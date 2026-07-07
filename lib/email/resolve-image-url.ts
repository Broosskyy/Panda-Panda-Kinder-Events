import { resolveImageUrl } from "@/lib/cms/resolve-image";
import {
  getDefaultEmailLogoUrl,
  getEmailAssetBaseUrl,
  isUnsafeEmailAssetUrl,
} from "@/lib/email/asset-url";

export {
  EMAIL_ASSET_BASE_DEFAULT,
  EMAIL_LOGO_DEFAULT_URL,
  getDefaultEmailLogoUrl,
  getEmailAssetBaseUrl,
} from "@/lib/email/asset-url";

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function looksLikeSiteAssetsPath(value: string): boolean {
  return /^(uploads|about|hero)\//i.test(value) || /^\/(uploads|about|hero)\//i.test(value);
}

function normalizeLogoPath(path: string): string {
  const trimmed = path.trim();
  if (trimmed === "/logo.png" || trimmed === "logo.png" || trimmed === "/Logo.png") {
    return "/assets/Logo.png";
  }
  if (/logo\.png$/i.test(trimmed) && !/assets\/Logo\.png$/i.test(trimmed)) {
    return "/assets/Logo.png";
  }
  return trimmed;
}

function isLogoAssetPath(path: string): boolean {
  return /\/assets\/logo\.png$/i.test(path) || path === "/assets/Logo.png" || /^logo\.png$/i.test(path);
}

/**
 * Wandelt CMS-/Branding-Bildpfade in öffentliche absolute URLs um.
 * Relative Logo-Pfade → EMAIL_ASSET_BASE_URL (www.pb-kinderevents.de).
 * Vercel-Preview-URLs werden verworfen und neu aufgelöst.
 */
export function resolveEmailImageUrl(
  path: string | null | undefined,
  baseUrl?: string,
): string | null {
  const trimmed = normalizeLogoPath(path ?? "");
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return null;

  if (isAbsoluteHttpUrl(trimmed)) {
    if (isUnsafeEmailAssetUrl(trimmed)) {
      try {
        const pathname = new URL(trimmed).pathname;
        if (isLogoAssetPath(pathname)) return getDefaultEmailLogoUrl();
        return resolveEmailImageUrl(pathname, getEmailAssetBaseUrl());
      } catch {
        return isLogoAssetPath(trimmed) ? getDefaultEmailLogoUrl() : null;
      }
    }
    return trimmed;
  }

  if (isLogoAssetPath(trimmed.startsWith("/") ? trimmed : `/${trimmed}`)) {
    return getDefaultEmailLogoUrl();
  }

  if (looksLikeSiteAssetsPath(trimmed)) {
    const storagePath = trimmed.replace(/^\//, "");
    const fromStorage = resolveImageUrl("site-assets", storagePath);
    if (fromStorage && !isUnsafeEmailAssetUrl(fromStorage)) return fromStorage;
  }

  const base = (baseUrl ?? getEmailAssetBaseUrl()).replace(/\/$/, "");
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const resolved = `${base}${normalized}`;
  if (isUnsafeEmailAssetUrl(resolved)) return null;
  return resolved;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Logo-Block: feste Produktions-URL oder CMS-Logo — nie Vercel-Preview */
export function buildEmailLogoHeaderHtml(opts: {
  logoUrl: string | null | undefined;
  companyName: string;
  baseUrl?: string;
  accentColor?: string;
}): string {
  const resolved = opts.logoUrl ? resolveEmailImageUrl(opts.logoUrl, opts.baseUrl) : null;
  const absolute = resolved && !isUnsafeEmailAssetUrl(resolved) ? resolved : getDefaultEmailLogoUrl();
  const companyName = opts.companyName?.trim() || "Panda-Bande Kinderevents";

  return `<img src="${escapeHtml(absolute)}" alt="${escapeHtml(companyName)}" width="180" style="display:block;border:0;outline:none;text-decoration:none;margin:0 auto;" />`;
}

export function buildEmailHeaderImageRow(
  headerImageUrl: string | null | undefined,
  baseUrl?: string,
): string {
  const absolute = resolveEmailImageUrl(headerImageUrl, baseUrl);
  if (!absolute || isUnsafeEmailAssetUrl(absolute)) return "";

  return `<tr><td style="padding:0;"><img src="${escapeHtml(absolute)}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" /></td></tr>`;
}
