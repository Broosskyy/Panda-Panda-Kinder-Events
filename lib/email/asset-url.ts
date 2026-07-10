/**
 * E-Mail-Asset-URLs — abgeleitet aus lib/system-config.ts
 */
import {
  canonicalizeProductionUrl,
  getDefaultLogoUrl,
  isUnsafeAssetUrl,
  resolveEmailAssetBaseUrl,
} from "@/lib/system-config";

export const EMAIL_ASSET_BASE_DEFAULT = resolveEmailAssetBaseUrl();

export const EMAIL_LOGO_DEFAULT_URL = getDefaultLogoUrl();

export {
  canonicalizeProductionUrl as canonicalizeEmailAssetUrl,
  isUnsafeAssetUrl as isUnsafeEmailAssetUrl,
};

/** CMS/ENV base URL for resolving relative email asset paths */
export function getEmailAssetBaseUrl(): string {
  return resolveEmailAssetBaseUrl();
}

/** Canonical logo URL for all outbound emails */
export function getDefaultEmailLogoUrl(): string {
  return getDefaultLogoUrl();
}
