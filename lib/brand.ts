/**
 * Panda-Bande — Branding-Konstanten
 * Bildmarke: /assets/Logo.png (Zwei-Panda-Illustration)
 * Textmarke: Panda-Bande / Kinderevents (aus CMS)
 */
export const BRAND = {
  name: "Panda-Bande Kinderevents",
  shortName: "Panda-Bande",
  textPrimary: "PANDA-BANDE",
  textSecondary: "KINDEREVENTS",
  splashTagline: "Mit Herz für kleine Abenteuer.",
  themeColor: "#52563e",
  accentColor: "#c45c5c",
  backgroundColor: "#f4f1ea",
  alt: "Panda-Bande KinderEvents",

  /** Header, Splash, Footer — unverändert */
  master: "/assets/Logo.png",

  /** Cache-Bust für Browser/PWA-Icons (bump bei Regeneration) */
  iconVersion: "7",

  markOnly: "/assets/Logo.png",

  /** Browser- und App-Icons — generiert aus /assets/logo.png */
  assets: {
    faviconPng: "/android-chrome-512x512.png",
    favicon16: "/favicon-16x16.png",
    favicon32: "/favicon-32x32.png",
    faviconIco: "/favicon.ico",
    appleTouchIcon: "/apple-touch-icon.png",
    icon192: "/android-chrome-192x192.png",
    icon512: "/android-chrome-512x512.png",
    iconMaskable512: "/android-chrome-maskable-512x512.png",
    mstile150: "/mstile-150x150.png",
    ogImage: "/branding/og-image.png",
  },

  /** Logo.png — 1536×1024, volle Illustration (kein Crop) */
  markWidth: 1536,
  markHeight: 1024,
} as const;

export const LOGO_MARK_ASPECT = BRAND.markWidth / BRAND.markHeight;

/** Breites Kombi-Logo mit eingebettetem Text — nur wenn Breite > 2× Höhe */
export const LOGO_COMBINED_ASPECT = LOGO_MARK_ASPECT;

/** 1 = volles Logo anzeigen; <1 = linke Bildmarke aus Kombi-Logo croppen */
export const LOGO_MARK_WIDTH_RATIO = 1;

export function withIconVersion(path: string): string {
  const v = BRAND.iconVersion;
  if (!path || path.startsWith("http")) return path;
  const base = path.split("?")[0];
  return `${base}?v=${v}`;
}

export const LOGO_SIZE_PX = {
  headerDesktop: 52,
  headerMobile: 38,
  footer: 52,
  adminSidebar: 40,
  login: 72,
  splash: 100,
  decorative: 64,
  email: 48,
  pdfWidth: 120,
} as const;

export type LogoContext =
  | "header"
  | "footer"
  | "splash"
  | "admin"
  | "login"
  | "decorative"
  | "email"
  | "pdf";
