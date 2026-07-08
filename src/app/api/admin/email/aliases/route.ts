import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { deleteEmailAlias, listEmailAliases, upsertEmailAlias } from "@/lib/email/aliases-db";

export async function GET() {
  const authError = await requireAdmin("email:write");
  if (authError) return authError;

  const aliases = await listEmailAliases();
  return NextResponse.json({ aliases });
}

export async function POST(request: Request) {
  const authError = await requireAdmin("email:write");
  if (authError) return authError;

  const body = await request.json();
  try {
    const alias = await upsertEmailAlias({
      id: body.id,
      aliasAddress: body.aliasAddress,
      forwardTo: body.forwardTo,
      description: body.description ?? "",
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    });
    return NextResponse.json({ alias, message: "Alias gespeichert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin("email:write");
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID fehlt." }, { status: 400 });

  await deleteEmailAlias(id);
  return NextResponse.json({ message: "Alias gelöscht." });
}
