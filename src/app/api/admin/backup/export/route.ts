import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { buildAdminBackupZip } from "@/lib/admin/backup-export";

export async function GET() {
  const authError = await requireAdmin("settings:write");
  if (authError) return authError;

  try {
    const result = await buildAdminBackupZip();

    return new NextResponse(new Uint8Array(result.zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "no-store",
        "X-Backup-Warnings": encodeURIComponent(JSON.stringify(result.warnings)),
        "X-Backup-Partial": result.warnings.length > 0 ? "true" : "false",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Backup-Export fehlgeschlagen.";
    console.error("backup export:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
