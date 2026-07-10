import { BRAND } from "@/lib/brand";
import { DEFAULT_COMPANY_EMAIL } from "@/lib/email/constants";
import { getDefaultSiteUrl, SYSTEM_DEFAULTS } from "@/lib/system-config";

/**
 * Zentrale Website-Konfiguration — Panda-Bande Kinderevents
 * Fallbacks aus lib/system-config.ts; Laufzeit aus CMS.
 */
export const siteConfig = {
  name: SYSTEM_DEFAULTS.company.name,
  tagline: SYSTEM_DEFAULTS.company.slogan,
  description: SYSTEM_DEFAULTS.company.description,
  /** @deprecated Verwende getSiteUrl() aus lib/site-url.ts */
  url: getDefaultSiteUrl(),

  assets: {
    logo: BRAND.master,
    logoAlt: BRAND.alt,
    ogImage: BRAND.assets.ogImage,
  },

  contact: {
    phone: "",
    isPlaceholder: {
      phone: true,
      email: true,
      whatsapp: true,
      location: true,
    },
    email: DEFAULT_COMPANY_EMAIL,
    whatsapp: "",
    instagram: SYSTEM_DEFAULTS.contact.instagram,
    instagramHandle: SYSTEM_DEFAULTS.contact.instagramHandle,
    location: SYSTEM_DEFAULTS.contact.location,
  },

  legal: {
    company: SYSTEM_DEFAULTS.company.name,
    owner: "",
    address: "",
    isPlaceholder: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
