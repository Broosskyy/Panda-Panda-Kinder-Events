import { Resend } from "resend";
import type { BusinessProfile } from "@/lib/crm/company";
import { BRAND } from "@/lib/brand";
import { wrapEmailHtml } from "@/lib/email/html";
import { getSiteUrl } from "@/lib/site-url";
import {
  getCopyEmailForDocument,
  getEmailSettings,
  getInquiryRecipient,
  resolveEmailSender,
  resolveFlowEmailSender,
  applyEmailTemplate,
  type ResolvedEmailSender,
} from "@/lib/email/sender";

export {
  RESEND_TEST_FROM,
  checkResendDomainStatus,
  getCopyEmailForDocument,
  getEmailSettings,
  getInquiryRecipient,
  getAdminNotificationRecipient,
  resolveEmailSender,
  resolveFlowEmailSender,
  applyEmailTemplate,
} from "@/lib/email/sender";
export { getResendSendingSetup } from "@/lib/email/resend-status";
export type { ResendSendingSetup, ResendStatusItem, ResendStatusLevel } from "@/lib/email/resend-status";
export type { EmailDomainCheck, EmailDomainStatus, ResolvedEmailSender } from "@/lib/email/sender";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY ist nicht gesetzt.");
  return new Resend(apiKey);
}

/** @deprecated Use resolveEmailSender() — kept for compatibility in tests */
export async function getFromEmail(): Promise<string> {
  const resolved = await resolveEmailSender();
  return resolved.from;
}

export async function getNotificationEmail(): Promise<string> {
  const settings = await getEmailSettings();
  return getInquiryRecipient(settings);
}

interface InquiryEmailData {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  date: string;
  time: string;
  duration?: string;
  location: string;
  childrenCount: string;
  message?: string;
}

export async function sendInquiryNotification(data: InquiryEmailData) {
  const resend = getResendClient();
  const emailSettings = await getEmailSettings();
  const sender = await resolveEmailSender(emailSettings);
  const to = getInquiryRecipient(emailSettings);
  const companyName = emailSettings.companyName;
  const subject = `Neue Anfrage — ${data.eventType} (${data.name})`;

  const lines = [
    `Name: ${data.name}`,
    `Telefon: ${data.phone}`,
    `E-Mail: ${data.email}`,
    `Veranstaltung: ${data.eventType}`,
    `Datum: ${data.date}`,
    `Uhrzeit: ${data.time}`,
    data.duration ? `Dauer: ${data.duration}` : null,
    `Ort: ${data.location}`,
    `Anzahl Kinder: ${data.childrenCount}`,
    data.message ? `Nachricht: ${data.message}` : null,
  ].filter(Boolean);

  await resend.emails.send({
    from: sender.from,
    to,
    replyTo: data.email,
    subject,
    text: `Neue Buchungsanfrage über die Website:\n\n${lines.join("\n")}`,
  });

  if (emailSettings.inquiryCopyTo?.trim()) {
    await resend.emails.send({
      from: sender.from,
      to: emailSettings.inquiryCopyTo.trim(),
      replyTo: data.email,
      subject: `[Kopie] ${subject}`,
      text: `Kopie der Anfrage:\n\n${lines.join("\n")}`,
    });
  }

  if (emailSettings.inquiryAutoReplyEnabled && data.email) {
    const vars = {
      name: data.name,
      company: companyName,
      customer_name: data.name,
      company_name: companyName,
    };
    const { renderEmailFromTemplate } = await import("@/lib/email/render");
    const rendered = await renderEmailFromTemplate("inquiry-auto-reply", vars);
    const autoText = rendered?.text
      ?? applyEmailTemplate(emailSettings.inquiryAutoReplyText, vars);
    const autoHtml = rendered?.html;
    const autoSubject = rendered?.subject
      ?? applyEmailTemplate(emailSettings.inquiryAutoReplySubject, vars);

    await resend.emails.send({
      from: sender.from,
      to: data.email,
      replyTo: sender.replyTo,
      subject: autoSubject,
      text: autoText,
      html: autoHtml,
    });

    const { logEmailSend } = await import("@/lib/email/log");
    await logEmailSend({
      recipient: data.email,
      subject: autoSubject,
      templateSlug: "inquiry-auto-reply",
      area: "inquiry",
      status: "sent",
    });
  }
}

interface ReviewNotificationData {
  name: string;
  eventType: string;
  rating: number;
  text: string;
}

export async function sendReviewNotification(data: ReviewNotificationData) {
  const resend = getResendClient();
  const emailSettings = await getEmailSettings();
  const sender = await resolveEmailSender(emailSettings);
  const { getAdminNotificationRecipient } = await import("@/lib/email/sender");
  const to = getAdminNotificationRecipient(emailSettings);
  const subject = `Neue Bewertung — ${data.eventType} (${data.name})`;

  const lines = [
    `Name: ${data.name}`,
    `Anlass: ${data.eventType}`,
    `Bewertung: ${data.rating} von 5 Sternen`,
    `Text: ${data.text}`,
    "",
    "Bitte im Admin unter Bewertungen prüfen und freigeben.",
  ];

  await resend.emails.send({
    from: sender.from,
    to,
    replyTo: sender.replyTo,
    subject,
    text: `Neue Bewertung über die Website:\n\n${lines.join("\n")}`,
  });

  const { logEmailSend } = await import("@/lib/email/log");
  await logEmailSend({
    recipient: to,
    subject,
    area: "review",
    status: "sent",
  });
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
  const resend = getResendClient();
  const emailSettings = await getEmailSettings();
  const flow = opts.documentType === "quote" ? "quote" : "invoice";
  const sender = opts.sender ?? (await resolveFlowEmailSender(flow, emailSettings));
  const label = opts.documentType === "quote" ? "Angebot" : "Rechnung";
  const filename = `${opts.documentNumber}.pdf`;
  const companyName = opts.company?.companyName ?? emailSettings.companyName;

  const subjectTemplate =
    flow === "quote" ? emailSettings.quoteSubjectTemplate : emailSettings.invoiceSubjectTemplate;
  const subject = subjectTemplate?.trim()
    ? applyEmailTemplate(subjectTemplate, {
        number: opts.documentNumber,
        company: companyName,
        customer: opts.customerName,
      })
    : `${label} ${opts.documentNumber} — ${companyName}`;

  const bodyTemplate = flow === "quote" ? emailSettings.quoteEmailBody : emailSettings.invoiceEmailBody;
  const defaultText = `Guten Tag ${opts.customerName},

anbei erhalten Sie ${opts.documentType === "quote" ? "unser Angebot" : "Ihre Rechnung"} ${opts.documentNumber}.

Gesamtbetrag: ${opts.totalFormatted}

Bei Fragen melden Sie sich gerne.

Mit freundlichen Grüßen
${companyName}
${opts.company?.website ?? ""}`.trim();

  const text = bodyTemplate?.trim()
    ? applyEmailTemplate(bodyTemplate, {
        number: opts.documentNumber,
        company: companyName,
        customer: opts.customerName,
        total: opts.totalFormatted,
      })
    : defaultText;

  const attachment = {
    filename,
    content: Buffer.from(opts.pdfBuffer),
  };

  await resend.emails.send({
    from: sender.from,
    to: opts.to,
    replyTo: sender.replyTo,
    subject,
    text,
    html: buildCrmEmailHtml(opts, companyName),
    attachments: [attachment],
  });

  const { logEmailSend } = await import("@/lib/email/log");
  await logEmailSend({
    recipient: opts.to,
    subject,
    templateSlug: opts.documentType === "quote" ? "quote-send" : "invoice-send",
    area: opts.documentType,
    status: "sent",
  });

  if (opts.copyToBusiness) {
    const copyTo = getCopyEmailForDocument(emailSettings, opts.documentType);
    await resend.emails.send({
      from: sender.from,
      to: copyTo,
      replyTo: sender.replyTo,
      subject: `[Kopie] ${label} ${opts.documentNumber} an ${opts.customerName}`,
      text: `Kopie des versendeten Dokuments ${opts.documentNumber} an ${opts.to}.\n\n${text}`,
      html: buildCrmEmailHtml(opts, companyName),
      attachments: [attachment],
    });
  }
}

export async function sendTransactionalEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const resend = getResendClient();
  const sender = await resolveEmailSender();
  await resend.emails.send({
    from: sender.from,
    to: opts.to,
    replyTo: sender.replyTo,
    subject: opts.subject,
    html: opts.html,
    text: opts.text ?? opts.html.replace(/<[^>]+>/g, ""),
  });
}

export async function sendTestEmail(to: string) {
  const resend = getResendClient();
  const emailSettings = await getEmailSettings();
  const sender = await resolveEmailSender(emailSettings);
  const companyName = emailSettings.companyName;

  const text = `Dies ist eine Test-E-Mail von ${companyName}.

Absender: ${sender.displayFrom}
Reply-To: ${sender.replyTo}
Domain-Status: ${sender.domainStatus}
${sender.usesTestDomain ? "Hinweis: Es wird die Resend-Testdomain verwendet." : "Ihre verifizierte Domain wird verwendet."}

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
    ${sender.usesTestDomain ? '<p style="color:#8a6d12;background:#fff8e6;padding:12px;border-radius:8px;">Momentan wird die Resend-Testdomain verwendet.</p>' : '<p style="color:#3d6649;background:#eef5f0;padding:12px;border-radius:8px;">Ihre verifizierte Domain wird verwendet.</p>'}
    <p style="color:#888;font-size:13px;">Wenn Sie diese E-Mail erhalten haben, ist die Resend-Konfiguration korrekt.</p>`,
  });

  await resend.emails.send({
    from: sender.from,
    to,
    replyTo: sender.replyTo,
    subject: `Test-E-Mail — ${companyName}`,
    text,
    html,
  });

  return { sender, companyName };
}
