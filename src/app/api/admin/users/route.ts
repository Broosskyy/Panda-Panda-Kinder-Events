import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { listUsers, listRoles, createUser, updateUser, getUserById } from "@/lib/auth/users";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { getPasswordPolicy } from "@/lib/auth/security-settings";
import { writeAuditLog } from "@/lib/auth/audit";
import { revokeAllSessions } from "@/lib/auth/session";
import { listTeamMembersForSelect } from "@/lib/team/db";

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
  const authError = await requireAdmin("users:read");
  if (authError) return authError;

  try {
    const [users, roles, teamMembers] = await Promise.all([
      listUsers(),
      listRoles(),
      listTeamMembersForSelect().catch(() => []),
    ]);
    return NextResponse.json({ users, roles, teamMembers });
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
    await writeAuditLog(ctx, {
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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Ungültige Daten.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const ctx = await getAdminContext();
  const { id, password, resetPassword, ...rest } = parsed.data;
  const before = await getUserById(id);

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
      await writeAuditLog(ctx, {
        action: resetPassword ? "password_reset_admin" : "password_change",
        area: "admin_users",
        entityId: id,
      });
    }

    const roleChanged = rest.roleId && before && rest.roleId !== before.role_id;
    await updateUser(id, patch);

    if (roleChanged) {
      await writeAuditLog(ctx, {
        action: "role_change",
        area: "admin_users",
        entityId: id,
        before: { role_id: before?.role_id },
        after: { role_id: rest.roleId },
      });
    } else if (rest.active === false) {
      await writeAuditLog(ctx, { action: "deactivate", area: "admin_users", entityId: id });
    } else if (rest.active === true) {
      await writeAuditLog(ctx, { action: "activate", area: "admin_users", entityId: id });
    } else {
      await writeAuditLog(ctx, { action: "update", area: "admin_users", entityId: id, after: rest });
    }

    return NextResponse.json({ success: true, message: "Benutzer aktualisiert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
