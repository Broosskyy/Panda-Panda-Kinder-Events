/**
 * Zentrale Marken-Konstanten — einheitliche Logo-Nutzung überall.
 * SVG bevorzugt, PNG als Fallback (PDF, E-Mail-Clients).
 */
export const BRAND = {
  name: "Panda-Bande Kinderevents",
  shortName: "Panda-Bande",
  splashTagline: "Mit Herz für kleine Abenteuer.",
  themeColor: "#52563e",
  backgroundColor: "#f4f1ea",

  logo: {
    svg: "/assets/logo.svg",
    svgInverse: "/assets/logo-inverse.svg",
    png: "/assets/logo.png",
    alt: "Panda-Bande Kinderevents Logo",
    /** Natürliches Seitenverhältnis — nie verzerren */
    width: 320,
    height: 80,
  },

  ogImage: "/og-image.png",
  mascot: "/panda-illustration.svg",
} as const;

export const LOGO_ASPECT_RATIO = BRAND.logo.width / BRAND.logo.height;

/** Einheitliche Logo-Höhen (Tailwind max-h) pro Kontext */
export const LOGO_HEIGHT = {
  header: "max-h-9 sm:max-h-10 md:max-h-12",
  headerDesktop: "md:max-h-14",
  footer: "max-h-10 sm:max-h-11 md:max-h-12",
  splash: "max-h-16 sm:max-h-20",
  admin: "max-h-12",
  email: 48,
  pdf: 56,
} as const;
