import { BRAND } from "@/lib/brand";
import { wrapEmailHtml } from "@/lib/email/html";
import { getSiteUrl } from "@/lib/site-url";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildEmailButton(href: string, label: string, primaryColor: string = BRAND.themeColor): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
    <tr><td align="center" style="border-radius:9999px;background:${primaryColor};">
      <a href="${safeHref}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:9999px;">${safeLabel}</a>
    </td></tr>
  </table>`;
}

export function buildInfoTable(rows: { label: string; value: string }[]): string {
  const items = rows
    .filter((row) => row.value.trim())
    .map(
      (row) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #ece8df;font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.04em;width:38%;vertical-align:top;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0 10px 12px;border-bottom:1px solid #ece8df;font-size:15px;line-height:1.5;color:#2c2c2c;vertical-align:top;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#faf9f6;border:1px solid #ece8df;border-radius:14px;margin:20px 0;">
    <tr><td style="padding:18px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${items}</table>
    </td></tr>
  </table>`;
}

interface BrandedEmailOptions {
  companyName: string;
  logoUrl: string;
  primaryColor?: string;
  bodyHtml: string;
  footerHtml?: string;
}

export function buildBrandedEmail(opts: BrandedEmailOptions): string {
  return wrapEmailHtml({
    baseUrl: getSiteUrl(),
    logoUrl: opts.logoUrl,
    companyName: opts.companyName,
    primaryColor: opts.primaryColor ?? BRAND.themeColor,
    bodyHtml: opts.bodyHtml,
    footerHtml: opts.footerHtml,
  });
}

export interface InquiryAdminEmailData {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  date: string;
  childrenCount: string;
  message?: string;
  submittedAt: string;
}

export function buildInquiryAdminEmail(
  data: InquiryAdminEmailData,
  opts: { companyName: string; logoUrl: string; primaryColor?: string },
): { html: string; text: string } {
  const adminUrl = `${getSiteUrl()}/admin/anfragen`;
  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${opts.primaryColor ?? BRAND.themeColor};text-transform:uppercase;letter-spacing:.05em;">Neue Kontaktanfrage</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#2c2c2c;">${escapeHtml(data.name)} möchte euch kontaktieren</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#555;">Eine neue Anfrage ist über die Website eingegangen. Alle Details auf einen Blick:</p>
    ${buildInfoTable(
      [
        { label: "Name", value: data.name },
        { label: "Telefon", value: data.phone },
        { label: "E-Mail", value: data.email },
        { label: "Eventart", value: data.eventType },
        { label: "Datum", value: data.date },
        { label: "Kinder", value: data.childrenCount },
        { label: "Eingegangen", value: data.submittedAt },
        { label: "Quelle", value: "Website Kontaktformular" },
        ...(data.message ? [{ label: "Nachricht", value: data.message }] : []),
      ],
    )}
    ${buildEmailButton(adminUrl, "Anfrage im Dashboard öffnen", opts.primaryColor)}
    <p style="margin:0;font-size:13px;color:#888;">Antworten direkt an <a href="mailto:${escapeHtml(data.email)}" style="color:${opts.primaryColor ?? BRAND.themeColor};">${escapeHtml(data.email)}</a></p>`;

  const text = [
    "Neue Kontaktanfrage über die Website",
    "",
    `Name: ${data.name}`,
    `Telefon: ${data.phone}`,
    `E-Mail: ${data.email}`,
    `Eventart: ${data.eventType}`,
    `Datum: ${data.date}`,
    `Kinder: ${data.childrenCount}`,
    `Eingegangen: ${data.submittedAt}`,
    `Quelle: Website Kontaktformular`,
    data.message ? `Nachricht: ${data.message}` : null,
    "",
    `Dashboard: ${adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    html: buildBrandedEmail({ ...opts, bodyHtml }),
    text,
  };
}

export interface ReviewAdminEmailData {
  name: string;
  eventType: string;
  rating: number;
  text: string;
  submittedAt: string;
}

export function buildReviewAdminEmail(
  data: ReviewAdminEmailData,
  opts: { companyName: string; logoUrl: string; primaryColor?: string },
): { html: string; text: string } {
  const adminUrl = `${getSiteUrl()}/admin/bewertungen`;
  const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${opts.primaryColor ?? BRAND.themeColor};text-transform:uppercase;letter-spacing:.05em;">Neue Bewertung</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#2c2c2c;">${escapeHtml(data.name)} hat eine Bewertung hinterlassen</h1>
    ${buildInfoTable(
      [
        { label: "Name", value: data.name },
        { label: "Anlass", value: data.eventType },
        { label: "Bewertung", value: `${data.rating} / 5 (${stars})` },
        { label: "Eingegangen", value: data.submittedAt },
      ],
    )}
    <blockquote style="margin:0 0 20px;padding:16px 18px;border-left:4px solid ${opts.primaryColor ?? BRAND.themeColor};background:#faf9f6;border-radius:0 12px 12px 0;font-size:15px;line-height:1.6;color:#444;">&ldquo;${escapeHtml(data.text)}&rdquo;</blockquote>
    ${buildEmailButton(adminUrl, "Bewertung im Dashboard prüfen", opts.primaryColor)}`;

  const text = [
    "Neue Bewertung über die Website",
    "",
    `Name: ${data.name}`,
    `Anlass: ${data.eventType}`,
    `Bewertung: ${data.rating} / 5`,
    `Text: ${data.text}`,
    `Eingegangen: ${data.submittedAt}`,
    "",
    `Dashboard: ${adminUrl}`,
  ].join("\n");

  return {
    html: buildBrandedEmail({ ...opts, bodyHtml }),
    text,
  };
}

export function buildInquiryAutoReplyFallback(
  customerName: string,
): { bodyHtml: string; bodyText: string } {
  const firstName = customerName.trim().split(/\s+/)[0] || customerName;
  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hallo ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">vielen Dank für eure Anfrage.</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">Wir freuen uns sehr über euer Interesse an Panda-Bande.</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">Wir prüfen eure Anfrage persönlich und melden uns schnellstmöglich zurück.</p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:#444;">Bis bald ❤️<br/><strong>Euer Panda-Bande Team</strong></p>`;

  const bodyText = `Hallo ${firstName},

vielen Dank für eure Anfrage.

Wir freuen uns sehr über euer Interesse an Panda-Bande.

Wir prüfen eure Anfrage persönlich und melden uns schnellstmöglich zurück.

Bis bald ❤️
Euer Panda-Bande Team`;

  return { bodyHtml, bodyText };
}
