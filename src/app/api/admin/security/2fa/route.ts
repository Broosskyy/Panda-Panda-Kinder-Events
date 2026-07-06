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
import { writeAuditLog } from "@/lib/auth/audit";

export async function GET() {
  const authError = await requireAdmin("security:read");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx?.userId) {
    return NextResponse.json({ enabled: false, legacy: true, backupCodesRemaining: 0 });
  }

  const user = await getUserById(ctx.userId);
  const backupCodesRemaining = await countUnusedBackupCodes(ctx.userId);

  return NextResponse.json({
    enabled: user?.totp_enabled ?? false,
    backupCodesRemaining,
  });
}

export async function POST(request: Request) {
  const authError = await requireAdmin("security:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx?.userId) {
    return NextResponse.json({ error: "2FA nur im Multi-User-Modus verfügbar." }, { status: 400 });
  }

  const body = await request.json();
  const user = await getUserById(ctx.userId);
  if (!user) return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });

  if (body.action === "setup") {
    const secret = generateTotpSecret();
    const qrDataUrl = await getTotpQrDataUrl(user.email, secret);
    await updateUser(user.id, { totpSecret: secret, totpEnabled: false });
    return NextResponse.json({ secret, qrDataUrl });
  }

  if (body.action === "verify") {
    if (!user.totp_secret || !body.code) {
      return NextResponse.json({ error: "Code erforderlich." }, { status: 400 });
    }
    if (!verifyTotpCode(user.totp_secret, body.code)) {
      return NextResponse.json({ error: "Ungültiger Code." }, { status: 400 });
    }
    const backupCodes = await generateBackupCodes(user.id);
    await updateUser(user.id, { totpEnabled: true });
    await writeAuditLog(ctx, { action: "2fa_enable", area: "security" });
    return NextResponse.json({ success: true, backupCodes });
  }

  if (body.action === "disable") {
    if (!user.totp_secret || !body.code) {
      return NextResponse.json({ error: "Code erforderlich." }, { status: 400 });
    }
    if (!verifyTotpCode(user.totp_secret, body.code)) {
      return NextResponse.json({ error: "Ungültiger Code." }, { status: 400 });
    }
    await updateUser(user.id, { totpEnabled: false, totpSecret: null });
    await writeAuditLog(ctx, { action: "2fa_disable", area: "security" });
    return NextResponse.json({ success: true });
  }

  if (body.action === "regenerate_backup") {
    if (!user.totp_enabled || !user.totp_secret || !body.code) {
      return NextResponse.json({ error: "2FA-Code erforderlich." }, { status: 400 });
    }
    if (!verifyTotpCode(user.totp_secret, body.code)) {
      return NextResponse.json({ error: "Ungültiger Code." }, { status: 400 });
    }
    const backupCodes = await generateBackupCodes(user.id);
    await writeAuditLog(ctx, { action: "2fa_backup_regenerate", area: "security" });
    return NextResponse.json({ backupCodes });
  }

  return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
}
