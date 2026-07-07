import { fetchSiteSettings } from "@/lib/cms/data";
import { resolveBrandLogo } from "@/lib/brand/resolve";
import type { SiteEmailBrandingSettings } from "@/lib/cms/types";

export async function getEmailBrandingSettings(): Promise<SiteEmailBrandingSettings> {
  const settings = await fetchSiteSettings();
  const emailBranding = settings.email.branding;
  return {
    ...emailBranding,
    logoUrl: emailBranding.logoUrl?.trim() || resolveBrandLogo(settings.branding, "email"),
    primaryColor: emailBranding.primaryColor?.trim() || settings.branding.primaryColor,
    companyName: emailBranding.companyName?.trim() || settings.email.companyName,
    senderName: emailBranding.senderName?.trim() || settings.email.senderName,
    replyTo: emailBranding.replyTo?.trim() || settings.email.replyTo,
  };
}

export interface ResolvedEmailBranding {
  logoUrl: string;
  headerImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  textColor: string;
  footerColor: string;
  fontFamily: string;
  companyName: string;
}

export async function resolveEmailBranding(): Promise<ResolvedEmailBranding> {
  const branding = await getEmailBrandingSettings();
  return {
    logoUrl: branding.logoUrl,
    headerImageUrl: branding.headerImageUrl,
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    buttonColor: branding.buttonColor,
    textColor: branding.textColor,
    footerColor: branding.footerColor,
    fontFamily: branding.fontFamily,
    companyName: branding.companyName,
  };
}
