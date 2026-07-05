import type {
  SiteContactSettings,
  SiteSectionHeading,
  SiteSettingsBundle,
} from "./types";
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
  branding: ["logoUrl", "logoAlt", "logoTextPrimary", "logoTextSecondary"],
  trustBadges: [],
  usps: ["title", "subtitle"],
  process: ["title", "subtitle", "speechBubble"],
  sections: [],
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

  if (section === "sections") {
    const sections = obj as unknown as SiteSettingsBundle["sections"];
    for (const [key, heading] of Object.entries(sections)) {
      const h = heading as SiteSectionHeading | undefined;
      if (!h?.title?.trim() || !h?.subtitle?.trim()) {
        return { ok: false, error: `Sektion „${key}" braucht Titel und Untertitel.` };
      }
    }
    return { ok: true, value: sections };
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

  if (["navigation", "trustBadges", "usps", "process", "sections"].includes(section)) {
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
