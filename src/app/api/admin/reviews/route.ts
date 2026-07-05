import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { deleteStorageFile } from "@/lib/cms/storage";
import { mapReviewRow } from "@/lib/cms/reviews";
import { storagePathForDelete, toStoragePath } from "@/lib/cms/storage-ref";
import { CMS_SAVE_SUCCESS_MESSAGE } from "@/lib/cms/messages";
import { revalidatePublicCms } from "@/lib/cms/revalidate";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 });
  }

  return NextResponse.json({
    reviews: (data ?? []).map((row) => mapReviewRow(row as Record<string, unknown>)),
  });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id, approved, admin_reply, verified, profile_image_url, event_image_url } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof approved === "boolean") updates.approved = approved;
  if (admin_reply !== undefined) updates.admin_reply = admin_reply;
  if (typeof verified === "boolean") updates.verified = verified;
  if (profile_image_url !== undefined) {
    updates.profile_image_url =
      typeof profile_image_url === "string" ? toStoragePath("reviews", profile_image_url) : profile_image_url;
  }
  if (event_image_url !== undefined) {
    updates.event_image_url =
      typeof event_image_url === "string" ? toStoragePath("reviews", event_image_url) : event_image_url;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Keine Updates." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("reviews").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Update fehlgeschlagen." }, { status: 500 });
  }

  revalidatePublicCms();
  return NextResponse.json({ success: true, message: CMS_SAVE_SUCCESS_MESSAGE });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: review } = await supabase
    .from("reviews")
    .select("profile_image_url, event_image_url")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });

  if (review?.profile_image_url) {
    try {
      const path = storagePathForDelete("reviews", review.profile_image_url);
      if (path) await deleteStorageFile("reviews", path);
    } catch { /* best effort */ }
  }
  if (review?.event_image_url) {
    try {
      const path = storagePathForDelete("reviews", review.event_image_url);
      if (path) await deleteStorageFile("reviews", path);
    } catch { /* best effort */ }
  }

  revalidatePublicCms();
  return NextResponse.json({ success: true, message: CMS_SAVE_SUCCESS_MESSAGE });
}
