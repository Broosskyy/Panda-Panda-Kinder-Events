import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getInvitationByToken,
  markInvitationAccepted,
  deriveUsernameFromEmail,
} from "@/lib/auth/invitations";
import { createUser, findUserByEmail } from "@/lib/auth/users";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { getPasswordPolicy } from "@/lib/auth/security-settings";
import {
  generateTotpSecret,
  getTotpQrDataUrl,
  verifyTotpCode,
  generateBackupCodes,
} from "@/lib/auth/totp";
import { updateUser } from "@/lib/auth/users";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const acceptSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8),
  totpCode: z.string().min(6),
  pendingSecret: z.string().min(16),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-invite-accept:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte später erneut versuchen." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = await request.json();

  if (body.action === "setup") {
    const token = String(body.token ?? "").trim();
    if (!token) return NextResponse.json({ error: "Token erforderlich." }, { status: 400 });

    const invite = await getInvitationByToken(token);
    if (!invite) {
      return NextResponse.json({ error: "Einladung ungültig oder abgelaufen." }, { status: 404 });
    }

    const secret = generateTotpSecret();
    const qrDataUrl = await getTotpQrDataUrl(invite.preview.email, secret);
    return NextResponse.json({ secret, qrDataUrl, email: invite.preview.email });
  }

  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Ungültige Daten.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const invite = await getInvitationByToken(parsed.data.token);
  if (!invite) {
    return NextResponse.json({ error: "Einladung ungültig oder abgelaufen." }, { status: 404 });
  }

  if (!verifyTotpCode(parsed.data.pendingSecret, parsed.data.totpCode)) {
    return NextResponse.json({ error: "Ungültiger 2FA-Code. Bitte Authenticator-App prüfen." }, { status: 400 });
  }

  const existingUser = await findUserByEmail(invite.preview.email);
  if (existingUser) {
    return NextResponse.json({ error: "Ein Benutzer mit dieser E-Mail existiert bereits." }, { status: 400 });
  }

  const policy = await getPasswordPolicy();
  const validationError = validatePassword(parsed.data.password, policy);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    let username = deriveUsernameFromEmail(invite.preview.email);
    const supabase = getSupabaseAdmin();

    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = attempt === 0 ? username : `${username}${attempt}`;
      const { data: clash } = await supabase.from("admin_users").select("id").eq("username", candidate).maybeSingle();
      if (!clash) {
        username = candidate;
        break;
      }
    }

    const user = await createUser({
      username,
      email: invite.preview.email,
      passwordHash,
      displayName: invite.preview.displayName,
      roleId: invite.row.role_id,
      createdBy: invite.row.invited_by ?? undefined,
    });

    await updateUser(user.id, {
      totpSecret: parsed.data.pendingSecret,
      totpEnabled: true,
    });
    const backupCodes = await generateBackupCodes(user.id);

    await markInvitationAccepted(invite.row.id, user.id);

    await writeAuditLogFromRequest(null, request, {
      action: "invite_accepted",
      area: "admin_invites",
      entityId: invite.row.id,
      after: { userId: user.id, email: user.email, role: user.role_slug },
    });
    await writeAuditLogFromRequest(null, request, {
      action: "2fa_enable",
      area: "security",
      entityId: user.id,
      after: { via: "invite_accept" },
    });

    return NextResponse.json({
      success: true,
      message: "Zugang eingerichtet. Sie können sich jetzt anmelden.",
      backupCodes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registrierung fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
