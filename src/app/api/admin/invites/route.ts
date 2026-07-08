import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { getRoleById } from "@/lib/auth/users";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { canInviteUsers, canInviteRole } from "@/lib/auth/invite-permissions";
import {
  listInvitations,
  createInvitation,
  revokeInvitation,
  resendInvitation,
  hasPendingInviteForEmail,
} from "@/lib/auth/invitations";
import { findUserByEmail } from "@/lib/auth/users";
import { sendAdminInviteEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getRateLimitPolicy } from "@/lib/auth/security-settings";

const createSchema = z.object({
  displayName: z.string().min(1, "Name erforderlich."),
  email: z.string().email("Gültige E-Mail erforderlich."),
  roleId: z.string().uuid("Rolle erforderlich."),
  message: z.string().max(2000).optional(),
});

export async function GET() {
  const authError = await requireAdmin("users:read");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx || !canInviteUsers(ctx.roleSlug)) {
    return NextResponse.json({ error: "Keine Berechtigung zum Einladen." }, { status: 403 });
  }

  try {
    const invitations = await listInvitations();
    return NextResponse.json({
      invitations,
      meta: {
        canInvite: true,
        inviterRole: ctx.roleSlug,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin("users:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx || !canInviteUsers(ctx.roleSlug)) {
    return NextResponse.json({ error: "Keine Berechtigung zum Einladen." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const ratePolicy = await getRateLimitPolicy().catch(() => ({ loginPerIp: 10, windowMinutes: 15 }));
  const limited = rateLimit(`admin-invite:${ip}`, Math.max(5, ratePolicy.loginPerIp), ratePolicy.windowMinutes * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Einladungen. Bitte später erneut versuchen." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Ungültige Einladungsdaten.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const role = await getRoleById(parsed.data.roleId);
  if (!role) {
    return NextResponse.json({ error: "Rolle nicht gefunden." }, { status: 400 });
  }

  if (!canInviteRole(ctx.roleSlug, role.slug)) {
    return NextResponse.json({ error: "Sie dürfen diese Rolle nicht vergeben." }, { status: 403 });
  }

  const existingUser = await findUserByEmail(parsed.data.email);
  if (existingUser) {
    return NextResponse.json({ error: "Ein Benutzer mit dieser E-Mail existiert bereits." }, { status: 400 });
  }

  const pendingInvite = await hasPendingInviteForEmail(parsed.data.email);
  if (pendingInvite) {
    return NextResponse.json({ error: "Für diese E-Mail liegt bereits eine offene Einladung vor." }, { status: 400 });
  }

  try {
    const { invitation, token } = await createInvitation({
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      roleId: parsed.data.roleId,
      invitedBy: ctx.userId,
      message: parsed.data.message,
    });

    const inviteUrl = `${getSiteUrl()}/admin/einladung/${token}`;

    await sendAdminInviteEmail({
      to: invitation.email,
      adminName: invitation.display_name,
      roleLabel: invitation.role_label,
      inviteUrl,
      message: parsed.data.message,
    });

    await writeAuditLogFromRequest(ctx, request, {
      action: "invite_created",
      area: "admin_invites",
      entityId: invitation.id,
      after: { email: invitation.email, role: invitation.role_slug },
    });
    await writeAuditLogFromRequest(ctx, request, {
      action: "invite_sent",
      area: "admin_invites",
      entityId: invitation.id,
      after: { email: invitation.email },
    });

    return NextResponse.json({ invitation, message: "Einladung gesendet." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Einladung fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin("users:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx || !canInviteUsers(ctx.roleSlug)) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });
  }

  const body = await request.json();
  const { id, action } = body as { id?: string; action?: string };
  if (!id || !action) {
    return NextResponse.json({ error: "ID und Aktion erforderlich." }, { status: 400 });
  }

  try {
    if (action === "revoke") {
      const invitation = await revokeInvitation(id);
      await writeAuditLogFromRequest(ctx, request, {
        action: "invite_revoked",
        area: "admin_invites",
        entityId: id,
        after: { email: invitation.email },
      });
      return NextResponse.json({ invitation, message: "Einladung widerrufen." });
    }

    if (action === "resend") {
      const { invitation, token } = await resendInvitation(id);
      const inviteUrl = `${getSiteUrl()}/admin/einladung/${token}`;
      await sendAdminInviteEmail({
        to: invitation.email,
        adminName: invitation.display_name,
        roleLabel: invitation.role_label,
        inviteUrl,
        message: invitation.message ?? undefined,
      });
      await writeAuditLogFromRequest(ctx, request, {
        action: "invite_resent",
        area: "admin_invites",
        entityId: id,
        after: { email: invitation.email },
      });
      return NextResponse.json({ invitation, message: "Einladung erneut gesendet." });
    }

    return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Aktion fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
