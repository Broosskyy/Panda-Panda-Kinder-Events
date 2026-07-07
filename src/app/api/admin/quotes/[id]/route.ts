import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getQuoteWithDetails } from "@/lib/crm/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin("crm:read");
  if (authError) return authError;

  const { id } = await params;

  try {
    const quote = await getQuoteWithDetails(id);
    if (!quote || quote.deleted_at) {
      return NextResponse.json({ error: "Angebot nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json({ quote });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
