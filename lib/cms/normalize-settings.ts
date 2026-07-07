import { BRAND } from "@/lib/brand";
import { DEFAULT_SITE_SETTINGS } from "./defaults";
import { resolveImageUrl } from "./resolve-image";
import { mergeBankFromLegacy, mergeInvoiceFromLegacy, syncLegacyBusinessFields } from "./settings-compat";
import { sanitizeAboutIntro, sanitizeGenderedRole } from "./content-quality";
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
      ? teamItems.map((m) => {
          const name = m.name.trim();
          const role = sanitizeGenderedRole(name, m.role.trim());
          return {
            name,
            role,
            description: m.description?.trim() || "",
            imageUrl:
              resolveImageUrl("site-assets", m.imageUrl?.trim()) ||
              m.imageUrl?.trim() ||
              "",
          };
        })
      : [];

  const aboutRaw = mergeRecord(defaults.about, base.about);
  const founderName = aboutRaw.founderName?.trim() || defaults.about.founderName;
  const about = {
    ...aboutRaw,
    founderName,
    introText: sanitizeAboutIntro(aboutRaw.introText, founderName),
    imageUrl:
      resolveImageUrl("site-assets", aboutRaw.imageUrl?.trim()) ||
      aboutRaw.imageUrl?.trim() ||
      defaults.about.imageUrl,
  };

  const business = mergeRecord(defaults.business, base.business);
  const bank = mergeBankFromLegacy(business, mergeRecord(defaults.bank, base.bank));
  const invoice = mergeInvoiceFromLegacy(business, mergeRecord(defaults.invoice, base.invoice));
  const syncedBusiness = syncLegacyBusinessFields(business, bank, invoice);

  const contact = mergeRecord(defaults.contact, base.contact);
  if (!contact.contactEmail?.trim()) contact.contactEmail = contact.email;
  if (!contact.mobile?.trim()) contact.mobile = contact.phone;
  if (!contact.whatsappLabel?.trim()) contact.whatsappLabel = "WhatsApp";

  const branding = normalizeBrandingIcons(mergeRecord(defaults.branding, base.branding));

  return {
    hero: mergeRecord(defaults.hero, base.hero),
    contact,
    about,
    footer: mergeRecord(defaults.footer, base.footer),
    navigation: {
      ...defaults.navigation,
      ...(base.navigation ?? {}),
      items:
        base.navigation?.items?.length && base.navigation.items.every((i) => i.label?.trim() && i.href?.trim())
          ? base.navigation.items
          : defaults.navigation.items,
    },
    branding,
    trustBadges: {
      items:
        base.trustBadges?.items?.length && base.trustBadges.items.some((i) => i.text?.trim())
          ? base.trustBadges.items
          : defaults.trustBadges.items,
    },
    publicStats: mergeRecord(defaults.publicStats, base.publicStats),
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
      companyEmail:
        base.email?.companyEmail?.trim() ||
        base.email?.copyToEmail?.trim() ||
        defaults.email.companyEmail,
      inquiryCopyTo: base.email?.inquiryCopyTo ?? defaults.email.inquiryCopyTo,
      adminNotificationEmail:
        base.email?.adminNotificationEmail?.trim() ||
        base.email?.copyToEmail?.trim() ||
        defaults.email.adminNotificationEmail,
      reviewRecipient:
        base.email?.reviewRecipient?.trim() ||
        base.email?.adminNotificationEmail?.trim() ||
        defaults.email.reviewRecipient,
      inquiryAdminSubject: base.email?.inquiryAdminSubject?.trim() || defaults.email.inquiryAdminSubject,
      inquiryAdminText: base.email?.inquiryAdminText?.trim() || defaults.email.inquiryAdminText,
      reviewRequestSubject: base.email?.reviewRequestSubject?.trim() || defaults.email.reviewRequestSubject,
      reviewRequestText: base.email?.reviewRequestText?.trim() || defaults.email.reviewRequestText,
      reviewAdminSubject: base.email?.reviewAdminSubject?.trim() || defaults.email.reviewAdminSubject,
      reviewAdminText: base.email?.reviewAdminText?.trim() || defaults.email.reviewAdminText,
      passwordResetSubject: base.email?.passwordResetSubject?.trim() || defaults.email.passwordResetSubject,
      passwordResetText: base.email?.passwordResetText?.trim() || defaults.email.passwordResetText,
      crmCopyToCompanyEnabled: base.email?.crmCopyToCompanyEnabled ?? defaults.email.crmCopyToCompanyEnabled,
      securityAlertsEnabled: base.email?.securityAlertsEnabled ?? defaults.email.securityAlertsEnabled,
      signature: {
        ...defaults.email.signature,
        ...(base.email?.signature ?? {}),
        companyName:
          base.email?.signature?.companyName?.trim() ||
          base.email?.companyName?.trim() ||
          business.companyName?.trim() ||
          defaults.email.signature.companyName,
        phone: base.email?.signature?.phone?.trim() || contact.phone || defaults.email.signature.phone,
        website: base.email?.signature?.website?.trim() || business.website?.trim() || defaults.email.signature.website,
        instagram: base.email?.signature?.instagram?.trim() || contact.instagram || defaults.email.signature.instagram,
        whatsapp: base.email?.signature?.whatsapp?.trim() || contact.whatsapp || defaults.email.signature.whatsapp,
        address:
          base.email?.signature?.address?.trim() ||
          [business.street, business.zip, business.city].filter(Boolean).join(", ") ||
          defaults.email.signature.address,
        logoUrl: base.email?.signature?.logoUrl?.trim() || branding.emailLogoUrl || defaults.email.signature.logoUrl,
      },
      branding: {
        ...defaults.email.branding,
        ...(base.email?.branding ?? {}),
        logoUrl: base.email?.branding?.logoUrl?.trim() || branding.emailLogoUrl || branding.logoUrl || defaults.email.branding.logoUrl,
        primaryColor: base.email?.branding?.primaryColor?.trim() || branding.primaryColor || defaults.email.branding.primaryColor,
        companyName: base.email?.branding?.companyName?.trim() || base.email?.companyName?.trim() || defaults.email.branding.companyName,
        senderName: base.email?.branding?.senderName?.trim() || base.email?.senderName?.trim() || defaults.email.branding.senderName,
        replyTo: base.email?.branding?.replyTo?.trim() || base.email?.replyTo?.trim() || defaults.email.branding.replyTo,
      },
      testMode: {
        ...defaults.email.testMode,
        ...(base.email?.testMode ?? {}),
        testAddress: base.email?.testMode?.testAddress?.trim() || defaults.email.testMode.testAddress,
      },
    },
    publicTeam,
  };
}
