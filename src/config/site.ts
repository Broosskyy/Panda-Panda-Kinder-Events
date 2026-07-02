/**
 * Zentrale Website-Konfiguration — Panda-Bande Kinderevents
 *
 * PLATZHALTER-Werte sind mit `isPlaceholder: true` markiert.
 * Vor Go-Live durch echte Daten ersetzen.
 */

export const siteConfig = {
  name: "Panda-Bande Kinderevents",
  tagline: "Glückliche Kinder. Entspannte Eltern.",
  description:
    "Liebevolle Kinderbetreuung für Hochzeiten, Geburtstage und Familienfeiern — bundesweit im Einsatz, mit Herz und professionellem Team.",
  url: "https://panda-bande-events.de",

  assets: {
    /** Originales Logo — Datei in public/assets/ ablegen */
    logo: "/assets/logo.png",
    logoAlt: "Panda-Bande Kinderevents Logo",
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
