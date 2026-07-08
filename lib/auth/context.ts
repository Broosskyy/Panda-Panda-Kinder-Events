import { getSessionByToken, getSessionTokenFromCookies, touchSession } from "@/lib/auth/session";
import { getPermissionsForRole, hasPermission } from "@/lib/auth/permissions";
import { getUserById, getRoleById } from "@/lib/auth/users";
import type { AdminContext } from "@/lib/auth/types";

/**
 * Authenticates exclusively via pb_admin_session → admin_sessions.user_id → admin_users.id.
 * No legacy cookies, no virtual users, no fallback identities.
 */
export async function resolveAdminContext(): Promise<AdminContext | null> {
  const sessionToken = await getSessionTokenFromCookies();
  if (!sessionToken) return null;

  const session = await getSessionByToken(sessionToken);
  if (!session) return null;

  const user = await getUserById(session.user_id);
  if (!user?.active) return null;

  const role = await getRoleById(user.role_id);
  const permissions = await getPermissionsForRole(user.role_id);
  void touchSession(session.id);

  return {
    userId: user.id,
    displayName: user.display_name,
    email: user.email,
    roleSlug: role?.slug ?? "readonly",
    permissions,
    sessionId: session.id,
  };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await resolveAdminContext()) !== null;
}

export function adminHasPermission(ctx: AdminContext, permission: string): boolean {
  return hasPermission(ctx.permissions, permission);
}
