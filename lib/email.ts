import { Resend } from "resend";

import type { BusinessProfile } from "@/lib/crm/company";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY ist nicht gesetzt.");
  return new Resend(apiKey);
}

export function getNotificationEmail(): string {
  return process.env.INQUIRY_NOTIFICATION_EMAIL ?? "manuel.bauch0705@gmail.com";
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
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
  const to = getNotificationEmail();

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
    from: getFromEmail(),
    to,
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
}

function buildCrmEmailHtml(opts: CrmDocumentEmailOptions): string {
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
          <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">${company?.companyName ?? "Panda-Bande Kinderevents"}</p>
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
          <p style="margin:0 0 8px;font-size:13px;color:#666;">📎 PDF-Anhang: <strong>${opts.documentNumber}.pdf</strong></p>
          <p style="margin:0;font-size:14px;line-height:1.6;">Bei Fragen melden Sie sich gerne.</p>
        </td></tr>
        <tr><td style="padding:20px 28px;border-top:1px solid #ece8df;background:#faf9f6;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${brand};">Mit freundlichen Grüßen</p>
          <p style="margin:0;font-size:13px;color:#555;">${company?.companyName ?? "Panda-Bande Kinderevents"}</p>
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
  const label = opts.documentType === "quote" ? "Angebot" : "Rechnung";
  const filename = `${opts.documentNumber}.pdf`;
  const companyName = opts.company?.companyName ?? "Panda-Bande Kinderevents";

  const text = `Guten Tag ${opts.customerName},

anbei erhalten Sie ${opts.documentType === "quote" ? "unser Angebot" : "Ihre Rechnung"} ${opts.documentNumber}.

Gesamtbetrag: ${opts.totalFormatted}

Bei Fragen melden Sie sich gerne.

Mit freundlichen Grüßen
${companyName}
${opts.company?.website ?? "https://panda-bande-events.de"}`;

  const attachment = {
    filename,
    content: Buffer.from(opts.pdfBuffer),
  };

  const from = opts.company?.senderEmail ? `${opts.company.senderName} <${getFromEmail()}>` : getFromEmail();

  await resend.emails.send({
    from,
    to: opts.to,
    subject: `${label} ${opts.documentNumber} — ${companyName}`,
    text,
    html: buildCrmEmailHtml(opts),
    attachments: [attachment],
  });

  if (opts.copyToBusiness) {
    await resend.emails.send({
      from,
      to: getNotificationEmail(),
      subject: `[Kopie] ${label} ${opts.documentNumber} an ${opts.customerName}`,
      text: `Kopie des versendeten Dokuments ${opts.documentNumber} an ${opts.to}.\n\n${text}`,
      html: buildCrmEmailHtml(opts),
      attachments: [attachment],
    });
  }
}
