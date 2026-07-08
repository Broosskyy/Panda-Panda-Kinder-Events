import type { AdminRoleSlug } from "@/lib/auth/types";

/** Samira-friendly role explanations for the handover. */
export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminRoleSlug, string> = {
  administrator:
    "Super Admin — darf alles: Benutzer, Module, Domain, E-Mail, Backup und alle Inhalte. Nur für vertrauenswürdige Personen.",
  manager:
    "Admin — Inhalte, Anfragen, Kunden, Angebote und Rechnungen bearbeiten. Keine kritischen Systemeinstellungen.",
  employee:
    "Mitarbeiter — Anfragen bearbeiten und Kunden ansehen. Keine Rechnungen löschen, keine Einstellungen ändern.",
  editor:
    "Redakteur — Website-Inhalte wie Beiträge, Galerie, FAQ und Leistungen.",
  accounting:
    "Buchhaltung — Kunden, Angebote und Rechnungen verwalten.",
  readonly: "Nur Lesen — alles ansehen, nichts ändern.",
};

export const ADMIN_ROLE_SHORT: Record<AdminRoleSlug, string> = {
  administrator: "Alles erlaubt (Super Admin)",
  manager: "Inhalte + CRM + Kommunikation",
  editor: "Website-Inhalte",
  employee: "Anfragen + Kunden lesen",
  accounting: "Kunden, Angebote, Rechnungen",
  readonly: "Nur ansehen",
};

/** Default role for new users — never Super Admin. */
export const DEFAULT_NEW_USER_ROLE_SLUG: AdminRoleSlug = "manager";

export function roleSlugFromId(roles: { id: string; slug: string }[], roleId: string): string | null {
  return roles.find((r) => r.id === roleId)?.slug ?? null;
}
