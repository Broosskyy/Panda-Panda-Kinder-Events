import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { listUsers, listRoles, createUser, updateUser } from "@/lib/auth/users";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { getPasswordPolicy } from "@/lib/auth/security-settings";
import { writeAuditLog } from "@/lib/auth/audit";
import { revokeAllSessions } from "@/lib/auth/session";

const createSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
  roleId: z.string().uuid(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
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
});

export async function GET() {
  const authError = await requireAdmin("users:read");
  if (authError) return authError;

  try {
    const [users, roles] = await Promise.all([listUsers(), listRoles()]);
    return NextResponse.json({ users, roles });
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
    return NextResponse.json({ error: "Ungültige Benutzerdaten." }, { status: 400 });
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
    });
    await writeAuditLog(ctx, { action: "create", area: "users", entityId: user.id, after: user });
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
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  const ctx = await getAdminContext();
  const { id, password, ...rest } = parsed.data;

  try {
    const patch: Parameters<typeof updateUser>[1] = {};
    if (rest.username) patch.username = rest.username;
    if (rest.email) patch.email = rest.email;
    if (rest.displayName) patch.displayName = rest.displayName;
    if (rest.roleId) patch.roleId = rest.roleId;
    if (rest.active !== undefined) patch.active = rest.active;
    if (rest.phone !== undefined) patch.phone = rest.phone;
    if (rest.avatar !== undefined) patch.avatar = rest.avatar;

    if (password) {
      const policy = await getPasswordPolicy();
      const validationError = validatePassword(password, policy);
      if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
      patch.passwordHash = await hashPassword(password);
      await revokeAllSessions(id);
    }

    await updateUser(id, patch);
    await writeAuditLog(ctx, { action: "update", area: "users", entityId: id, after: rest });
    return NextResponse.json({ success: true, message: "Benutzer aktualisiert." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
