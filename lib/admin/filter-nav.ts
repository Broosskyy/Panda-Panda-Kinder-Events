import { ADMIN_NAV_GROUPS, type AdminNavGroup } from "@/lib/admin/nav";
import type { SiteModulesSettings } from "@/lib/cms/types";
import { filterAdminNavHref } from "@/lib/cms/modules";
import { hasPermission } from "@/lib/auth/permissions";

const NAV_PERMISSION_MAP: Record<string, string> = {
  "/admin/analytics": "analytics:read",
  "/admin/inhalte": "website:read",
  "/admin/leistungen": "website:read",
  "/admin/galerie": "website:read",
  "/admin/beitraege": "posts:write",
  "/admin/faq": "faq:write",
  "/admin/team": "team:write",
  "/admin/anfragen": "inquiries:write",
  "/admin/bewertungen": "website:read",
  "/admin/emails": "email:write",
  "/admin/kunden": "crm:read",
  "/admin/angebote": "quotes:write",
  "/admin/rechnungen": "invoices:write",
  "/admin/sicherheit/benutzer": "users:read",
  "/admin/sicherheit/2fa": "security:read",
  "/admin/sicherheit/sitzungen": "security:read",
  "/admin/sicherheit/login-historie": "security:read",
  "/admin/sicherheit/audit": "audit:read",
  "/admin/einstellungen": "settings:write",
};

function navItemAllowed(href: string, permissions: string[], modules: SiteModulesSettings): boolean {
  const base = href.split("?")[0] ?? href;
  if (!filterAdminNavHref(href, modules)) return false;

  const required = NAV_PERMISSION_MAP[base];
  if (required && !hasPermission(permissions, required)) return false;

  if (base.startsWith("/admin/einstellungen")) {
    return hasPermission(permissions, "settings:write") || hasPermission(permissions, "settings:system");
  }

  return true;
}

export function filterAdminNavGroups(
  permissions: string[],
  modules: SiteModulesSettings,
): AdminNavGroup[] {
  return ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => navItemAllowed(item.href, permissions, modules)),
  })).filter((group) => group.items.length > 0);
}
