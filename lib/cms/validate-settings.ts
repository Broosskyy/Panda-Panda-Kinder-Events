import type { SiteSettingsBundle } from "./types";

const REQUIRED_FIELDS: Record<keyof SiteSettingsBundle, readonly string[]> = {
  hero: ["tagline", "headline", "subtitle", "ctaPrimary", "ctaSecondary"],
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
};

export function validateSiteSettingsSection(
  section: keyof SiteSettingsBundle,
  value: unknown,
):
  | { ok: true; value: SiteSettingsBundle[keyof SiteSettingsBundle] }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Ungültige Daten." };
  }

  const obj = value as Record<string, unknown>;
  const missing = REQUIRED_FIELDS[section].filter((field) => !String(obj[field] ?? "").trim());

  if (missing.length > 0) {
    return { ok: false, error: `Pflichtfelder fehlen: ${missing.join(", ")}` };
  }

  return { ok: true, value: value as SiteSettingsBundle[keyof SiteSettingsBundle] };
}

export function hasNonEmptyCmsValue(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).some((v) => String(v ?? "").trim().length > 0);
}
