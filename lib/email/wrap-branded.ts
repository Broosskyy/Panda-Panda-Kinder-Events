import { fetchSiteSettings } from "@/lib/cms/data";
import { getSiteUrl } from "@/lib/site-url";
import { resolveEmailBranding } from "@/lib/email/branding";
import { buildEmailSignatureFooter } from "@/lib/email/signature";
import { wrapEmailHtml } from "@/lib/email/html";

export async function wrapBrandedEmailHtml(
  bodyHtml: string,
  companyName?: string,
  extraFooterHtml?: string,
): Promise<string> {
  const [settings, branding] = await Promise.all([
    fetchSiteSettings(),
    resolveEmailBranding(),
  ]);
  const signatureHtml = await buildEmailSignatureFooter(branding.primaryColor);

  const name = companyName || branding.companyName || settings.email.companyName;

  return wrapEmailHtml({
    baseUrl: getSiteUrl(),
    logoUrl: branding.logoUrl,
    companyName: name,
    primaryColor: branding.primaryColor,
    headerImageUrl: branding.headerImageUrl,
    branding,
    bodyHtml,
    signatureHtml,
    footerHtml: extraFooterHtml,
  });
}
