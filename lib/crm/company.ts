import { fetchSiteSettings } from "@/lib/cms/data";
import { BRAND } from "@/lib/brand";
import type { SiteBankSettings, SiteBusinessSettings, SiteInvoiceSettings } from "@/lib/cms/types";
import { getSiteUrl } from "@/lib/site-url";

function resolvePdfLogoUrl(url: string): string {
  if (!url) return BRAND.logo.png;
  if (url.endsWith(".svg")) return BRAND.logo.png;
  return url;
}

export type BusinessProfile = SiteBusinessSettings & SiteBankSettings & {
  formattedAddress: string;
  invoiceSettings: SiteInvoiceSettings;
};

export function formatBusinessAddress(
  business: Pick<SiteBusinessSettings, "street" | "zip" | "city" | "state" | "country" | "address">,
): string {
  if (business.street?.trim()) {
    const cityLine = [business.zip, business.city].filter(Boolean).join(" ").trim();
    const region = [cityLine, business.state, business.country].filter(Boolean).join(", ");
    return [business.street.trim(), region].filter(Boolean).join("\n");
  }
  return business.address?.trim() ?? "";
}

export async function getBusinessProfile(): Promise<BusinessProfile> {
  const settings = await fetchSiteSettings();
  const b = settings.business;
  const bank = settings.bank;
  const invoice = settings.invoice;
  const email = settings.email;
  const contact = settings.contact;
  const branding = settings.branding;
  const formattedAddress = formatBusinessAddress(b) || contact.location;

  return {
    ...b,
    ...bank,
    companyName: b.companyName || settings.footer.copyrightName || branding.logoTextPrimary,
    logoUrl: resolvePdfLogoUrl(b.logoUrl || branding.logoUrl),
    phone: b.phone || contact.phone,
    email: b.email || contact.email,
    website: b.website || getSiteUrl(),
    address: formattedAddress,
    formattedAddress,
    accountHolder: bank.accountHolder || b.companyName,
    senderName: email.senderName || b.companyName,
    senderEmail: email.senderEmail || b.email || contact.email,
    invoiceSettings: invoice,
    defaultPaymentDays: invoice.defaultPaymentDays,
    defaultQuoteText: invoice.quoteIntroText,
    defaultInvoiceText: invoice.invoiceIntroText,
    defaultPaymentText: invoice.paymentInfoText,
  };
}
