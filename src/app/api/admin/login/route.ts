import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  createAdminSessionToken,
  getAdminCookieName,
  getAdminSessionMaxAge,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { verifyPassword } from "@/lib/auth/password";
import { countAdminUsers, findUserByIdentifier, updateUser } from "@/lib/auth/users";
import { getLoginPolicy, getRateLimitPolicy } from "@/lib/auth/security-settings";
import { recordLoginHistory } from "@/lib/auth/login-history";
import { writeAuditLog } from "@/lib/auth/audit";
import {
  createSession,
  PENDING_2FA_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
  clearSessionCookieOptions,
} from "@/lib/auth/session";
import { verifyTotpCode, verifyBackupCode } from "@/lib/auth/totp";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { sha256, randomToken } from "@/lib/auth/crypto";
import { resolveAdminContext } from "@/lib/auth/context";

function passwordsMatch(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function legacyLogin(password: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  const token = createAdminSessionToken();
  if (!password || !expected || !token || !passwordsMatch(password, expected)) {
    return null;
  }
  return token;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ratePolicy = await getRateLimitPolicy().catch(() => ({ loginPerIp: 10, windowMinutes: 15 }));
  const limited = rateLimit(
    `admin-login:${ip}`,
    ratePolicy.loginPerIp,
    ratePolicy.windowMinutes * 60 * 1000,
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Loginversuche. Bitte später erneut versuchen." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = await request.json();
  const {
    identifier,
    password,
    rememberMe,
    totpCode,
    backupCode,
    pendingToken,
    trustDevice,
  } = body as {
    identifier?: string;
    password?: string;
    rememberMe?: boolean;
    totpCode?: string;
    backupCode?: string;
    pendingToken?: string;
    trustDevice?: boolean;
  };

  // Step 2: 2FA verification
  if (pendingToken && (totpCode || backupCode)) {
    const userId = body.userId as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Ungültige 2FA-Anfrage." }, { status: 400 });
    }

    const { getUserById } = await import("@/lib/auth/users");
    const user = await getUserById(userId);
    if (!user?.active || !user.totp_enabled || !user.totp_secret) {
      return NextResponse.json({ error: "2FA nicht verfügbar." }, { status: 400 });
    }

    const codeOk = totpCode
      ? verifyTotpCode(user.totp_secret, totpCode)
      : backupCode
        ? await verifyBackupCode(user.id, backupCode)
        : false;

    if (!codeOk) {
      await recordLoginHistory({
        userId: user.id,
        identifier: user.username,
        success: false,
        ip,
        userAgent: request.headers.get("user-agent"),
      });
      return NextResponse.json({ error: "Ungültiger 2FA-Code." }, { status: 401 });
    }

    const loginPolicy = await getLoginPolicy();
    const { token, maxAgeSec } = await createSession({
      userId: user.id,
      userAgent: request.headers.get("user-agent"),
      ip,
      rememberDays: rememberMe ? loginPolicy.rememberDays : undefined,
      trustedDays: trustDevice ? 30 : undefined,
    });

    await updateUser(user.id, { lastLogin: new Date().toISOString(), failedLoginAttempts: 0, lockedUntil: null });
    await recordLoginHistory({
      userId: user.id,
      identifier: user.username,
      success: true,
      ip,
      userAgent: request.headers.get("user-agent"),
    });

    const response = NextResponse.json({
      success: true,
      user: { displayName: user.display_name, role: user.role_id },
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAgeSec));
    response.cookies.set(PENDING_2FA_COOKIE, "", clearSessionCookieOptions());
    return response;
  }

  const userCount = await countAdminUsers();

  // Legacy single-password mode
  if (userCount === 0) {
    if (!isAdminConfigured()) {
      return NextResponse.json({ error: "Admin ist nicht konfiguriert." }, { status: 503 });
    }
    const legacyPassword = password ?? identifier;
    const token = await legacyLogin(legacyPassword ?? "");
    if (!token) {
      await recordLoginHistory({
        identifier: "legacy",
        success: false,
        ip,
        userAgent: request.headers.get("user-agent"),
      });
      return NextResponse.json({ error: "Ungültiges Passwort." }, { status: 401 });
    }
    const response = NextResponse.json({ success: true, legacy: true });
    response.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: getAdminSessionMaxAge(),
    });
    return response;
  }

  // Multi-user login step 1
  if (!identifier?.trim() || !password) {
    return NextResponse.json({ error: "Benutzername/E-Mail und Passwort erforderlich." }, { status: 400 });
  }

  const user = await findUserByIdentifier(identifier);
  if (!user || !user.active) {
    await recordLoginHistory({
      identifier,
      success: false,
      ip,
      userAgent: request.headers.get("user-agent"),
    });
    return NextResponse.json({ error: "Ungültige Anmeldedaten." }, { status: 401 });
  }

  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    return NextResponse.json({ error: "Konto vorübergehend gesperrt. Bitte später erneut versuchen." }, { status: 423 });
  }

  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    const loginPolicy = await getLoginPolicy();
    const attempts = user.failed_login_attempts + 1;
    const lockedUntil =
      attempts >= loginPolicy.maxAttempts
        ? new Date(Date.now() + loginPolicy.lockoutMinutes * 60 * 1000).toISOString()
        : null;

    await updateUser(user.id, {
      failedLoginAttempts: attempts,
      lockedUntil,
    });

    await recordLoginHistory({
      userId: user.id,
      identifier,
      success: false,
      ip,
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ error: "Ungültige Anmeldedaten." }, { status: 401 });
  }

  if (user.totp_enabled && user.totp_secret) {
    const pending = randomToken(24);
    const response = NextResponse.json({
      requires2fa: true,
      userId: user.id,
      pendingToken: pending,
      message: "Bitte 2FA-Code eingeben.",
    });
    response.cookies.set(PENDING_2FA_COOKIE, sha256(pending), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 300,
    });
    return response;
  }

  const loginPolicy = await getLoginPolicy();
  const { token, maxAgeSec } = await createSession({
    userId: user.id,
    userAgent: request.headers.get("user-agent"),
    ip,
    rememberDays: rememberMe ? loginPolicy.rememberDays : undefined,
  });

  await updateUser(user.id, {
    lastLogin: new Date().toISOString(),
    failedLoginAttempts: 0,
    lockedUntil: null,
  });

  await recordLoginHistory({
    userId: user.id,
    identifier,
    success: true,
    ip,
    userAgent: request.headers.get("user-agent"),
  });

  const response = NextResponse.json({
    success: true,
    user: { displayName: user.display_name },
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAgeSec));
  return response;
}

export async function DELETE() {
  const ctx = await resolveAdminContext();
  if (ctx?.userId && ctx.sessionId) {
    const { revokeSession } = await import("@/lib/auth/session");
    await revokeSession(ctx.sessionId, ctx.userId);
    await writeAuditLog(ctx, { action: "logout", area: "auth" });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(getAdminCookieName(), "", clearSessionCookieOptions());
  response.cookies.set(SESSION_COOKIE, "", clearSessionCookieOptions());
  response.cookies.set(PENDING_2FA_COOKIE, "", clearSessionCookieOptions());
  return response;
}

export async function GET() {
  const ctx = await resolveAdminContext();
  if (!ctx) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    displayName: ctx.displayName,
    roleSlug: ctx.roleSlug,
    isLegacy: ctx.isLegacy,
    permissions: ctx.permissions,
  });
}
