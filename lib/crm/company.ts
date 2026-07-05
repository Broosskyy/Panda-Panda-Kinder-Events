import { fetchSiteSettings } from "@/lib/cms/data";
import type { SiteBusinessSettings } from "@/lib/cms/types";

export type BusinessProfile = SiteBusinessSettings & {
  formattedAddress: string;
};

export function formatBusinessAddress(business: Pick<SiteBusinessSettings, "street" | "zip" | "city" | "address">): string {
  if (business.street?.trim()) {
    const cityLine = [business.zip, business.city].filter(Boolean).join(" ").trim();
    return [business.street.trim(), cityLine].filter(Boolean).join("\n");
  }
  return business.address?.trim() ?? "";
}

export async function getBusinessProfile(): Promise<BusinessProfile> {
  const settings = await fetchSiteSettings();
  const b = settings.business;
  const email = settings.email;
  const contact = settings.contact;
  const branding = settings.branding;
  const formattedAddress = formatBusinessAddress(b) || contact.location;

  return {
    ...b,
    companyName: b.companyName || settings.footer.copyrightName || branding.logoTextPrimary,
    logoUrl: b.logoUrl || branding.logoUrl,
    phone: b.phone || contact.phone,
    email: b.email || contact.email,
    website: b.website || "https://panda-bande-events.de",
    address: formattedAddress,
    formattedAddress,
    senderName: email.senderName || b.senderName || b.companyName,
    senderEmail: email.senderEmail || b.senderEmail || b.email || contact.email,
  };
}
