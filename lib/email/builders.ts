import { EMAIL_BRAND } from "@/lib/email/brand-tokens";
import { buildEmailCtaButton, buildEmailInfoBox, wrapEmailHtml } from "@/lib/email/html";
import { getDefaultEmailLogoUrl, getEmailAssetBaseUrl } from "@/lib/email/resolve-image-url";
import { getSiteUrl } from "@/lib/site-url";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildEmailButton(href: string, label: string, primaryColor: string = EMAIL_BRAND.primary): string {
  return buildEmailCtaButton(href, label, primaryColor);
}

export function buildInfoTable(rows: { label: string; value: string }[]): string {
  const items = rows
    .filter((row) => row.value.trim())
    .map(
      (row) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_BRAND.border};font-size:12px;font-weight:600;color:${EMAIL_BRAND.textMuted};text-transform:uppercase;letter-spacing:.04em;width:38%;vertical-align:top;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0 10px 12px;border-bottom:1px solid ${EMAIL_BRAND.border};font-size:15px;line-height:1.5;color:${EMAIL_BRAND.text};vertical-align:top;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join("");

  if (!items) return "";

  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${EMAIL_BRAND.accent};border:1px solid ${EMAIL_BRAND.border};border-radius:16px;margin:24px 0;">
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
  const primary = opts.primaryColor ?? EMAIL_BRAND.primary;
  return wrapEmailHtml({
    baseUrl: getEmailAssetBaseUrl(),
    logoUrl: opts.logoUrl || getDefaultEmailLogoUrl(),
    companyName: opts.companyName,
    primaryColor: primary,
    branding: {
      primaryColor: primary,
      buttonColor: primary,
      backgroundColor: EMAIL_BRAND.pageBackground,
      cardBackground: EMAIL_BRAND.cardBackground,
      accentColor: EMAIL_BRAND.accent,
      textColor: EMAIL_BRAND.text,
      textMutedColor: EMAIL_BRAND.textMuted,
      footerColor: EMAIL_BRAND.accent,
    },
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
  location?: string;
  message?: string;
  submittedAt: string;
}

export function buildInquiryAdminEmail(
  data: InquiryAdminEmailData,
  opts: { companyName: string; logoUrl: string; primaryColor?: string },
): { html: string; text: string } {
  const primary = opts.primaryColor ?? EMAIL_BRAND.primary;
  const adminUrl = `${getSiteUrl()}/admin/anfragen`;
  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${primary};text-transform:uppercase;letter-spacing:.05em;">Neue Anfrage</p>
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:${EMAIL_BRAND.text};">Neue Anfrage eingegangen</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${EMAIL_BRAND.textMuted};">Eine neue Anfrage ist über die Website eingegangen. Alle Details auf einen Blick:</p>
    ${buildInfoTable(
      [
        { label: "Name", value: data.name },
        { label: "Telefon", value: data.phone },
        { label: "E-Mail", value: data.email },
        { label: "Event-Art", value: data.eventType },
        { label: "Datum", value: data.date },
        { label: "Ort", value: data.location ?? "" },
        { label: "Kinder", value: data.childrenCount },
        { label: "Eingegangen", value: data.submittedAt },
        ...(data.message ? [{ label: "Nachricht", value: data.message }] : []),
      ],
    )}
    ${buildEmailButton(adminUrl, "Anfrage im Admin öffnen", primary)}
    <p style="margin:0;font-size:13px;color:${EMAIL_BRAND.textMuted};">Antworten direkt an <a href="mailto:${escapeHtml(data.email)}" style="color:${primary};">${escapeHtml(data.email)}</a></p>`;

  const text = [
    "Neue Anfrage eingegangen",
    "",
    `Name: ${data.name}`,
    `Telefon: ${data.phone}`,
    `E-Mail: ${data.email}`,
    `Event-Art: ${data.eventType}`,
    `Datum: ${data.date}`,
    data.location ? `Ort: ${data.location}` : null,
    `Kinder: ${data.childrenCount}`,
    `Eingegangen: ${data.submittedAt}`,
    data.message ? `Nachricht: ${data.message}` : null,
    "",
    `Admin: ${adminUrl}`,
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
  const primary = opts.primaryColor ?? EMAIL_BRAND.primary;
  const adminUrl = `${getSiteUrl()}/admin/bewertungen`;
  const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${primary};text-transform:uppercase;letter-spacing:.05em;">Neue Bewertung</p>
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:${EMAIL_BRAND.text};">Neue Bewertung wartet auf Prüfung</h1>
    ${buildInfoTable(
      [
        { label: "Name", value: data.name },
        { label: "Event-Art", value: data.eventType },
        { label: "Sterne", value: `${data.rating} / 5 (${stars})` },
        { label: "Datum", value: data.submittedAt },
      ],
    )}
    <blockquote style="margin:0 0 20px;padding:16px 18px;border-left:4px solid ${primary};background:${EMAIL_BRAND.accent};border-radius:0 16px 16px 0;font-size:15px;line-height:1.7;color:${EMAIL_BRAND.text};">&ldquo;${escapeHtml(data.text)}&rdquo;</blockquote>
    ${buildEmailButton(adminUrl, "Bewertung im Admin prüfen", primary)}`;

  const text = [
    "Neue Bewertung wartet auf Prüfung",
    "",
    `Name: ${data.name}`,
    `Event-Art: ${data.eventType}`,
    `Sterne: ${data.rating} / 5`,
    `Text: ${data.text}`,
    `Datum: ${data.submittedAt}`,
    "",
    `Admin: ${adminUrl}`,
  ].join("\n");

  return {
    html: buildBrandedEmail({ ...opts, bodyHtml }),
    text,
  };
}

export function buildInquiryAutoReplyFallback(
  customerName: string,
  websiteUrl?: string,
): { bodyHtml: string; bodyText: string } {
  const firstName = customerName.trim().split(/\s+/)[0] || customerName;
  const site = websiteUrl || getSiteUrl();
  const primary = EMAIL_BRAND.primary;
  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:${EMAIL_BRAND.text};">Hallo ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${EMAIL_BRAND.text};">vielen Dank für eure Anfrage.</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${EMAIL_BRAND.text};">Wir haben eure Nachricht erhalten und melden uns persönlich innerhalb von 24 Stunden zurück.</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${EMAIL_BRAND.text};">Bis dahin könnt ihr euch entspannt zurücklehnen — wir schauen uns euren Anlass in Ruhe an.</p>
    ${buildEmailInfoBox(
      ["Anfrage erhalten", "Persönliche Rückmeldung", "Kostenlos & unverbindlich"],
      EMAIL_BRAND.accent,
      EMAIL_BRAND.border,
    )}
    ${buildEmailCtaButton(site, "Zur Website", primary)}`;

  const bodyText = `Hallo ${firstName},

vielen Dank für eure Anfrage.

Wir haben eure Nachricht erhalten und melden uns persönlich innerhalb von 24 Stunden zurück.

Bis dahin könnt ihr euch entspannt zurücklehnen — wir schauen uns euren Anlass in Ruhe an.

Website: ${site}`;

  return { bodyHtml, bodyText };
}

export function buildCrmDocumentBodyHtml(opts: {
  customerName: string;
  documentNumber: string;
  documentType: "quote" | "invoice";
  totalFormatted: string;
  primaryColor?: string;
}): string {
  const primary = opts.primaryColor ?? EMAIL_BRAND.primary;
  const label = opts.documentType === "quote" ? "Angebot" : "Rechnung";
  return `
    <p style="margin:0 0 12px;font-size:16px;color:${EMAIL_BRAND.text};">Guten Tag ${escapeHtml(opts.customerName)},</p>
    <p style="margin:0 0 8px;font-size:12px;color:${EMAIL_BRAND.textMuted};text-transform:uppercase;letter-spacing:.05em;">${label} ${escapeHtml(opts.documentNumber)}</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${EMAIL_BRAND.textMuted};">
      anbei erhalten Sie ${opts.documentType === "quote" ? "unser Angebot" : "Ihre Rechnung"} als PDF.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${EMAIL_BRAND.accent};border:1px solid ${EMAIL_BRAND.border};border-radius:16px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0;font-size:12px;color:${EMAIL_BRAND.textMuted};text-transform:uppercase;letter-spacing:.05em;">Gesamtbetrag</p>
        <p style="margin:8px 0 0;font-size:26px;font-weight:700;color:${primary};">${escapeHtml(opts.totalFormatted)}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:${EMAIL_BRAND.textMuted};">PDF-Anhang: <strong>${escapeHtml(opts.documentNumber)}.pdf</strong></p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${EMAIL_BRAND.text};">Bei Fragen melden Sie sich gerne — wir helfen Ihnen persönlich weiter.</p>`;
}
