import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { galleryImageInsertSchema, galleryImagePatchSchema } from "@/lib/cms/admin-schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPublicUrl } from "@/lib/cms/storage";
import { deleteStorageFile } from "@/lib/cms/storage";
import type { GalleryImageRecord } from "@/lib/cms/types";
import { CMS_SAVE_SUCCESS_MESSAGE } from "@/lib/cms/messages";
import { revalidatePublicCms } from "@/lib/cms/revalidate";

export async function GET() {
  const authError = await requireAdmin("website:read");
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
  const authError = await requireAdmin("gallery:write");
  if (authError) return authError;

  const body = await request.json();
  const parsed = galleryImageInsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Galeriedaten." }, { status: 400 });
  }

  const { storage_path, title, alt_text, category, sort_order, visible } = parsed.data;

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

  const ctx = await getAdminContext();
  await writeAuditLogFromRequest(ctx, request, {
    action: "create",
    area: "gallery",
    entityId: data.id,
    after: { title: data.title, category: data.category },
  });

  revalidatePublicCms();
  return NextResponse.json({
    image: { ...data, url: getPublicUrl("gallery", data.storage_path) },
    message: CMS_SAVE_SUCCESS_MESSAGE,
  });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin("gallery:write");
  if (authError) return authError;

  const body = await request.json();
  const { id, ...rawUpdates } = body;
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const parsed = galleryImagePatchSchema.safeParse(rawUpdates);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Galeriedaten." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("gallery_images")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Update fehlgeschlagen." }, { status: 500 });
  const ctx = await getAdminContext();
  await writeAuditLogFromRequest(ctx, request, {
    action: "update",
    area: "gallery",
    entityId: id,
    after: parsed.data,
  });
  revalidatePublicCms();
  return NextResponse.json({ success: true, message: CMS_SAVE_SUCCESS_MESSAGE });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin("gallery:write");
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: img } = await supabase.from("gallery_images").select("storage_path").eq("id", id).single();

  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });

  const ctx = await getAdminContext();
  await writeAuditLogFromRequest(ctx, request, { action: "delete", area: "gallery", entityId: id });

  if (img?.storage_path) {
    try {
      await deleteStorageFile("gallery", img.storage_path);
    } catch {
      /* storage cleanup best-effort */
    }
  }

  revalidatePublicCms();
  return NextResponse.json({ success: true, message: CMS_SAVE_SUCCESS_MESSAGE });
}
