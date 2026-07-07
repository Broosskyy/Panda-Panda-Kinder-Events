import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { resetEmailTemplateToDefault } from "@/lib/email/templates-db";

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { slug } = await context.params;
  try {
    const template = await resetEmailTemplateToDefault(decodeURIComponent(slug));
    return NextResponse.json({
      success: true,
      message: `Vorlage „${template.name}" wurde auf den Standard zurückgesetzt.`,
      template,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Zurücksetzen fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
