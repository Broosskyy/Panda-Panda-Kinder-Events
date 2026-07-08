import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { getUserById, updateUser } from "@/lib/auth/users";
import {
  generateTotpSecret,
  getTotpQrDataUrl,
  verifyTotpCode,
  generateBackupCodes,
  countUnusedBackupCodes,
} from "@/lib/auth/totp";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";

/** Personal 2FA — any authenticated multi-user admin can manage their own 2FA. */
async function requirePersonalAuth() {
  const authError = await requireAdmin("security:write");
  if (authError) return { error: authError, ctx: null };
  const adminCtx = await getAdminContext();
  if (!adminCtx) {
    return {
      error: NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 }),
      ctx: null,
    };
  }
  return { error: null, ctx: adminCtx };
}

export async function GET() {
  const { error, ctx } = await requirePersonalAuth();
  if (error) return error;

  const user = await getUserById(ctx!.userId!);
  const backupCodesRemaining = await countUnusedBackupCodes(ctx!.userId!);

  return NextResponse.json({
    enabled: user?.totp_enabled ?? false,
    backupCodesRemaining,
    email: user?.email,
  });
}

export async function POST(request: Request) {
  const { error, ctx } = await requirePersonalAuth();
  if (error) return error;

  const body = await request.json();
  const user = await getUserById(ctx!.userId!);
  if (!user) return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });

  if (body.action === "setup") {
    const secret = generateTotpSecret();
    const qrDataUrl = await getTotpQrDataUrl(user.email, secret);
    await updateUser(user.id, { totpSecret: secret, totpEnabled: false });
    return NextResponse.json({ secret, qrDataUrl, email: user.email });
  }

  if (body.action === "verify") {
    if (!user.totp_secret || !body.code) {
      return NextResponse.json({ error: "6-stelliger Code erforderlich." }, { status: 400 });
    }
    if (!verifyTotpCode(user.totp_secret, body.code)) {
      return NextResponse.json({ error: "Ungültiger Code. Bitte Authenticator-App prüfen." }, { status: 400 });
    }
    const backupCodes = await generateBackupCodes(user.id);
    await updateUser(user.id, { totpEnabled: true });
    await writeAuditLogFromRequest(ctx, request, { action: "2fa_enable", area: "security" });
    return NextResponse.json({ success: true, backupCodes });
  }

  if (body.action === "disable") {
    return NextResponse.json(
      { error: "2FA ist verpflichtend und kann nicht deaktiviert werden. Bitte Super Admin kontaktieren." },
      { status: 403 },
    );
  }

  if (body.action === "regenerate_backup") {
    if (!user.totp_enabled || !user.totp_secret || !body.code) {
      return NextResponse.json({ error: "2FA-Code erforderlich." }, { status: 400 });
    }
    if (!verifyTotpCode(user.totp_secret, body.code)) {
      return NextResponse.json({ error: "Ungültiger 2FA-Code." }, { status: 400 });
    }
    const backupCodes = await generateBackupCodes(user.id);
    await writeAuditLogFromRequest(ctx, request, { action: "2fa_backup_regenerate", area: "security" });
    return NextResponse.json({ backupCodes });
  }

  return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
}
