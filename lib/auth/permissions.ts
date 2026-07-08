import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AdminRoleSlug } from "@/lib/auth/types";

const ALL_PERMISSIONS = [
  "dashboard:read",
  "analytics:read",
  "website:read",
  "website:write",
  "hero:write",
  "gallery:write",
  "faq:write",
  "reviews:write",
  "posts:write",
  "crm:read",
  "customers:write",
  "inquiries:write",
  "quotes:write",
  "invoices:write",
  "invoices:delete",
  "users:read",
  "users:write",
  "settings:write",
  "settings:system",
  "security:read",
  "security:write",
  "audit:read",
  "audit:export",
  "team:write",
  "email:write",
  "modules:write",
  "backup:write",
] as const;

export async function getPermissionsForRole(roleId: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_role_permissions")
    .select("admin_permissions(slug)")
    .eq("role_id", roleId);

  if (error) return [];
  return (data ?? [])
    .map((row) => {
      const perm = row.admin_permissions as { slug: string } | { slug: string }[] | null;
      if (Array.isArray(perm)) return perm[0]?.slug;
      return perm?.slug;
    })
    .filter((slug): slug is string => Boolean(slug));
}

export function getLegacyPermissions(): string[] {
  return [...ALL_PERMISSIONS];
}

export function hasPermission(permissions: string[], required: string): boolean {
  if (permissions.includes(required)) return true;
  const [area] = required.split(":");
  if (required.endsWith(":read")) {
    return permissions.includes(`${area}:write`);
  }
  return false;
}

export async function getRolePermissionsMap(): Promise<Record<AdminRoleSlug, string[]>> {
  const supabase = getSupabaseAdmin();
  const { data: roles } = await supabase.from("admin_roles").select("id, slug");
  const map = {} as Record<AdminRoleSlug, string[]>;

  for (const role of roles ?? []) {
    map[role.slug as AdminRoleSlug] = await getPermissionsForRole(role.id);
  }
  return map;
}
