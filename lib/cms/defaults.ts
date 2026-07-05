import { siteConfig } from "@/config/site";
import { navigation } from "@/lib/navigation";
import { processSteps } from "@/lib/process-steps";
import { trustBadges } from "@/lib/trust-badges";
import { usps } from "@/lib/usps";
import type { SiteSettingsBundle } from "./types";

const HERO_IMAGE_DEFAULT =
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1000&h=1250&fit=crop&q=85";

export const DEFAULT_SITE_SETTINGS: SiteSettingsBundle = {
  hero: {
    tagline: siteConfig.tagline,
    headline: siteConfig.name,
    subtitle: "Liebevolle Kinderbetreuung für eure besonderen Momente.",
    ctaPrimary: "Jetzt anfragen",
    ctaSecondary: "Unsere Leistungen",
    imageUrl: HERO_IMAGE_DEFAULT,
    badgeQuote: "Jedes Kind verdient einen Tag voller Abenteuer.",
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
  navigation: {
    items: navigation.map((item) => ({ label: item.label, href: item.href })),
    ctaLabel: "Jetzt anfragen",
    ctaLabelShort: "Anfragen",
  },
  branding: {
    logoUrl: siteConfig.assets.logo,
    logoAlt: siteConfig.assets.logoAlt,
    logoTextPrimary: "PANDA-BANDE",
    logoTextSecondary: "KINDEREVENTS",
  },
  trustBadges: {
    items: [
      { iconKey: "Award", text: trustBadges[0].text },
      { iconKey: "Heart", text: trustBadges[1].text },
      { iconKey: "Shield", text: trustBadges[2].text },
      { iconKey: "MapPin", text: trustBadges[3].text },
    ],
  },
  usps: {
    title: "Warum Panda-Bande?",
    subtitle: "Professionelle Betreuung mit echter Herzlichkeit — für unvergessliche Momente.",
    items: [
      { iconKey: "Heart", title: usps[0].title, description: usps[0].description },
      { iconKey: "Palette", title: usps[1].title, description: usps[1].description },
      { iconKey: "Sparkles", title: usps[2].title, description: usps[2].description },
      { iconKey: "PartyPopper", title: usps[3].title, description: usps[3].description },
    ],
  },
  process: {
    title: "So einfach buchst du uns",
    subtitle: "In fünf Schritten zu eurem unvergesslichen Event.",
    speechBubble: "Wir kümmern uns um den Rest!",
    steps: [
      { number: 1, title: processSteps[0].title, description: processSteps[0].description, iconKey: "PartyPopper" },
      { number: 2, title: processSteps[1].title, description: processSteps[1].description, iconKey: "MapPin" },
      { number: 3, title: processSteps[2].title, description: processSteps[2].description, iconKey: "Calendar" },
      { number: 4, title: processSteps[3].title, description: processSteps[3].description, iconKey: "Clock" },
      { number: 5, title: processSteps[4].title, description: processSteps[4].description, iconKey: "Users" },
    ],
  },
  sections: {
    usps: {
      title: "Warum Panda-Bande?",
      subtitle: "Professionelle Betreuung mit echter Herzlichkeit — für unvergessliche Momente.",
    },
    services: {
      title: "Unsere Leistungen",
      subtitle: "Von der Hochzeit bis zum Kindergeburtstag — wir gestalten unvergessliche Momente.",
    },
    process: {
      title: "So einfach buchst du uns",
      subtitle: "In fünf Schritten zu eurem unvergesslichen Event.",
    },
    gallery: {
      title: "Einblicke in unsere Arbeit",
      subtitle: "Echte Momente, echte Freude — so sieht Panda-Bande aus.",
    },
    testimonials: {
      title: "Das sagen Eltern",
      subtitle: "Echte Rückmeldungen — freigegeben nach Prüfung durch unser Team.",
    },
    about: {
      title: "Über uns",
      subtitle: "Die Panda-Bande — mit Herz für kleine Abenteurer.",
    },
    news: {
      title: "Aktuelles",
      subtitle: "Neuigkeiten, Tipps und Einblicke von der Panda-Bande.",
    },
    faq: {
      title: "Häufige Fragen",
      subtitle: "Antworten auf die wichtigsten Fragen rund um euer Event.",
    },
    contact: {
      title: "Jetzt unverbindlich anfragen",
      subtitle: "Erzählt uns von eurem Event — wir melden uns schnellstmöglich bei euch.",
    },
  },
  business: {
    companyName: siteConfig.name,
    logoUrl: siteConfig.assets.logo,
    address: siteConfig.contact.location,
    phone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    website: siteConfig.url,
    iban: "",
    bic: "",
    bankName: "",
    taxNumber: "",
    vatId: "",
    managingDirector: "Lisa",
    defaultPaymentDays: 14,
    defaultQuoteText: "Vielen Dank für Ihre Anfrage. Wir freuen uns auf Ihre Rückmeldung.",
    defaultInvoiceText: "Vielen Dank für Ihren Auftrag.",
    defaultPaymentText:
      "Bitte überweisen Sie den Rechnungsbetrag innerhalb des Zahlungsziels auf das unten genannte Konto.",
    senderName: siteConfig.name,
    senderEmail: siteConfig.contact.email,
  },
};
