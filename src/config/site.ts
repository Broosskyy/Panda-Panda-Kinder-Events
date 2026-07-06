/**
 * Zentrale Website-Konfiguration — Panda-Bande Kinderevents
 *
 * PLATZHALTER-Werte sind mit `isPlaceholder: true` markiert.
 * Vor Go-Live durch echte Daten ersetzen.
 *
 * Öffentliche URL: NEXT_PUBLIC_SITE_URL (siehe lib/site-url.ts)
 */

import { BRAND } from "@/lib/brand";
import { SITE_URL_PLACEHOLDER } from "@/lib/site-url";

export const siteConfig = {
  name: "Panda-Bande Kinderevents",
  tagline: "Glückliche Kinder. Entspannte Eltern.",
  description:
    "Liebevolle Kinderbetreuung für Hochzeiten, Geburtstage und Familienfeiern — bundesweit im Einsatz, mit Herz und professionellem Team.",
  /** @deprecated Verwende getSiteUrl() aus lib/site-url.ts */
  url: SITE_URL_PLACEHOLDER,

  assets: {
    logo: BRAND.logo.svg,
    logoPng: BRAND.logo.png,
    logoAlt: BRAND.logo.alt,
    ogImage: BRAND.ogImage,
  },

  contact: {
    /** PLATZHALTER — echte Telefonnummer eintragen */
    phone: "+49 170 0000000",
    isPlaceholder: {
      phone: true,
      email: true,
      whatsapp: true,
      location: true,
    },
    /** PLATZHALTER — echte E-Mail eintragen */
    email: "hallo@panda-bande-events.de",
    /** PLATZHALTER — echte WhatsApp-Nummer (ohne +, mit Ländervorwahl) */
    whatsapp: "491700000000",
    instagram:
      "https://www.instagram.com/pandabande_kinderevents?igsh=aDhoZmVnNHlibTZn",
    instagramHandle: "@pandabande_kinderevents",
    /** PLATZHALTER — Standort ggf. anpassen */
    location: "NRW · bundesweit im Einsatz",
  },

  legal: {
    /** PLATZHALTER — Impressumsdaten vor Go-Live prüfen */
    company: "Panda-Bande Kinderevents",
    owner: "Lisa Muster",
    address: "Musterstraße 1, 40210 Düsseldorf",
    isPlaceholder: true,
  },

  /**
   * Demo-Bewertungen — NUR für interne Vorschau.
   * Werden NIEMALS öffentlich angezeigt (showDemoReviews: false).
   */
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
