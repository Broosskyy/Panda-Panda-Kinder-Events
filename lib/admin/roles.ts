import type { TeamMemberRole } from "@/lib/cms/types";

export const TEAM_ROLE_LABELS: Record<TeamMemberRole, string> = {
  admin: "Admin",
  editor: "Bearbeiter",
  readonly: "Nur Lesen",
};

export const TEAM_ROLE_DESCRIPTIONS: Record<TeamMemberRole, string> = {
  admin: "Vollzugriff auf alle Bereiche",
  editor: "Anfragen, Kunden, Angebote, Rechnungen, Beiträge, Galerie",
  readonly: "Nur Ansehen — keine Bearbeitung",
};

/** Permission areas for future multi-login auth */
export const ROLE_PERMISSIONS: Record<TeamMemberRole, string[]> = {
  admin: ["*"],
  editor: [
    "inquiries",
    "customers",
    "quotes",
    "invoices",
    "posts",
    "gallery",
    "reviews",
  ],
  readonly: [
    "inquiries:read",
    "customers:read",
    "quotes:read",
    "invoices:read",
    "posts:read",
    "gallery:read",
    "reviews:read",
    "analytics:read",
  ],
};
