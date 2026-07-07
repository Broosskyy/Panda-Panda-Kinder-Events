/**
 * Zentrale Auflösung der öffentlichen Website-URL.
 * Für Domain-Wechsel: NEXT_PUBLIC_SITE_URL in Vercel/.env.local setzen.
 */
const DEFAULT_SITE_URL = "https://pb-kinderevents.de";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return DEFAULT_SITE_URL;
}

/** Platzhalter-Domain — nur Fallback, wenn Env leer ist */
export const SITE_URL_PLACEHOLDER = DEFAULT_SITE_URL;
