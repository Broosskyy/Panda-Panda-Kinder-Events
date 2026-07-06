import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getInvoiceWithDetails } from "@/lib/crm/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;

  try {
    const invoice = await getInvoiceWithDetails(id);
    if (!invoice || invoice.deleted_at) {
      return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json({ invoice });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
