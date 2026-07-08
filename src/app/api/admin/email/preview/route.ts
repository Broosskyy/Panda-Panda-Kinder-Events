import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { renderGlobalEmail } from "@/lib/email/global-renderer";
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
    previewMode?: "desktop" | "tablet" | "mobile" | "dark" | "light";
    variables?: Record<string, string>;
  };

  try {
    const result = await renderGlobalEmail({
      slug,
      subject,
      bodyHtml,
      layout,
      previewMode,
      variables,
    });

    return NextResponse.json({ html: result.html, subject: result.subject });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Vorschau fehlgeschlagen." },
      { status: 500 },
    );
  }
}
