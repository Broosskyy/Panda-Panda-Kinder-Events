import type { ResolvedEmailBranding } from "@/lib/email/branding";
import { EMAIL_BRAND } from "@/lib/email/brand-tokens";
import {
  buildEmailHeaderImageRow,
  buildEmailLogoHeaderHtml,
  getEmailAssetBaseUrl,
} from "@/lib/email/resolve-image-url";

export interface EmailLayoutOptions {
  baseUrl?: string;
  logoUrl: string;
  companyName: string;
  bodyHtml: string;
  footerHtml?: string;
  signatureHtml?: string;
  primaryColor?: string;
  branding?: Partial<ResolvedEmailBranding>;
  headerImageUrl?: string;
}

/** Responsive HTML-E-Mail mit Logo, Branding und Signatur — hell & website-aligned */
export function wrapEmailHtml(opts: EmailLayoutOptions): string {
  const brand = opts.branding;
  const baseUrl = opts.baseUrl ?? getEmailAssetBaseUrl();
  const pageBg = brand?.backgroundColor || EMAIL_BRAND.pageBackground;
  const cardBg = brand?.cardBackground || EMAIL_BRAND.cardBackground;
  const primary = opts.primaryColor || brand?.primaryColor || EMAIL_BRAND.primary;
  const accent = brand?.accentColor || brand?.footerColor || EMAIL_BRAND.accent;
  const textColor = brand?.textColor || EMAIL_BRAND.text;
  const textMuted = brand?.textMutedColor || EMAIL_BRAND.textMuted;
  const border = EMAIL_BRAND.border;
  const fontFamily = brand?.fontFamily || "Helvetica, Arial, sans-serif";
  const headerImage = buildEmailHeaderImageRow(opts.headerImageUrl, baseUrl);
  const logoHeader = buildEmailLogoHeaderHtml({
    logoUrl: opts.logoUrl,
    companyName: opts.companyName,
    baseUrl,
    accentColor: primary,
  });

  const signatureBlock = opts.signatureHtml
    ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid ${border};">${opts.signatureHtml}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <style>
    @media only screen and (max-width: 600px) {
      .email-card { width: 100% !important; }
      .email-inner { padding: 22px 18px !important; }
      .email-header { padding: 24px 18px 18px !important; }
      .email-footer { padding: 18px !important; }
    }
  </style>
</head>
<body class="email-body" style="margin:0;padding:0;background:${pageBg};font-family:${fontFamily};color:${textColor};">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${pageBg};padding:28px 14px;">
    <tr><td align="center">
      <table width="100%" class="email-card" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:${cardBg};border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(46,46,42,.08);border:1px solid ${border};">
        ${headerImage}
        <tr><td class="email-header" style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid ${border};background:linear-gradient(180deg, ${accent} 0%, ${cardBg} 100%);">
          ${logoHeader}
        </td></tr>
        <tr><td class="email-inner" style="padding:32px;color:${textColor};font-size:15px;line-height:1.7;">
          ${opts.bodyHtml}
        </td></tr>
        <tr><td class="email-footer" style="padding:24px 32px;border-top:1px solid ${border};background:${accent};">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${primary};">Mit freundlichen Grüßen</p>
          <p style="margin:0;font-size:13px;color:${textMuted};">${opts.companyName}</p>
          ${signatureBlock}
          ${opts.footerHtml ?? ""}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildEmailCtaButton(href: string, label: string, buttonColor: string, buttonText = EMAIL_BRAND.buttonText): string {
  const safeHref = href.replace(/"/g, "&quot;");
  const safeLabel = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0;">
    <tr><td align="center" style="border-radius:9999px;background:${buttonColor};">
      <a href="${safeHref}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:${buttonText};text-decoration:none;border-radius:9999px;">${safeLabel}</a>
    </td></tr>
  </table>`;
}

export function buildEmailInfoBox(items: string[], accentColor: string, borderColor: string): string {
  if (!items.length) return "";
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.text};">✓ ${item
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</td></tr>`,
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${accentColor};border:1px solid ${borderColor};border-radius:16px;margin:24px 0;">
    <tr><td style="padding:18px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows}</table>
    </td></tr>
  </table>`;
}
