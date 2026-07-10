/**
 * Zentrale Systemkonfiguration — Panda-Bande V1
 *
 * Einzige Quelle für Entwicklungs-Fallbacks und technische Defaults.
 * Laufzeitwerte kommen aus CMS (Admin → Einstellungen) und Umgebungsvariablen.
 *
 * Domainwechsel ohne Codeänderung:
 * 1. NEXT_PUBLIC_SITE_URL in Vercel/.env setzen
 * 2. CMS → Domain & SEO → Primäre Domain / Canonical Base URL
 * 3. Neu deployen
 */

import { BRAND } from "@/lib/brand";

// ─── Entwicklungs-Fallbacks (nur wenn CMS + ENV leer) ───────────────────────

export const SYSTEM_DEFAULTS = {
  company: {
    name: "Panda-Bande Kinderevents",
    shortName: "Panda-Bande",
    senderName: "Panda-Bande",
    slogan: "Damit ihr feiern könnt — wir kümmern uns um die Kleinen.",
    description:
      "Liebevolle Kinderbetreuung für Hochzeiten, Geburtstage und Familienfeiern in NRW und bundesweit — mit Herz, Erfahrung und einem Team, dem ihr vertrauen könnt.",
  },
  domain: {
    /** Apex-Host ohne Protokoll — Fallback für Entwicklung */
    host: "pb-kinderevents.de",
    wwwHost: "www.pb-kinderevents.de",
  },
  email: {
    address: "info@pb-kinderevents.de",
    supportAddress: "info@pb-kinderevents.de",
    billingAddress: "info@pb-kinderevents.de",
  },
  contact: {
    location: "NRW · bundesweit im Einsatz",
    instagram: "https://www.instagram.com/pandabande_kinderevents?igsh=aDhoZmVnNHlibTZn",
    instagramHandle: "@pandabande_kinderevents",
  },
  assets: {
    logoPath: BRAND.master,
    ogImagePath: BRAND.assets.ogImage,
    faviconPath: BRAND.assets.faviconPng,
  },
  push: {
    iconPath: "/icons/panda-icon-192.png",
    inquiryUrl: "/admin/anfragen",
  },
} as const;

// ─── Abgeleitete Fallbacks ───────────────────────────────────────────────────

export function getDefaultCompanyEmail(): string {
  return SYSTEM_DEFAULTS.email.address;
}

export function getDefaultCompanyDomain(): string {
  return SYSTEM_DEFAULTS.domain.host;
}

export function getDefaultSenderName(): string {
  return SYSTEM_DEFAULTS.company.senderName;
}

export function getDefaultFromAddress(): string {
  return `${getDefaultSenderName()} <${getDefaultCompanyEmail()}>`;
}

export function getDefaultSiteUrl(): string {
  return `https://${SYSTEM_DEFAULTS.domain.host}`;
}

export function getDefaultWwwSiteUrl(): string {
  return `https://${SYSTEM_DEFAULTS.domain.wwwHost}`;
}

export function getDefaultEmailAssetBaseUrl(): string {
  return getDefaultWwwSiteUrl();
}

export function getDefaultLogoUrl(): string {
  return `${getDefaultWwwSiteUrl()}${SYSTEM_DEFAULTS.assets.logoPath}`;
}

export function getDefaultOgImageUrl(): string {
  return `${getDefaultSiteUrl()}${SYSTEM_DEFAULTS.assets.ogImagePath}`;
}

// ─── URL-Auflösung ───────────────────────────────────────────────────────────

const UNSAFE_HOST_PATTERN = /localhost|127\.0\.0\.1|vercel\.app/i;

function sanitizeSiteUrl(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  if (UNSAFE_HOST_PATTERN.test(trimmed)) {
    return getDefaultSiteUrl();
  }
  return trimmed;
}

/** Öffentliche Website-URL — ENV → Fallback. Niemals *.vercel.app für Produktionslinks. */
export function resolveSiteUrlFromEnv(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return sanitizeSiteUrl(fromEnv);
  return getDefaultSiteUrl();
}

/** Basis-URL für E-Mail-Bilder — ENV EMAIL_ASSET_BASE_URL → WWW-Fallback */
export function resolveEmailAssetBaseUrl(): string {
  const fromEnv = process.env.EMAIL_ASSET_BASE_URL?.trim();
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    const normalized = canonicalizeProductionUrl(fromEnv.replace(/\/$/, ""));
    if (!UNSAFE_HOST_PATTERN.test(normalized)) return normalized;
  }
  return getDefaultEmailAssetBaseUrl();
}

/** Normalisiert bekannte Produktions-Hosts auf die WWW-Variante (E-Mail-Kompatibilität). */
export function canonicalizeProductionUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const knownHosts = collectKnownHosts();
    if (knownHosts.has(host)) {
      parsed.protocol = "https:";
      parsed.hostname = getPreferredWwwHost();
      return parsed.href.replace(/\/$/, "");
    }
  } catch {
    // not a full URL
  }
  return url;
}

function collectKnownHosts(): Set<string> {
  const hosts = new Set<string>([
    SYSTEM_DEFAULTS.domain.host,
    SYSTEM_DEFAULTS.domain.wwwHost,
  ]);
  for (const raw of [process.env.NEXT_PUBLIC_SITE_URL, process.env.EMAIL_ASSET_BASE_URL]) {
    if (!raw?.trim()) continue;
    try {
      const h = new URL(raw.trim()).hostname.toLowerCase();
      hosts.add(h);
      if (h.startsWith("www.")) hosts.add(h.slice(4));
      else hosts.add(`www.${h}`);
    } catch {
      // ignore
    }
  }
  return hosts;
}

function getPreferredWwwHost(): string {
  const fromEnv = process.env.EMAIL_ASSET_BASE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      const h = new URL(fromEnv).hostname.toLowerCase();
      return h.startsWith("www.") ? h : `www.${h}`;
    } catch {
      // fall through
    }
  }
  return SYSTEM_DEFAULTS.domain.wwwHost;
}

export function buildAbsoluteUrl(path: string, baseUrl?: string): string {
  const base = (baseUrl ?? resolveSiteUrlFromEnv()).replace(/\/$/, "");
  if (!path) return base;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildAdminInviteUrl(token: string, baseUrl?: string): string {
  return `${(baseUrl ?? resolveSiteUrlFromEnv()).replace(/\/$/, "")}/admin/einladung/${encodeURIComponent(token)}`;
}

export function extractDomainFromEmail(email: string): string {
  const match = email.trim().match(/@([^@\s]+)$/);
  return match?.[1]?.toLowerCase() ?? getDefaultCompanyDomain();
}

export function isUnsafeAssetUrl(url: string): boolean {
  return UNSAFE_HOST_PATTERN.test(url);
}

// ─── Push ────────────────────────────────────────────────────────────────────

export function resolveVapidSubject(): string {
  return process.env.VAPID_SUBJECT?.trim() || `mailto:${getDefaultCompanyEmail()}`;
}

// ─── Google-Integrationen (vorbereitet, optional) ───────────────────────────

export interface GoogleIntegrationConfig {
  analyticsId?: string;
  tagManagerId?: string;
  siteVerification?: string;
  clarityId?: string;
  mapsApiKey?: string;
  recaptchaSiteKey?: string;
}

/** Liest Google-IDs aus CMS + ENV. Fehlende IDs erzeugen keine Fehler. */
export function resolveGoogleIntegrations(cms?: {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleSiteVerification?: string;
  microsoftClarityId?: string;
  googleMapsApiKey?: string;
  googleRecaptchaSiteKey?: string;
}): GoogleIntegrationConfig {
  const trim = (v?: string) => v?.trim() || undefined;
  return {
    analyticsId: trim(cms?.googleAnalyticsId) || trim(process.env.NEXT_PUBLIC_GA_ID),
    tagManagerId: trim(cms?.googleTagManagerId) || trim(process.env.NEXT_PUBLIC_GTM_ID),
    siteVerification: trim(cms?.googleSiteVerification) || trim(process.env.GOOGLE_SITE_VERIFICATION),
    clarityId: trim(cms?.microsoftClarityId) || trim(process.env.NEXT_PUBLIC_CLARITY_ID),
    mapsApiKey: trim(cms?.googleMapsApiKey) || trim(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
    recaptchaSiteKey: trim(cms?.googleRecaptchaSiteKey) || trim(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
  };
}

/** Server-seitig — niemals an Client senden */
export function resolveRecaptchaSecret(): string | undefined {
  return process.env.RECAPTCHA_SECRET_KEY?.trim() || undefined;
}

// ─── SMTP / Mail (Resend) ───────────────────────────────────────────────────

export interface MailEnvConfig {
  resendApiKey?: string;
  inquiryNotificationEmail?: string;
  emailAssetBaseUrl: string;
}

export function resolveMailEnvConfig(): MailEnvConfig {
  return {
    resendApiKey: process.env.RESEND_API_KEY?.trim() || undefined,
    inquiryNotificationEmail:
      process.env.INQUIRY_NOTIFICATION_EMAIL?.trim() || getDefaultCompanyEmail(),
    emailAssetBaseUrl: resolveEmailAssetBaseUrl(),
  };
}

/** @deprecated Verwende resolveSiteUrlFromEnv() */
export const SITE_URL_PLACEHOLDER = getDefaultSiteUrl();

/** @deprecated Verwende getDefaultSiteUrl() */
export const DEFAULT_SITE_URL = getDefaultSiteUrl();
