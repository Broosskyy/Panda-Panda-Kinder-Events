import type { AdminRole, AdminRoleSlug } from "@/lib/auth/types";

/** The four active roles used in production. Legacy slugs remain in DB for migration only. */
export const ACTIVE_ADMIN_ROLE_SLUGS = [
  "administrator",
  "manager",
  "employee",
  "readonly",
] as const satisfies readonly AdminRoleSlug[];

export type ActiveAdminRoleSlug = (typeof ACTIVE_ADMIN_ROLE_SLUGS)[number];

export const ADMIN_ROLE_DISPLAY_LABELS: Record<ActiveAdminRoleSlug, string> = {
  administrator: "Super Admin",
  manager: "Admin",
  employee: "Mitarbeiter",
  readonly: "Nur Lesen",
};

export function isActiveRoleSlug(slug: string): slug is ActiveAdminRoleSlug {
  return (ACTIVE_ADMIN_ROLE_SLUGS as readonly string[]).includes(slug);
}

export function filterActiveRoles(roles: AdminRole[]): AdminRole[] {
  return roles.filter((role) => isActiveRoleSlug(role.slug));
}

export function roleDisplayLabel(slug: AdminRoleSlug, fallback?: string): string {
  if (slug in ADMIN_ROLE_DISPLAY_LABELS) {
    return ADMIN_ROLE_DISPLAY_LABELS[slug as ActiveAdminRoleSlug];
  }
  return fallback ?? slug;
}
