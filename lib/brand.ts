/**
 * Panda-Bande — Branding-Konstanten
 * Bildmarke: /assets/Logo.png
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

  /** Standard-Bildmarke für Header/Splash (Kombi-Logo mit Text) */
  master: "/assets/Logo.png",

  /** Zwei-Panda-Icon für Favicon/PWA/Tab (separat vom Header-Logo) */
  iconSource: "/assets/AppIcon.svg",

  /** Cache-Busting für Favicon/PWA nach Icon-Update */
  iconVersion: "4",

  /** Extrahierte quadratische Bildmarke aus Logo.png (nur PDF/E-Mail) */
  markOnly: "/icons/panda-mark.png",

  /** Generierte Icon-Assets (npm run generate:brand-assets) */
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
    iconMaskable512: "/icons/panda-icon-maskable-512.png",
    ogImage: "/branding/og-image.png",
  },

  /** Kombi-Logo 640×160 — linke Bildmarke ist quadratisch */
  combinedWidth: 640,
  combinedHeight: 160,
  markWidth: 160,
  markHeight: 160,
} as const;

/** Breites Kombi-Logo (Bildmarke + eingebetteter Text) */
export const LOGO_COMBINED_ASPECT = BRAND.combinedWidth / BRAND.combinedHeight;

/** Quadratische Bildmarke (Panda-Kopf) */
export const LOGO_MARK_ASPECT = BRAND.markWidth / BRAND.markHeight;

/** Anteil der Kombi-Logo-Breite, den die Bildmarke einnimmt */
export const LOGO_MARK_WIDTH_RATIO = BRAND.markWidth / BRAND.combinedWidth;

export function withIconVersion(path: string): string {
  const v = BRAND.iconVersion;
  return path.includes("?") ? path : `${path}?v=${v}`;
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
