import { BRAND, type LogoContext } from "@/lib/brand";
import type { SiteBrandingSettings } from "@/lib/cms/types";

const LEGACY_ICON_PATTERNS = [
  "/branding/favicon",
  "/branding/icon",
  "/branding/apple",
  "/icons/panda-",
  "/icons/panda-mark",
  "/favicon.png",
  "/assets/logo.png",
  "/assets/appicon",
  "/panda-illustration",
];

function isLegacyIconPath(url: string): boolean {
  const lower = url.toLowerCase();
  return LEGACY_ICON_PATTERNS.some((p) => lower.includes(p));
}

function pickUrl(...candidates: (string | undefined | null)[]): string {
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed && !isLegacyIconPath(trimmed)) return trimmed;
  }
  return BRAND.master;
}

function pickIconUrl(cmsValue: string | undefined | null, fallback: string): string {
  const trimmed = cmsValue?.trim();
  if (trimmed && !isLegacyIconPath(trimmed)) return trimmed;
  return fallback;
}

/** CMS-Override oder Master-Logo — eine konsistente Quelle pro Kontext */
export function resolveBrandLogo(
  branding: SiteBrandingSettings | undefined,
  context: LogoContext,
): string {
  const b = branding;

  switch (context) {
    case "footer":
      return pickUrl(b?.logoLightUrl, b?.logoUrl);
    case "email":
      return pickUrl(b?.emailLogoUrl, b?.logoUrl);
    case "pdf":
      return pickUrl(b?.pdfLogoUrl, b?.logoUrl);
    case "login":
      return pickUrl(b?.loginLogoUrl, b?.logoUrl);
    case "admin":
      return pickUrl(b?.logoUrl);
    default:
      return pickUrl(b?.logoUrl);
  }
}

export function resolveFaviconUrl(branding?: SiteBrandingSettings): string {
  return pickIconUrl(branding?.faviconUrl, BRAND.assets.faviconPng);
}

export function resolveAppleTouchIconUrl(branding?: SiteBrandingSettings): string {
  return pickIconUrl(branding?.appleTouchIconUrl, BRAND.assets.appleTouchIcon);
}

export function resolveOgImageUrl(branding?: SiteBrandingSettings, seoOgUrl?: string): string {
  const fromBranding = branding?.ogImageUrl?.trim();
  if (fromBranding) return fromBranding;
  const fromSeo = seoOgUrl?.trim();
  if (fromSeo) return fromSeo;
  return BRAND.assets.ogImage;
}

export function resolvePwaIcon192(branding?: SiteBrandingSettings): string {
  return pickIconUrl(branding?.pwaIcon192Url, BRAND.assets.icon192);
}

export function resolvePwaIcon512(branding?: SiteBrandingSettings): string {
  return pickIconUrl(branding?.pwaIcon512Url, BRAND.assets.icon512);
}

export function resolvePrimaryColor(branding?: SiteBrandingSettings): string {
  return branding?.primaryColor?.trim() || BRAND.themeColor;
}

export function resolveAccentColor(branding?: SiteBrandingSettings): string {
  return branding?.accentColor?.trim() || BRAND.accentColor;
}

export function resolveBrandAlt(branding?: SiteBrandingSettings): string {
  return branding?.logoAlt?.trim() || BRAND.alt;
}

/** Absolute URL für E-Mails und externe Dienste */
export function toAbsoluteBrandUrl(path: string, baseUrl: string): string {
  if (path.startsWith("http")) return path;
  return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
