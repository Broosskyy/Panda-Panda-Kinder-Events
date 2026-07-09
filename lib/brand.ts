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

  /** Eine Quelle: Header, Splash, Favicon, PWA */
  master: "/assets/Logo.png",

  iconVersion: "9",

  markOnly: "/assets/Logo.png",

  assets: {
    faviconPng: "/favicon.png",
    favicon16: "/icons/panda-icon-16.png",
    favicon32: "/icons/panda-icon-32.png",
    favicon48: "/icons/panda-icon-48.png",
    favicon64: "/icons/panda-icon-64.png",
    faviconIco: "/favicon.ico",
    appleTouchIcon: "/icons/panda-apple-touch-icon.png",
    icon192: "/icons/panda-icon-192.png",
    icon512: "/icons/panda-icon-512.png",
    iconMaskable192: "/icons/panda-icon-maskable-192.png",
    iconMaskable512: "/icons/panda-icon-maskable-512.png",
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
  headerDesktop: 56,
  headerMobile: 42,
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
