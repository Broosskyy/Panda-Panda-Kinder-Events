import { fetchSiteSettings } from "@/lib/cms/data";
import { getSiteUrl } from "@/lib/site-url";
import type { SiteEmailSignatureSettings } from "@/lib/cms/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkOrText(url: string, label: string, color: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  const href = trimmed.startsWith("http") ? trimmed : `${getSiteUrl()}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
  return `<a href="${escapeHtml(href)}" style="color:${color};text-decoration:none;">${escapeHtml(label)}</a>`;
}

export async function getEmailSignatureSettings(): Promise<SiteEmailSignatureSettings> {
  const settings = await fetchSiteSettings();
  return settings.email.signature;
}

export function buildSignatureHtml(sig: SiteEmailSignatureSettings, accentColor: string): string {
  const lines: string[] = [];
  if (sig.contactPerson?.trim()) {
    lines.push(`<p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#2c2c2c;">${escapeHtml(sig.contactPerson)}</p>`);
  }
  if (sig.companyName?.trim()) {
    lines.push(`<p style="margin:0 0 8px;font-size:13px;color:#555;">${escapeHtml(sig.companyName)}</p>`);
  }
  const contactBits = [sig.phone, sig.mobile].filter((v) => v?.trim()).map((v) => escapeHtml(v!.trim()));
  if (contactBits.length) {
    lines.push(`<p style="margin:0 0 4px;font-size:12px;color:#666;">${contactBits.join(" · ")}</p>`);
  }
  if (sig.address?.trim()) {
    lines.push(`<p style="margin:0 0 8px;font-size:12px;color:#666;">${escapeHtml(sig.address.trim())}</p>`);
  }

  const social: string[] = [];
  if (sig.website?.trim()) social.push(linkOrText(sig.website, "Website", accentColor));
  if (sig.instagram?.trim()) social.push(linkOrText(sig.instagram, "Instagram", accentColor));
  if (sig.facebook?.trim()) social.push(linkOrText(sig.facebook, "Facebook", accentColor));
  if (sig.tiktok?.trim()) social.push(linkOrText(sig.tiktok, "TikTok", accentColor));
  if (sig.whatsapp?.trim()) social.push(`<span style="font-size:12px;color:#666;">WhatsApp: ${escapeHtml(sig.whatsapp)}</span>`);

  if (sig.showSocialIcons && social.length) {
    lines.push(`<p style="margin:8px 0 0;font-size:12px;line-height:1.8;">${social.join("<br/>")}</p>`);
  }

  const legal: string[] = [];
  if (sig.impressumUrl?.trim()) legal.push(linkOrText(sig.impressumUrl, "Impressum", accentColor));
  if (sig.privacyUrl?.trim()) legal.push(linkOrText(sig.privacyUrl, "Datenschutz", accentColor));
  if (legal.length) {
    lines.push(`<p style="margin:10px 0 0;font-size:11px;color:#888;">${legal.join(" · ")}</p>`);
  }
  if (sig.footerText?.trim()) {
    lines.push(`<p style="margin:8px 0 0;font-size:11px;color:#888;">${escapeHtml(sig.footerText.trim())}</p>`);
  }
  if (sig.freeText?.trim()) {
    lines.push(`<p style="margin:8px 0 0;font-size:12px;color:#666;">${escapeHtml(sig.freeText.trim()).replace(/\n/g, "<br/>")}</p>`);
  }

  return lines.join("");
}

export function buildSignatureText(sig: SiteEmailSignatureSettings): string {
  return [
    sig.contactPerson,
    sig.companyName,
    [sig.phone, sig.mobile].filter(Boolean).join(" · "),
    sig.address,
    sig.website,
    sig.footerText,
    sig.freeText,
  ]
    .filter((line) => line?.trim())
    .join("\n");
}

export async function buildEmailSignatureFooter(accentColor: string): Promise<string> {
  const sig = await getEmailSignatureSettings();
  return buildSignatureHtml(sig, accentColor);
}
