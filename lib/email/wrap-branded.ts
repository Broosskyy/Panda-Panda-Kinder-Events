import { fetchSiteSettings } from "@/lib/cms/data";
import { resolveEmailBranding, resolveEmailLogoForSend, type ResolvedEmailBranding } from "@/lib/email/branding";
import { getEmailAssetBaseUrl } from "@/lib/email/asset-url";
import { buildEmailSignatureFooter } from "@/lib/email/signature";
import { wrapEmailHtml } from "@/lib/email/html";

export async function wrapBrandedEmailHtml(
  bodyHtml: string,
  companyName?: string,
  extraFooterHtml?: string,
  options?: {
    previewMode?: "desktop" | "tablet" | "mobile" | "dark";
    branding?: Partial<ResolvedEmailBranding>;
  },
): Promise<string> {
  const [settings, resolvedBranding] = await Promise.all([
    fetchSiteSettings(),
    options?.branding ? Promise.resolve(options.branding as ResolvedEmailBranding) : resolveEmailBranding(),
  ]);

  const branding = options?.branding ?? resolvedBranding;
  const signatureHtml = await buildEmailSignatureFooter(
    branding.linkColor || branding.primaryColor || "#4F5638",
  );
  const name = companyName || branding.companyName || settings.email.companyName;

  return wrapEmailHtml({
    baseUrl: getEmailAssetBaseUrl(),
    logoUrl: resolveEmailLogoForSend(branding.logoUrl),
    companyName: name,
    headerImageUrl: branding.headerImageUrl,
    branding,
    bodyHtml,
    signatureHtml,
    footerHtml: extraFooterHtml,
    previewMode: options?.previewMode,
  });
}
