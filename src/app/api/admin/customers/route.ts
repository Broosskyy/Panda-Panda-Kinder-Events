import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { listCustomers, getCustomer } from "@/lib/crm/db";
import { crmCustomerSchema } from "@/lib/crm/schemas";
import { logCustomerEvent } from "@/lib/crm/events";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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
    return NextResponse.json({ error: "Ungültige Kundendaten." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("crm_customers")
      .insert({
        ...parsed.data,
        email: parsed.data.email || null,
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
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("crm_customers")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ customer: data });
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
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("crm_customers").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Löschen fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
