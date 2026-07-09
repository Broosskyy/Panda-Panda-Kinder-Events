import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { fetchCustomerLinks } from "@/lib/crm/customer-links";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin("crm:read");
  if (authError) return authError;

  const { id } = await params;

  try {
    const links = await fetchCustomerLinks(id);
    return NextResponse.json(links);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verknüpfungen konnten nicht geladen werden.";
    const status = message.includes("nicht gefunden") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
