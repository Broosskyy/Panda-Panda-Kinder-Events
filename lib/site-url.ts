/**
 * Zentrale Auflösung der öffentlichen Website-URL.
 * Für Domain-Wechsel: NEXT_PUBLIC_SITE_URL in Vercel/.env.local setzen.
 */
import {
  buildAdminInviteUrl,
  buildAbsoluteUrl,
  getDefaultSiteUrl,
  resolveSiteUrlFromEnv,
  SITE_URL_PLACEHOLDER,
} from "@/lib/system-config";

export { SITE_URL_PLACEHOLDER, getDefaultSiteUrl as DEFAULT_SITE_URL };

/** Produktions-URL — niemals *.vercel.app für Admin-Links oder E-Mails. */
export function getSiteUrl(): string {
  return resolveSiteUrlFromEnv();
}

export function getAdminInviteUrl(token: string): string {
  return buildAdminInviteUrl(token);
}

/** Baut absolute URL aus relativem Pfad */
export function absoluteUrl(path: string, baseUrl?: string): string {
  return buildAbsoluteUrl(path, baseUrl);
}
