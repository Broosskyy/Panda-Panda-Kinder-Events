import type { ActiveAdminRoleSlug } from "@/lib/admin/roles";
import type { AdminContext, AdminRoleSlug } from "@/lib/auth/types";
import { hasPermission } from "@/lib/auth/permissions";

/** Super Admin and Admin may invite users; others may not. */
export function canInviteUsers(roleSlug: AdminRoleSlug): boolean {
  return roleSlug === "administrator" || roleSlug === "manager";
}

/** Session may manage invitations (list, create, resend, revoke). */
export function canManageInvites(ctx: AdminContext): boolean {
  if (!canInviteUsers(ctx.roleSlug)) return false;
  return hasPermission(ctx.permissions, "users:invite") || hasPermission(ctx.permissions, "users:write");
}

/** Session may manually create users (full or limited by invitable roles). */
export function canCreateUsersManually(ctx: AdminContext): boolean {
  if (!canInviteUsers(ctx.roleSlug)) return false;
  return hasPermission(ctx.permissions, "users:write") || hasPermission(ctx.permissions, "users:invite");
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
