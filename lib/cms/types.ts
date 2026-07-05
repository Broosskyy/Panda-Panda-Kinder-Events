export type BookingStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "completed";

export interface SiteHeroSettings {
  tagline: string;
  headline: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  imageUrl: string;
  badgeQuote: string;
}

export interface SiteNavItem {
  label: string;
  href: string;
}

export interface SiteNavigationSettings {
  items: SiteNavItem[];
  ctaLabel: string;
  ctaLabelShort: string;
}

export interface SiteBrandingSettings {
  logoUrl: string;
  logoAlt: string;
  logoTextPrimary: string;
  logoTextSecondary: string;
}

export interface CmsIconTextItem {
  iconKey: string;
  text: string;
}

export interface CmsUspItem {
  iconKey: string;
  title: string;
  description: string;
}

export interface CmsProcessStepItem {
  number: number;
  title: string;
  description: string;
  iconKey: string;
}

export interface SiteTrustBadgesSettings {
  items: CmsIconTextItem[];
}

export interface SiteUspsSettings {
  title: string;
  subtitle: string;
  items: CmsUspItem[];
}

export interface SiteProcessSettings {
  title: string;
  subtitle: string;
  speechBubble: string;
  steps: CmsProcessStepItem[];
}

export interface SiteSectionHeading {
  title: string;
  subtitle: string;
}

export interface SiteSectionsSettings {
  usps: SiteSectionHeading;
  services: SiteSectionHeading;
  process: SiteSectionHeading;
  gallery: SiteSectionHeading;
  testimonials: SiteSectionHeading;
  about: SiteSectionHeading;
  news: SiteSectionHeading;
  faq: SiteSectionHeading;
  contact: SiteSectionHeading;
}

export interface SiteContactSettings {
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  instagramHandle: string;
  location: string;
}

export interface SiteAboutSettings {
  founderName: string;
  imageUrl: string;
  introText: string;
  paragraph1: string;
  paragraph2: string;
  missionText: string;
  valuesText: string;
}

export interface SiteFooterSettings {
  tagline: string;
  copyrightName: string;
}

export interface SiteEmailSettings {
  companyName: string;
  senderName: string;
  senderEmail: string;
  replyTo: string;
  notificationEmail: string;
}

export interface SiteBusinessSettings {
  companyName: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  iban: string;
  bic: string;
  bankName: string;
  taxNumber: string;
  vatId: string;
  managingDirector: string;
  defaultPaymentDays: number;
  defaultQuoteText: string;
  defaultInvoiceText: string;
  defaultPaymentText: string;
  senderName: string;
  senderEmail: string;
}

export interface SiteSettingsBundle {
  hero: SiteHeroSettings;
  contact: SiteContactSettings;
  about: SiteAboutSettings;
  footer: SiteFooterSettings;
  navigation: SiteNavigationSettings;
  branding: SiteBrandingSettings;
  trustBadges: SiteTrustBadgesSettings;
  usps: SiteUspsSettings;
  process: SiteProcessSettings;
  sections: SiteSectionsSettings;
  business: SiteBusinessSettings;
  email: SiteEmailSettings;
}

export interface CmsService {
  id: string;
  icon_key: string;
  title: string;
  description: string;
  sort_order: number;
  visible: boolean;
}

export interface CmsFaq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  visible: boolean;
}

export interface GalleryImageRecord {
  id: string;
  storage_path: string;
  title: string;
  alt_text: string;
  category: string;
  sort_order: number;
  visible: boolean;
  url?: string;
}

export interface CmsPost {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  hero_image_path: string | null;
  category: string;
  slug: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  hero_image_url?: string | null;
}

export interface ReviewRecord {
  id: string;
  created_at: string;
  name: string;
  event_type: string;
  rating: number;
  text: string;
  approved: boolean;
  profile_image_url: string | null;
  event_image_url: string | null;
  admin_reply: string | null;
  verified: boolean;
}

export interface PublicReview {
  id: string;
  name: string;
  event_type: string;
  rating: number;
  text: string;
  created_at: string;
  profile_image_url: string | null;
  event_image_url: string | null;
  admin_reply: string | null;
  verified: boolean;
}

export interface BookingRecord {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  event_type: string;
  event_date: string;
  event_time: string;
  duration: string | null;
  location: string;
  children_count: number;
  message: string | null;
  status: BookingStatus;
  admin_notes: string | null;
}

export type StorageBucket = "gallery" | "reviews" | "site-assets";
