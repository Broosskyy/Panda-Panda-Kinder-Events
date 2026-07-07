import { BRAND } from "@/lib/brand";
import { DEFAULT_COMPANY_EMAIL } from "@/lib/email/constants";

/**
 * Zentrale Website-Konfiguration — Panda-Bande Kinderevents
 */
import { SITE_URL_PLACEHOLDER } from "@/lib/site-url";

export const siteConfig = {
  name: "Panda-Bande Kinderevents",
  tagline: "Damit ihr feiern könnt — wir kümmern uns um die Kleinen.",
  description:
    "Liebevolle Kinderbetreuung für Hochzeiten, Geburtstage und Familienfeiern in NRW und bundesweit — mit Herz, Erfahrung und einem Team, dem ihr vertrauen könnt.",
  /** @deprecated Verwende getSiteUrl() aus lib/site-url.ts */
  url: SITE_URL_PLACEHOLDER,

  assets: {
    logo: BRAND.master,
    logoAlt: BRAND.alt,
    ogImage: BRAND.assets.ogImage,
  },

  contact: {
    phone: "",
    isPlaceholder: {
      phone: true,
      email: true,
      whatsapp: true,
      location: true,
    },
    email: DEFAULT_COMPANY_EMAIL,
    whatsapp: "",
    instagram:
      "https://www.instagram.com/pandabande_kinderevents?igsh=aDhoZmVnNHlibTZn",
    instagramHandle: "@pandabande_kinderevents",
    location: "NRW · bundesweit im Einsatz",
  },

  legal: {
    company: "Panda-Bande Kinderevents",
    owner: "",
    address: "",
    isPlaceholder: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
