import { NextResponse } from "next/server";
import { getAdminCookieName, legacyCookieClearOptions } from "@/lib/admin-auth";
import { verifyPassword } from "@/lib/auth/password";
import { evaluateBootstrapAccess } from "@/lib/auth/bootstrap-guard";
import { findUserByIdentifier, getRoleById, getUserPublicById, hasAdminUsers, updateUser } from "@/lib/auth/users";
import { getLoginPolicy, getRateLimitPolicy } from "@/lib/auth/security-settings";
import { recordLoginHistory } from "@/lib/auth/login-history";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
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
import { fetchSiteSettings } from "@/lib/cms/data";
import { roleDisplayLabel } from "@/lib/admin/roles";

function attachSessionCookies(response: NextResponse, token: string, maxAgeSec: number) {
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAgeSec));
  response.cookies.set(getAdminCookieName(), "", legacyCookieClearOptions());
}

function clearLegacyAuthCookie(response: NextResponse) {
  response.cookies.set(getAdminCookieName(), "", legacyCookieClearOptions());
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

    const { cookies } = await import("next/headers");
    const pendingCookie = (await cookies()).get(PENDING_2FA_COOKIE)?.value;
    if (!pendingCookie || sha256(pendingToken) !== pendingCookie) {
      return NextResponse.json({ error: "2FA-Sitzung abgelaufen. Bitte erneut anmelden." }, { status: 401 });
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
      user: {
        id: user.id,
        displayName: user.display_name,
        email: user.email,
      },
    });
    attachSessionCookies(response, token, maxAgeSec);
    response.cookies.set(PENDING_2FA_COOKIE, "", clearSessionCookieOptions());
    return response;
  }

  let usersExist = false;
  try {
    usersExist = await hasAdminUsers();
  } catch {
    return NextResponse.json({ error: "Anmeldung vorübergehend nicht verfügbar." }, { status: 503 });
  }

  if (!usersExist) {
    const response = NextResponse.json(
      { error: "Noch kein Admin-Benutzer angelegt. Bitte zuerst den Einrichtungs-Assistenten nutzen.", needsBootstrap: true },
      { status: 403 },
    );
    clearLegacyAuthCookie(response);
    return response;
  }

  if (!identifier?.trim() || !password) {
    return NextResponse.json({ error: "Benutzername/E-Mail und Passwort erforderlich." }, { status: 400 });
  }

  const user = await findUserByIdentifier(identifier);
  if (!user || !user.active) {
    await writeAuditLogFromRequest(null, request, {
      action: "login_failed",
      area: "auth",
      success: false,
      errorMessage: "invalid_credentials",
    });
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

    await writeAuditLogFromRequest(null, request, {
      action: "login_failed",
      area: "auth",
      entityId: user.id,
      success: false,
      errorMessage: "invalid_password",
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
  const { token, session, maxAgeSec } = await createSession({
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

  const role = await getRoleById(user.role_id);
  await writeAuditLogFromRequest(
    {
      userId: user.id,
      displayName: user.display_name,
      email: user.email,
      roleSlug: role?.slug ?? "readonly",
      permissions: [],
      sessionId: session.id,
    },
    request,
    { action: "login", area: "auth", entityId: user.id },
  );

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      displayName: user.display_name,
      email: user.email,
    },
  });
  attachSessionCookies(response, token, maxAgeSec);
  return response;
}

export async function DELETE(request: Request) {
  const ctx = await resolveAdminContext();
  if (ctx?.sessionId) {
    const { revokeSession } = await import("@/lib/auth/session");
    await revokeSession(ctx.sessionId, ctx.userId);
    await writeAuditLogFromRequest(ctx, request, { action: "logout", area: "auth" });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(getAdminCookieName(), "", legacyCookieClearOptions());
  response.cookies.set(SESSION_COOKIE, "", clearSessionCookieOptions());
  response.cookies.set(PENDING_2FA_COOKIE, "", clearSessionCookieOptions());
  return response;
}

export async function GET() {
  const bootstrap = await evaluateBootstrapAccess();

  const ctx = await resolveAdminContext();
  if (!ctx) {
    const response = NextResponse.json({
      authenticated: false,
      needsBootstrap: bootstrap.allowed,
      bootstrap,
      ...(bootstrap.reason === "count_query_failed"
        ? { error: "Datenbank nicht erreichbar." }
        : {}),
    });
    if (bootstrap.reason === "admin_users_exist") clearLegacyAuthCookie(response);
    return response;
  }

  const settings = await fetchSiteSettings().catch(() => null);
  const profile = await getUserPublicById(ctx.userId);
  const roleLabel = profile?.role_label ?? roleDisplayLabel(ctx.roleSlug);

  const response = NextResponse.json({
    authenticated: true,
    needsBootstrap: false,
    bootstrap: {
      allowed: false,
      reason: "authenticated_session" as const,
      adminUserCount: null,
      sessionActive: true,
      sessionUserId: ctx.userId,
    },
    userId: ctx.userId,
    displayName: profile?.display_name ?? ctx.displayName,
    email: profile?.email ?? ctx.email,
    roleSlug: ctx.roleSlug,
    roleLabel,
    permissions: ctx.permissions,
    modules: settings?.modules ?? null,
    isSuperAdmin: ctx.roleSlug === "administrator",
    identity: {
      id: ctx.userId,
      displayName: profile?.display_name ?? ctx.displayName,
      email: profile?.email ?? ctx.email,
      roleSlug: ctx.roleSlug,
      roleLabel,
    },
  });
  clearLegacyAuthCookie(response);
  return response;
}
