import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sha256 } from "@/lib/auth/crypto";
import { createSession, PENDING_2FA_COOKIE, SESSION_COOKIE, sessionCookieOptions, clearSessionCookieOptions } from "@/lib/auth/session";
import { getUserById, updateUser, getRoleById } from "@/lib/auth/users";
import {
  generateTotpSecret,
  getTotpQrDataUrl,
  verifyTotpCode,
  generateBackupCodes,
} from "@/lib/auth/totp";
import { getAdminCookieName, legacyCookieClearOptions } from "@/lib/admin-auth";
import { getLoginPolicy } from "@/lib/auth/security-settings";
import { recordLoginHistory } from "@/lib/auth/login-history";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

function attachSessionCookies(response: NextResponse, token: string, maxAgeSec: number) {
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAgeSec));
  response.cookies.set(getAdminCookieName(), "", legacyCookieClearOptions());
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-2fa-setup:${ip}`, 15, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte später erneut versuchen." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = await request.json();
  const { pendingToken, userId, action, code, rememberMe } = body as {
    pendingToken?: string;
    userId?: string;
    action?: string;
    code?: string;
    rememberMe?: boolean;
  };

  if (!pendingToken || !userId) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const pendingCookie = (await cookies()).get(PENDING_2FA_COOKIE)?.value;
  if (!pendingCookie || sha256(pendingToken) !== pendingCookie) {
    return NextResponse.json({ error: "Sitzung abgelaufen. Bitte erneut anmelden." }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user?.active) {
    return NextResponse.json({ error: "Benutzer nicht verfügbar." }, { status: 400 });
  }

  if (user.totp_enabled && user.totp_secret) {
    return NextResponse.json({ error: "2FA ist bereits eingerichtet." }, { status: 400 });
  }

  if (action === "setup") {
    const secret = generateTotpSecret();
    const qrDataUrl = await getTotpQrDataUrl(user.email, secret);
    await updateUser(user.id, { totpSecret: secret, totpEnabled: false });
    return NextResponse.json({ secret, qrDataUrl, email: user.email });
  }

  if (action === "verify") {
    if (!code || !user.totp_secret) {
      return NextResponse.json({ error: "6-stelliger Code erforderlich." }, { status: 400 });
    }

    if (!verifyTotpCode(user.totp_secret, code)) {
      await writeAuditLogFromRequest(null, request, {
        action: "2fa_failed",
        area: "auth",
        entityId: user.id,
        success: false,
        errorMessage: "invalid_2fa_setup",
      });
      return NextResponse.json({ error: "Ungültiger 2FA-Code." }, { status: 401 });
    }

    const backupCodes = await generateBackupCodes(user.id);
    await updateUser(user.id, { totpEnabled: true });

    await writeAuditLogFromRequest(null, request, {
      action: "2fa_enable",
      area: "security",
      entityId: user.id,
      after: { via: "login_setup" },
    });

    const loginPolicy = await getLoginPolicy();
    const { token, session, maxAgeSec } = await createSession({
      userId: user.id,
      userAgent: request.headers.get("user-agent"),
      ip,
      rememberDays: rememberMe ? loginPolicy.rememberDays : undefined,
    });

    await updateUser(user.id, { lastLogin: new Date().toISOString(), failedLoginAttempts: 0, lockedUntil: null });

    const role = await getRoleById(user.role_id);
    await recordLoginHistory({
      userId: user.id,
      identifier: user.username,
      success: true,
      ip,
      userAgent: request.headers.get("user-agent"),
      request,
      roleSlug: role?.slug ?? null,
    });

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
      backupCodes,
      user: { id: user.id, displayName: user.display_name, email: user.email },
    });
    attachSessionCookies(response, token, maxAgeSec);
    response.cookies.set(PENDING_2FA_COOKIE, "", clearSessionCookieOptions());
    return response;
  }

  return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
}
