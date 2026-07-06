import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { deleteEmailTemplate } from "@/lib/email/templates-db";

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const { slug } = await context.params;
  await deleteEmailTemplate(decodeURIComponent(slug));
  return NextResponse.json({ message: "Vorlage gelöscht." });
}
