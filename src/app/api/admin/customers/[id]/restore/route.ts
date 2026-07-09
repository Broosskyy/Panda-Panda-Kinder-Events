import { NextResponse } from "next/server";
import { getAdminContext, requireAdmin } from "@/lib/admin-route";
import { restoreCustomerRecord } from "@/lib/crm/db";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin("customers:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  const { id } = await params;

  try {
    const customer = await restoreCustomerRecord(id);
    if (ctx) {
      await writeAuditLogFromRequest(ctx, request, {
        action: "customer_restored",
        area: "crm",
        entityId: id,
        before: { status: "inactive" },
        after: { status: "active", name: customer.name },
      });
    }
    return NextResponse.json({ customer, message: "Kunde wurde wiederhergestellt." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Wiederherstellen fehlgeschlagen.";
    const status = message.includes("nicht gefunden") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
