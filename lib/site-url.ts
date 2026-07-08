/**
 * Zentrale Auflösung der öffentlichen Website-URL.
 * Für Domain-Wechsel: NEXT_PUBLIC_SITE_URL in Vercel/.env.local setzen.
 */
export const DEFAULT_SITE_URL = "https://pb-kinderevents.de";

function sanitizeSiteUrl(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  if (/vercel\.app/i.test(trimmed)) {
    return DEFAULT_SITE_URL;
  }
  return trimmed;
}

/** Produktions-URL — niemals *.vercel.app für Admin-Links oder E-Mails. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return sanitizeSiteUrl(fromEnv);
  }
  return DEFAULT_SITE_URL;
}

export function getAdminInviteUrl(token: string): string {
  return `${getSiteUrl()}/admin/einladung/${encodeURIComponent(token)}`;
}

/** Platzhalter-Domain — nur Fallback, wenn Env leer ist */
export const SITE_URL_PLACEHOLDER = DEFAULT_SITE_URL;
