import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { writeAuditLog } from "@/lib/auth/audit";
import {
  createTeamMember,
  deleteTeamMember,
  isTeamTableReady,
  listTeamMembers,
  updateTeamMember,
} from "@/lib/team/db";

const socialLinksSchema = z
  .object({
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().optional(),
  })
  .optional();

const teamMemberSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  displayName: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email(),
  title: z.string().optional(),
  position: z.string().optional(),
  description: z.string().optional(),
  profileImageUrl: z.string().optional(),
  phone: z.string().optional(),
  socialLinks: socialLinksSchema,
  sortOrder: z.number().int().optional(),
  role: z.enum(["admin", "editor", "readonly"]),
  active: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export async function GET() {
  const authError = await requireAdmin("team:write");
  if (authError) return authError;

  try {
    const configured = await isTeamTableReady();
    const members = configured ? await listTeamMembers(true) : [];
    return NextResponse.json({ members, configured });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message, members: [], configured: false }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin("team:write");
  if (authError) return authError;

  const body = await request.json();
  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Teamdaten." }, { status: 400 });
  }

  const ctx = await getAdminContext();

  try {
    const member = await createTeamMember(parsed.data);
    await writeAuditLog(ctx, {
      action: "create",
      area: "team",
      entityId: member.id,
      after: member,
    });
    return NextResponse.json({ member, message: "Teammitglied gespeichert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
    await writeAuditLog(ctx, {
      action: "create",
      area: "team",
      success: false,
      errorMessage: message,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin("team:write");
  if (authError) return authError;

  const body = await request.json();
  const { id, ...rest } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const parsed = teamMemberSchema.partial().safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  const ctx = await getAdminContext();

  try {
    const member = await updateTeamMember(id, parsed.data);
    await writeAuditLog(ctx, {
      action: parsed.data.archived ? "archive" : "update",
      area: "team",
      entityId: id,
      after: member,
    });
    return NextResponse.json({ member, message: "Teammitglied aktualisiert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin("team:write");
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const ctx = await getAdminContext();

  try {
    await deleteTeamMember(id);
    await writeAuditLog(ctx, { action: "delete", area: "team", entityId: id });
    return NextResponse.json({ success: true, message: "Teammitglied entfernt." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Löschen fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
