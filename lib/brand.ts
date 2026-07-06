/**
 * Panda-Bande — eine einzige Logoquelle für das gesamte Projekt.
 * Master: /branding/logo.png (640×160, Seitenverhältnis 4:1)
 */
export const BRAND = {
  name: "Panda-Bande Kinderevents",
  shortName: "Panda-Bande",
  splashTagline: "Mit Herz für kleine Abenteuer.",
  themeColor: "#52563e",
  backgroundColor: "#f4f1ea",
  alt: "Panda-Bande KinderEvents",

  /** Einzige Master-Logoquelle */
  master: "/branding/logo.png",

  /** Generierte Assets (aus Master via npm run generate:brand-assets) */
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

  /** Natürliche Pixelmaße des Master-Logos — nie verzerren */
  width: 640,
  height: 160,
} as const;

export const LOGO_ASPECT_RATIO = BRAND.width / BRAND.height;

/** Pixel-Höhen pro Kontext (Spezifikation v1.0) */
export const LOGO_SIZE_PX = {
  headerDesktop: 60,
  headerMobile: 46,
  footer: 48,
  adminSidebar: 38,
  login: 90,
  splash: 140,
  decorative: 80,
  email: 48,
  pdfWidth: 200,
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
