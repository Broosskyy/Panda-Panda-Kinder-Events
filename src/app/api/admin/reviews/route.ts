import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { deleteStorageFile } from "@/lib/cms/storage";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase nicht konfiguriert." }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [] });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const { id, approved, admin_reply, verified } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof approved === "boolean") updates.approved = approved;
  if (admin_reply !== undefined) updates.admin_reply = admin_reply;
  if (typeof verified === "boolean") updates.verified = verified;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Keine Updates." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("reviews").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Update fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

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
      const path = review.profile_image_url.split("/reviews/")[1];
      if (path) await deleteStorageFile("reviews", path);
    } catch { /* best effort */ }
  }
  if (review?.event_image_url) {
    try {
      const path = review.event_image_url.split("/reviews/")[1];
      if (path) await deleteStorageFile("reviews", path);
    } catch { /* best effort */ }
  }

  return NextResponse.json({ success: true });
}
