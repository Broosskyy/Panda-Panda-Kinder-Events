import { cookies } from "next/headers";
import {
  getAdminCookieName,
  isAdminAuthenticated as isLegacyAuthenticated,
} from "@/lib/admin-auth";
import { getSessionByToken, getSessionTokenFromCookies, touchSession } from "@/lib/auth/session";
import { getPermissionsForRole, getLegacyPermissions, hasPermission } from "@/lib/auth/permissions";
import { getUserById } from "@/lib/auth/users";
import { getRoleById } from "@/lib/auth/users";
import type { AdminContext } from "@/lib/auth/types";

let cachedContext: { at: number; ctx: AdminContext | null } | null = null;

export async function resolveAdminContext(): Promise<AdminContext | null> {
  if (cachedContext && Date.now() - cachedContext.at < 1000) {
    return cachedContext.ctx;
  }

  const sessionToken = await getSessionTokenFromCookies();
  if (sessionToken) {
    const session = await getSessionByToken(sessionToken);
    if (session) {
      const user = await getUserById(session.user_id);
      if (user?.active) {
        const role = await getRoleById(user.role_id);
        const permissions = await getPermissionsForRole(user.role_id);
        void touchSession(session.id);
        const ctx: AdminContext = {
          userId: user.id,
          displayName: user.display_name,
          roleSlug: role?.slug ?? "readonly",
          permissions,
          sessionId: session.id,
          isLegacy: false,
        };
        cachedContext = { at: Date.now(), ctx };
        return ctx;
      }
    }
  }

  const legacyOk = await isLegacyAuthenticated();
  if (legacyOk) {
    const ctx: AdminContext = {
      userId: null,
      displayName: "Administrator",
      roleSlug: "legacy",
      permissions: getLegacyPermissions(),
      sessionId: null,
      isLegacy: true,
    };
    cachedContext = { at: Date.now(), ctx };
    return ctx;
  }

  cachedContext = { at: Date.now(), ctx: null };
  return null;
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
