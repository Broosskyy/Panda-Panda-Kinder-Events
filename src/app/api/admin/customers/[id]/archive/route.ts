import { NextResponse } from "next/server";
import { getAdminContext, requireAdmin } from "@/lib/admin-route";
import { archiveCustomerRecord } from "@/lib/crm/db";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin("customers:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  const { id } = await params;

  try {
    const customer = await archiveCustomerRecord(id);
    if (ctx) {
      await writeAuditLogFromRequest(ctx, request, {
        action: "customer_archived",
        area: "crm",
        entityId: id,
        before: { name: customer.name },
        after: { status: "inactive" },
      });
    }
    return NextResponse.json({ customer, message: "Kunde wurde archiviert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Archivieren fehlgeschlagen.";
    const status = message.includes("nicht gefunden") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
