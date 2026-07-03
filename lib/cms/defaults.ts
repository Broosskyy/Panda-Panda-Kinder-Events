import { siteConfig } from "@/config/site";
import type { SiteSettingsBundle } from "./types";

export const DEFAULT_SITE_SETTINGS: SiteSettingsBundle = {
  hero: {
    tagline: siteConfig.tagline,
    headline: siteConfig.name,
    subtitle: "Liebevolle Kinderbetreuung für eure besonderen Momente.",
    ctaPrimary: "Jetzt anfragen",
    ctaSecondary: "Unsere Leistungen",
  },
  contact: {
    phone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    whatsapp: siteConfig.contact.whatsapp,
    instagram: siteConfig.contact.instagram,
    instagramHandle: siteConfig.contact.instagramHandle,
    location: siteConfig.contact.location,
  },
  about: {
    founderName: "Lisa",
    imageUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1000&fit=crop&q=85",
    introText: "Hallo, ich bin Lisa — die Gründerin der Panda-Bande.",
    paragraph1:
      "Panda-Bande entstand aus einer einfachen Überzeugung: Kinder gehören auf Feiern nicht an den Rand, sondern ins Herz des Moments.",
    paragraph2:
      "Was als Herzensprojekt begann, ist heute ein erfahrenes Team aus Betreuern, die mit Kreativität, Geduld und echter Freude arbeiten — damit ihr entspannt feiern könnt.",
    missionText: "Magische Momente für Kinder — sorgenfreie Erlebnisse für Familien.",
    valuesText: "Herzlichkeit, Sicherheit, Kreativität und Verlässlichkeit.",
  },
  footer: {
    tagline: "Mit Herz für kleine Abenteurer. ♡",
    copyrightName: siteConfig.name,
  },
};
