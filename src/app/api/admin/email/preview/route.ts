import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { applyTemplateVariables } from "@/lib/email/variables";
import { buildEmailVariableContext } from "@/lib/email/render";
import { resolveEmailBranding } from "@/lib/email/branding";
import { resolveActiveDesignTokens } from "@/lib/email/design-system";
import { composeTemplateBodyHtml } from "@/lib/email/template-compose";
import { wrapBrandedEmailHtml } from "@/lib/email/wrap-branded";
import type { EmailTemplateLayout } from "@/lib/cms/types";

export async function POST(request: Request) {
  const authError = await requireAdmin("email:write");
  if (authError) return authError;

  const body = await request.json();
  const {
    slug,
    subject,
    bodyHtml,
    layout,
    previewMode,
    variables,
  } = body as {
    slug?: string;
    subject?: string;
    bodyHtml?: string;
    layout?: EmailTemplateLayout | null;
    previewMode?: "desktop" | "tablet" | "mobile" | "dark";
    variables?: Record<string, string>;
  };

  try {
    const [vars, branding] = await Promise.all([
      buildEmailVariableContext(variables ?? {}),
      resolveEmailBranding(),
    ]);

    const effectiveBranding =
      previewMode === "dark" ? { ...branding, theme: "dark" as const } : branding;
    const tokens = resolveActiveDesignTokens(effectiveBranding);

    let innerHtml = "";
    if (bodyHtml?.trim()) {
      innerHtml = applyTemplateVariables(bodyHtml, vars);
    } else if (layout) {
      innerHtml = composeTemplateBodyHtml(layout, vars, tokens);
    } else if (slug) {
      const { getEmailTemplateBySlug } = await import("@/lib/email/templates-db");
      const template = await getEmailTemplateBySlug(slug);
      if (template) {
        const composed = template.layout ? composeTemplateBodyHtml(template.layout, vars, tokens) : "";
        innerHtml = template.body_html?.trim()
          ? applyTemplateVariables(template.body_html, vars)
          : composed;
      }
    }

    const html = await wrapBrandedEmailHtml(innerHtml || "<p>Vorschau</p>", vars.company_name, undefined, {
      previewMode,
      branding: effectiveBranding,
    });

    const resolvedSubject = subject
      ? applyTemplateVariables(subject, vars)
      : slug
        ? applyTemplateVariables((await import("@/lib/email/templates-db")).getDefaultTemplateBySlug(slug)?.subject ?? "", vars)
        : "";

    return NextResponse.json({ html, subject: resolvedSubject });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Vorschau fehlgeschlagen." },
      { status: 500 },
    );
  }
}
