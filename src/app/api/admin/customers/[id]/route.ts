import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getCustomer } from "@/lib/crm/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin("crm:read");
  if (authError) return authError;

  const { id } = await params;

  try {
    const customer = await getCustomer(id);
    if (!customer) {
      return NextResponse.json({ error: "Kunde nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json({ customer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
