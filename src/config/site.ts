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
    phone: "+49 170 0000000",
    isPlaceholder: {
      phone: true,
      email: true,
      whatsapp: true,
      location: true,
    },
    email: DEFAULT_COMPANY_EMAIL,
    whatsapp: "491700000000",
    instagram:
      "https://www.instagram.com/pandabande_kinderevents?igsh=aDhoZmVnNHlibTZn",
    instagramHandle: "@pandabande_kinderevents",
    location: "NRW · bundesweit im Einsatz",
  },

  legal: {
    company: "Panda-Bande Kinderevents",
    owner: "Lisa Muster",
    address: "Musterstraße 1, 40210 Düsseldorf",
    isPlaceholder: true,
  },

  reviews: {
    showDemoReviews: false,
    demoData: [
      {
        stars: 5,
        text: "Demo-Bewertung — nicht öffentlich sichtbar.",
        author: "Demo Nutzer",
        event: "Hochzeit",
      },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
