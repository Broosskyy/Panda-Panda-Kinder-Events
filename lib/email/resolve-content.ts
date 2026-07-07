import { getEmailSettings } from "@/lib/email/sender";
import type { SiteEmailSettings } from "@/lib/cms/types";
import { applyTemplateVariables } from "@/lib/email/variables";
import { buildEmailVariableContext, renderEmailFromTemplate } from "@/lib/email/render";
import { wrapBrandedEmailHtml } from "@/lib/email/wrap-branded";
import { SYSTEM_EMAIL_DEFAULTS } from "@/lib/email/brand-tokens";

function plainTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${SYSTEM_EMAIL_DEFAULTS.text};">${p.replace(/\n/g, "<br/>")}</p>`)
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

function buildOptionalFooterHtml(vars: Record<string, string>): string {
  const bits: string[] = [];
  if (vars.company_phone?.trim()) bits.push(vars.company_phone.trim());
  if (vars.company_email?.trim()) bits.push(vars.company_email.trim());
  const contactLine = bits.length
    ? `<p style="margin:8px 0 0;font-size:12px;color:${SYSTEM_EMAIL_DEFAULTS.textMuted};">${bits.join(" · ")}</p>`
    : "";
  const websiteLine = vars.company_website?.trim()
    ? `<p style="margin:4px 0 0;font-size:12px;color:${SYSTEM_EMAIL_DEFAULTS.textMuted};"><a href="${vars.company_website}" style="color:${SYSTEM_EMAIL_DEFAULTS.primary};">${vars.company_website}</a></p>`
    : "";
  return `${contactLine}${websiteLine}`;
}

async function wrapWithBranding(bodyHtml: string, vars: Record<string, string>): Promise<string> {
  return wrapBrandedEmailHtml(bodyHtml, vars.company_name, buildOptionalFooterHtml(vars));
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
