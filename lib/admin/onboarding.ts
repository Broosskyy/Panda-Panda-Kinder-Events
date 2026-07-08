import type { AdminRoleSlug } from "@/lib/auth/types";
import { hasPermission } from "@/lib/auth/permissions";

export interface OnboardingStep {
  id: string;
  title: string;
  body: string;
  permission?: string;
  href?: string;
  hrefLabel?: string;
}

const ROLE_TRACKS: Record<ActiveOnboardingRole, OnboardingStep[]> = {
  administrator: [
    {
      id: "welcome",
      title: "Willkommen im Panda-Bande Admin",
      body: "Kurzes Tutorial zu den wichtigsten Bereichen. Du kannst überspringen oder es später erneut starten.",
    },
    {
      id: "dashboard",
      title: "Dashboard",
      body: "Offene Aufgaben, Kennzahlen und Schnellzugriffe — starte hier jeden Tag.",
      href: "/admin",
      hrefLabel: "Zum Dashboard",
    },
    {
      id: "anfragen",
      title: "Anfragen",
      body: "Kontaktanfragen prüfen, Status setzen, archivieren und Kunden anlegen.",
      permission: "inquiries:write",
      href: "/admin/anfragen",
      hrefLabel: "Zu Anfragen",
    },
    {
      id: "kunden",
      title: "Kunden",
      body: "Kundenstamm pflegen — Grundlage für Angebote und Rechnungen.",
      permission: "crm:read",
      href: "/admin/kunden",
      hrefLabel: "Zu Kunden",
    },
    {
      id: "crm-docs",
      title: "Angebote & Rechnungen",
      body: "Angebote erstellen, PDFs versenden und Rechnungen verwalten.",
      permission: "quotes:write",
      href: "/admin/angebote",
      hrefLabel: "Zu Angeboten",
    },
    {
      id: "website",
      title: "Website, Galerie & Bewertungen",
      body: "Inhalte, Eventfotos und Bewertungsfreigaben steuern.",
      permission: "gallery:write",
      href: "/admin/galerie",
      hrefLabel: "Zur Galerie",
    },
    {
      id: "users",
      title: "Benutzer & Rollen",
      body: "Admin-Zugänge und Rollen verwalten.",
      permission: "users:read",
      href: "/admin/sicherheit/benutzer",
      hrefLabel: "Zu Benutzer & Rollen",
    },
    {
      id: "security",
      title: "Sicherheit & Audit Logs",
      body: "Sitzungen, Login-Historie und Aktivitätsprotokoll einsehen.",
      permission: "audit:read",
      href: "/admin/sicherheit/audit",
      hrefLabel: "Zum Protokoll",
    },
    {
      id: "done",
      title: "Fertig!",
      body: "Du kennst die wichtigsten Bereiche. Nutze die Navigation unten für alles Weitere.",
    },
  ],
  manager: [
    {
      id: "welcome",
      title: "Willkommen im Panda-Bande Admin",
      body: "Kurzes Tutorial zu deinen täglichen Aufgaben im Admin.",
    },
    {
      id: "dashboard",
      title: "Dashboard",
      body: "Übersicht über offene Aufgaben und Kennzahlen.",
      href: "/admin",
      hrefLabel: "Zum Dashboard",
    },
    {
      id: "anfragen",
      title: "Anfragen",
      body: "Neue Anfragen bearbeiten und Kunden anlegen.",
      permission: "inquiries:write",
      href: "/admin/anfragen",
      hrefLabel: "Zu Anfragen",
    },
    {
      id: "kunden",
      title: "Kunden",
      body: "Kunden verwalten und Historie einsehen.",
      permission: "crm:read",
      href: "/admin/kunden",
      hrefLabel: "Zu Kunden",
    },
    {
      id: "crm-docs",
      title: "Angebote & Rechnungen",
      body: "Angebote erstellen und Rechnungen versenden.",
      permission: "quotes:write",
      href: "/admin/angebote",
      hrefLabel: "Zu Angeboten",
    },
    {
      id: "website",
      title: "Website, Galerie & Bewertungen",
      body: "Website-Inhalte und Bewertungen pflegen.",
      permission: "website:read",
      href: "/admin/bewertungen",
      hrefLabel: "Zu Bewertungen",
    },
    {
      id: "done",
      title: "Fertig!",
      body: "Viel Erfolg — bei Fragen findest du Hilfe unter „Erste Schritte“.",
    },
  ],
  employee: [
    {
      id: "welcome",
      title: "Willkommen",
      body: "Kurze Einführung in deine Aufgaben als Mitarbeiter.",
    },
    {
      id: "anfragen",
      title: "Anfragen",
      body: "Kontaktanfragen prüfen, Status setzen und archivieren.",
      permission: "inquiries:write",
      href: "/admin/anfragen",
      hrefLabel: "Zu Anfragen",
    },
    {
      id: "kunden",
      title: "Kunden",
      body: "Kunden anlegen und Daten pflegen.",
      permission: "crm:read",
      href: "/admin/kunden",
      hrefLabel: "Zu Kunden",
    },
    {
      id: "tasks",
      title: "Aufgaben & Notizen",
      body: "Nutze interne Notizen bei Anfragen und halte den Status aktuell.",
      permission: "inquiries:write",
      href: "/admin/anfragen",
      hrefLabel: "Zu Anfragen",
    },
    {
      id: "done",
      title: "Fertig!",
      body: "Du kannst jederzeit über Einstellungen das Tutorial erneut starten.",
    },
  ],
  readonly: [
    {
      id: "welcome",
      title: "Willkommen",
      body: "Du hast Lesezugriff auf den Admin — keine Bearbeitung möglich.",
    },
    {
      id: "overview",
      title: "Übersicht ansehen",
      body: "Das Dashboard zeigt dir Kennzahlen und offene Punkte zur Information.",
      permission: "dashboard:read",
      href: "/admin",
      hrefLabel: "Zum Dashboard",
    },
    {
      id: "areas",
      title: "Bereiche verstehen",
      body: "Navigation unten und Menü oben links führen zu den erlaubten Bereichen. Rechte werden serverseitig geschützt.",
    },
    {
      id: "done",
      title: "Fertig!",
      body: "Bei Fragen wende dich an einen Admin.",
    },
  ],
};

type ActiveOnboardingRole = "administrator" | "manager" | "employee" | "readonly";

function resolveTrackRole(roleSlug: AdminRoleSlug): ActiveOnboardingRole {
  if (roleSlug === "administrator") return "administrator";
  if (roleSlug === "manager") return "manager";
  if (roleSlug === "employee") return "employee";
  return "readonly";
}

export function filterOnboardingSteps(
  permissions: string[],
  roleSlug: AdminRoleSlug,
): OnboardingStep[] {
  const track = ROLE_TRACKS[resolveTrackRole(roleSlug)];
  return track.filter((step) => {
    if (!step.permission) return true;
    return hasPermission(permissions, step.permission);
  });
}

/** Client-side fallback when API is unavailable */
export function getClientOnboardingSteps(
  permissions: string[],
  roleSlug: AdminRoleSlug,
): OnboardingStep[] {
  return filterOnboardingSteps(permissions, roleSlug);
}
