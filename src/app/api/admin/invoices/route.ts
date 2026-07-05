import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { createInvoiceFromQuote, listInvoices, updateInvoiceStatus } from "@/lib/crm/db";
import { crmStatusUpdateSchema } from "@/lib/crm/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;

  try {
    const invoices = await listInvoices(search);
    return NextResponse.json({ invoices });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();

  if (body.quote_id) {
    try {
      const invoice = await createInvoiceFromQuote(body.quote_id);
      return NextResponse.json({ invoice });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rechnung konnte nicht erstellt werden.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "quote_id erforderlich." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const parsed = crmStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
  }

  try {
    const invoice = await updateInvoiceStatus(parsed.data.id, parsed.data.status);
    return NextResponse.json({ invoice });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("crm_invoices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
