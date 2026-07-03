import { faqs as staticFaqs } from "@/lib/faqs";
import { galleryImages as staticGallery } from "@/lib/gallery";
import { services as staticServices } from "@/lib/services";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { DEFAULT_SITE_SETTINGS } from "./defaults";
import { getPublicUrl } from "./storage";
import { resolveServiceIcon } from "./icons";
import type {
  CmsFaq,
  CmsPost,
  CmsService,
  GalleryImageRecord,
  SiteSettingsBundle,
} from "./types";
import type { Service } from "@/lib/services";

function mergeSettings(partial: Partial<SiteSettingsBundle>): SiteSettingsBundle {
  return {
    hero: { ...DEFAULT_SITE_SETTINGS.hero, ...partial.hero },
    contact: { ...DEFAULT_SITE_SETTINGS.contact, ...partial.contact },
    about: { ...DEFAULT_SITE_SETTINGS.about, ...partial.about },
    footer: { ...DEFAULT_SITE_SETTINGS.footer, ...partial.footer },
  };
}

export async function fetchSiteSettings(): Promise<SiteSettingsBundle> {
  if (!isSupabaseConfigured()) return DEFAULT_SITE_SETTINGS;

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("site_settings").select("key, value");

    if (!data?.length) return DEFAULT_SITE_SETTINGS;

    const partial: Partial<SiteSettingsBundle> = {};
    for (const row of data) {
      if (row.key === "hero") partial.hero = row.value as SiteSettingsBundle["hero"];
      if (row.key === "contact") partial.contact = row.value as SiteSettingsBundle["contact"];
      if (row.key === "about") partial.about = row.value as SiteSettingsBundle["about"];
      if (row.key === "footer") partial.footer = row.value as SiteSettingsBundle["footer"];
    }
    return mergeSettings(partial);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(
  section: keyof SiteSettingsBundle,
  value: SiteSettingsBundle[keyof SiteSettingsBundle],
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("site_settings").upsert({
    key: section,
    value,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function fetchCmsServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return staticServices;

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("cms_services")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (!data?.length) return staticServices;

    return (data as CmsService[]).map((s) => ({
      icon: resolveServiceIcon(s.icon_key),
      title: s.title,
      description: s.description,
    }));
  } catch {
    return staticServices;
  }
}

export async function fetchCmsFaqs(): Promise<{ question: string; answer: string }[]> {
  if (!isSupabaseConfigured()) return staticFaqs;

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("cms_faqs")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (!data?.length) return staticFaqs;

    return (data as CmsFaq[]).map((f) => ({ question: f.question, answer: f.answer }));
  } catch {
    return staticFaqs;
  }
}

export async function fetchGalleryImages(): Promise<{ src: string; alt: string }[]> {
  if (!isSupabaseConfigured()) return staticGallery;

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (!data?.length) return staticGallery;

    return (data as GalleryImageRecord[]).map((img) => ({
      src: getPublicUrl("gallery", img.storage_path),
      alt: img.alt_text || img.title || "Galeriebild",
    }));
  } catch {
    return staticGallery;
  }
}

export async function fetchPublishedPosts(limit = 6): Promise<CmsPost[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("cms_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (!data) return [];

    return (data as CmsPost[]).map((post) => ({
      ...post,
      hero_image_url: post.hero_image_path
        ? getPublicUrl("site-assets", post.hero_image_path)
        : null,
    }));
  } catch {
    return [];
  }
}

export async function fetchPostBySlug(slug: string): Promise<CmsPost | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("cms_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!data) return null;

  const post = data as CmsPost;
  return {
    ...post,
    hero_image_url: post.hero_image_path
      ? getPublicUrl("site-assets", post.hero_image_path)
      : null,
  };
}

export async function fetchDashboardStats() {
  const supabase = getSupabaseAdmin();
  const [bookings, reviews, gallery, posts] = await Promise.all([
    supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("approved", false),
    supabase.from("gallery_images").select("id", { count: "exact", head: true }),
    supabase.from("cms_posts").select("id", { count: "exact", head: true }),
  ]);

  return {
    newBookings: bookings.count ?? 0,
    pendingReviews: reviews.count ?? 0,
    galleryCount: gallery.count ?? 0,
    postsCount: posts.count ?? 0,
  };
}
