import { NextResponse } from "next/server";
import { getAdminContext, requireAdmin } from "@/lib/admin-route";
import {
  archiveQuote,
  createQuote,
  deleteQuote,
  listQuotes,
  restoreQuote,
  updateQuote,
  type CrmListView,
} from "@/lib/crm/db";
import { crmQuoteSchema, crmStatusUpdateSchema } from "@/lib/crm/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function parseView(value: string | null): CrmListView {
  if (value === "archived" || value === "all") return value;
  return "active";
}

export async function GET(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const view = parseView(searchParams.get("view"));

  try {
    const quotes = await listQuotes(search, view);
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

  const ctx = await getAdminContext();
  const body = await request.json();
  const { id, items, action, ...rest } = body as {
    id?: string;
    items?: unknown[];
    action?: string;
  };

  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  if (action === "archive") {
    try {
      await archiveQuote(id, ctx);
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Archivieren fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (action === "restore") {
    try {
      await restoreQuote(id, ctx);
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wiederherstellen fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (body.status && !items && !action) {
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

  const ctx = await getAdminContext();
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  try {
    await deleteQuote(id, ctx);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Löschen fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
