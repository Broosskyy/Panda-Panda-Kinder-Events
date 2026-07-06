/**
 * Panda-Bande — Branding-Konstanten
 * Bildmarke: /assets/logo.png
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

  /** Standard-Bildmarke */
  master: "/assets/logo.png",

  /** Generierte Icon-Assets (npm run generate:brand-assets) */
  assets: {
    favicon16: "/branding/favicon-16.png",
    favicon32: "/branding/favicon-32.png",
    favicon48: "/branding/favicon-48.png",
    favicon64: "/branding/favicon-64.png",
    faviconIco: "/branding/favicon.ico",
    appleTouchIcon: "/branding/apple-touch-icon.png",
    icon192: "/branding/icon-192.png",
    icon512: "/branding/icon-512.png",
    iconMaskable512: "/branding/icon-maskable-512.png",
    ogImage: "/branding/og-image.png",
  },

  /** Bildmarke — typisch quadratisch / kompakt */
  markWidth: 160,
  markHeight: 160,
} as const;

export const LOGO_MARK_ASPECT = BRAND.markWidth / BRAND.markHeight;

export const LOGO_SIZE_PX = {
  headerDesktop: 48,
  headerMobile: 40,
  footer: 44,
  adminSidebar: 36,
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
