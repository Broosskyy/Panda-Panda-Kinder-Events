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

export interface SiteSettingsBundle {
  hero: SiteHeroSettings;
  contact: SiteContactSettings;
  about: SiteAboutSettings;
  footer: SiteFooterSettings;
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
