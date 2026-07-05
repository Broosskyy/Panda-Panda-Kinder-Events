import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { createQuote, listQuotes, updateQuote } from "@/lib/crm/db";
import { crmQuoteSchema, crmStatusUpdateSchema } from "@/lib/crm/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;

  try {
    const quotes = await listQuotes(search);
    return NextResponse.json({ quotes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const parsed = crmQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Angebotsdaten." }, { status: 400 });
  }

  try {
    const quote = await createQuote(parsed.data);
    return NextResponse.json({ quote });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Angebot konnte nicht erstellt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id, items, ...rest } = body as { id?: string; items?: unknown[] };

  if (body.status && id && !items) {
    const statusParsed = crmStatusUpdateSchema.safeParse(body);
    if (!statusParsed.success) {
      return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("crm_quotes")
      .update({ status: statusParsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", statusParsed.data.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  try {
    const quote = await updateQuote(id, { ...rest, items: items as never });
    return NextResponse.json({ quote });
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
  const { error } = await supabase.from("crm_quotes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
