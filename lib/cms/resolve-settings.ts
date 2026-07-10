import type { SiteSettingsBundle } from "./types";
import { BRAND } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";
import { resolveGoogleIntegrations } from "@/lib/system-config";

/** Resolves public site URL: SEO canonical → business website → env fallback. */
export function resolvePublicSiteUrl(settings: Pick<SiteSettingsBundle, "seo" | "business">): string {
  const canonical = settings.seo?.canonicalBaseUrl?.trim();
  if (canonical) return canonical.replace(/\/$/, "");

  const domain = settings.seo?.primaryDomain?.trim();
  if (domain) {
    const withProto = domain.startsWith("http") ? domain : `https://${domain}`;
    return withProto.replace(/\/$/, "");
  }

  const website = settings.business?.website?.trim();
  if (website && !website.includes("panda-bande-events.de") && !website.includes("resend.dev")) {
    const withProto = website.startsWith("http") ? website : `https://${website}`;
    return withProto.replace(/\/$/, "");
  }

  return getSiteUrl();
}

export function resolveSeoMeta(settings: SiteSettingsBundle) {
  const base = resolvePublicSiteUrl(settings);
  const ogImage = settings.seo.ogImageUrl?.trim();
  const ogUrl = ogImage?.startsWith("http") ? ogImage : `${base}${ogImage || BRAND.assets.ogImage}`;
  const google = resolveGoogleIntegrations(settings.seo);

  return {
    baseUrl: base,
    title: settings.seo.metaTitle?.trim() || settings.business.companyName,
    description: settings.seo.metaDescription?.trim() || settings.business.description,
    ogImage: ogUrl,
    robotsIndex: settings.seo.robotsIndex !== false,
    googleSiteVerification: google.siteVerification,
    googleAnalyticsId: google.analyticsId,
    googleTagManagerId: google.tagManagerId,
    microsoftClarityId: google.clarityId,
    googleMapsApiKey: google.mapsApiKey,
    googleRecaptchaSiteKey: google.recaptchaSiteKey,
  };
}

export function formatDocumentNumberPreview(
  prefix: string,
  yearInNumber: boolean,
  startNumber: number,
): string {
  const year = new Date().getFullYear();
  const num = String(startNumber).padStart(4, "0");
  return yearInNumber ? `${prefix}-${year}-${num}` : `${prefix}-${num}`;
}
