import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import {
  getSecuritySettingsBundle,
  updateSecuritySettings,
} from "@/lib/auth/security-settings";
import { writeAuditLog } from "@/lib/auth/audit";

export async function GET() {
  const authError = await requireAdmin("security:read");
  if (authError) return authError;

  try {
    const settings = await getSecuritySettingsBundle();
    return NextResponse.json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = await requireAdmin("security:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  const body = await request.json();

  try {
    await updateSecuritySettings({
      passwordPolicy: body.passwordPolicy,
      loginPolicy: body.loginPolicy,
      rateLimit: body.rateLimit,
    });
    await writeAuditLog(ctx, { action: "update", area: "security", after: body });
    return NextResponse.json({ success: true, message: "Sicherheitseinstellungen gespeichert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
