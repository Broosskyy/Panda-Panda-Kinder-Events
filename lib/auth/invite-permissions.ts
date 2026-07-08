import type { ActiveAdminRoleSlug } from "@/lib/admin/roles";
import type { AdminRoleSlug } from "@/lib/auth/types";

/** Super Admin and Admin may invite users; others may not. */
export function canInviteUsers(roleSlug: AdminRoleSlug): boolean {
  return roleSlug === "administrator" || roleSlug === "manager";
}

/** Roles the inviter is allowed to assign. */
export function invitableRoleSlugs(inviterRole: AdminRoleSlug): ActiveAdminRoleSlug[] {
  if (inviterRole === "administrator") {
    return ["administrator", "manager", "employee", "readonly"];
  }
  if (inviterRole === "manager") {
    return ["employee", "readonly"];
  }
  return [];
}

export function canInviteRole(inviterRole: AdminRoleSlug, targetRoleSlug: AdminRoleSlug): boolean {
  return invitableRoleSlugs(inviterRole).includes(targetRoleSlug as ActiveAdminRoleSlug);
}
