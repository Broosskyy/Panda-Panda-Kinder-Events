import { resolveImageUrl } from "@/lib/cms/resolve-image";
import {
  canonicalizeEmailAssetUrl,
  getDefaultEmailLogoUrl,
  getEmailAssetBaseUrl,
  isUnsafeEmailAssetUrl,
} from "@/lib/email/asset-url";

import { SYSTEM_DEFAULTS } from "@/lib/system-config";

/** Alt-Text für E-Mail-Logos (Barrierefreiheit in Mail-Clients) */
export const EMAIL_LOGO_ALT = SYSTEM_DEFAULTS.company.name;

/**
 * E-Mail-Bilder nutzen resolveEmailAssetBaseUrl() aus lib/system-config —
 * nicht NEXT_PUBLIC_SITE_URL (Vercel-Preview-Schutz).
 */

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
  if (isAbsoluteHttpUrl(trimmed)) return trimmed;
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

function finalizeAbsoluteUrl(url: string): string | null {
  const canonical = canonicalizeEmailAssetUrl(url);
  if (isUnsafeEmailAssetUrl(canonical)) return null;
  return canonical;
}

/**
 * Wandelt CMS-/Branding-Bildpfade in öffentliche absolute HTTPS-URLs um.
 * Relative Logo-Pfade → absolute HTTPS-URL über resolveEmailAssetBaseUrl()
 * Vercel-Preview- und localhost-URLs werden verworfen und neu aufgelöst.
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
    return finalizeAbsoluteUrl(trimmed);
  }

  if (isLogoAssetPath(trimmed.startsWith("/") ? trimmed : `/${trimmed}`)) {
    return getDefaultEmailLogoUrl();
  }

  if (looksLikeSiteAssetsPath(trimmed)) {
    const storagePath = trimmed.replace(/^\//, "");
    const fromStorage = resolveImageUrl("site-assets", storagePath);
    if (fromStorage) {
      const safe = finalizeAbsoluteUrl(fromStorage);
      if (safe) return safe;
    }
  }

  const base = canonicalizeEmailAssetUrl((baseUrl ?? getEmailAssetBaseUrl()).replace(/\/$/, ""));
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const resolved = `${base}${normalized}`;
  return finalizeAbsoluteUrl(resolved);
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
  logoWidth?: number;
  logoHeight?: number;
}): string {
  const resolved = opts.logoUrl ? resolveEmailImageUrl(opts.logoUrl, opts.baseUrl) : null;
  const absolute = resolved ?? getDefaultEmailLogoUrl();
  const companyName = opts.companyName?.trim() || "Panda-Bande Kinderevents";
  const width = opts.logoWidth ?? 140;
  const heightAttr = opts.logoHeight && opts.logoHeight > 0 ? ` height="${opts.logoHeight}"` : "";

  return `<img src="${escapeHtml(absolute)}" alt="${escapeHtml(companyName || EMAIL_LOGO_ALT)}" width="${width}"${heightAttr} style="display:block;border:0;outline:none;text-decoration:none;margin:0 auto;" />`;
}

export function buildEmailHeaderBlock(opts: {
  logoUrl: string;
  brandName?: string;
  slogan?: string;
  showLogo?: boolean;
  showBrandName?: boolean;
  showSlogan?: boolean;
  logoWidth?: number;
  logoHeight?: number;
  logoPaddingTop?: number;
  logoPaddingBottom?: number;
  textColor?: string;
  textMutedColor?: string;
  primaryColor?: string;
  baseUrl?: string;
}): string {
  const parts: string[] = [];
  const padTop = opts.logoPaddingTop ?? 32;
  const padBottom = opts.logoPaddingBottom ?? 16;

  if (opts.showLogo !== false) {
    parts.push(
      buildEmailLogoHeaderHtml({
        logoUrl: opts.logoUrl,
        companyName: opts.brandName || "Panda-Bande Kinderevents",
        baseUrl: opts.baseUrl,
        logoWidth: opts.logoWidth,
        logoHeight: opts.logoHeight,
      }),
    );
  }

  if (opts.showBrandName !== false && opts.brandName?.trim()) {
    parts.push(
      `<p style="margin:${opts.showLogo !== false ? "16px" : "0"} 0 4px;font-size:17px;font-weight:600;color:${opts.textColor || "#2F2F2F"};letter-spacing:0.01em;">${escapeHtml(opts.brandName.trim())}</p>`,
    );
  }

  if (opts.showSlogan !== false && opts.slogan?.trim()) {
    parts.push(
      `<p style="margin:0;font-size:13px;color:${opts.textMutedColor || "#6B6B6B"};font-style:italic;">${escapeHtml(opts.slogan.trim())}</p>`,
    );
  }

  if (!parts.length) return "";

  return `<div style="padding:${padTop}px 32px ${padBottom}px;text-align:center;">${parts.join("")}</div>`;
}

export function buildEmailHeaderImageRow(
  headerImageUrl: string | null | undefined,
  baseUrl?: string,
): string {
  const absolute = resolveEmailImageUrl(headerImageUrl, baseUrl);
  if (!absolute) return "";

  return `<tr><td style="padding:0;"><img src="${escapeHtml(absolute)}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" /></td></tr>`;
}
