import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { fetchSiteSettings, saveSiteSettings } from "@/lib/cms/data";
import { revalidatePublicCms } from "@/lib/cms/revalidate";
import {
  createTeamMember,
  deleteTeamMember,
  isTeamTableReady,
  listTeamMembers,
  updateTeamMember,
} from "@/lib/team/db";
import { syncTeamMembersToPublicCms } from "@/lib/team/sync-public";

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
  name: z.string().min(1, "Name ist erforderlich."),
  position: z.string().min(1, "Position ist erforderlich."),
  description: z.string().optional(),
  profileImageUrl: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Ungültige E-Mail.").optional().or(z.literal("")),
  socialLinks: socialLinksSchema,
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
  archived: z.boolean().optional(),
});

const sectionSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
});

export async function GET() {
  const authError = await requireAdmin("website:read");
  if (authError) return authError;

  try {
    const configured = await isTeamTableReady();
    const members = configured ? await listTeamMembers(true) : [];
    const settings = await fetchSiteSettings();
    return NextResponse.json({
      members,
      configured,
      section: {
        title: settings.publicTeam.title,
        subtitle: settings.publicTeam.subtitle,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message, members: [], configured: false }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin("website:write");
  if (authError) return authError;

  const body = await request.json();

  if (body.section) {
    const parsed = sectionSchema.safeParse(body.section);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Sektionsdaten." }, { status: 400 });
    }
    const settings = await fetchSiteSettings();
    await saveSiteSettings("publicTeam", {
      ...settings.publicTeam,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? "",
    });
    revalidatePublicCms();
    const ctx = await getAdminContext();
    await writeAuditLogFromRequest(ctx, request, { action: "content_updated", area: "website" });
    return NextResponse.json({ success: true, message: "Team-Überschrift gespeichert." });
  }

  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Ungültige Teamdaten.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const ctx = await getAdminContext();

  try {
    const member = await createTeamMember(parsed.data);
    await syncTeamMembersToPublicCms();
    await writeAuditLogFromRequest(ctx, request, {
      action: "create",
      area: "public_team",
      entityId: member.id,
      after: { name: member.name, position: member.position, active: member.active },
    });
    return NextResponse.json({ member, message: "Teammitglied gespeichert und auf der Website veröffentlicht." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
    await writeAuditLogFromRequest(ctx, request, { action: "create", area: "public_team", success: false, errorMessage: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin("website:write");
  if (authError) return authError;

  const body = await request.json();
  const { id, ...rest } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const parsed = teamMemberSchema.partial().safeParse(rest);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Ungültige Daten.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const ctx = await getAdminContext();

  try {
    const member = await updateTeamMember(id, parsed.data);
    await syncTeamMembersToPublicCms();
    const action = parsed.data.archived ? "archive" : parsed.data.active === false ? "deactivate" : "update";
    await writeAuditLogFromRequest(ctx, request, {
      action,
      area: "public_team",
      entityId: id,
      after: { name: member.name, position: member.position, active: member.active },
    });
    return NextResponse.json({ member, message: "Teammitglied aktualisiert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin("website:write");
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const ctx = await getAdminContext();

  try {
    await deleteTeamMember(id);
    await syncTeamMembersToPublicCms();
    await writeAuditLogFromRequest(ctx, request, { action: "delete", area: "public_team", entityId: id });
    return NextResponse.json({ success: true, message: "Teammitglied entfernt." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Löschen fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
