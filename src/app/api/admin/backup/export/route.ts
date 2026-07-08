import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { buildAdminBackupZip } from "@/lib/admin/backup-export";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { verifyCriticalConfirmation } from "@/lib/auth/critical-action";

export async function GET(request: Request) {
  const authError = await requireAdmin("backup:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const confirmPassword = searchParams.get("confirmPassword") ?? undefined;
  const critical = await verifyCriticalConfirmation(ctx, {
    confirmPassword,
    criticalAcknowledged: searchParams.get("criticalAcknowledged") === "true",
  });
  if (!critical.ok) return critical.response;

  try {
    const result = await buildAdminBackupZip();

    await writeAuditLogFromRequest(ctx, request, {
      action: "backup_export",
      area: "backup",
      after: { filename: result.filename, warnings: result.warnings.length },
    });

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
