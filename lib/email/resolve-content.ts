import { getEmailSettings } from "@/lib/email/sender";
import type { SiteEmailSettings } from "@/lib/cms/types";
import { applyTemplateVariables } from "@/lib/email/variables";
import { buildEmailVariableContext, renderEmailFromTemplate } from "@/lib/email/render";
import { wrapEmailHtml } from "@/lib/email/html";
import { fetchSiteSettings } from "@/lib/cms/data";
import { getSiteUrl } from "@/lib/site-url";
import { resolveBrandLogo, resolvePrimaryColor } from "@/lib/brand/resolve";

function plainTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export interface ResolvedEmailContent {
  subject: string;
  html: string;
  text: string;
  templateSlug: string;
}

interface CmsFieldFallback {
  subjectField: keyof SiteEmailSettings;
  textField: keyof SiteEmailSettings;
}

const CMS_FIELD_MAP: Record<string, CmsFieldFallback> = {
  "inquiry-auto-reply": { subjectField: "inquiryAutoReplySubject", textField: "inquiryAutoReplyText" },
  "inquiry-admin": { subjectField: "inquiryAdminSubject", textField: "inquiryAdminText" },
  "review-request": { subjectField: "reviewRequestSubject", textField: "reviewRequestText" },
  "review-admin": { subjectField: "reviewAdminSubject", textField: "reviewAdminText" },
  "quote-send": { subjectField: "quoteSubjectTemplate", textField: "quoteEmailBody" },
  "invoice-send": { subjectField: "invoiceSubjectTemplate", textField: "invoiceEmailBody" },
  "password-reset": { subjectField: "passwordResetSubject", textField: "passwordResetText" },
};

async function wrapWithBranding(bodyHtml: string, vars: Record<string, string>): Promise<string> {
  const settings = await fetchSiteSettings();
  return wrapEmailHtml({
    baseUrl: getSiteUrl(),
    logoUrl: resolveBrandLogo(settings.branding, "email"),
    companyName: vars.company_name,
    primaryColor: resolvePrimaryColor(settings.branding),
    bodyHtml,
    footerHtml: `<p style="margin:8px 0 0;font-size:12px;color:#888;">${vars.company_phone} · ${vars.company_email}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#888;"><a href="${vars.company_website}" style="color:${resolvePrimaryColor(settings.branding)};">${vars.company_website}</a></p>`,
  });
}

/**
 * Löst E-Mail-Inhalt auf: DB-Vorlage → CMS-Felder → optionaler Builder-Fallback.
 */
export async function resolveEmailContent(
  slug: string,
  overrides: Record<string, string | number | null | undefined> = {},
  builderFallback?: () => { subject: string; html: string; text: string },
): Promise<ResolvedEmailContent> {
  const rendered = await renderEmailFromTemplate(slug, overrides);
  if (rendered) {
    return { ...rendered, templateSlug: slug };
  }

  const [emailSettings, vars] = await Promise.all([
    getEmailSettings(),
    buildEmailVariableContext(overrides),
  ]);

  const cmsFields = CMS_FIELD_MAP[slug];
  if (cmsFields) {
    const subjectTemplate = String(emailSettings[cmsFields.subjectField] ?? "");
    const textTemplate = String(emailSettings[cmsFields.textField] ?? "");
    if (subjectTemplate.trim() || textTemplate.trim()) {
      const subject = applyTemplateVariables(subjectTemplate, vars);
      const text = applyTemplateVariables(textTemplate, vars);
      const html = await wrapWithBranding(plainTextToHtml(text), vars);
      return { subject, html, text, templateSlug: slug };
    }
  }

  if (builderFallback) {
    const built = builderFallback();
    return { ...built, templateSlug: slug };
  }

  return {
    subject: applyTemplateVariables("Nachricht von {{company_name}}", vars),
    html: await wrapWithBranding(plainTextToHtml(vars.message || ""), vars),
    text: vars.message || "",
    templateSlug: slug,
  };
}
