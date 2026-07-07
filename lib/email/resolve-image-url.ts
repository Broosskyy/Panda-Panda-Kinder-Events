import { resolveImageUrl } from "@/lib/cms/resolve-image";
import { getSiteUrl } from "@/lib/site-url";
import { EMAIL_LOGO_URL, EMAIL_LOGO_WIDTH } from "@/lib/email/brand-tokens";

export const EMAIL_LOGO_ALT = "Panda-Bande Kinderevents";
export const EMAIL_ASSET_BASE_FALLBACK = "https://pb-kinderevents.de";

/** Öffentliche Basis-URL für E-Mail-Bilder (immer HTTPS, nie localhost). */
export function getEmailAssetBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    const normalized = fromEnv.replace(/\/$/, "");
    if (!/localhost|127\.0\.0\.1/i.test(normalized)) {
      return normalized;
    }
  }

  try {
    const site = getSiteUrl().replace(/\/$/, "");
    if (/^https?:\/\//i.test(site) && !/localhost|127\.0\.0\.1/i.test(site)) {
      return site;
    }
  } catch {
    // ignore
  }

  return EMAIL_ASSET_BASE_FALLBACK;
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function looksLikeSiteAssetsPath(value: string): boolean {
  return /^(uploads|about|hero)\//i.test(value) || /^\/(uploads|about|hero)\//i.test(value);
}

function normalizeLogoPath(path: string): string {
  const trimmed = path.trim();
  if (/logo\.png$/i.test(trimmed) && !/Logo\.png$/.test(trimmed)) {
    return trimmed.replace(/logo\.png$/i, "Logo.png");
  }
  if (trimmed === "/logo.png" || trimmed === "logo.png") {
    return "/assets/Logo.png";
  }
  return trimmed;
}

/**
 * Wandelt CMS-/Branding-Bildpfade in öffentliche absolute URLs um.
 * Kein base64, keine relativen Pfade in der Ausgabe.
 */
export function resolveEmailImageUrl(
  path: string | null | undefined,
  baseUrl?: string,
): string | null {
  const trimmed = normalizeLogoPath(path ?? "");
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return null;
  if (isAbsoluteHttpUrl(trimmed)) return trimmed;

  if (looksLikeSiteAssetsPath(trimmed)) {
    const storagePath = trimmed.replace(/^\//, "");
    const fromStorage = resolveImageUrl("site-assets", storagePath);
    if (fromStorage) return fromStorage;
  }

  const base = (baseUrl ?? getEmailAssetBaseUrl()).replace(/\/$/, "");
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${normalized}`;
}

/** Standard-Logo für E-Mails — immer absolute HTTPS-URL mit großem L. */
export function getDefaultEmailLogoUrl(baseUrl?: string): string {
  return resolveEmailImageUrl("/assets/Logo.png", baseUrl) ?? EMAIL_LOGO_URL;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Logo-Block: Bild mit absoluter URL oder Text-Fallback ohne broken image. */
export function buildEmailLogoHeaderHtml(opts: {
  logoUrl: string | null | undefined;
  companyName: string;
  baseUrl?: string;
  accentColor?: string;
}): string {
  const absolute = resolveEmailImageUrl(opts.logoUrl, opts.baseUrl) ?? getDefaultEmailLogoUrl(opts.baseUrl);
  const companyName = opts.companyName?.trim() || EMAIL_LOGO_ALT;
  const color = opts.accentColor ?? "#4F5638";

  if (!absolute) {
    return `<p style="margin:0;font-size:22px;font-weight:700;color:${color};letter-spacing:.02em;">${escapeHtml(companyName)}</p>`;
  }

  return `<img src="${escapeHtml(absolute)}" alt="${escapeHtml(EMAIL_LOGO_ALT)}" width="${EMAIL_LOGO_WIDTH}" style="display:block;margin:0 auto;max-width:${EMAIL_LOGO_WIDTH}px;width:${EMAIL_LOGO_WIDTH}px;height:auto;border:0;object-fit:contain;" />`;
}

export function buildEmailHeaderImageRow(
  headerImageUrl: string | null | undefined,
  baseUrl?: string,
): string {
  const absolute = resolveEmailImageUrl(headerImageUrl, baseUrl);
  if (!absolute) return "";

  return `<tr><td style="padding:0;"><img src="${escapeHtml(absolute)}" alt="${escapeHtml(EMAIL_LOGO_ALT)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" /></td></tr>`;
}
