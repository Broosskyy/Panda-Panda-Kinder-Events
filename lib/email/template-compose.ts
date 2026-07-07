import type { EmailTemplateLayout } from "@/lib/cms/types";
import { applyTemplateVariables } from "@/lib/email/variables";
import { buildEmailCtaButton, buildEmailInfoBox } from "@/lib/email/html";
import type { EmailDesignTokens } from "@/lib/email/design-system";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphHtml(text: string, tokens: EmailDesignTokens): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${tokens.text};">${escapeHtml(trimmed).replace(/\n/g, "<br/>")}</p>`;
}

/** Compose template body HTML from structured CMS layout + variables */
export function composeTemplateBodyHtml(
  layout: EmailTemplateLayout | null | undefined,
  vars: Record<string, string>,
  tokens: EmailDesignTokens,
): string {
  if (!layout) return "";

  const headline = applyTemplateVariables(layout.headline ?? "", vars).trim();
  const intro = applyTemplateVariables(layout.intro ?? "", vars).trim();
  const body = applyTemplateVariables(layout.body ?? "", vars).trim();

  const parts: string[] = [];

  if (headline) {
    parts.push(
      `<h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:${tokens.text};">${escapeHtml(headline)}</h1>`,
    );
  }
  if (intro) parts.push(paragraphHtml(intro, tokens));
  if (body) parts.push(paragraphHtml(body, tokens));

  if (layout.infoBoxEnabled !== false && layout.infoBoxItems?.length) {
    const items = layout.infoBoxItems
      .map((item) => applyTemplateVariables(item, vars).trim())
      .filter(Boolean);
    if (items.length) parts.push(buildEmailInfoBox(items, tokens.accent, tokens.border, tokens.text));
  }

  const ctaText = applyTemplateVariables(layout.ctaText ?? "", vars).trim();
  const ctaUrl = applyTemplateVariables(layout.ctaUrl ?? "", vars).trim();
  if (ctaText && ctaUrl) {
    parts.push(buildEmailCtaButton(ctaUrl, ctaText, tokens.button, tokens.buttonText || "#FFFFFF"));
  }

  return parts.join("\n");
}
