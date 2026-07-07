import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { listCustomers, getCustomer, getCustomerDeleteBlockers } from "@/lib/crm/db";
import { crmCustomerSchema } from "@/lib/crm/schemas";
import { logCustomerEvent } from "@/lib/crm/events";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function normalizeCustomerFields(data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data };
  for (const key of ["email", "phone", "address", "notes"]) {
    if (typeof out[key] === "string" && (out[key] as string).trim() === "") {
      out[key] = null;
    }
  }
  return out;
}

export async function GET(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;

  try {
    const customers = await listCustomers(search);
    return NextResponse.json({ customers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const parsed = crmCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Kundendaten. Bitte Name prüfen." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const payload = normalizeCustomerFields(parsed.data);
    const { data, error } = await supabase
      .from("crm_customers")
      .insert({
        ...payload,
        email: payload.email || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await logCustomerEvent(data.id, "customer_created", "Kunde manuell angelegt", parsed.data.name);
    return NextResponse.json({ customer: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id, ...rest } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const parsed = crmCustomerSchema.partial().safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Daten. Bitte E-Mail und Pflichtfelder prüfen." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const payload = normalizeCustomerFields({ ...parsed.data, updated_at: new Date().toISOString() });
    const { data, error } = await supabase
      .from("crm_customers")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ customer: data, message: "Kunde gespeichert." });
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

  const existing = await getCustomer(id);
  if (!existing) return NextResponse.json({ error: "Kunde nicht gefunden." }, { status: 404 });

  try {
    const blockers = await getCustomerDeleteBlockers(id);
    const blocked = blockers.quotes > 0 || blockers.invoices > 0 || blockers.bookings > 0;

    if (blocked) {
      const parts: string[] = [];
      if (blockers.bookings > 0) parts.push(`${blockers.bookings} Anfrage(n)`);
      if (blockers.quotes > 0) parts.push(`${blockers.quotes} Angebot(e)`);
      if (blockers.invoices > 0) parts.push(`${blockers.invoices} Rechnung(en)`);

      return NextResponse.json(
        {
          error: `Dieser Kunde kann nicht gelöscht werden, weil noch ${parts.join(", ")} verknüpft sind.`,
          blockers,
          canArchive: true,
        },
        { status: 409 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("crm_customers").delete().eq("id", id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, message: "Kunde wurde gelöscht." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Löschen fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
