import { BRAND } from "@/lib/brand";
import { toAbsoluteBrandUrl } from "@/lib/brand/resolve";
import type { ResolvedEmailBranding } from "@/lib/email/branding";

export interface EmailLayoutOptions {
  baseUrl: string;
  logoUrl: string;
  companyName: string;
  bodyHtml: string;
  footerHtml?: string;
  signatureHtml?: string;
  primaryColor?: string;
  branding?: Partial<ResolvedEmailBranding>;
  headerImageUrl?: string;
}

/** Responsive HTML-E-Mail mit Logo, Branding und Signatur */
export function wrapEmailHtml(opts: EmailLayoutOptions): string {
  const brand = opts.branding;
  const logoSrc = toAbsoluteBrandUrl(opts.logoUrl, opts.baseUrl);
  const primary = opts.primaryColor || brand?.primaryColor || BRAND.themeColor;
  const secondary = brand?.secondaryColor || "#f4a261";
  const buttonColor = brand?.buttonColor || primary;
  const textColor = brand?.textColor || "#2c2c2c";
  const footerBg = brand?.footerColor || "#faf9f6";
  const fontFamily = brand?.fontFamily || "Helvetica, Arial, sans-serif";
  const headerImage = opts.headerImageUrl?.trim()
    ? `<tr><td style="padding:0;"><img src="${toAbsoluteBrandUrl(opts.headerImageUrl, opts.baseUrl)}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;" /></td></tr>`
    : "";

  const signatureBlock = opts.signatureHtml
    ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #ece8df;">${opts.signatureHtml}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #1a1a18 !important; }
      .email-card { background-color: #2a2a26 !important; color: #f4f1ea !important; }
      .email-muted { color: #b8b5ad !important; }
    }
    @media only screen and (max-width: 600px) {
      .email-card { width: 100% !important; }
      .email-inner { padding: 20px 16px !important; }
    }
  </style>
</head>
<body class="email-body" style="margin:0;padding:0;background:#f4f1ea;font-family:${fontFamily};color:${textColor};">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f1ea;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" class="email-card" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        ${headerImage}
        <tr><td style="padding:28px 28px 20px;text-align:center;border-bottom:1px solid #ece8df;background:linear-gradient(180deg, ${secondary}14 0%, #ffffff 100%);">
          <img src="${logoSrc}" alt="${BRAND.alt}" width="200" height="50" style="display:block;margin:0 auto;max-width:200px;width:200px;height:auto;border:0;object-fit:contain;" />
        </td></tr>
        <tr><td class="email-inner" style="padding:28px;color:${textColor};">
          ${opts.bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 28px;border-top:1px solid #ece8df;background:${footerBg};">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${buttonColor};">Mit freundlichen Grüßen</p>
          <p style="margin:0;font-size:13px;color:#555;" class="email-muted">${opts.companyName}</p>
          ${signatureBlock}
          ${opts.footerHtml ?? ""}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
