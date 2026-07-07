import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { fetchCustomerHistory } from "@/lib/crm/events";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin("crm:read");
  if (authError) return authError;

  const { id } = await params;

  try {
    const history = await fetchCustomerHistory(id);
    return NextResponse.json(history);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Historie konnte nicht geladen werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
