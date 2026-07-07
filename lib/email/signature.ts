import { fetchSiteSettings } from "@/lib/cms/data";
import { getEmailAssetBaseUrl } from "@/lib/email/asset-url";
import { SYSTEM_EMAIL_DEFAULTS } from "@/lib/email/brand-tokens";
import { cleanEmailDisplayValue } from "@/lib/email/placeholder-filter";
import type { SiteEmailSignatureSettings } from "@/lib/cms/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkOrText(url: string, label: string, color: string, websiteBase: string): string {
  const trimmed = cleanEmailDisplayValue(url);
  if (!trimmed) return "";
  const href = trimmed.startsWith("http") ? trimmed : `${websiteBase}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
  return `<a href="${escapeHtml(href)}" style="color:${color};text-decoration:none;">${escapeHtml(label)}</a>`;
}

export async function getEmailSignatureSettings(): Promise<SiteEmailSignatureSettings> {
  const settings = await fetchSiteSettings();
  return settings.email.signature;
}

export function buildSignatureHtml(
  sig: SiteEmailSignatureSettings,
  accentColor: string,
  mutedColor: string = SYSTEM_EMAIL_DEFAULTS.textMuted,
  textColor: string = SYSTEM_EMAIL_DEFAULTS.text,
  websiteBase?: string,
): string {
  const base = websiteBase || getEmailAssetBaseUrl();
  const contactPerson = cleanEmailDisplayValue(sig.contactPerson);
  const companyName = cleanEmailDisplayValue(sig.companyName);
  const phone = cleanEmailDisplayValue(sig.phone);
  const mobile = cleanEmailDisplayValue(sig.mobile);
  const address = cleanEmailDisplayValue(sig.address);
  const openingHours = cleanEmailDisplayValue(sig.openingHours);
  const whatsapp = cleanEmailDisplayValue(sig.whatsapp);
  const footerText = cleanEmailDisplayValue(sig.footerText);
  const freeText = cleanEmailDisplayValue(sig.freeText);

  const lines: string[] = [];
  if (contactPerson) {
    lines.push(`<p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${textColor};">${escapeHtml(contactPerson)}</p>`);
  }
  if (companyName) {
    lines.push(`<p style="margin:0 0 8px;font-size:13px;color:${mutedColor};">${escapeHtml(companyName)}</p>`);
  }
  const contactBits = [phone, mobile].filter(Boolean).map((v) => escapeHtml(v));
  if (contactBits.length) {
    lines.push(`<p style="margin:0 0 4px;font-size:12px;color:${mutedColor};">${contactBits.join(" · ")}</p>`);
  }
  if (address) {
    lines.push(`<p style="margin:0 0 8px;font-size:12px;color:${mutedColor};">${escapeHtml(address)}</p>`);
  }
  if (openingHours) {
    lines.push(`<p style="margin:0 0 8px;font-size:12px;color:${mutedColor};">${escapeHtml(openingHours)}</p>`);
  }

  const social: string[] = [];
  if (cleanEmailDisplayValue(sig.website)) social.push(linkOrText(sig.website, "Website", accentColor, base));
  if (cleanEmailDisplayValue(sig.instagram)) social.push(linkOrText(sig.instagram, "Instagram", accentColor, base));
  if (cleanEmailDisplayValue(sig.facebook)) social.push(linkOrText(sig.facebook, "Facebook", accentColor, base));
  if (cleanEmailDisplayValue(sig.tiktok)) social.push(linkOrText(sig.tiktok, "TikTok", accentColor, base));
  if (cleanEmailDisplayValue(sig.youtube)) social.push(linkOrText(sig.youtube, "YouTube", accentColor, base));
  if (whatsapp) {
    const waDigits = whatsapp.replace(/\D/g, "");
    if (waDigits.length >= 10) {
      social.push(`<a href="https://wa.me/${escapeHtml(waDigits)}" style="color:${accentColor};text-decoration:none;">WhatsApp</a>`);
    }
  }

  if (sig.showSocialIcons && social.length) {
    lines.push(`<p style="margin:8px 0 0;font-size:12px;line-height:1.8;">${social.join("<br/>")}</p>`);
  }

  const legal: string[] = [];
  if (sig.impressumUrl?.trim()) legal.push(linkOrText(sig.impressumUrl, "Impressum", accentColor, base));
  if (sig.privacyUrl?.trim()) legal.push(linkOrText(sig.privacyUrl, "Datenschutz", accentColor, base));
  if (legal.length) {
    lines.push(`<p style="margin:10px 0 0;font-size:11px;color:${mutedColor};">${legal.join(" · ")}</p>`);
  }
  if (footerText) {
    lines.push(`<p style="margin:8px 0 0;font-size:11px;color:${mutedColor};">${escapeHtml(footerText)}</p>`);
  }
  if (freeText) {
    lines.push(`<p style="margin:8px 0 0;font-size:12px;color:${mutedColor};">${escapeHtml(freeText).replace(/\n/g, "<br/>")}</p>`);
  }

  return lines.join("");
}

export function buildSignatureText(sig: SiteEmailSignatureSettings): string {
  return [
    cleanEmailDisplayValue(sig.contactPerson),
    cleanEmailDisplayValue(sig.companyName),
    [cleanEmailDisplayValue(sig.phone), cleanEmailDisplayValue(sig.mobile)].filter(Boolean).join(" · "),
    cleanEmailDisplayValue(sig.address),
    cleanEmailDisplayValue(sig.openingHours),
    cleanEmailDisplayValue(sig.website),
    cleanEmailDisplayValue(sig.footerText),
    cleanEmailDisplayValue(sig.freeText),
  ]
    .filter((line) => line.trim())
    .join("\n");
}

export async function buildEmailSignatureFooter(accentColor: string): Promise<string> {
  const [sig, settings] = await Promise.all([getEmailSignatureSettings(), fetchSiteSettings()]);
  const branding = settings.email.branding;
  const websiteBase = branding.website?.trim().startsWith("http")
    ? branding.website.replace(/\/$/, "")
    : getEmailAssetBaseUrl();

  const html = buildSignatureHtml(
    sig,
    accentColor,
    branding.textMutedColor || SYSTEM_EMAIL_DEFAULTS.textMuted,
    branding.textColor || SYSTEM_EMAIL_DEFAULTS.text,
    websiteBase,
  );

  return html;
}
