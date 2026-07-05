import { fetchSiteSettings } from "@/lib/cms/data";
import type { SiteBusinessSettings } from "@/lib/cms/types";

export type BusinessProfile = SiteBusinessSettings;

export async function getBusinessProfile(): Promise<BusinessProfile> {
  const settings = await fetchSiteSettings();
  const b = settings.business;
  const contact = settings.contact;
  const branding = settings.branding;

  return {
    ...b,
    companyName: b.companyName || settings.footer.copyrightName || branding.logoTextPrimary,
    logoUrl: b.logoUrl || branding.logoUrl,
    phone: b.phone || contact.phone,
    email: b.email || contact.email,
    website: b.website || "https://panda-bande-events.de",
    address: b.address || contact.location,
    senderName: b.senderName || b.companyName,
    senderEmail: b.senderEmail || b.email || contact.email,
  };
}
