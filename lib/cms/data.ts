import { unstable_noStore as noStore } from "next/cache";
import { faqs as staticFaqs } from "@/lib/faqs";
import { galleryImages as staticGallery } from "@/lib/gallery";
import { services as staticServices } from "@/lib/services";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { isPlaceholderContent, isValidCmsFaq, isValidCmsService } from "./content-quality";
import { DEFAULT_SITE_SETTINGS } from "./defaults";
import { resolveImageUrl } from "./resolve-image";
import { resolveServiceIcon } from "./icons";
import { hasNonEmptyCmsValue, validateSiteSettingsSection } from "./validate-settings";
import type {
  CmsFaq,
  CmsPost,
  CmsService,
  GalleryImageRecord,
  SiteAboutSettings,
  SiteHeroSettings,
  SiteSettingsBundle,
} from "./types";
import type { Service } from "@/lib/services";

function cmsSection<T extends keyof SiteSettingsBundle>(
  section: T,
  defaults: SiteSettingsBundle[T],
  cmsValue: unknown,
  hasKey: boolean,
): SiteSettingsBundle[T] {
  if (!hasKey || !hasNonEmptyCmsValue(cmsValue)) return defaults;
  const merged = {
    ...(defaults as unknown as Record<string, unknown>),
    ...(cmsValue as Record<string, unknown>),
  };
  const validated = validateSiteSettingsSection(section, merged);
  if (!validated.ok) return defaults;
  return validated.value as SiteSettingsBundle[T];
}

function normalizeAboutSettings(about: SiteAboutSettings): SiteAboutSettings {
  const resolved = resolveImageUrl("site-assets", about.imageUrl);
  const imageUrl =
    (resolved ?? about.imageUrl?.trim()) || DEFAULT_SITE_SETTINGS.about.imageUrl;
  return { ...about, imageUrl };
}

function normalizeHeroSettings(hero: SiteHeroSettings): SiteHeroSettings {
  const resolved = resolveImageUrl("site-assets", hero.imageUrl);
  const imageUrl =
    (resolved ?? hero.imageUrl?.trim()) || DEFAULT_SITE_SETTINGS.hero.imageUrl;
  return { ...hero, imageUrl };
}

function filterPlaceholderItems<T extends { text?: string; title?: string; description?: string; question?: string; answer?: string }>(
  items: T[],
): T[] {
  return items.filter((item) => {
    if ("text" in item && item.text !== undefined) {
      return !isPlaceholderContent(item.text);
    }
    if ("title" in item && "description" in item) {
      return !isPlaceholderContent(item.title) && !isPlaceholderContent(item.description);
    }
    if ("question" in item && "answer" in item) {
      return !isPlaceholderContent(item.question) && !isPlaceholderContent(item.answer);
    }
    return true;
  });
}

function buildSettingsFromRows(
  rows: { key: string; value: unknown }[],
): SiteSettingsBundle {
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  const aboutRaw = cmsSection(
    "about",
    DEFAULT_SITE_SETTINGS.about,
    byKey.get("about"),
    byKey.has("about"),
  );

  const heroRaw = cmsSection("hero", DEFAULT_SITE_SETTINGS.hero, byKey.get("hero"), byKey.has("hero"));
  const trustBadgesRaw = cmsSection(
    "trustBadges",
    DEFAULT_SITE_SETTINGS.trustBadges,
    byKey.get("trustBadges"),
    byKey.has("trustBadges"),
  );
  const uspsRaw = cmsSection("usps", DEFAULT_SITE_SETTINGS.usps, byKey.get("usps"), byKey.has("usps"));
  const processRaw = cmsSection(
    "process",
    DEFAULT_SITE_SETTINGS.process,
    byKey.get("process"),
    byKey.has("process"),
  );

  const trustItems = filterPlaceholderItems(trustBadgesRaw.items);
  const uspItems = filterPlaceholderItems(uspsRaw.items);
  const processSteps = filterPlaceholderItems(processRaw.steps);

  return {
    hero: normalizeHeroSettings(heroRaw),
    contact: cmsSection(
      "contact",
      DEFAULT_SITE_SETTINGS.contact,
      byKey.get("contact"),
      byKey.has("contact"),
    ),
    about: normalizeAboutSettings(aboutRaw),
    footer: cmsSection(
      "footer",
      DEFAULT_SITE_SETTINGS.footer,
      byKey.get("footer"),
      byKey.has("footer"),
    ),
    navigation: cmsSection(
      "navigation",
      DEFAULT_SITE_SETTINGS.navigation,
      byKey.get("navigation"),
      byKey.has("navigation"),
    ),
    branding: cmsSection(
      "branding",
      DEFAULT_SITE_SETTINGS.branding,
      byKey.get("branding"),
      byKey.has("branding"),
    ),
    trustBadges: {
      items: trustItems.length > 0 ? trustItems : DEFAULT_SITE_SETTINGS.trustBadges.items,
    },
    usps: {
      ...uspsRaw,
      items: uspItems.length > 0 ? uspItems : DEFAULT_SITE_SETTINGS.usps.items,
    },
    process: {
      ...processRaw,
      steps: processSteps.length > 0 ? processSteps : DEFAULT_SITE_SETTINGS.process.steps,
    },
    sections: cmsSection(
      "sections",
      DEFAULT_SITE_SETTINGS.sections,
      byKey.get("sections"),
      byKey.has("sections"),
    ),
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

async function queryCmsServices(): Promise<Service[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_services")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data as CmsService[])
    .filter((s) => isValidCmsService(s.title ?? "", s.description ?? ""))
    .map((s) => ({
      icon: resolveServiceIcon(s.icon_key),
      title: s.title.trim(),
      description: s.description.trim(),
    }));
}

function hasValidCmsServices(services: Service[]): boolean {
  return services.length > 0;
}

export async function fetchCmsServices(): Promise<Service[]> {
  noStore();
  if (!isSupabaseConfigured()) return staticServices;

  try {
    const hasCms = await tableHasRows("cms_services");
    if (!hasCms) return staticServices;

    try {
      const cmsServices = await queryCmsServices();
      return hasValidCmsServices(cmsServices) ? cmsServices : staticServices;
    } catch (firstError) {
      console.error("fetchCmsServices (retry):", firstError);
      const cmsServices = await queryCmsServices();
      return hasValidCmsServices(cmsServices) ? cmsServices : staticServices;
    }
  } catch (err) {
    console.error("fetchCmsServices:", err);
    const hasCms = await tableHasRows("cms_services").catch(() => false);
    return hasCms ? [] : staticServices;
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
      return staticFaqs;
    }

    const faqResults = (data as CmsFaq[])
      .filter((f) => isValidCmsFaq(f.question ?? "", f.answer ?? ""))
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }));

    return faqResults.length > 0 ? faqResults : staticFaqs;
  } catch (err) {
    console.error("fetchCmsFaqs:", err);
    return staticFaqs;
  }
}

async function queryGalleryImages(): Promise<{ src: string; alt: string }[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data as GalleryImageRecord[])
    .map((img) => ({
      src: resolveImageUrl("gallery", img.storage_path) ?? "",
      alt: img.alt_text?.trim() || img.title?.trim() || "Galeriebild",
    }))
    .filter((img) => img.src);
}

export async function fetchGalleryImages(): Promise<{ src: string; alt: string }[]> {
  noStore();
  if (!isSupabaseConfigured()) return staticGallery;

  try {
    const hasCms = await tableHasRows("gallery_images");
    if (!hasCms) return staticGallery;

    try {
      return await queryGalleryImages();
    } catch (firstError) {
      console.error("fetchGalleryImages (retry):", firstError);
      return await queryGalleryImages();
    }
  } catch (err) {
    console.error("fetchGalleryImages:", err);
    const hasCms = await tableHasRows("gallery_images").catch(() => false);
    return hasCms ? [] : staticGallery;
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
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("fetchPublishedPosts:", error.message);
      return [];
    }

    if (!data) return [];

    return (data as CmsPost[]).map((post) => ({
      ...post,
      hero_image_url: resolveImageUrl("site-assets", post.hero_image_path),
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
    hero_image_url: resolveImageUrl("site-assets", post.hero_image_path),
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
