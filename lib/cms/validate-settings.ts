import type {
  SiteContactSettings,
  SiteSectionHeading,
  SiteSectionsSettings,
  SiteSettingsBundle,
} from "./types";
import { DEFAULT_SITE_SETTINGS } from "./defaults";
import { sanitizeHttpUrl } from "@/lib/validation";

const REQUIRED_FIELDS: Record<keyof SiteSettingsBundle, readonly string[]> = {
  hero: ["tagline", "headline", "subtitle", "ctaPrimary", "ctaSecondary", "imageUrl", "badgeQuote"],
  contact: ["phone", "email", "whatsapp", "instagram", "instagramHandle", "location"],
  about: [
    "founderName",
    "introText",
    "paragraph1",
    "paragraph2",
    "missionText",
    "valuesText",
  ],
  footer: ["tagline", "copyrightName"],
  navigation: ["ctaLabel", "ctaLabelShort"],
  branding: [
    "logoUrl",
    "logoDarkUrl",
    "logoLightUrl",
    "logoAlt",
    "logoTextPrimary",
    "logoTextSecondary",
    "brandName",
    "tagline",
    "slogan",
    "primaryColor",
    "accentColor",
    "faviconUrl",
    "appleTouchIconUrl",
    "pwaIcon192Url",
    "pwaIcon512Url",
    "pdfLogoUrl",
    "emailLogoUrl",
    "loginLogoUrl",
    "ogImageUrl",
    "showTextMark",
  ],
  trustBadges: [],
  publicStats: [],
  usps: ["title", "subtitle"],
  process: ["title", "subtitle", "speechBubble"],
  sections: [],
  publicTeam: ["title", "subtitle"],
  business: ["companyName", "email"],
  email: ["senderName", "senderEmail", "replyTo"],
  bank: [],
  invoice: ["quotePrefix", "invoicePrefix"],
  seo: ["metaTitle", "metaDescription"],
  legal: [],
};

function hasNonEmptyItems(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.length > 0;
}

function validateArraySection(
  section: keyof SiteSettingsBundle,
  value: unknown,
): { ok: true; value: SiteSettingsBundle[keyof SiteSettingsBundle] } | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Ungültige Daten." };
  }

  const obj = value as Record<string, unknown>;

  if (section === "navigation") {
    const items = obj.items;
    if (!hasNonEmptyItems(items)) {
      return { ok: false, error: "Mindestens ein Navigationspunkt erforderlich." };
    }
    for (const item of items as { label?: string; href?: string }[]) {
      if (!String(item.label ?? "").trim() || !String(item.href ?? "").trim()) {
        return { ok: false, error: "Alle Navigationspunkte brauchen Label und Link." };
      }
    }
    const missing = REQUIRED_FIELDS.navigation.filter((field) => !String(obj[field] ?? "").trim());
    if (missing.length > 0) {
      return { ok: false, error: `Pflichtfelder fehlen: ${missing.join(", ")}` };
    }
    return { ok: true, value: value as SiteSettingsBundle["navigation"] };
  }

  if (section === "trustBadges") {
    const items = obj.items;
    if (!hasNonEmptyItems(items)) {
      return { ok: false, error: "Mindestens ein Trust-Badge erforderlich." };
    }
    for (const item of items as { iconKey?: string; text?: string }[]) {
      if (!String(item.text ?? "").trim()) {
        return { ok: false, error: "Alle Trust-Badges brauchen Text." };
      }
    }
    return { ok: true, value: value as SiteSettingsBundle["trustBadges"] };
  }

  if (section === "usps") {
    const items = obj.items;
    if (!hasNonEmptyItems(items)) {
      return { ok: false, error: "Mindestens eine USP-Karte erforderlich." };
    }
    const missing = REQUIRED_FIELDS.usps.filter((field) => !String(obj[field] ?? "").trim());
    if (missing.length > 0) {
      return { ok: false, error: `Pflichtfelder fehlen: ${missing.join(", ")}` };
    }
    for (const item of items as { title?: string; description?: string }[]) {
      if (!String(item.title ?? "").trim() || !String(item.description ?? "").trim()) {
        return { ok: false, error: "Alle USP-Karten brauchen Titel und Beschreibung." };
      }
    }
    return { ok: true, value: value as SiteSettingsBundle["usps"] };
  }

  if (section === "process") {
    const steps = obj.steps;
    if (!hasNonEmptyItems(steps)) {
      return { ok: false, error: "Mindestens ein Buchungsschritt erforderlich." };
    }
    const missing = REQUIRED_FIELDS.process.filter((field) => !String(obj[field] ?? "").trim());
    if (missing.length > 0) {
      return { ok: false, error: `Pflichtfelder fehlen: ${missing.join(", ")}` };
    }
    for (const step of steps as { title?: string; description?: string }[]) {
      if (!String(step.title ?? "").trim() || !String(step.description ?? "").trim()) {
        return { ok: false, error: "Alle Buchungsschritte brauchen Titel und Beschreibung." };
      }
    }
    return { ok: true, value: value as SiteSettingsBundle["process"] };
  }

  if (section === "publicTeam") {
    const items = obj.items;
    if (!hasNonEmptyItems(items)) {
      return { ok: false, error: "Mindestens ein Teammitglied erforderlich." };
    }
    const missing = REQUIRED_FIELDS.publicTeam.filter((field) => !String(obj[field] ?? "").trim());
    if (missing.length > 0) {
      return { ok: false, error: `Pflichtfelder fehlen: ${missing.join(", ")}` };
    }
    for (const member of items as { name?: string; role?: string; description?: string }[]) {
      if (!String(member.name ?? "").trim() || !String(member.role ?? "").trim()) {
        return { ok: false, error: "Alle Teammitglieder brauchen Name und Rolle." };
      }
    }
    return { ok: true, value: value as SiteSettingsBundle["publicTeam"] };
  }

  if (section === "sections") {
    const defaults = DEFAULT_SITE_SETTINGS.sections;
    const merged = { ...defaults } as SiteSectionsSettings;
    for (const key of Object.keys(defaults) as (keyof SiteSectionsSettings)[]) {
      const raw = (obj as Record<string, unknown>)[key];
      if (!raw || typeof raw !== "object") continue;
      const heading = raw as SiteSectionHeading;
      const title = String(heading.title ?? "").trim();
      const subtitle = String(heading.subtitle ?? "").trim();
      if (title && subtitle) {
        merged[key] = { title, subtitle };
      }
    }
    return { ok: true, value: merged };
  }

  return { ok: false, error: "Ungültige Sektion." };
}

export function validateSiteSettingsSection(
  section: keyof SiteSettingsBundle,
  value: unknown,
):
  | { ok: true; value: SiteSettingsBundle[keyof SiteSettingsBundle] }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Ungültige Daten." };
  }

  if (["navigation", "trustBadges", "usps", "process", "sections", "publicTeam"].includes(section)) {
    return validateArraySection(section, value);
  }

  const obj = value as Record<string, unknown>;
  const missing = REQUIRED_FIELDS[section].filter((field) => !String(obj[field] ?? "").trim());

  if (missing.length > 0) {
    return { ok: false, error: `Pflichtfelder fehlen: ${missing.join(", ")}` };
  }

  if (section === "contact") {
    const instagram = sanitizeHttpUrl(String(obj.instagram));
    if (!instagram) {
      return { ok: false, error: "Instagram-URL muss mit http:// oder https:// beginnen." };
    }
    return {
      ok: true,
      value: { ...(value as SiteContactSettings), instagram } as SiteSettingsBundle["contact"],
    };
  }

  if (section === "email") {
    const email = value as SiteSettingsBundle["email"];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.senderEmail)) {
      return { ok: false, error: "Absender-E-Mail ist ungültig." };
    }
    if (!emailPattern.test(email.replyTo)) {
      return { ok: false, error: "Reply-To-Adresse ist ungültig." };
    }
    const optionalEmails = [
      email.companyEmail,
      email.copyToEmail,
      email.quoteCopyTo,
      email.invoiceCopyTo,
      email.inquiryRecipient,
      email.inquiryCopyTo,
      email.adminNotificationEmail,
      email.reviewRecipient,
      email.quoteSenderEmail,
      email.quoteReplyTo,
      email.invoiceSenderEmail,
      email.invoiceReplyTo,
      email.loginAlertRecipient,
      email.applicationEmail,
      email.applicationCopyTo,
      email.testMode?.testAddress,
    ].filter(Boolean);
    for (const addr of optionalEmails) {
      if (addr && !emailPattern.test(addr)) {
        return { ok: false, error: `E-Mail-Adresse „${addr}" ist ungültig.` };
      }
    }
  }

  if (section === "invoice") {
    const inv = value as SiteSettingsBundle["invoice"];
    if (inv.defaultTaxRate < 0 || inv.defaultTaxRate > 100) {
      return { ok: false, error: "MwSt.-Satz muss zwischen 0 und 100 liegen." };
    }
    if (inv.defaultPaymentDays < 1 || inv.defaultDueDays < 1) {
      return { ok: false, error: "Zahlungsziel muss mindestens 1 Tag sein." };
    }
  }

  if (section === "seo") {
    const seo = value as SiteSettingsBundle["seo"];
    const urlFields = [seo.canonicalBaseUrl, seo.primaryDomain, seo.wwwDomain, seo.ogImageUrl].filter(Boolean);
    for (const u of urlFields) {
      if (u && u.startsWith("http") && !sanitizeHttpUrl(u)) {
        return { ok: false, error: `Ungültige URL: ${u}` };
      }
    }
  }

  if (section === "bank") {
    const bank = value as SiteSettingsBundle["bank"];
    const iban = bank.iban?.replace(/\s/g, "") ?? "";
    if (iban && !/^DE\d{20}$/i.test(iban) && iban.length > 4) {
      return { ok: false, error: "IBAN-Format ungültig (erwartet DE + 20 Ziffern)." };
    }
  }

  return { ok: true, value: value as SiteSettingsBundle[keyof SiteSettingsBundle] };
}

export function hasNonEmptyCmsValue(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  const obj = value as Record<string, unknown>;

  if (Array.isArray(obj.items) && obj.items.length > 0) return true;
  if (Array.isArray(obj.steps) && obj.steps.length > 0) return true;

  if (obj.usps && typeof obj.usps === "object") {
    return Object.values(obj.usps as Record<string, unknown>).some(
      (v) => typeof v === "object" && v !== null && Object.values(v).some((x) => String(x ?? "").trim()),
    );
  }

  return Object.values(obj).some((v) => {
    if (Array.isArray(v)) return v.length > 0;
    if (v && typeof v === "object") {
      return Object.values(v as Record<string, unknown>).some((x) => String(x ?? "").trim().length > 0);
    }
    return String(v ?? "").trim().length > 0;
  });
}
