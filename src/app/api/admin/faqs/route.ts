import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { cmsFaqPatchSchema, cmsFaqSchema } from "@/lib/cms/admin-schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { CMS_SAVE_SUCCESS_MESSAGE } from "@/lib/cms/messages";
import { revalidatePublicCms } from "@/lib/cms/revalidate";

const OK = { message: CMS_SAVE_SUCCESS_MESSAGE };

export async function GET() {
  const authError = await requireAdmin("website:read");
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
  const authError = await requireAdmin("faq:write");
  if (authError) return authError;

  const body = await request.json();
  const parsed = cmsFaqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige FAQ-Daten." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_faqs")
    .insert({
      ...parsed.data,
      sort_order: parsed.data.sort_order ?? 0,
      visible: parsed.data.visible ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("faqs POST:", error.message);
    return NextResponse.json({ error: "Erstellen fehlgeschlagen." }, { status: 500 });
  }
  revalidatePublicCms();
  return NextResponse.json({ faq: data, ...OK });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin("faq:write");
  if (authError) return authError;

  const body = await request.json();
  const { id, ...rawUpdates } = body;
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const parsed = cmsFaqPatchSchema.safeParse(rawUpdates);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige FAQ-Daten." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("cms_faqs")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("faqs PATCH:", error.message);
    return NextResponse.json({ error: "Update fehlgeschlagen." }, { status: 500 });
  }
  revalidatePublicCms();
  return NextResponse.json({ success: true, ...OK });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin("faq:write");
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("cms_faqs").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });
  revalidatePublicCms();
  return NextResponse.json({ success: true, ...OK });
}
