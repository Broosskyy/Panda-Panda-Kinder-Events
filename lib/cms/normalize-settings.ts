import { BRAND } from "@/lib/brand";
import { DEFAULT_SITE_SETTINGS } from "./defaults";
import { resolveImageUrl } from "./resolve-image";
import { mergeBankFromLegacy, mergeInvoiceFromLegacy, syncLegacyBusinessFields } from "./settings-compat";
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

function normalizeBrandingIcons(
  branding: SiteSettingsBundle["branding"],
): SiteSettingsBundle["branding"] {
  const legacy = ["/branding/favicon", "/branding/icon", "/icons/panda-mark", "/assets/logo.png", "/assets/appicon"];
  const clean = (url: string | undefined, fallback: string) => {
    const t = url?.trim();
    if (!t) return fallback;
    const lower = t.toLowerCase();
    if (legacy.some((p) => lower.includes(p))) return fallback;
    return t;
  };
  return {
    ...branding,
    faviconUrl: clean(branding.faviconUrl, BRAND.assets.faviconPng),
    appleTouchIconUrl: clean(branding.appleTouchIconUrl, BRAND.assets.appleTouchIcon),
    pwaIcon192Url: clean(branding.pwaIcon192Url, BRAND.assets.icon192),
    pwaIcon512Url: clean(branding.pwaIcon512Url, BRAND.assets.icon512),
    logoUrl: branding.logoUrl?.trim() || BRAND.master,
  };
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
  const teamItems = publicTeam.items?.filter((m) => m?.name?.trim() && m?.role?.trim());
  publicTeam.items =
    teamItems?.length
      ? teamItems.map((m) => ({
          name: m.name.trim(),
          role: m.role.trim(),
          description: m.description?.trim() || "",
          imageUrl:
            resolveImageUrl("site-assets", m.imageUrl?.trim()) ||
            m.imageUrl?.trim() ||
            defaults.publicTeam.items[0]?.imageUrl ||
            defaults.hero.imageUrl,
        }))
      : defaults.publicTeam.items;

  const business = mergeRecord(defaults.business, base.business);
  const bank = mergeBankFromLegacy(business, mergeRecord(defaults.bank, base.bank));
  const invoice = mergeInvoiceFromLegacy(business, mergeRecord(defaults.invoice, base.invoice));
  const syncedBusiness = syncLegacyBusinessFields(business, bank, invoice);

  const contact = mergeRecord(defaults.contact, base.contact);
  if (!contact.contactEmail?.trim()) contact.contactEmail = contact.email;
  if (!contact.mobile?.trim()) contact.mobile = contact.phone;
  if (!contact.whatsappLabel?.trim()) contact.whatsappLabel = "WhatsApp";

  return {
    hero: mergeRecord(defaults.hero, base.hero),
    contact,
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
    branding: normalizeBrandingIcons(mergeRecord(defaults.branding, base.branding)),
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
    business: syncedBusiness,
    bank,
    invoice,
    seo: mergeRecord(defaults.seo, base.seo),
    legal: {
      ...defaults.legal,
      ...(base.legal ?? {}),
      privacyContactEmail:
        base.legal?.privacyContactEmail?.trim() || contact.email || defaults.legal.privacyContactEmail,
      impressumResponsible:
        base.legal?.impressumResponsible?.trim() ||
        business.managingDirector?.trim() ||
        defaults.legal.impressumResponsible,
    },
    email: {
      ...defaults.email,
      ...(base.email ?? {}),
      customAddresses: {
        ...defaults.email.customAddresses,
        ...(base.email?.customAddresses ?? {}),
      },
      inquiryCopyTo: base.email?.inquiryCopyTo ?? defaults.email.inquiryCopyTo,
      adminNotificationEmail:
        base.email?.adminNotificationEmail?.trim() ||
        base.email?.copyToEmail?.trim() ||
        defaults.email.adminNotificationEmail,
    },
    publicTeam,
  };
}
