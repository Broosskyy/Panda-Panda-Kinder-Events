import { unstable_noStore as noStore } from "next/cache";
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

function mergeSection<T extends object>(defaults: T, cmsValue: unknown): T {
  if (!cmsValue || typeof cmsValue !== "object") return defaults;
  return { ...defaults, ...(cmsValue as T) };
}

function buildSettingsFromRows(
  rows: { key: string; value: unknown }[],
): SiteSettingsBundle {
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  return {
    hero: byKey.has("hero")
      ? mergeSection(DEFAULT_SITE_SETTINGS.hero, byKey.get("hero"))
      : DEFAULT_SITE_SETTINGS.hero,
    contact: byKey.has("contact")
      ? mergeSection(DEFAULT_SITE_SETTINGS.contact, byKey.get("contact"))
      : DEFAULT_SITE_SETTINGS.contact,
    about: byKey.has("about")
      ? mergeSection(DEFAULT_SITE_SETTINGS.about, byKey.get("about"))
      : DEFAULT_SITE_SETTINGS.about,
    footer: byKey.has("footer")
      ? mergeSection(DEFAULT_SITE_SETTINGS.footer, byKey.get("footer"))
      : DEFAULT_SITE_SETTINGS.footer,
  };
}

export async function fetchSiteSettings(): Promise<SiteSettingsBundle> {
  noStore();
  if (!isSupabaseConfigured()) return DEFAULT_SITE_SETTINGS;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("site_settings").select("key, value");

    if (error) {
      console.error("fetchSiteSettings:", error.message);
      return DEFAULT_SITE_SETTINGS;
    }

    if (!data?.length) return DEFAULT_SITE_SETTINGS;

    return buildSettingsFromRows(data);
  } catch (err) {
    console.error("fetchSiteSettings:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(
  section: keyof SiteSettingsBundle,
  value: SiteSettingsBundle[keyof SiteSettingsBundle],
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: section,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}

async function tableHasRows(table: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error(`tableHasRows(${table}):`, error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

export async function fetchCmsServices(): Promise<Service[]> {
  noStore();
  if (!isSupabaseConfigured()) return staticServices;

  try {
    const hasCms = await tableHasRows("cms_services");
    if (!hasCms) return staticServices;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cms_services")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("fetchCmsServices:", error.message);
      return [];
    }

    return (data as CmsService[]).map((s) => ({
      icon: resolveServiceIcon(s.icon_key),
      title: s.title,
      description: s.description,
    }));
  } catch (err) {
    console.error("fetchCmsServices:", err);
    return staticServices;
  }
}

export async function fetchCmsFaqs(): Promise<{ question: string; answer: string }[]> {
  noStore();
  if (!isSupabaseConfigured()) return staticFaqs;

  try {
    const hasCms = await tableHasRows("cms_faqs");
    if (!hasCms) return staticFaqs;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cms_faqs")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("fetchCmsFaqs:", error.message);
      return [];
    }

    return (data as CmsFaq[]).map((f) => ({ question: f.question, answer: f.answer }));
  } catch (err) {
    console.error("fetchCmsFaqs:", err);
    return staticFaqs;
  }
}

export async function fetchGalleryImages(): Promise<{ src: string; alt: string }[]> {
  noStore();
  if (!isSupabaseConfigured()) return staticGallery;

  try {
    const hasCms = await tableHasRows("gallery_images");
    if (!hasCms) return staticGallery;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("fetchGalleryImages:", error.message);
      return [];
    }

    return (data as GalleryImageRecord[]).map((img) => ({
      src: getPublicUrl("gallery", img.storage_path),
      alt: img.alt_text || img.title || "Galeriebild",
    }));
  } catch (err) {
    console.error("fetchGalleryImages:", err);
    return staticGallery;
  }
}

export async function fetchPublishedPosts(limit = 6): Promise<CmsPost[]> {
  noStore();
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cms_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("fetchPublishedPosts:", error.message);
      return [];
    }

    if (!data) return [];

    return (data as CmsPost[]).map((post) => ({
      ...post,
      hero_image_url: post.hero_image_path
        ? getPublicUrl("site-assets", post.hero_image_path)
        : null,
    }));
  } catch (err) {
    console.error("fetchPublishedPosts:", err);
    return [];
  }
}

export async function fetchPostBySlug(slug: string): Promise<CmsPost | null> {
  noStore();
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("fetchPostBySlug:", error.message);
    return null;
  }

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

export async function fetchCmsDebugSnapshot() {
  noStore();
  if (!isSupabaseConfigured()) {
    return { configured: false, fetchedAt: new Date().toISOString() };
  }

  const supabase = getSupabaseAdmin();
  const [settings, services, faqs, gallery, posts, reviews] = await Promise.all([
    supabase.from("site_settings").select("key, value, updated_at"),
    supabase.from("cms_services").select("id", { count: "exact", head: true }),
    supabase.from("cms_faqs").select("id", { count: "exact", head: true }),
    supabase.from("gallery_images").select("id", { count: "exact", head: true }),
    supabase.from("cms_posts").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("approved", true),
  ]);

  return {
    configured: true,
    fetchedAt: new Date().toISOString(),
    siteSettings: settings.data ?? [],
    counts: {
      services: services.count ?? 0,
      faqs: faqs.count ?? 0,
      gallery: gallery.count ?? 0,
      publishedPosts: posts.count ?? 0,
      approvedReviews: reviews.count ?? 0,
    },
    publicPreview: await Promise.all([
      fetchSiteSettings(),
      fetchGalleryImages(),
      fetchPublishedPosts(3),
    ]).then(([s, g, p]) => ({
      aboutIntro: s.about.introText,
      contactPhone: s.contact.phone,
      galleryImages: g.length,
      publishedPosts: p.map((post) => post.title),
    })),
  };
}
