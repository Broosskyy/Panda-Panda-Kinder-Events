import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPublicUrl } from "@/lib/cms/storage";
import { CMS_SAVE_SUCCESS_MESSAGE } from "@/lib/cms/messages";
import { revalidatePublicCms } from "@/lib/cms/revalidate";
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

function pickPostFields(body: Record<string, unknown>) {
  const published = Boolean(body.published);
  let published_at: string | null = body.published_at ? String(body.published_at) : null;
  if (published && !published_at) {
    published_at = new Date().toISOString();
  }

  return {
    title: String(body.title ?? ""),
    subtitle: String(body.subtitle ?? ""),
    content: String(body.content ?? ""),
    hero_image_path: (body.hero_image_path as string | null) ?? null,
    category: String(body.category ?? "aktuelles"),
    published,
    published_at,
  };
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
  const fields = pickPostFields(body);
  const slug = await ensureUniqueSlug(body.slug ? slugify(String(body.slug)) : slugify(fields.title || "beitrag"));
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_posts")
    .insert({ ...fields, slug })
    .select()
    .single();

  if (error) {
    console.error("posts POST:", error.message);
    return NextResponse.json({ error: `Erstellen fehlgeschlagen: ${error.message}` }, { status: 500 });
  }

  revalidatePublicCms(data.slug);
  return NextResponse.json({ post: data, message: CMS_SAVE_SUCCESS_MESSAGE });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id, slug: rawSlug, ...rawUpdates } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const updates = pickPostFields({ ...rawUpdates, title: rawUpdates.title ?? "" });
  let newSlug: string | undefined;
  if (rawSlug) {
    newSlug = await ensureUniqueSlug(slugify(String(rawSlug)), id);
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from("cms_posts").select("slug").eq("id", id).single();
  const { error } = await supabase
    .from("cms_posts")
    .update({
      ...updates,
      ...(newSlug ? { slug: newSlug } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("posts PATCH:", error.message);
    return NextResponse.json({ error: `Update fehlgeschlagen: ${error.message}` }, { status: 500 });
  }

  const slug = newSlug ?? existing?.slug;
  revalidatePublicCms(slug);
  return NextResponse.json({ success: true, message: CMS_SAVE_SUCCESS_MESSAGE });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from("cms_posts").select("slug").eq("id", id).single();
  const { error } = await supabase.from("cms_posts").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });
  revalidatePublicCms(existing?.slug);
  return NextResponse.json({ success: true, message: CMS_SAVE_SUCCESS_MESSAGE });
}
