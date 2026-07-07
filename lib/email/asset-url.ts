/**
 * Fixed production base for all email image assets.
 * Never use NEXT_PUBLIC_SITE_URL or Vercel preview domains for email HTML.
 */
export const EMAIL_ASSET_BASE_DEFAULT = "https://www.pb-kinderevents.de";

export const EMAIL_LOGO_DEFAULT_URL = `${EMAIL_ASSET_BASE_DEFAULT}/assets/Logo.png`;

const UNSAFE_HOST_PATTERN = /localhost|127\.0\.0\.1|vercel\.app/i;

/** CMS/ENV base URL for resolving relative email asset paths */
export function getEmailAssetBaseUrl(): string {
  const fromEnv = process.env.EMAIL_ASSET_BASE_URL?.trim();
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    const normalized = fromEnv.replace(/\/$/, "");
    if (!UNSAFE_HOST_PATTERN.test(normalized)) return normalized;
  }
  return EMAIL_ASSET_BASE_DEFAULT;
}

export function isUnsafeEmailAssetUrl(url: string): boolean {
  return UNSAFE_HOST_PATTERN.test(url);
}

/** Canonical logo URL for all outbound emails */
export function getDefaultEmailLogoUrl(): string {
  return EMAIL_LOGO_DEFAULT_URL;
}
