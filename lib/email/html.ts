import type { EmailTemplateLayout } from "@/lib/cms/types";
import type { ResolvedEmailBranding } from "@/lib/email/branding";
import { resolveActiveDesignTokens, type EmailDesignTokens } from "@/lib/email/design-system";
import { SYSTEM_EMAIL_DEFAULTS } from "@/lib/email/brand-tokens";
import {
  buildEmailHeaderBlock,
  buildEmailHeaderImageRow,
  getEmailAssetBaseUrl,
} from "@/lib/email/resolve-image-url";

export interface EmailLayoutOptions {
  baseUrl?: string;
  logoUrl: string;
  companyName: string;
  bodyHtml: string;
  footerHtml?: string;
  signatureHtml?: string;
  branding?: Partial<ResolvedEmailBranding>;
  headerImageUrl?: string;
  previewMode?: "desktop" | "tablet" | "mobile" | "dark" | "light";
  layout?: EmailTemplateLayout;
  footerEnabled?: boolean;
}

function colorSchemeMeta(tokens: EmailDesignTokens): string {
  if (tokens.theme === "dark") {
    return `<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">`;
  }
  if (tokens.theme === "auto") {
    return `<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">`;
  }
  return `<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">`;
}

function themeStyles(tokens: EmailDesignTokens): string {
  const darkBlock =
    tokens.theme === "auto"
      ? `
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #1a1a18 !important; }
      .email-card { background-color: #2a2a26 !important; color: #f4f1ea !important; }
      .email-muted { color: #b8b5ad !important; }
      .email-headline { color: #f4f1ea !important; }
    }`
      : "";

  return `
    @media only screen and (max-width: 600px) {
      .email-card { width: 100% !important; }
      .email-inner { padding: 24px 20px !important; }
      .email-header { padding: 24px 20px 16px !important; }
      .email-footer { padding: 20px !important; }
    }${darkBlock}`;
}

function escapeCompanyName(name: string): string {
  return name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Global email shell — logo, brand, body, footer from CMS branding */
export function wrapEmailHtml(opts: EmailLayoutOptions): string {
  const brand = opts.branding ?? {};
  const forceDark = opts.previewMode === "dark";
  const tokens = resolveActiveDesignTokens(brand, forceDark ? "dark" : brand.theme);
  const baseUrl = opts.baseUrl ?? getEmailAssetBaseUrl();
  const layout = opts.layout;
  const footerOn = opts.footerEnabled ?? layout?.footerEnabled ?? true;

  const showLogo = layout?.showLogo ?? brand.showLogo ?? true;
  const showBrandName = layout?.showBrandName ?? brand.showBrandName ?? true;
  const showSlogan = layout?.showSlogan ?? brand.showSlogan ?? true;

  const headerImage = buildEmailHeaderImageRow(opts.headerImageUrl, baseUrl);
  const headerBlock = buildEmailHeaderBlock({
    logoUrl: opts.logoUrl,
    brandName: brand.brandDisplayName || opts.companyName,
    slogan: brand.slogan,
    showLogo,
    showBrandName,
    showSlogan,
    logoWidth: brand.logoWidth ?? SYSTEM_EMAIL_DEFAULTS.logoWidth,
    logoHeight: brand.logoHeight,
    logoPaddingTop: brand.logoPaddingTop,
    logoPaddingBottom: brand.logoPaddingBottom,
    textColor: tokens.text,
    textMutedColor: tokens.textMuted,
    primaryColor: tokens.primary,
    baseUrl,
  });

  const signatureBlock =
    footerOn && opts.signatureHtml
      ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid ${tokens.border};">${opts.signatureHtml}</div>`
      : "";

  const closingLine = brand.closingLine?.trim() || "Mit freundlichen Grüßen";
  const footerSection = footerOn
    ? `<tr><td class="email-footer" style="padding:24px 32px 28px;border-top:1px solid ${tokens.border};background:${tokens.cardBackground};">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${tokens.primary};">${escapeCompanyName(closingLine)}</p>
          <p class="email-muted" style="margin:0;font-size:13px;color:${tokens.textMuted};">${escapeCompanyName(opts.companyName)}</p>
          ${signatureBlock}
          ${opts.footerHtml ?? ""}
        </td></tr>`
    : "";

  const maxWidth =
    opts.previewMode === "mobile" ? "390px" : opts.previewMode === "tablet" ? "768px" : "600px";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  ${colorSchemeMeta(tokens)}
  <style>${themeStyles(tokens)}</style>
</head>
<body class="email-body" style="margin:0;padding:0;background:${tokens.pageBackground};font-family:${tokens.fontFamily};color:${tokens.text};-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${tokens.pageBackground};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" class="email-card" cellpadding="0" cellspacing="0" role="presentation" style="max-width:${maxWidth};background:${tokens.cardBackground};border-radius:${tokens.cardRadius};overflow:hidden;box-shadow:${tokens.cardShadow};border:1px solid ${tokens.border};">
        ${headerImage}
        ${headerBlock ? `<tr><td class="email-header" style="background:${tokens.cardBackground};">${headerBlock}</td></tr>` : ""}
        <tr><td class="email-inner" style="padding:0 32px 32px;color:${tokens.text};font-size:16px;line-height:1.65;">
          ${opts.bodyHtml}
        </td></tr>
        ${footerSection}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildEmailCtaButton(
  href: string,
  label: string,
  buttonColor: string,
  buttonText: string = SYSTEM_EMAIL_DEFAULTS.buttonText,
): string {
  const safeHref = href.replace(/"/g, "&quot;");
  const safeLabel = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px auto;">
    <tr><td align="center" style="border-radius:999px;background:${buttonColor};">
      <a href="${safeHref}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:${buttonText};text-decoration:none;border-radius:999px;font-family:Arial,Helvetica,sans-serif;">${safeLabel}</a>
    </td></tr>
  </table>`;
}

export function buildEmailInfoBox(
  items: string[],
  accentColor: string,
  borderColor: string,
  textColor: string,
): string {
  if (!items.length) return "";
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;font-size:14px;line-height:1.6;color:${textColor};">✓ ${item
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</td></tr>`,
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${accentColor};border:1px solid ${borderColor};border-radius:12px;margin:24px 0;">
    <tr><td style="padding:18px 22px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows}</table>
    </td></tr>
  </table>`;
}
