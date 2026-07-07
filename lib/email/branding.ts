import { fetchSiteSettings } from "@/lib/cms/data";
import { resolveBrandLogo } from "@/lib/brand/resolve";
import { EMAIL_BRAND } from "@/lib/email/brand-tokens";
import { getDefaultEmailLogoUrl, resolveEmailImageUrl } from "@/lib/email/resolve-image-url";
import type { SiteEmailBrandingSettings } from "@/lib/cms/types";

export async function getEmailBrandingSettings(): Promise<SiteEmailBrandingSettings> {
  const settings = await fetchSiteSettings();
  const emailBranding = settings.email.branding;
  return {
    ...emailBranding,
    logoUrl: emailBranding.logoUrl?.trim() || resolveBrandLogo(settings.branding, "email") || "/assets/Logo.png",
    primaryColor: emailBranding.primaryColor?.trim() || settings.branding.primaryColor || EMAIL_BRAND.primary,
    companyName: emailBranding.companyName?.trim() || settings.email.companyName,
    senderName: emailBranding.senderName?.trim() || settings.email.senderName,
    replyTo: emailBranding.replyTo?.trim() || settings.email.replyTo,
  };
}

export interface ResolvedEmailBranding {
  logoUrl: string;
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
  footerColor: string;
  fontFamily: string;
  companyName: string;
}

export async function resolveEmailBranding(): Promise<ResolvedEmailBranding> {
  const branding = await getEmailBrandingSettings();
  return {
    logoUrl: branding.logoUrl,
    headerImageUrl: branding.headerImageUrl,
    backgroundColor: branding.backgroundColor || EMAIL_BRAND.pageBackground,
    cardBackground: branding.cardColor || EMAIL_BRAND.cardBackground,
    primaryColor: branding.primaryColor || EMAIL_BRAND.primary,
    secondaryColor: branding.secondaryColor || EMAIL_BRAND.primary,
    accentColor: branding.accentColor || branding.footerColor || EMAIL_BRAND.accent,
    buttonColor: branding.buttonColor || branding.primaryColor || EMAIL_BRAND.primary,
    buttonTextColor: branding.buttonTextColor || EMAIL_BRAND.buttonText,
    textColor: branding.textColor || EMAIL_BRAND.text,
    textMutedColor: branding.textMutedColor || EMAIL_BRAND.textMuted,
    footerColor: branding.footerColor || EMAIL_BRAND.accent,
    fontFamily: branding.fontFamily,
    companyName: branding.companyName,
  };
}

export function resolveEmailLogoForSend(logoPath: string | undefined | null): string {
  return resolveEmailImageUrl(logoPath) ?? getDefaultEmailLogoUrl();
}
