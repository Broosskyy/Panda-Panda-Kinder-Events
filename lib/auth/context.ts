import { cookies } from "next/headers";
import {
  getAdminCookieName,
  isAdminAuthenticated as isLegacyAuthenticated,
} from "@/lib/admin-auth";
import { getSessionByToken, getSessionTokenFromCookies, touchSession } from "@/lib/auth/session";
import { getPermissionsForRole, getLegacyPermissions, hasPermission } from "@/lib/auth/permissions";
import { getUserById, hasAdminUsers } from "@/lib/auth/users";
import { getRoleById } from "@/lib/auth/users";
import type { AdminContext } from "@/lib/auth/types";

/**
 * Resolves the authenticated admin from the session cookie (admin_users.id).
 * Legacy cookie auth is only allowed when zero admin_users exist — never as fallback.
 */
export async function resolveAdminContext(): Promise<AdminContext | null> {
  const sessionToken = await getSessionTokenFromCookies();
  if (sessionToken) {
    const session = await getSessionByToken(sessionToken);
    if (session) {
      const user = await getUserById(session.user_id);
      if (user?.active) {
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
          isLegacy: false,
        };
      }
      // Session exists but user is missing or inactive — never fall back to another identity.
      return null;
    }
  }

  let multiUserEnabled = false;
  try {
    multiUserEnabled = await hasAdminUsers();
  } catch (err) {
    console.error("resolveAdminContext: cannot verify admin_users", err);
    return null;
  }

  if (multiUserEnabled) {
    // Stale legacy cookies must not impersonate "Administrator" when real users exist.
    return null;
  }

  const legacyOk = await isLegacyAuthenticated();
  if (!legacyOk) return null;

  return {
    userId: null,
    displayName: "Administrator",
    email: null,
    roleSlug: "legacy",
    permissions: getLegacyPermissions(),
    sessionId: null,
    isLegacy: true,
  };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await resolveAdminContext()) !== null;
}

export function adminHasPermission(ctx: AdminContext, permission: string): boolean {
  if (ctx.isLegacy) return true;
  return hasPermission(ctx.permissions, permission);
}

export async function clearAdminCookies(): Promise<string[]> {
  const cookieStore = await cookies();
  const names = [getAdminCookieName(), "pb_admin_session", "pb_admin_2fa_pending"];
  return names.filter((name) => Boolean(cookieStore.get(name)?.value));
}
