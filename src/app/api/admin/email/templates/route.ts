import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { listEmailTemplates, upsertEmailTemplate } from "@/lib/email/templates-db";
import type { EmailTemplateArea } from "@/lib/cms/types";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;
  const templates = await listEmailTemplates();
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { slug, name, subject, body_html, body_text, area, is_active, is_default, variables } = body as {
    slug: string;
    name: string;
    subject?: string;
    body_html?: string;
    body_text?: string;
    area?: EmailTemplateArea;
    is_active?: boolean;
    is_default?: boolean;
    variables?: string[];
  };

  if (!slug?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "Slug und Name sind erforderlich." }, { status: 400 });
  }

  try {
    const template = await upsertEmailTemplate({
      slug: slug.trim(),
      name: name.trim(),
      subject: subject ?? "",
      body_html: body_html ?? "",
      body_text: body_text ?? null,
      area: area ?? "general",
      is_active: is_active ?? true,
      is_default: is_default ?? false,
      variables: variables ?? [],
    });
    return NextResponse.json({ template, message: "Vorlage gespeichert." });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Speichern fehlgeschlagen." },
      { status: 500 },
    );
  }
}
