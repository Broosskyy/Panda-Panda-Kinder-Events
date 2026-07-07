import type { EmailTemplateLayout } from "@/lib/cms/types";
import type { EmailThemeMode } from "@/lib/cms/types";
import { resolveEmailBranding, type ResolvedEmailBranding } from "@/lib/email/branding";
import { resolveActiveDesignTokens } from "@/lib/email/design-system";
import { composeTemplateBodyHtml } from "@/lib/email/template-compose";
import { wrapBrandedEmailHtml } from "@/lib/email/wrap-branded";
import { applyTemplateVariables, sanitizeEmailVariables } from "@/lib/email/variables";
import { buildEmailVariableContext } from "@/lib/email/render";

export type EmailPreviewMode = "desktop" | "tablet" | "mobile" | "dark" | "light";

export interface GlobalEmailRenderInput {
  slug?: string;
  subject?: string;
  bodyHtml?: string;
  layout?: EmailTemplateLayout | null;
  variables?: Record<string, string | number | null | undefined>;
  previewMode?: EmailPreviewMode;
}

function resolveEffectiveTheme(
  branding: ResolvedEmailBranding,
  layout?: EmailTemplateLayout | null,
  previewMode?: EmailPreviewMode,
): EmailThemeMode {
  if (previewMode === "dark") return "dark";
  if (previewMode === "light") return "light";
  const override = layout?.themeOverride?.trim();
  if (override === "light" || override === "dark" || override === "auto") return override;
  return branding.theme ?? "light";
}

/** Single global renderer — all outbound and preview emails use this path */
export async function renderGlobalEmail(
  input: GlobalEmailRenderInput,
): Promise<{ subject: string; html: string; text: string }> {
  const rawVars = await buildEmailVariableContext(input.variables ?? {});
  const vars = sanitizeEmailVariables(rawVars);
  const branding = await resolveEmailBranding();
  const theme = resolveEffectiveTheme(branding, input.layout, input.previewMode);
  const effectiveBranding: ResolvedEmailBranding = { ...branding, theme };
  const tokens = resolveActiveDesignTokens(
    effectiveBranding,
    theme === "dark" ? "dark" : theme === "auto" ? "auto" : "light",
  );

  let layout = input.layout ?? null;
  let subjectTemplate = input.subject ?? "";
  let bodyTextTemplate = "";

  if (input.slug && !layout && !input.bodyHtml?.trim()) {
    const { getEmailTemplateBySlug } = await import("@/lib/email/templates-db");
    const template = await getEmailTemplateBySlug(input.slug);
    if (template) {
      layout = template.layout ?? null;
      subjectTemplate = subjectTemplate || template.subject;
      bodyTextTemplate = template.body_text ?? "";
      if (template.body_html?.trim() && !input.bodyHtml?.trim()) {
        const inner = applyTemplateVariables(template.body_html, vars);
        const html = await wrapBrandedEmailHtml(inner, vars.company_name, undefined, {
          previewMode: input.previewMode === "light" ? "desktop" : input.previewMode,
          branding: effectiveBranding,
          layout: layout ?? undefined,
        });
        return {
          subject: applyTemplateVariables(subjectTemplate, vars),
          html,
          text: applyTemplateVariables(bodyTextTemplate || template.body_html.replace(/<[^>]+>/g, ""), vars),
        };
      }
    }
  }

  let innerHtml = "";
  if (input.bodyHtml?.trim()) {
    innerHtml = applyTemplateVariables(input.bodyHtml, vars);
  } else if (layout) {
    innerHtml = composeTemplateBodyHtml(layout, vars, tokens);
  }

  const html = await wrapBrandedEmailHtml(innerHtml || "<p></p>", vars.company_name, undefined, {
    previewMode: input.previewMode === "light" ? "desktop" : input.previewMode,
    branding: effectiveBranding,
    layout: layout ?? undefined,
  });

  const textSource =
    bodyTextTemplate ||
    [layout?.headline, layout?.intro, layout?.body].filter(Boolean).join("\n\n") ||
    innerHtml.replace(/<[^>]+>/g, "");

  return {
    subject: applyTemplateVariables(subjectTemplate || "Nachricht von {{company_name}}", vars),
    html,
    text: applyTemplateVariables(textSource, vars),
  };
}
