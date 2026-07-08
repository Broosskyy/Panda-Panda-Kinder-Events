import type { ActiveAdminRoleSlug } from "@/lib/admin/roles";
import type { AdminRoleSlug } from "@/lib/auth/types";

/** Practical role explanations for the four active roles. */
export const ADMIN_ROLE_DESCRIPTIONS: Record<ActiveAdminRoleSlug, string> = {
  administrator:
    "Super Admin — darf alles: Benutzer, Module, Domain, E-Mail-Provider, Backup und alle Inhalte. Nur für vertrauenswürdige Personen.",
  manager:
    "Admin — Website-Inhalte, Anfragen, Kunden, Angebote und Rechnungen im Tagesgeschäft. Keine technischen Systemeinstellungen.",
  employee:
    "Mitarbeiter — Anfragen und Kunden bearbeiten. Keine Website-Struktur, keine Rechnungen, keine Einstellungen.",
  readonly: "Nur Lesen — alles ansehen, nichts ändern.",
};

export const ADMIN_ROLE_SHORT: Record<ActiveAdminRoleSlug, string> = {
  administrator: "Alles erlaubt (Super Admin)",
  manager: "Inhalte + CRM + Kommunikation",
  employee: "Anfragen + Kunden",
  readonly: "Nur ansehen",
};

/** Default role for new users — never Super Admin. */
export const DEFAULT_NEW_USER_ROLE_SLUG: AdminRoleSlug = "manager";

export function roleSlugFromId(roles: { id: string; slug: string }[], roleId: string): string | null {
  return roles.find((r) => r.id === roleId)?.slug ?? null;
}

export function describeRoleSlug(slug: AdminRoleSlug | string): string {
  if (slug in ADMIN_ROLE_DESCRIPTIONS) {
    return ADMIN_ROLE_DESCRIPTIONS[slug as ActiveAdminRoleSlug];
  }
  return "Veraltete Rolle — bitte auf Admin oder Mitarbeiter umstellen.";
}

export function shortRoleSlug(slug: AdminRoleSlug | string): string {
  if (slug in ADMIN_ROLE_SHORT) {
    return ADMIN_ROLE_SHORT[slug as ActiveAdminRoleSlug];
  }
  return "";
}
