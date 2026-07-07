import { BRAND } from "@/lib/brand";
import { resolveBrandLogo, resolvePrimaryColor } from "@/lib/brand/resolve";
import { fetchSiteSettings } from "@/lib/cms/data";
import { getSiteUrl } from "@/lib/site-url";
import { resolveEmailContent } from "@/lib/email/resolve-content";
import { buildEmailButton } from "@/lib/email/builders";
import { sendEmailWithRetry } from "@/lib/email/transport";
import {
  getCopyEmailForDocument,
  getEmailSettings,
  getInquiryRecipient,
  resolveEmailSender,
  resolveFlowEmailSender,
  applyEmailTemplate,
  type ResolvedEmailSender,
} from "@/lib/email/sender";
import { wrapEmailHtml } from "@/lib/email/html";
import type { BusinessProfile } from "@/lib/crm/company";

export {
  checkResendDomainStatus,
  getCopyEmailForDocument,
  getEmailSettings,
  getInquiryRecipient,
  getAdminNotificationRecipient,
  getReviewRecipient,
  normalizeProductionEmail,
  normalizeSenderName,
  resolveEmailSender,
  resolveFlowEmailSender,
  applyEmailTemplate,
} from "@/lib/email/sender";
export { getResendSendingSetup } from "@/lib/email/resend-status";
export type { ResendSendingSetup, ResendStatusItem, ResendStatusLevel } from "@/lib/email/resend-status";
export type { EmailDomainCheck, EmailDomainStatus, ResolvedEmailSender } from "@/lib/email/sender";

import { Resend } from "resend";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY ist nicht gesetzt.");
  return new Resend(apiKey);
}

export async function getNotificationEmail(): Promise<string> {
  const settings = await getEmailSettings();
  return getInquiryRecipient(settings);
}

function formatSubmittedAt(date = new Date()): string {
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface InquiryEmailData {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  date: string;
  childrenCount: string;
  message?: string;
  submittedAt?: string;
}

export interface InquiryEmailResult {
  adminSent: boolean;
  customerSent: boolean;
  copySent: boolean;
  errors: string[];
}

export async function sendInquiryNotification(data: InquiryEmailData): Promise<InquiryEmailResult> {
  const emailSettings = await getEmailSettings();
  const sender = await resolveEmailSender(emailSettings);
  const to = getInquiryRecipient(emailSettings);
  const submittedAt = data.submittedAt ?? formatSubmittedAt();
  const templateVars = {
    customer_name: data.name,
    customer_email: data.email,
    customer_phone: data.phone,
    event_type: data.eventType,
    event_date: data.date,
    children_count: data.childrenCount,
    message: data.message ?? "",
    submitted_at: submittedAt,
  };

  const settings = await fetchSiteSettings();
  const companyName = emailSettings.companyName;
  const logoUrl = resolveBrandLogo(settings.branding, "email");
  const primaryColor = resolvePrimaryColor(settings.branding);
  const branded = { companyName, logoUrl, primaryColor };

  const { buildInquiryAdminEmail, buildInquiryAutoReplyFallback } = await import("@/lib/email/builders");

  const adminContent = await resolveEmailContent("inquiry-admin", templateVars, () => {
    const built = buildInquiryAdminEmail({ ...data, submittedAt }, branded);
    return {
      subject: applyEmailTemplate(emailSettings.inquiryAdminSubject, templateVars),
      ...built,
    };
  });

  const errors: string[] = [];
  let adminSent = false;
  let customerSent = false;
  let copySent = false;

  const adminResult = await sendEmailWithRetry({
    payload: {
      from: sender.from,
      to,
      replyTo: data.email,
      subject: adminContent.subject,
      text: adminContent.text,
      html: adminContent.html,
    },
    log: {
      recipient: to,
      subject: adminContent.subject,
      templateSlug: "inquiry-admin",
      area: "inquiry",
    },
  });
  adminSent = adminResult.success;
  if (!adminResult.success && adminResult.error) errors.push(`Admin-Benachrichtigung: ${adminResult.error}`);

  if (emailSettings.inquiryCopyTo?.trim()) {
    const copyTo = emailSettings.inquiryCopyTo.trim();
    const copyResult = await sendEmailWithRetry({
      payload: {
        from: sender.from,
        to: copyTo,
        replyTo: data.email,
        subject: `[Kopie] ${adminContent.subject}`,
        text: adminContent.text,
        html: adminContent.html,
      },
      log: {
        recipient: copyTo,
        subject: `[Kopie] ${adminContent.subject}`,
        templateSlug: "inquiry-admin",
        area: "inquiry",
      },
    });
    copySent = copyResult.success;
    if (!copyResult.success && copyResult.error) errors.push(`Kopie: ${copyResult.error}`);
  }

  const shouldAutoReply = emailSettings.inquiryAutoReplyEnabled !== false;
  if (shouldAutoReply && data.email) {
    const autoContent = await resolveEmailContent(
      "inquiry-auto-reply",
      {
        ...templateVars,
        name: data.name.trim().split(/\s+/)[0] || data.name,
      },
      () => {
        const fallback = buildInquiryAutoReplyFallback(data.name);
        return {
          subject: applyEmailTemplate(emailSettings.inquiryAutoReplySubject, templateVars),
          html: wrapEmailHtml({
            baseUrl: getSiteUrl(),
            logoUrl,
            companyName,
            primaryColor,
            bodyHtml: fallback.bodyHtml,
            footerHtml: `<p style="margin:8px 0 0;font-size:12px;color:#888;">${settings.contact.phone} · ${settings.contact.email}</p>`,
          }),
          text: fallback.bodyText,
        };
      },
    );

    const customerResult = await sendEmailWithRetry({
      payload: {
        from: sender.from,
        to: data.email,
        replyTo: sender.replyTo,
        subject: autoContent.subject,
        text: autoContent.text,
        html: autoContent.html,
      },
      log: {
        recipient: data.email,
        subject: autoContent.subject,
        templateSlug: "inquiry-auto-reply",
        area: "inquiry",
      },
    });
    customerSent = customerResult.success;
    if (!customerResult.success && customerResult.error) errors.push(`Kundenbestätigung: ${customerResult.error}`);
  }

  return { adminSent, customerSent, copySent, errors };
}

interface ReviewNotificationData {
  name: string;
  eventType: string;
  rating: number;
  text: string;
  submittedAt?: string;
}

export async function sendReviewNotification(data: ReviewNotificationData) {
  const emailSettings = await getEmailSettings();
  const settings = await fetchSiteSettings();
  const sender = await resolveEmailSender(emailSettings);
  const { getReviewRecipient } = await import("@/lib/email/sender");
  const to = getReviewRecipient(emailSettings);
  const submittedAt = data.submittedAt ?? formatSubmittedAt();
  const templateVars = {
    customer_name: data.name,
    event_type: data.eventType,
    rating: String(data.rating),
    message: data.text,
    submitted_at: submittedAt,
  };

  const { buildReviewAdminEmail } = await import("@/lib/email/builders");
  const content = await resolveEmailContent("review-admin", templateVars, () => {
    const built = buildReviewAdminEmail(
      { ...data, submittedAt },
      {
        companyName: emailSettings.companyName,
        logoUrl: resolveBrandLogo(settings.branding, "email"),
        primaryColor: resolvePrimaryColor(settings.branding),
      },
    );
    return {
      subject: applyEmailTemplate(emailSettings.reviewAdminSubject, templateVars),
      ...built,
    };
  });

  const result = await sendEmailWithRetry({
    payload: {
      from: sender.from,
      to,
      replyTo: sender.replyTo,
      subject: content.subject,
      text: content.text,
      html: content.html,
    },
    log: {
      recipient: to,
      subject: content.subject,
      templateSlug: "review-admin",
      area: "review",
    },
  });

  if (!result.success) {
    throw new Error(result.error ?? "Bewertungs-Benachrichtigung fehlgeschlagen");
  }

  return result;
}

export interface ReviewRequestEmailData {
  to: string;
  customerName: string;
  eventType?: string;
  reviewLink?: string;
}

export async function sendReviewRequestEmail(data: ReviewRequestEmailData) {
  const emailSettings = await getEmailSettings();
  const sender = await resolveEmailSender(emailSettings);
  const reviewLink = data.reviewLink ?? `${getSiteUrl()}/bewertung`;

  const content = await resolveEmailContent("review-request", {
    customer_name: data.customerName,
    customer_email: data.to,
    event_type: data.eventType ?? "",
    review_link: reviewLink,
  });

  const result = await sendEmailWithRetry({
    payload: {
      from: sender.from,
      to: data.to,
      replyTo: sender.replyTo,
      subject: content.subject,
      text: content.text,
      html: content.html,
    },
    log: {
      recipient: data.to,
      subject: content.subject,
      templateSlug: "review-request",
      area: "review",
    },
  });

  if (!result.success) {
    throw new Error(result.error ?? "Bewertungsanfrage konnte nicht gesendet werden");
  }

  return result;
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  adminName: string;
  resetUrl: string;
}) {
  const emailSettings = await getEmailSettings();
  const sender = await resolveFlowEmailSender("security", emailSettings);
  const settings = await fetchSiteSettings();
  const primaryColor = resolvePrimaryColor(settings.branding);

  const content = await resolveEmailContent("password-reset", {
    admin_name: opts.adminName,
    reset_link: opts.resetUrl,
  });

  let html = content.html;
  if (!html.includes(opts.resetUrl)) {
    html = html.replace(
      "</td></tr>",
      `${buildEmailButton(opts.resetUrl, "Passwort zurücksetzen", primaryColor)}</td></tr>`,
    );
  }

  const result = await sendEmailWithRetry({
    payload: {
      from: sender.from,
      to: opts.to,
      replyTo: sender.replyTo,
      subject: content.subject,
      text: content.text,
      html,
    },
    log: {
      recipient: opts.to,
      subject: content.subject,
      templateSlug: "password-reset",
      area: "password_reset",
    },
  });

  if (!result.success) {
    throw new Error(result.error ?? "Passwort-E-Mail konnte nicht gesendet werden");
  }

  return result;
}

interface CrmDocumentEmailOptions {
  to: string;
  customerName: string;
  documentNumber: string;
  documentType: "quote" | "invoice";
  totalFormatted: string;
  pdfBuffer: Uint8Array;
  copyToBusiness?: boolean;
  company?: BusinessProfile;
  sender?: ResolvedEmailSender;
  relatedQuoteId?: string;
  relatedInvoiceId?: string;
  relatedCustomerId?: string;
}

function buildCrmEmailHtml(opts: CrmDocumentEmailOptions, companyName: string): string {
  const label = opts.documentType === "quote" ? "Angebot" : "Rechnung";
  const company = opts.company;
  const brand = BRAND.themeColor;
  const baseUrl = company?.website || getSiteUrl();
  const logoUrl = company?.logoUrl || BRAND.master;

  const bodyHtml = `
          <p style="margin:0 0 12px;font-size:15px;">Guten Tag ${opts.customerName},</p>
          <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.05em;">${label} ${opts.documentNumber}</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#555;">
            anbei erhalten Sie ${opts.documentType === "quote" ? "unser Angebot" : "Ihre Rechnung"} als PDF.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8f7f4;border-radius:12px;margin-bottom:20px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.05em;">Gesamtbetrag</p>
              <p style="margin:6px 0 0;font-size:24px;font-weight:700;color:${brand};">${opts.totalFormatted}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">PDF-Anhang: <strong>${opts.documentNumber}.pdf</strong></p>
          <p style="margin:0;font-size:14px;line-height:1.6;">Bei Fragen melden Sie sich gerne.</p>`;

  const footerHtml = [
    company?.website ? `<p style="margin:8px 0 0;font-size:12px;color:#888;"><a href="${company.website}" style="color:${brand};">${company.website}</a></p>` : "",
    company?.phone || company?.email
      ? `<p style="margin:4px 0 0;font-size:12px;color:#888;">${[company.phone, company.email].filter(Boolean).join(" · ")}</p>`
      : "",
  ].join("");

  return wrapEmailHtml({ baseUrl, logoUrl, companyName, bodyHtml, footerHtml });
}

export async function sendCrmDocumentEmail(opts: CrmDocumentEmailOptions) {
  const emailSettings = await getEmailSettings();
  const flow = opts.documentType === "quote" ? "quote" : "invoice";
  const sender = opts.sender ?? (await resolveFlowEmailSender(flow, emailSettings));
  const label = opts.documentType === "quote" ? "Angebot" : "Rechnung";
  const filename = `${opts.documentNumber}.pdf`;
  const companyName = opts.company?.companyName ?? emailSettings.companyName;
  const templateSlug = flow === "quote" ? "quote-send" : "invoice-send";

  const templateVars = {
    customer_name: opts.customerName,
    quote_number: opts.documentNumber,
    invoice_number: opts.documentNumber,
    total_amount: opts.totalFormatted,
    total: opts.totalFormatted,
    due_date: "",
  };

  const content = await resolveEmailContent(templateSlug, templateVars, () => ({
    subject: `${label} ${opts.documentNumber} — ${companyName}`,
    html: buildCrmEmailHtml(opts, companyName),
    text: `Guten Tag ${opts.customerName},\n\nanbei ${label} ${opts.documentNumber}.\nGesamtbetrag: ${opts.totalFormatted}`,
  }));

  const attachment = {
    filename,
    content: Buffer.from(opts.pdfBuffer),
  };

  const mainResult = await sendEmailWithRetry({
    payload: {
      from: sender.from,
      to: opts.to,
      replyTo: sender.replyTo || emailSettings.replyTo,
      subject: content.subject,
      text: content.text,
      html: content.html,
      attachments: [attachment],
    },
    log: {
      recipient: opts.to,
      subject: content.subject,
      templateSlug,
      area: opts.documentType,
      relatedQuoteId: opts.relatedQuoteId,
      relatedInvoiceId: opts.relatedInvoiceId,
      relatedCustomerId: opts.relatedCustomerId,
    },
  });

  if (!mainResult.success) {
    throw new Error(mainResult.error ?? "CRM-E-Mail fehlgeschlagen");
  }

  const shouldCopy =
    opts.copyToBusiness ?? emailSettings.crmCopyToCompanyEnabled !== false;

  if (shouldCopy) {
    const copyTo = getCopyEmailForDocument(emailSettings, opts.documentType);
    await sendEmailWithRetry({
      payload: {
        from: sender.from,
        to: copyTo,
        replyTo: sender.replyTo,
        subject: `[Kopie] ${label} ${opts.documentNumber} an ${opts.customerName}`,
        text: `Kopie des versendeten Dokuments ${opts.documentNumber} an ${opts.to}.\n\n${content.text}`,
        html: content.html,
        attachments: [attachment],
      },
      log: {
        recipient: copyTo,
        subject: `[Kopie] ${label} ${opts.documentNumber}`,
        templateSlug,
        area: opts.documentType,
        relatedQuoteId: opts.relatedQuoteId,
        relatedInvoiceId: opts.relatedInvoiceId,
      },
    });
  }
}

export async function sendTransactionalEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateSlug?: string;
  area?: string;
}) {
  const sender = await resolveEmailSender();
  const result = await sendEmailWithRetry({
    payload: {
      from: sender.from,
      to: opts.to,
      replyTo: sender.replyTo,
      subject: opts.subject,
      html: opts.html,
      text: opts.text ?? opts.html.replace(/<[^>]+>/g, ""),
    },
    log: {
      recipient: opts.to,
      subject: opts.subject,
      templateSlug: opts.templateSlug ?? "transactional",
      area: opts.area ?? "general",
    },
  });

  if (!result.success) {
    throw new Error(result.error ?? "E-Mail konnte nicht gesendet werden");
  }

  return result;
}

export async function sendTestEmail(to: string) {
  const emailSettings = await getEmailSettings();
  const sender = await resolveEmailSender(emailSettings);
  const companyName = emailSettings.companyName;

  const text = `Dies ist eine Test-E-Mail von ${companyName}.

Absender: ${sender.displayFrom}
Reply-To: ${sender.replyTo}
Domain-Status: ${sender.domainStatus}
${sender.domainStatus === "verified" ? "Die Produktionsdomain ist verifiziert." : "Hinweis: Domain in Resend verifizieren, damit der Versand zuverlässig funktioniert."}

Wenn Sie diese E-Mail erhalten haben, ist die Resend-Konfiguration korrekt.`;

  const html = wrapEmailHtml({
    baseUrl: getSiteUrl(),
    logoUrl: BRAND.master,
    companyName,
    primaryColor: BRAND.themeColor,
    bodyHtml: `<p>Dies ist eine Test-E-Mail aus den CMS-Einstellungen.</p>
    <table style="background:#f8f7f4;border-radius:12px;padding:16px;margin:16px 0;width:100%;max-width:480px;">
      <tr><td><strong>Absender:</strong> ${sender.displayFrom}</td></tr>
      <tr><td><strong>Reply-To:</strong> ${sender.replyTo}</td></tr>
      <tr><td><strong>Domain-Status:</strong> ${sender.domainStatus}</td></tr>
    </table>
    ${sender.domainStatus === "verified" ? '<p style="color:#3d6649;background:#eef5f0;padding:12px;border-radius:8px;">Produktionsdomain verifiziert — Versand über info@pb-kinderevents.de.</p>' : '<p style="color:#8a6d12;background:#fff8e6;padding:12px;border-radius:8px;">Domain noch nicht verifiziert — bitte pb-kinderevents.de in Resend prüfen.</p>'}
    <p style="color:#888;font-size:13px;">Wenn Sie diese E-Mail erhalten haben, ist die Resend-Konfiguration korrekt.</p>`,
  });

  const result = await sendEmailWithRetry({
    payload: {
      from: sender.from,
      to,
      replyTo: sender.replyTo,
      subject: `Test-E-Mail — ${companyName}`,
      text,
      html,
    },
    log: {
      recipient: to,
      subject: `Test-E-Mail — ${companyName}`,
      templateSlug: "test",
      area: "general",
    },
  });

  if (!result.success) {
    throw new Error(`E-Mail konnte nicht gesendet werden. Grund: ${result.error ?? "Unbekannter Fehler"}`);
  }

  return { sender, companyName };
}
