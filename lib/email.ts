import { Resend } from "resend";
import type { BusinessProfile } from "@/lib/crm/company";
import {
  getCopyEmailForDocument,
  getEmailSettings,
  getInquiryRecipient,
  resolveEmailSender,
  type ResolvedEmailSender,
} from "@/lib/email/sender";

export { RESEND_TEST_FROM, checkResendDomainStatus, getCopyEmailForDocument, getEmailSettings, getInquiryRecipient, resolveEmailSender } from "@/lib/email/sender";
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
    subject: `Neue Anfrage — ${data.eventType} (${data.name})`,
    text: `Neue Buchungsanfrage über die Website:\n\n${lines.join("\n")}`,
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
  const brand = "#52563e";

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:Helvetica,Arial,sans-serif;color:#2c2c2c;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr><td style="background:${brand};padding:24px 28px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">${companyName}</p>
          <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.85);">${label} ${opts.documentNumber}</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 12px;font-size:15px;">Guten Tag ${opts.customerName},</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#555;">
            anbei erhalten Sie ${opts.documentType === "quote" ? "unser Angebot" : "Ihre Rechnung"} als PDF.
          </p>
          <table width="100%" style="background:#f8f7f4;border-radius:12px;margin-bottom:20px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.05em;">Gesamtbetrag</p>
              <p style="margin:6px 0 0;font-size:24px;font-weight:700;color:${brand};">${opts.totalFormatted}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;color:#666;">PDF-Anhang: <strong>${opts.documentNumber}.pdf</strong></p>
          <p style="margin:0;font-size:14px;line-height:1.6;">Bei Fragen melden Sie sich gerne.</p>
        </td></tr>
        <tr><td style="padding:20px 28px;border-top:1px solid #ece8df;background:#faf9f6;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${brand};">Mit freundlichen Grüßen</p>
          <p style="margin:0;font-size:13px;color:#555;">${companyName}</p>
          ${company?.website ? `<p style="margin:8px 0 0;font-size:12px;color:#888;"><a href="${company.website}" style="color:${brand};">${company.website}</a></p>` : ""}
          ${company?.phone || company?.email ? `<p style="margin:4px 0 0;font-size:12px;color:#888;">${[company.phone, company.email].filter(Boolean).join(" · ")}</p>` : ""}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendCrmDocumentEmail(opts: CrmDocumentEmailOptions) {
  const resend = getResendClient();
  const emailSettings = await getEmailSettings();
  const sender = opts.sender ?? (await resolveEmailSender(emailSettings));
  const label = opts.documentType === "quote" ? "Angebot" : "Rechnung";
  const filename = `${opts.documentNumber}.pdf`;
  const companyName = opts.company?.companyName ?? emailSettings.companyName;

  const text = `Guten Tag ${opts.customerName},

anbei erhalten Sie ${opts.documentType === "quote" ? "unser Angebot" : "Ihre Rechnung"} ${opts.documentNumber}.

Gesamtbetrag: ${opts.totalFormatted}

Bei Fragen melden Sie sich gerne.

Mit freundlichen Grüßen
${companyName}
${opts.company?.website ?? ""}`.trim();

  const attachment = {
    filename,
    content: Buffer.from(opts.pdfBuffer),
  };

  await resend.emails.send({
    from: sender.from,
    to: opts.to,
    replyTo: sender.replyTo,
    subject: `${label} ${opts.documentNumber} — ${companyName}`,
    text,
    html: buildCrmEmailHtml(opts, companyName),
    attachments: [attachment],
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

  const html = `<!DOCTYPE html><html lang="de"><body style="font-family:Helvetica,Arial,sans-serif;padding:24px;color:#2c2c2c;">
    <h1 style="color:#52563e;font-size:20px;">Test-E-Mail — ${companyName}</h1>
    <p>Dies ist eine Test-E-Mail aus den CMS-Einstellungen.</p>
    <table style="background:#f8f7f4;border-radius:12px;padding:16px;margin:16px 0;width:100%;max-width:480px;">
      <tr><td><strong>Absender:</strong> ${sender.displayFrom}</td></tr>
      <tr><td><strong>Reply-To:</strong> ${sender.replyTo}</td></tr>
      <tr><td><strong>Domain-Status:</strong> ${sender.domainStatus}</td></tr>
    </table>
    ${sender.usesTestDomain ? '<p style="color:#8a6d12;background:#fff8e6;padding:12px;border-radius:8px;">Momentan wird die Resend-Testdomain verwendet.</p>' : '<p style="color:#3d6649;background:#eef5f0;padding:12px;border-radius:8px;">Ihre verifizierte Domain wird verwendet.</p>'}
    <p style="color:#888;font-size:13px;">Wenn Sie diese E-Mail erhalten haben, ist die Resend-Konfiguration korrekt.</p>
  </body></html>`;

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
