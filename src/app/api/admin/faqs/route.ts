import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePublicCms } from "@/lib/cms/revalidate";

const OK = { message: "Gespeichert und Startseite aktualisiert." };

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: "Laden fehlgeschlagen." }, { status: 500 });
  return NextResponse.json({ faqs: data ?? [] });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("cms_faqs").insert(body).select().single();

  if (error) return NextResponse.json({ error: `Erstellen fehlgeschlagen: ${error.message}` }, { status: 500 });
  revalidatePublicCms();
  return NextResponse.json({ faq: data, ...OK });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("cms_faqs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: `Update fehlgeschlagen: ${error.message}` }, { status: 500 });
  revalidatePublicCms();
  return NextResponse.json({ success: true, ...OK });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("cms_faqs").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });
  revalidatePublicCms();
  return NextResponse.json({ success: true, ...OK });
}
