import type { ActiveAdminRoleSlug } from "@/lib/admin/roles";

export interface RoleHelpItem {
  title: string;
  body: string;
}

/** Role-specific dashboard hints — no hardcoded user names. */
export const ROLE_DASHBOARD_HELP: Record<ActiveAdminRoleSlug, RoleHelpItem[]> = {
  administrator: [
    {
      title: "Systemstatus",
      body: "Prüfe Domain, E-Mail-Provider, Module und Backup-Hinweise unter Einstellungen → System.",
    },
    {
      title: "Benutzer & Rollen",
      body: "Lege neue Admins an und weise nur die nötige Rolle zu — nie mehr Rechte als nötig.",
    },
    {
      title: "Aktivitätsprotokoll",
      body: "Alle wichtigen Änderungen werden protokolliert. Export nur bei Bedarf für Audits.",
    },
  ],
  manager: [
    {
      title: "Inhalte pflegen",
      body: "Texte, Galerie, Team und Leistungen findest du unter Website.",
    },
    {
      title: "Anfragen bearbeiten",
      body: "Neue Kontaktanfragen erscheinen unter Kommunikation → Anfragen.",
    },
    {
      title: "Angebote & Rechnungen",
      body: "Erstelle Angebote, wandle sie in Rechnungen um und versende PDFs per E-Mail.",
    },
    {
      title: "Bewertungen freigeben",
      body: "Neue Bewertungen sind erst nach Freigabe öffentlich sichtbar.",
    },
  ],
  employee: [
    {
      title: "Anfragen",
      body: "Bearbeite neue Kontaktanfragen und setze den Status.",
    },
    {
      title: "Kunden",
      body: "Pflege Kundendaten und Notizen — ohne Website oder Rechnungen.",
    },
    {
      title: "Tagesgeschäft",
      body: "Offene Aufgaben findest du in den Karten oben — ein Klick führt direkt zum Bereich.",
    },
  ],
  readonly: [
    {
      title: "Nur Ansicht",
      body: "Du kannst alle erlaubten Bereiche ansehen, aber nichts speichern oder löschen.",
    },
    {
      title: "Übersicht",
      body: "Nutze die Karten für einen schnellen Überblick über Anfragen und CRM-Zahlen.",
    },
  ],
};

export function dashboardDescriptionForRole(slug: ActiveAdminRoleSlug): string {
  switch (slug) {
    case "administrator":
      return "Deine Systemzentrale — Betrieb, Sicherheit und technische Hinweise auf einen Blick.";
    case "manager":
      return "Deine Tageszentrale — Website, Anfragen, Kunden und Dokumente an einem Ort.";
    case "employee":
      return "Dein Arbeitsbereich — Anfragen und Kunden für den Tagesbetrieb.";
    case "readonly":
      return "Deine Übersicht — alle erlaubten Bereiche nur zur Ansicht.";
    default:
      return "Hier siehst du auf einen Blick, was zu tun ist.";
  }
}
