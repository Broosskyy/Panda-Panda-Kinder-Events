import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";
import { faqs as staticFaqs } from "@/lib/faqs";
import { galleryImages as staticGallery } from "@/lib/gallery";
import { services as staticServices } from "@/lib/services";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { isPlaceholderContent, isValidCmsFaq, isValidCmsService, isValidPublishedPost } from "./content-quality";
import { DEFAULT_SITE_SETTINGS } from "./defaults";
import { normalizeSiteSettings } from "./normalize-settings";
import { resolveImageUrl } from "./resolve-image";
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

function mergeCmsSectionValue<T extends keyof SiteSettingsBundle>(
  section: T,
  defaults: SiteSettingsBundle[T],
  cmsValue: unknown,
): SiteSettingsBundle[T] {
  if (!cmsValue || typeof cmsValue !== "object") return defaults;

  const base = defaults as unknown as Record<string, unknown>;
  const patch = cmsValue as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...base, ...patch };

  if (section === "email") {
    merged.customAddresses = {
      ...(base.customAddresses as Record<string, unknown>),
      ...((patch.customAddresses as Record<string, unknown> | undefined) ?? {}),
    };
    merged.signature = {
      ...(base.signature as Record<string, unknown>),
      ...((patch.signature as Record<string, unknown> | undefined) ?? {}),
    };
    merged.branding = {
      ...(base.branding as Record<string, unknown>),
      ...((patch.branding as Record<string, unknown> | undefined) ?? {}),
    };
    merged.testMode = {
      ...(base.testMode as Record<string, unknown>),
      ...((patch.testMode as Record<string, unknown> | undefined) ?? {}),
    };
  }

  return merged as unknown as SiteSettingsBundle[T];
}

function cmsSection<T extends keyof SiteSettingsBundle>(
  section: T,
  defaults: SiteSettingsBundle[T],
  cmsValue: unknown,
  hasKey: boolean,
): SiteSettingsBundle[T] {
  if (!hasKey || !hasNonEmptyCmsValue(cmsValue)) return defaults;
  const merged = mergeCmsSectionValue(section, defaults, cmsValue);
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

function mergePublicTeamSettings(
  cmsValue: unknown,
  hasKey: boolean,
): SiteSettingsBundle["publicTeam"] {
  const defaults = DEFAULT_SITE_SETTINGS.publicTeam;
  if (!hasKey || !cmsValue || typeof cmsValue !== "object") {
    return { ...defaults, items: [] };
  }

  const validated = validateSiteSettingsSection("publicTeam", cmsValue);
  if (!validated.ok) {
    const obj = cmsValue as Record<string, unknown>;
    return {
      title: String(obj.title ?? "").trim() || defaults.title,
      subtitle: String(obj.subtitle ?? "").trim(),
      items: [],
    };
  }

  return { ...(validated.value as SiteSettingsBundle["publicTeam"]), items: [] };
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
  try {
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
    publicStats: cmsSection(
      "publicStats",
      DEFAULT_SITE_SETTINGS.publicStats,
      byKey.get("publicStats"),
      byKey.has("publicStats"),
    ),
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
    business: cmsSection(
      "business",
      DEFAULT_SITE_SETTINGS.business,
      byKey.get("business"),
      byKey.has("business"),
    ),
    email: cmsSection("email", DEFAULT_SITE_SETTINGS.email, byKey.get("email"), byKey.has("email")),
    bank: cmsSection("bank", DEFAULT_SITE_SETTINGS.bank, byKey.get("bank"), byKey.has("bank")),
    invoice: cmsSection("invoice", DEFAULT_SITE_SETTINGS.invoice, byKey.get("invoice"), byKey.has("invoice")),
    seo: cmsSection("seo", DEFAULT_SITE_SETTINGS.seo, byKey.get("seo"), byKey.has("seo")),
    legal: cmsSection("legal", DEFAULT_SITE_SETTINGS.legal, byKey.get("legal"), byKey.has("legal")),
    publicTeam: mergePublicTeamSettings(byKey.get("publicTeam"), byKey.has("publicTeam")),
    modules: cmsSection("modules", DEFAULT_SITE_SETTINGS.modules, byKey.get("modules"), byKey.has("modules")),
  };
  } catch (err) {
    console.error("buildSettingsFromRows:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

async function fetchSiteSettingsImpl(): Promise<SiteSettingsBundle> {
  if (!isSupabaseConfigured()) return normalizeSiteSettings(DEFAULT_SITE_SETTINGS);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("site_settings").select("key, value");

    if (error) {
      console.error("fetchSiteSettings:", error.message);
      return normalizeSiteSettings(DEFAULT_SITE_SETTINGS);
    }

    if (!data?.length) return normalizeSiteSettings(DEFAULT_SITE_SETTINGS);

    return normalizeSiteSettings(buildSettingsFromRows(data));
  } catch (err) {
    console.error("fetchSiteSettings:", err);
    return normalizeSiteSettings(DEFAULT_SITE_SETTINGS);
  }
}

export const fetchSiteSettings = cache(fetchSiteSettingsImpl);

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

  if (error) {
    console.error("queryCmsServices:", error.message);
    return [];
  }

  return (data as CmsService[])
    .filter((s) => isValidCmsService(s.title ?? "", s.description ?? ""))
    .map((s) => ({
      id: s.id,
      iconKey: s.icon_key?.trim() || "Star",
      title: s.title.trim(),
      description: s.description.trim(),
      detailText: s.detail_text?.trim() || s.description.trim(),
      imageUrl: (resolveImageUrl("gallery", s.image_url) ?? s.image_url?.trim()) || undefined,
      buttonLabel: s.button_label?.trim() || "Mehr erfahren",
      buttonLink: s.button_link?.trim() || undefined,
      category: s.category?.trim() || undefined,
      priceFrom: s.price_from?.trim() || undefined,
      highlights: Array.isArray(s.highlights) ? s.highlights.filter((h) => String(h).trim()) : undefined,
    }));
}

async function fetchCmsServicesImpl(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return staticServices;

  try {
    const hasCms = await tableHasRows("cms_services");
    if (!hasCms) return staticServices;

    const cmsServices = await queryCmsServices();
    if (cmsServices.length === 0) {
      console.warn("fetchCmsServices: cms_services has rows but none are publicly visible/valid");
    }
    return cmsServices;
  } catch (err) {
    console.error("fetchCmsServices:", err);
    return staticServices;
  }
}

export const fetchCmsServices = cache(fetchCmsServicesImpl);

async function fetchCmsFaqsImpl(): Promise<{ question: string; answer: string }[]> {
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

export const fetchCmsFaqs = cache(fetchCmsFaqsImpl);

async function queryGalleryImages(): Promise<{ src: string; alt: string; category: string }[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("queryGalleryImages:", error.message);
    return [];
  }

  return (data as GalleryImageRecord[])
    .map((img) => ({
      src: resolveImageUrl("gallery", img.storage_path) ?? "",
      alt: img.alt_text?.trim() || img.title?.trim() || "Galeriebild Panda-Bande",
      title: img.title?.trim() || undefined,
      category: img.category?.trim() || "Sonstiges",
    }))
    .filter((img) => img.src);
}

async function fetchGalleryImagesImpl(): Promise<{ src: string; alt: string; category: string }[]> {
  const withCategory = (images: { src: string; alt: string; category?: string }[]) =>
    images.map((img) => ({ ...img, category: img.category ?? "Sonstiges" }));

  if (!isSupabaseConfigured()) return withCategory(staticGallery);

  try {
    const hasCms = await tableHasRows("gallery_images");
    if (!hasCms) return withCategory(staticGallery);

    const images = await queryGalleryImages();
    return images.length > 0 ? images : withCategory(staticGallery);
  } catch (err) {
    console.error("fetchGalleryImages:", err);
    return withCategory(staticGallery);
  }
}

export const fetchGalleryImages = cache(fetchGalleryImagesImpl);

async function fetchPublishedPostsImpl(limit = 6): Promise<CmsPost[]> {
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

    return (data as CmsPost[])
      .map((post) => ({
        ...post,
        hero_image_url: resolveImageUrl("site-assets", post.hero_image_path),
      }))
      .filter(isValidPublishedPost);
  } catch (err) {
    console.error("fetchPublishedPosts:", err);
    return [];
  }
}

export const fetchPublishedPosts = cache(fetchPublishedPostsImpl);

async function fetchPostBySlugImpl(slug: string): Promise<CmsPost | null> {
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
  const resolved = {
    ...post,
    hero_image_url: resolveImageUrl("site-assets", post.hero_image_path),
  };
  return isValidPublishedPost(resolved) ? resolved : null;
}

export const fetchPostBySlug = cache(fetchPostBySlugImpl);

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
