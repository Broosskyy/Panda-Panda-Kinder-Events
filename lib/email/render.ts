import { fetchSiteSettings } from "@/lib/cms/data";
import { getBusinessProfile } from "@/lib/crm/company";
import { resolveBrandLogo, resolvePrimaryColor } from "@/lib/brand/resolve";
import { getSiteUrl } from "@/lib/site-url";
import { getDefaultEmailLogoUrl, resolveEmailImageUrl } from "@/lib/email/resolve-image-url";
import { normalizeEmailVariables, sanitizeEmailVariables } from "@/lib/email/variables";
import { getEmailSettings } from "@/lib/email/sender";

/** Standard-Variablen für E-Mail-Vorlagen aus CMS-Settings */
export async function buildEmailVariableContext(
  overrides: Record<string, string | number | null | undefined> = {},
): Promise<Record<string, string>> {
  const [settings, business, emailSettings] = await Promise.all([
    fetchSiteSettings(),
    getBusinessProfile(),
    getEmailSettings(),
  ]);

  const companyName =
    business.companyName || settings.branding.brandName || emailSettings.companyName || settings.email.branding.companyName || "";

  const base: Record<string, string> = {
    company_name: companyName,
    company: companyName,
    company_email: emailSettings.companyEmail || business.email || settings.contact.email || "",
    company_phone: business.phone || settings.contact.phone || "",
    company_website: business.website || settings.email.branding.website || getSiteUrl(),
    website: business.website || getSiteUrl(),
    websiteUrl: business.website || getSiteUrl(),
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    name: "",
    quote_number: "",
    invoice_number: "",
    offerNumber: "",
    invoiceNumber: "",
    total_amount: "",
    amount: "",
    due_date: "",
    payment_terms: business.invoiceSettings?.paymentInfoText || "",
    iban: business.iban || "",
    bic: business.bic || "",
    appointment_date: "",
    event_type: "",
    event_date: "",
    event_location: "",
    eventLocation: "",
    children_count: "",
    message: "",
    reviewText: "",
    admin_name: "",
    admin_url: `${getSiteUrl()}/admin`,
    adminUrl: `${getSiteUrl()}/admin`,
    review_link: "",
    reset_link: "",
    rating: "",
    submitted_at: "",
    sender_from: "",
    reply_to: "",
    domain_status: "",
    opening_hours: settings.contact.openingHours || settings.email.signature.openingHours || "",
    current_year: String(new Date().getFullYear()),
    currentYear: String(new Date().getFullYear()),
    logo_url:
      resolveEmailImageUrl(resolveBrandLogo(settings.branding, "email"), undefined) ?? getDefaultEmailLogoUrl(),
    primary_color: resolvePrimaryColor(settings.branding),
    tagline: settings.branding.tagline || "",
    slogan: settings.branding.slogan || settings.business.slogan || "",
  };

  for (const [key, value] of Object.entries(overrides)) {
    if (value != null) base[key] = String(value);
  }

  if (base.customer_name && !base.name) base.name = base.customer_name.split(/\s+/)[0] || base.customer_name;
  if (base.name && !base.customer_name) base.customer_name = base.name;

  return sanitizeEmailVariables(normalizeEmailVariables(base));
}

export async function renderEmailFromTemplate(
  slug: string,
  overrides: Record<string, string | number | null | undefined> = {},
  options?: {
    previewMode?: "desktop" | "tablet" | "mobile" | "dark" | "light";
    layout?: import("@/lib/cms/types").EmailTemplateLayout | null;
    subject?: string;
    bodyHtml?: string;
  },
): Promise<{ subject: string; html: string; text: string } | null> {
  const { getEmailTemplateBySlug } = await import("@/lib/email/templates-db");
  const template = await getEmailTemplateBySlug(slug);
  if (!template || !template.is_active) return null;

  const { renderGlobalEmail } = await import("@/lib/email/global-renderer");
  const result = await renderGlobalEmail({
    slug,
    subject: options?.subject ?? template.subject,
    bodyHtml: options?.bodyHtml ?? (template.body_html?.trim() ? template.body_html : undefined),
    layout: options?.layout ?? template.layout ?? null,
    variables: overrides,
    previewMode: options?.previewMode,
  });

  return result;
}
