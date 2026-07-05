import { DEFAULT_SITE_SETTINGS } from "./defaults";
import type {
  SiteSectionHeading,
  SiteSectionsSettings,
  SiteSettingsBundle,
} from "./types";

const SECTION_KEYS = Object.keys(DEFAULT_SITE_SETTINGS.sections) as (keyof SiteSectionsSettings)[];

/** Default params do not apply when a parent passes `undefined` explicitly — resolve safely. */
export function resolveSectionHeading(
  heading: SiteSectionHeading | undefined | null,
  key: keyof SiteSectionsSettings,
): SiteSectionHeading {
  const fallback = DEFAULT_SITE_SETTINGS.sections[key];
  if (!heading) return fallback;
  return {
    title: heading.title?.trim() || fallback.title,
    subtitle: heading.subtitle?.trim() || fallback.subtitle,
  };
}

function mergeSectionHeadings(
  sections: Partial<SiteSectionsSettings> | undefined | null,
): SiteSectionsSettings {
  const merged = { ...DEFAULT_SITE_SETTINGS.sections };
  if (!sections || typeof sections !== "object") return merged;

  for (const key of SECTION_KEYS) {
    const heading = sections[key];
    if (!heading || typeof heading !== "object") continue;
    merged[key] = resolveSectionHeading(heading, key);
  }
  return merged;
}

function mergeRecord<T extends object>(defaults: T, value: Partial<T> | undefined | null): T {
  if (!value || typeof value !== "object") return { ...defaults };
  return { ...defaults, ...value };
}

/** Ensures every CMS bundle field exists with safe fallbacks for the public site. */
export function normalizeSiteSettings(bundle: Partial<SiteSettingsBundle> | null | undefined): SiteSettingsBundle {
  const base = bundle ?? {};
  const defaults = DEFAULT_SITE_SETTINGS;

  const publicTeam = mergeRecord(defaults.publicTeam, base.publicTeam);
  const teamItems = publicTeam.items?.filter(
    (m) => m?.name?.trim() && m?.role?.trim(),
  );
  publicTeam.items =
    teamItems?.length ? teamItems.map((m) => ({
      name: m.name.trim(),
      role: m.role.trim(),
      description: m.description?.trim() || "",
      imageUrl: m.imageUrl?.trim() || defaults.publicTeam.items[0]?.imageUrl || defaults.hero.imageUrl,
    })) : defaults.publicTeam.items;

  return {
    hero: mergeRecord(defaults.hero, base.hero),
    contact: mergeRecord(defaults.contact, base.contact),
    about: mergeRecord(defaults.about, base.about),
    footer: mergeRecord(defaults.footer, base.footer),
    navigation: {
      ...defaults.navigation,
      ...(base.navigation ?? {}),
      items:
        base.navigation?.items?.length && base.navigation.items.every((i) => i.label?.trim() && i.href?.trim())
          ? base.navigation.items
          : defaults.navigation.items,
    },
    branding: mergeRecord(defaults.branding, base.branding),
    trustBadges: {
      items:
        base.trustBadges?.items?.length && base.trustBadges.items.some((i) => i.text?.trim())
          ? base.trustBadges.items
          : defaults.trustBadges.items,
    },
    usps: {
      ...defaults.usps,
      ...(base.usps ?? {}),
      items:
        base.usps?.items?.length && base.usps.items.some((i) => i.title?.trim())
          ? base.usps.items
          : defaults.usps.items,
    },
    process: {
      ...defaults.process,
      ...(base.process ?? {}),
      steps:
        base.process?.steps?.length && base.process.steps.some((s) => s.title?.trim())
          ? base.process.steps
          : defaults.process.steps,
    },
    sections: mergeSectionHeadings(base.sections),
    business: mergeRecord(defaults.business, base.business),
    email: {
      ...defaults.email,
      ...(base.email ?? {}),
      customAddresses: {
        ...defaults.email.customAddresses,
        ...(base.email?.customAddresses ?? {}),
      },
    },
    publicTeam,
  };
}
