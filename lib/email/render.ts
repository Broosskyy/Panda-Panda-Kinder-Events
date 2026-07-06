import { fetchSiteSettings } from "@/lib/cms/data";
import { getBusinessProfile } from "@/lib/crm/company";
import { getSiteUrl } from "@/lib/site-url";
import { resolveBrandLogo, resolvePrimaryColor } from "@/lib/brand/resolve";
import { applyTemplateVariables } from "@/lib/email/variables";

/** Standard-Variablen für E-Mail-Vorlagen aus CMS-Settings */
export async function buildEmailVariableContext(
  overrides: Record<string, string | number | null | undefined> = {},
): Promise<Record<string, string>> {
  const [settings, business] = await Promise.all([fetchSiteSettings(), getBusinessProfile()]);

  const base: Record<string, string> = {
    company_name: business.companyName || settings.branding.brandName || "Panda-Bande",
    company_email: business.email || settings.contact.email,
    company_phone: business.phone || settings.contact.phone,
    company_website: business.website || getSiteUrl(),
    customer_name: "",
    customer_email: "",
    quote_number: "",
    invoice_number: "",
    total_amount: "",
    due_date: "",
    payment_terms: business.invoiceSettings?.paymentInfoText || "",
    iban: business.iban || "",
    bic: business.bic || "",
    appointment_date: "",
    message: "",
    admin_name: "",
    logo_url: resolveBrandLogo(settings.branding, "email"),
    primary_color: resolvePrimaryColor(settings.branding),
    tagline: settings.branding.tagline || "Kinderevents",
    slogan: settings.branding.slogan || settings.business.slogan || "",
  };

  for (const [key, value] of Object.entries(overrides)) {
    if (value != null) base[key] = String(value);
  }

  return base;
}

export async function renderEmailFromTemplate(
  slug: string,
  overrides: Record<string, string | number | null | undefined> = {},
): Promise<{ subject: string; html: string; text: string } | null> {
  const { getEmailTemplateBySlug } = await import("@/lib/email/templates-db");
  const template = await getEmailTemplateBySlug(slug);
  if (!template || !template.is_active) return null;

  const vars = await buildEmailVariableContext(overrides);
  const subject = applyTemplateVariables(template.subject, vars);
  const bodyHtml = applyTemplateVariables(template.body_html, vars);
  const bodyText = applyTemplateVariables(template.body_text || template.body_html.replace(/<[^>]+>/g, ""), vars);

  const settings = await fetchSiteSettings();
  const { wrapEmailHtml } = await import("@/lib/email/html");
  const html = wrapEmailHtml({
    baseUrl: getSiteUrl(),
    logoUrl: resolveBrandLogo(settings.branding, "email"),
    companyName: vars.company_name,
    primaryColor: resolvePrimaryColor(settings.branding),
    bodyHtml,
    footerHtml: `<p style="margin:8px 0 0;font-size:12px;color:#888;">${vars.company_phone} · ${vars.company_email}</p>`,
  });

  return { subject, html, text: bodyText };
}
