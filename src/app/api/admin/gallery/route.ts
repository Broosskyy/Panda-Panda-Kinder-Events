import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPublicUrl } from "@/lib/cms/storage";
import { deleteStorageFile } from "@/lib/cms/storage";
import type { GalleryImageRecord } from "@/lib/cms/types";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: "Laden fehlgeschlagen." }, { status: 500 });

  const images = ((data ?? []) as GalleryImageRecord[]).map((img) => ({
    ...img,
    url: getPublicUrl("gallery", img.storage_path),
  }));

  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { storage_path, title, alt_text, category, sort_order, visible } = body;

  if (!storage_path) {
    return NextResponse.json({ error: "storage_path erforderlich." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("gallery_images")
    .insert({
      storage_path,
      title: title ?? "",
      alt_text: alt_text ?? "",
      category: category ?? "allgemein",
      sort_order: sort_order ?? 0,
      visible: visible ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Erstellen fehlgeschlagen." }, { status: 500 });

  return NextResponse.json({
    image: { ...data, url: getPublicUrl("gallery", data.storage_path) },
  });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("gallery_images")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Update fehlgeschlagen." }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: img } = await supabase.from("gallery_images").select("storage_path").eq("id", id).single();

  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });

  if (img?.storage_path) {
    try {
      await deleteStorageFile("gallery", img.storage_path);
    } catch {
      /* storage cleanup best-effort */
    }
  }

  return NextResponse.json({ success: true });
}
