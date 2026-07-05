import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-route";
import { createTeamMember, deleteTeamMember, listTeamMembers, updateTeamMember } from "@/lib/team/db";

const teamMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "editor", "readonly"]),
  active: z.boolean().optional(),
});

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const members = await listTeamMembers();
    return NextResponse.json({ members });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Teamdaten." }, { status: 400 });
  }

  try {
    const member = await createTeamMember(parsed.data);
    return NextResponse.json({ member, message: "Teammitglied angelegt." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id, ...rest } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const parsed = teamMemberSchema.partial().safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  try {
    const member = await updateTeamMember(id, parsed.data);
    return NextResponse.json({ member, message: "Teammitglied aktualisiert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  try {
    await deleteTeamMember(id);
    return NextResponse.json({ success: true, message: "Teammitglied entfernt." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Löschen fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
