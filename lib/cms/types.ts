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
  logoDarkUrl: string;
  logoLightUrl: string;
  logoAlt: string;
  logoTextPrimary: string;
  logoTextSecondary: string;
  brandName: string;
  tagline: string;
  slogan: string;
  primaryColor: string;
  accentColor: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  pwaIcon192Url: string;
  pwaIcon512Url: string;
  pdfLogoUrl: string;
  emailLogoUrl: string;
  loginLogoUrl: string;
  ogImageUrl: string;
  showTextMark: boolean;
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

export interface SitePublicStatsSettings {
  eventsCount?: number;
  childrenCount?: number;
  recommendationPercent?: number;
  yearsExperience?: number;
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
  team: SiteSectionHeading;
  contact: SiteSectionHeading;
}

export interface SiteContactSettings {
  phone: string;
  mobile: string;
  email: string;
  contactEmail: string;
  whatsapp: string;
  whatsappLabel: string;
  instagram: string;
  instagramHandle: string;
  facebook: string;
  tiktok: string;
  location: string;
  mapsUrl: string;
  responseTime: string;
  openingHours: string;
}

export interface PublicTeamMemberItem {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

export interface SitePublicTeamSettings {
  title: string;
  subtitle: string;
  items: PublicTeamMemberItem[];
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

export interface EmailTemplateLayout {
  headline?: string;
  intro?: string;
  body?: string;
  infoBoxEnabled?: boolean;
  infoBoxItems?: string[];
  ctaText?: string;
  ctaUrl?: string;
  footerEnabled?: boolean;
}

export interface EmailTemplateRecord {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  subject: string;
  body_html: string;
  body_text: string | null;
  layout?: EmailTemplateLayout | null;
  area: EmailTemplateArea;
  is_active: boolean;
  is_default: boolean;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export type EmailTemplateArea =
  | "general"
  | "inquiry"
  | "quote"
  | "invoice"
  | "payment_reminder"
  | "review"
  | "password_reset"
  | "security"
  | "appointment"
  | "inquiry_reply"
  | "newsletter";

export interface EmailLogRecord {
  id: string;
  recipient: string;
  subject: string;
  template_slug: string | null;
  area: string | null;
  status: "sent" | "failed";
  error_message: string | null;
  sent_by_admin_id: string | null;
  related_customer_id: string | null;
  related_quote_id: string | null;
  related_invoice_id: string | null;
  original_recipient?: string | null;
  sender_from?: string | null;
  body_preview?: string | null;
  opened_at?: string | null;
  tenant_id?: string | null;
  created_at: string;
}

export interface EmailDraftRecord {
  id: string;
  recipient: string | null;
  subject: string | null;
  body_html: string | null;
  template_slug: string | null;
  created_by_admin_id: string | null;
  updated_at: string;
}

export interface SiteFooterSettings {
  tagline: string;
  copyrightName: string;
}

export interface SiteEmailCustomAddresses {
  info: string;
  kontakt: string;
  rechnung: string;
  angebote: string;
}

/** Alias-Eintrag (CMS-Fallback; primär in email_aliases Tabelle) */
export interface SiteEmailAliasRecord {
  id: string;
  aliasAddress: string;
  forwardTo: string;
  description: string;
  isActive: boolean;
  sortOrder?: number;
  tenantId?: string | null;
}

export interface SiteEmailSignatureSettings {
  companyName: string;
  contactPerson: string;
  phone: string;
  mobile: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
  address: string;
  openingHours: string;
  logoUrl: string;
  impressumUrl: string;
  privacyUrl: string;
  footerText: string;
  freeText: string;
  showSocialIcons: boolean;
}

export type EmailThemeMode = "light" | "dark" | "auto";

export interface SiteEmailBrandingSettings {
  logoUrl: string;
  faviconUrl: string;
  headerImageUrl: string;
  backgroundColor: string;
  cardColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
  textMutedColor: string;
  borderColor: string;
  linkColor: string;
  footerColor: string;
  fontFamily: string;
  theme: EmailThemeMode;
  showSocialIcons: boolean;
  companyName: string;
  senderName: string;
  replyTo: string;
  website: string;
}

export type EmailTestModePrefix = "TEST" | "STAGING" | "DEV";

export interface SiteEmailTestModeSettings {
  enabled: boolean;
  testAddress: string;
  subjectPrefix: EmailTestModePrefix;
}

export interface SiteEmailSettings {
  companyName: string;
  senderName: string;
  senderEmail: string;
  replyTo: string;
  /** Zentrale Firmen-E-Mail für Kopien und als Fallback */
  companyEmail: string;
  copyToEmail: string;
  quoteCopyTo: string;
  invoiceCopyTo: string;
  inquiryRecipient: string;
  inquiryCopyTo: string;
  adminNotificationEmail: string;
  inquiryAutoReplyEnabled: boolean;
  inquiryAutoReplySubject: string;
  inquiryAutoReplyText: string;
  inquiryAdminSubject: string;
  inquiryAdminText: string;
  reviewRecipient: string;
  reviewRequestSubject: string;
  reviewRequestText: string;
  reviewAdminSubject: string;
  reviewAdminText: string;
  quoteSenderEmail: string;
  quoteReplyTo: string;
  quoteSubjectTemplate: string;
  quoteEmailBody: string;
  invoiceSenderEmail: string;
  invoiceReplyTo: string;
  invoiceSubjectTemplate: string;
  invoiceEmailBody: string;
  crmCopyToCompanyEnabled: boolean;
  passwordResetSenderEmail: string;
  passwordResetSubject: string;
  passwordResetText: string;
  securityNotificationSender: string;
  securityAlertsEnabled: boolean;
  loginAlertRecipient: string;
  applicationEmail: string;
  applicationCopyTo: string;
  customAddresses: SiteEmailCustomAddresses;
  signature: SiteEmailSignatureSettings;
  branding: SiteEmailBrandingSettings;
  testMode: SiteEmailTestModeSettings;
  /** @deprecated use inquiryRecipient */
  notificationEmail?: string;
}

export interface SiteBankSettings {
  bankName: string;
  accountHolder: string;
  iban: string;
  bic: string;
  taxNumber: string;
  vatId: string;
  smallBusinessRule: boolean;
  smallBusinessNotice: string;
  paymentTerms: string;
  dunningNotice: string;
}

export interface SiteInvoiceSettings {
  quotePrefix: string;
  invoicePrefix: string;
  quoteStartNumber: number;
  invoiceStartNumber: number;
  yearInNumber: boolean;
  defaultQuoteDateToday: boolean;
  defaultInvoiceDateToday: boolean;
  defaultDueDays: number;
  defaultPaymentDays: number;
  showServiceDate: boolean;
  showEventDate: boolean;
  defaultTaxRate: number;
  smallBusinessRule: boolean;
  taxNoticeText: string;
  discountFieldEnabled: boolean;
  quoteIntroText: string;
  quoteClosingText: string;
  invoiceIntroText: string;
  invoiceClosingText: string;
  paymentInfoText: string;
  paymentReferenceText: string;
  pdfFooterText: string;
  legalNoticeText: string;
}

export interface SiteSeoSettings {
  primaryDomain: string;
  wwwDomain: string;
  canonicalBaseUrl: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  socialPreviewText: string;
  googleSiteVerification: string;
  googleAnalyticsId: string;
  microsoftClarityId: string;
  robotsIndex: boolean;
  sitemapEnabled: boolean;
}

export interface SiteLegalSettings {
  impressumResponsible: string;
  impressumDisclaimer: string;
  privacyContactEmail: string;
  privacyCustomText: string;
  agbTitle: string;
  agbContent: string;
  cookieNoticeText: string;
  inquiryPrivacyHint: string;
  reviewPrivacyHint: string;
  bookingPrivacyHint: string;
  invoiceLegalNotice: string;
  placeholderNotice: string;
}

export interface SiteBusinessSettings {
  companyName: string;
  shortName: string;
  slogan: string;
  logoUrl: string;
  faviconUrl: string;
  street: string;
  zip: string;
  city: string;
  state: string;
  country: string;
  /** Legacy combined address — derived from street/zip/city when empty */
  address: string;
  managingDirector: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  /** @deprecated use bank settings — kept for backward compatibility */
  iban: string;
  /** @deprecated use bank settings */
  bic: string;
  /** @deprecated use bank settings */
  bankName: string;
  /** @deprecated use bank settings */
  taxNumber: string;
  /** @deprecated use bank settings */
  vatId: string;
  /** @deprecated use invoice settings */
  defaultPaymentDays: number;
  /** @deprecated use invoice settings */
  defaultQuoteText: string;
  /** @deprecated use invoice settings */
  defaultInvoiceText: string;
  /** @deprecated use invoice settings */
  defaultPaymentText: string;
  /** @deprecated use email settings */
  senderName: string;
  /** @deprecated use email settings */
  senderEmail: string;
}

export interface TeamSocialLinks {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  active: boolean;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  position?: string;
  description?: string;
  profile_image_url?: string;
  phone?: string;
  social_links?: TeamSocialLinks;
  sort_order?: number;
  archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteModulesSettings {
  blog: boolean;
  gallery: boolean;
  reviews: boolean;
  team: boolean;
  faq: boolean;
  services: boolean;
  quotes: boolean;
  invoices: boolean;
  crm: boolean;
  email: boolean;
  backup: boolean;
  analytics: boolean;
  pwa: boolean;
  whatsapp: boolean;
  stickyCta: boolean;
}

export interface SiteSettingsBundle {
  hero: SiteHeroSettings;
  contact: SiteContactSettings;
  about: SiteAboutSettings;
  footer: SiteFooterSettings;
  navigation: SiteNavigationSettings;
  branding: SiteBrandingSettings;
  trustBadges: SiteTrustBadgesSettings;
  publicStats: SitePublicStatsSettings;
  usps: SiteUspsSettings;
  process: SiteProcessSettings;
  sections: SiteSectionsSettings;
  publicTeam: SitePublicTeamSettings;
  business: SiteBusinessSettings;
  email: SiteEmailSettings;
  bank: SiteBankSettings;
  invoice: SiteInvoiceSettings;
  seo: SiteSeoSettings;
  legal: SiteLegalSettings;
  modules: SiteModulesSettings;
}

export interface CmsService {
  id: string;
  icon_key: string;
  title: string;
  description: string;
  detail_text?: string;
  image_url?: string;
  button_label?: string;
  price_from?: string;
  highlights?: string[];
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
