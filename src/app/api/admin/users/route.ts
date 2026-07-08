import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { adminHasPermission } from "@/lib/auth/context";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  listRoles,
  resolveUsersForSession,
  createUser,
  updateUser,
  getUserById,
  deleteUser,
} from "@/lib/auth/users";
import { filterActiveRoles } from "@/lib/admin/roles";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { getPasswordPolicy } from "@/lib/auth/security-settings";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { revokeAllSessions } from "@/lib/auth/session";
import { listTeamMembersForSelect } from "@/lib/team/db";
import { parseCriticalBody, verifyCriticalConfirmation } from "@/lib/auth/critical-action";

const createSchema = z.object({
  username: z.string().min(2, "Benutzername erforderlich."),
  email: z.string().email("Gültige E-Mail erforderlich."),
  password: z.string().min(8, "Passwort erforderlich."),
  displayName: z.string().min(1, "Anzeigename erforderlich."),
  roleId: z.string().uuid("Rolle erforderlich."),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  teamMemberId: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(2).optional(),
  email: z.string().email().optional(),
  displayName: z.string().min(1).optional(),
  roleId: z.string().uuid().optional(),
  active: z.boolean().optional(),
  phone: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  password: z.string().min(8).optional(),
  teamMemberId: z.string().uuid().nullable().optional(),
  resetPassword: z.boolean().optional(),
});

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase nicht konfiguriert." }, { status: 503 });
  }

  const canListAll = adminHasPermission(ctx, "users:read");
  const canManageUsers = adminHasPermission(ctx, "users:write");

  try {
    const [users, roles, teamMembers] = await Promise.all([
      resolveUsersForSession(ctx, canListAll),
      listRoles(),
      listTeamMembersForSelect().catch(() => []),
    ]);

    return NextResponse.json({
      users,
      roles: filterActiveRoles(roles),
      teamMembers,
      meta: {
        canListAll,
        canManageUsers,
        selfOnly: !canListAll && users.length > 0,
        currentUserId: ctx.userId,
        authenticated: true,
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

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Ungültige Benutzerdaten.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const ctx = await getAdminContext();
  const policy = await getPasswordPolicy();
  const validationError = validatePassword(parsed.data.password, policy);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const roles = await listRoles();
    const assignedRole = roles.find((r) => r.id === parsed.data.roleId);
    if (assignedRole?.slug === "administrator" && ctx && ctx.roleSlug !== "administrator") {
      return NextResponse.json({ error: "Nur Super Admins dürfen weitere Super Admins anlegen." }, { status: 403 });
    }
    const user = await createUser({
      username: parsed.data.username,
      email: parsed.data.email,
      passwordHash,
      displayName: parsed.data.displayName,
      roleId: parsed.data.roleId,
      phone: parsed.data.phone,
      avatar: parsed.data.avatar,
      createdBy: ctx?.userId ?? undefined,
      teamMemberId: parsed.data.teamMemberId ?? null,
    });
    await writeAuditLogFromRequest(ctx, request, {
      action: "create",
      area: "admin_users",
      entityId: user.id,
      after: { username: user.username, role: user.role_slug },
    });
    return NextResponse.json({ user, message: "Benutzer angelegt." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin("users:write");
  if (authError) return authError;

  const body = await request.json();

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  if (body.action === "reset2fa") {
    if (ctx.roleSlug !== "administrator") {
      return NextResponse.json({ error: "Nur Super Admins dürfen 2FA zurücksetzen." }, { status: 403 });
    }
    const targetId = body.id as string | undefined;
    if (!targetId) return NextResponse.json({ error: "Benutzer-ID erforderlich." }, { status: 400 });

    const target = await getUserById(targetId);
    if (!target) return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });

    await revokeAllSessions(targetId);
    await updateUser(targetId, { totpEnabled: false, totpSecret: null });
    const supabase = (await import("@/lib/supabase/admin")).getSupabaseAdmin();
    await supabase.from("admin_backup_codes").delete().eq("user_id", targetId);

    await writeAuditLogFromRequest(ctx, request, {
      action: "2fa_reset",
      area: "security",
      entityId: targetId,
      after: { email: target.email },
    });

    return NextResponse.json({ success: true, message: "2FA zurückgesetzt. Benutzer muss 2FA beim nächsten Login neu einrichten." });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Ungültige Daten.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { id, password, resetPassword, ...rest } = parsed.data;
  const before = await getUserById(id);
  const roleChanged = Boolean(rest.roleId && before && rest.roleId !== before.role_id);

  if (roleChanged) {
    const critical = await verifyCriticalConfirmation(ctx!, parseCriticalBody(body));
    if (!critical.ok) return critical.response;
  }

  try {
    const patch: Parameters<typeof updateUser>[1] = {};
    if (rest.username) patch.username = rest.username;
    if (rest.email) patch.email = rest.email;
    if (rest.displayName) patch.displayName = rest.displayName;
    if (rest.roleId) patch.roleId = rest.roleId;
    if (rest.active !== undefined) patch.active = rest.active;
    if (rest.phone !== undefined) patch.phone = rest.phone;
    if (rest.avatar !== undefined) patch.avatar = rest.avatar;
    if (rest.teamMemberId !== undefined) patch.teamMemberId = rest.teamMemberId;

    if (password) {
      const policy = await getPasswordPolicy();
      const validationError = validatePassword(password, policy);
      if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
      patch.passwordHash = await hashPassword(password);
      await revokeAllSessions(id);
      await writeAuditLogFromRequest(ctx, request, {
        action: resetPassword ? "password_reset_admin" : "password_change",
        area: "admin_users",
        entityId: id,
      });
    }

    await updateUser(id, patch);

    if (roleChanged) {
      await writeAuditLogFromRequest(ctx, request, {
        action: "role_change",
        area: "admin_users",
        entityId: id,
        before: { role_id: before?.role_id },
        after: { role_id: rest.roleId },
      });
    } else if (rest.active === false) {
      await writeAuditLogFromRequest(ctx, request, { action: "deactivate", area: "admin_users", entityId: id });
    } else if (rest.active === true) {
      await writeAuditLogFromRequest(ctx, request, { action: "activate", area: "admin_users", entityId: id });
    } else {
      await writeAuditLogFromRequest(ctx, request, { action: "update", area: "admin_users", entityId: id, after: rest });
    }

    return NextResponse.json({ success: true, message: "Benutzer aktualisiert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin("users:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  if (ctx.userId === id) {
    return NextResponse.json({ error: "Sie können sich nicht selbst löschen." }, { status: 400 });
  }

  const critical = await verifyCriticalConfirmation(ctx, parseCriticalBody(body));
  if (!critical.ok) return critical.response;

  const before = await getUserById(id);
  if (!before) {
    return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });
  }

  try {
    await revokeAllSessions(id);
    await deleteUser(id);
    await writeAuditLogFromRequest(ctx, request, {
      action: "delete",
      area: "admin_users",
      entityId: id,
      before: { username: before.username, email: before.email },
    });
    return NextResponse.json({ success: true, message: "Benutzer gelöscht." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Löschen fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
