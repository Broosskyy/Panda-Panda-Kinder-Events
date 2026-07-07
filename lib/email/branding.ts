import { fetchSiteSettings } from "@/lib/cms/data";
import { resolveBrandLogo } from "@/lib/brand/resolve";
import { SYSTEM_EMAIL_DEFAULTS } from "@/lib/email/brand-tokens";
import { getDefaultEmailLogoUrl, resolveEmailImageUrl } from "@/lib/email/resolve-image-url";
import type { EmailThemeMode, SiteEmailBrandingSettings } from "@/lib/cms/types";

export async function getEmailBrandingSettings(): Promise<SiteEmailBrandingSettings> {
  const settings = await fetchSiteSettings();
  const emailBranding = settings.email.branding;
  const business = settings.business;
  const rawLogo =
    emailBranding.logoUrl?.trim() || resolveBrandLogo(settings.branding, "email") || "/assets/Logo.png";
  return {
    ...emailBranding,
    logoUrl: resolveEmailImageUrl(rawLogo) ?? getDefaultEmailLogoUrl(),
    faviconUrl: emailBranding.faviconUrl?.trim() || settings.branding.faviconUrl || "",
    primaryColor: emailBranding.primaryColor?.trim() || settings.branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    companyName: emailBranding.companyName?.trim() || settings.email.companyName || business.companyName,
    senderName: emailBranding.senderName?.trim() || settings.email.senderName,
    replyTo: emailBranding.replyTo?.trim() || settings.email.replyTo,
    website: emailBranding.website?.trim() || business.website || "",
    theme: (emailBranding.theme as EmailThemeMode) || "light",
    brandDisplayName:
      emailBranding.brandDisplayName?.trim() ||
      settings.branding.brandName ||
      emailBranding.companyName ||
      business.companyName,
    slogan:
      emailBranding.slogan?.trim() ||
      settings.branding.slogan ||
      settings.branding.tagline ||
      business.slogan ||
      "",
  };
}

export interface ResolvedEmailBranding {
  logoUrl: string;
  faviconUrl: string;
  headerImageUrl: string;
  backgroundColor: string;
  cardBackground: string;
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
  companyName: string;
  logoWidth: number;
  logoHeight: number;
  logoPaddingTop: number;
  logoPaddingBottom: number;
  brandDisplayName: string;
  slogan: string;
  showBrandName: boolean;
  showSlogan: boolean;
  showLogo: boolean;
  cardRadius: number;
  shadowEnabled: boolean;
  closingLine: string;
  defaultCtaUrl: string;
  adminEmail: string;
  darkBackgroundColor: string;
  darkCardColor: string;
  darkPrimaryColor: string;
  darkSecondaryColor: string;
  darkTextColor: string;
  darkTextMutedColor: string;
  darkBorderColor: string;
  darkAccentColor: string;
  darkButtonColor: string;
  darkButtonTextColor: string;
}

export async function resolveEmailBranding(): Promise<ResolvedEmailBranding> {
  const branding = await getEmailBrandingSettings();
  return {
    logoUrl: branding.logoUrl,
    faviconUrl: branding.faviconUrl,
    headerImageUrl: branding.headerImageUrl,
    backgroundColor: branding.backgroundColor || SYSTEM_EMAIL_DEFAULTS.pageBackground,
    cardBackground: branding.cardColor || SYSTEM_EMAIL_DEFAULTS.cardBackground,
    primaryColor: branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    secondaryColor: branding.secondaryColor || branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    accentColor: branding.accentColor || branding.footerColor || SYSTEM_EMAIL_DEFAULTS.accent,
    buttonColor: branding.buttonColor || branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    buttonTextColor: branding.buttonTextColor || SYSTEM_EMAIL_DEFAULTS.buttonText,
    textColor: branding.textColor || SYSTEM_EMAIL_DEFAULTS.text,
    textMutedColor: branding.textMutedColor || SYSTEM_EMAIL_DEFAULTS.textMuted,
    borderColor: branding.borderColor || SYSTEM_EMAIL_DEFAULTS.border,
    linkColor: branding.linkColor || branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    footerColor: branding.footerColor || SYSTEM_EMAIL_DEFAULTS.accent,
    fontFamily: branding.fontFamily || SYSTEM_EMAIL_DEFAULTS.fontFamily,
    theme: branding.theme || "light",
    companyName: branding.companyName,
    logoWidth: branding.logoWidth || SYSTEM_EMAIL_DEFAULTS.logoWidth,
    logoHeight: branding.logoHeight ?? 0,
    logoPaddingTop: branding.logoPaddingTop ?? 32,
    logoPaddingBottom: branding.logoPaddingBottom ?? 16,
    brandDisplayName: branding.brandDisplayName || branding.companyName,
    slogan: branding.slogan || "",
    showBrandName: branding.showBrandName !== false,
    showSlogan: branding.showSlogan !== false,
    showLogo: branding.showLogo !== false,
    cardRadius: branding.cardRadius ?? 16,
    shadowEnabled: branding.shadowEnabled !== false,
    closingLine: branding.closingLine?.trim() || "Mit freundlichen Grüßen",
    defaultCtaUrl: branding.defaultCtaUrl?.trim() || branding.website || "",
    adminEmail: branding.adminEmail?.trim() || "",
    darkBackgroundColor: branding.darkBackgroundColor || "#1a1a18",
    darkCardColor: branding.darkCardColor || "#2a2a26",
    darkPrimaryColor: branding.darkPrimaryColor || branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    darkSecondaryColor: branding.darkSecondaryColor || branding.darkPrimaryColor || branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    darkTextColor: branding.darkTextColor || "#f4f1ea",
    darkTextMutedColor: branding.darkTextMutedColor || "#b8b5ad",
    darkBorderColor: branding.darkBorderColor || "#3d3d38",
    darkAccentColor: branding.darkAccentColor || "#33332f",
    darkButtonColor: branding.darkButtonColor || branding.darkPrimaryColor || branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    darkButtonTextColor: branding.darkButtonTextColor || "#ffffff",
  };
}

export function resolveEmailLogoForSend(logoPath: string | undefined | null): string {
  return resolveEmailImageUrl(logoPath) ?? getDefaultEmailLogoUrl();
}
