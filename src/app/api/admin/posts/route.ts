import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPublicUrl } from "@/lib/cms/storage";
import type { CmsPost } from "@/lib/cms/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || `beitrag-${Date.now()}`;
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  let slug = base;
  let counter = 1;

  while (true) {
    let query = supabase.from("cms_posts").select("id").eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    slug = `${base}-${counter++}`;
  }
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Laden fehlgeschlagen." }, { status: 500 });

  const posts = ((data ?? []) as CmsPost[]).map((p) => ({
    ...p,
    hero_image_url: p.hero_image_path ? getPublicUrl("site-assets", p.hero_image_path) : null,
  }));

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const slug = await ensureUniqueSlug(body.slug ? slugify(body.slug) : slugify(body.title ?? "beitrag"));
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_posts")
    .insert({ ...body, slug })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Erstellen fehlgeschlagen." }, { status: 500 });
  return NextResponse.json({ post: data });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id, slug: rawSlug, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  if (rawSlug) {
    updates.slug = await ensureUniqueSlug(slugify(rawSlug), id);
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("cms_posts")
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
  const { error } = await supabase.from("cms_posts").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });
  return NextResponse.json({ success: true });
}
