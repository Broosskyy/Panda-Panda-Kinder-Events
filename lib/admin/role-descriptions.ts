import type { AdminRoleSlug } from "@/lib/auth/types";

export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminRoleSlug, string> = {
  administrator: "Vollzugriff auf alle Bereiche des Admin-Dashboards.",
  manager: "CRM, Kommunikation und Website bearbeiten — ohne Sicherheitseinstellungen.",
  employee: "Website-Inhalte und CRM-Anfragen bearbeiten.",
  editor: "Website-Inhalte: Beiträge, Galerie, FAQ, Leistungen.",
  accounting: "Kunden, Angebote und Rechnungen verwalten.",
  readonly: "Alles ansehen, nichts ändern.",
};

export const ADMIN_ROLE_SHORT: Record<AdminRoleSlug, string> = {
  administrator: "Alles",
  manager: "CRM + Kommunikation + Website",
  editor: "Website-Inhalte",
  employee: "Website + CRM (eingeschränkt)",
  accounting: "Kunden, Angebote, Rechnungen",
  readonly: "Nur Lesen",
};
