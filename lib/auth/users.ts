import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AdminContext, AdminRole, AdminRoleSlug, AdminUser, AdminUserPublic } from "@/lib/auth/types";

export async function countAdminUsers(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true });
  if (error) {
    console.error("countAdminUsers:", error.message);
    throw new Error(`Admin-Benutzer konnten nicht gezählt werden: ${error.message}`);
  }
  return count ?? 0;
}

export async function countAdminUsersSafe(): Promise<number> {
  try {
    return await countAdminUsers();
  } catch {
    return 0;
  }
}

export async function isMultiUserAuthEnabled(): Promise<boolean> {
  return (await countAdminUsersSafe()) > 0;
}

export async function findUserByIdentifier(identifier: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();
  const trimmed = identifier.trim().toLowerCase();
  const isEmail = trimmed.includes("@");

  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq(isEmail ? "email" : "username", isEmail ? trimmed : identifier.trim())
    .maybeSingle();

  if (error || !data) return null;
  return data as AdminUser;
}

export async function getUserById(id: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("admin_users").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as AdminUser;
}

export async function listRoles(): Promise<AdminRole[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("admin_roles").select("*").order("label");
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminRole[];
}

export async function getRoleById(id: string): Promise<AdminRole | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("admin_roles").select("*").eq("id", id).maybeSingle();
  return (data as AdminRole | null) ?? null;
}

function mapRowToAdminUserPublic(row: Record<string, unknown>): AdminUserPublic {
  const role = row.admin_roles as { slug: AdminRoleSlug; label: string } | null;
  const teamMember = row.team_members as { name: string } | null;
  return {
    id: String(row.id),
    username: String(row.username),
    email: String(row.email),
    display_name: String(row.display_name),
    role_id: String(row.role_id),
    role_slug: role?.slug ?? "readonly",
    role_label: role?.label ?? "Nur Lesen",
    active: Boolean(row.active),
    avatar: (row.avatar as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    totp_enabled: Boolean(row.totp_enabled),
    last_login: (row.last_login as string | null) ?? null,
    team_member_id: (row.team_member_id as string | null) ?? null,
    team_member_name: teamMember?.name ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

/** Virtual profile for legacy cookie sessions (no admin_users row yet). */
export function buildLegacyUserPublic(ctx: AdminContext): AdminUserPublic {
  const now = new Date().toISOString();
  return {
    id: "legacy-session",
    username: "administrator",
    email: "",
    display_name: ctx.displayName || "Administrator",
    role_id: "",
    role_slug: "administrator",
    role_label: "Super Admin",
    active: true,
    avatar: null,
    phone: null,
    totp_enabled: false,
    last_login: null,
    team_member_id: null,
    team_member_name: null,
    created_at: now,
    updated_at: now,
  };
}

export async function getUserPublicById(id: string): Promise<AdminUserPublic | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*, admin_roles(slug, label), team_members(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    const fallback = await supabase
      .from("admin_users")
      .select("*, admin_roles(slug, label)")
      .eq("id", id)
      .maybeSingle();
    if (fallback.error || !fallback.data) return null;
    return mapRowToAdminUserPublic(fallback.data as Record<string, unknown>);
  }

  return mapRowToAdminUserPublic(data as Record<string, unknown>);
}

export async function listUsers(): Promise<AdminUserPublic[]> {
  const supabase = getSupabaseAdmin();
  const first = await supabase
    .from("admin_users")
    .select("*, admin_roles(slug, label), team_members(name)")
    .order("display_name");

  let data = first.data;
  if (first.error) {
    console.warn("listUsers with team_members join failed, retrying:", first.error.message);
    const fallback = await supabase
      .from("admin_users")
      .select("*, admin_roles(slug, label)")
      .order("display_name");
    if (fallback.error) throw new Error(fallback.error.message);
    data = fallback.data;
  }

  return (data ?? []).map((row) => mapRowToAdminUserPublic(row as Record<string, unknown>));
}

/**
 * Ensures the active session user is always included in the users list.
 * Never returns an empty list for an authenticated admin.
 */
export async function resolveUsersForSession(ctx: AdminContext, canListAll: boolean): Promise<AdminUserPublic[]> {
  let users: AdminUserPublic[] = [];

  if (canListAll) {
    users = await listUsers();
  }

  if (ctx.isLegacy) {
    const legacyUser = buildLegacyUserPublic(ctx);
    if (!users.some((u) => u.id === legacyUser.id)) {
      users = [legacyUser, ...users];
    }
    return users;
  }

  if (ctx.userId) {
    const self = await getUserPublicById(ctx.userId);
    if (self && !users.some((u) => u.id === self.id)) {
      users = [self, ...users];
    } else if (!self) {
      console.error("resolveUsersForSession: session user missing in admin_users", ctx.userId);
    }
  }

  return users;
}

export async function createUser(input: {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  roleId: string;
  phone?: string;
  avatar?: string;
  createdBy?: string;
  teamMemberId?: string | null;
}): Promise<AdminUserPublic> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      username: input.username.trim(),
      email: input.email.trim().toLowerCase(),
      password_hash: input.passwordHash,
      display_name: input.displayName.trim(),
      role_id: input.roleId,
      phone: input.phone?.trim() || null,
      avatar: input.avatar || null,
      created_by: input.createdBy ?? null,
      team_member_id: input.teamMemberId ?? null,
    })
    .select("*, admin_roles(slug, label)")
    .single();

  if (error) throw new Error(error.message);
  const role = data.admin_roles as { slug: AdminRoleSlug; label: string };
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    display_name: data.display_name,
    role_id: data.role_id,
    role_slug: role.slug,
    role_label: role.label,
    active: data.active,
    avatar: data.avatar,
    phone: data.phone,
    totp_enabled: data.totp_enabled,
    last_login: data.last_login,
    team_member_id: data.team_member_id ?? null,
    team_member_name: null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function updateUser(
  id: string,
  patch: Partial<{
    username: string;
    email: string;
    displayName: string;
    roleId: string;
    active: boolean;
    phone: string | null;
    avatar: string | null;
    passwordHash: string;
    totpEnabled: boolean;
    totpSecret: string | null;
    failedLoginAttempts: number;
    lockedUntil: string | null;
    lastLogin: string;
    teamMemberId: string | null;
  }>,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (patch.username !== undefined) update.username = patch.username.trim();
  if (patch.email !== undefined) update.email = patch.email.trim().toLowerCase();
  if (patch.displayName !== undefined) update.display_name = patch.displayName.trim();
  if (patch.roleId !== undefined) update.role_id = patch.roleId;
  if (patch.active !== undefined) update.active = patch.active;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.avatar !== undefined) update.avatar = patch.avatar;
  if (patch.passwordHash !== undefined) update.password_hash = patch.passwordHash;
  if (patch.totpEnabled !== undefined) update.totp_enabled = patch.totpEnabled;
  if (patch.totpSecret !== undefined) update.totp_secret = patch.totpSecret;
  if (patch.failedLoginAttempts !== undefined) update.failed_login_attempts = patch.failedLoginAttempts;
  if (patch.lockedUntil !== undefined) update.locked_until = patch.lockedUntil;
  if (patch.lastLogin !== undefined) update.last_login = patch.lastLogin;
  if (patch.teamMemberId !== undefined) update.team_member_id = patch.teamMemberId;

  const { error } = await supabase.from("admin_users").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
