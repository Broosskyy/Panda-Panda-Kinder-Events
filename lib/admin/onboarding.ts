import type { AdminRoleSlug } from "@/lib/auth/types";
import { hasPermission } from "@/lib/auth/permissions";
import { ADMIN_HOME_PATH } from "@/lib/admin/routes";

export const ONBOARDING_SESSION_DISMISS_KEY = "pb-admin-onboarding-session-dismissed";

export interface OnboardingStep {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
  iconKey?: string;
  permission?: string;
  href?: string;
  hrefLabel?: string;
}

const ROLE_TRACKS: Record<ActiveOnboardingRole, OnboardingStep[]> = {
  administrator: [
    {
      id: "welcome",
      iconKey: "Sparkles",
      title: "Willkommen im Panda-Bande Admin",
      body: "In wenigen Schritten zeigen wir dir die wichtigsten Bereiche.",
      bullets: ["Du kannst jederzeit überspringen", "Tutorial später unter Einstellungen erneut starten"],
    },
    {
      id: "dashboard",
      iconKey: "Home",
      title: "Dashboard",
      body: "Deine Tageszentrale mit offenen Aufgaben und Kennzahlen.",
      bullets: ["Neue Anfragen und Bewertungen auf einen Blick", "Schnellzugriffe zu wichtigen Bereichen"],
      href: ADMIN_HOME_PATH,
      hrefLabel: "Zum Dashboard",
    },
    {
      id: "anfragen",
      iconKey: "Inbox",
      title: "Anfragen",
      body: "Hier landen Kontaktanfragen von der Website.",
      bullets: ["Status setzen und Notizen hinterlegen", "Kunden anlegen oder archivieren"],
      permission: "inquiries:write",
      href: "/admin/anfragen",
      hrefLabel: "Zu Anfragen",
    },
    {
      id: "kunden",
      iconKey: "Users",
      title: "Kunden",
      body: "Der Kundenstamm ist die Basis für Angebote und Rechnungen.",
      bullets: ["Kontaktdaten und Historie pflegen", "Aus Anfragen direkt übernehmen"],
      permission: "crm:read",
      href: "/admin/kunden",
      hrefLabel: "Zu Kunden",
    },
    {
      id: "crm-docs",
      iconKey: "FileText",
      title: "Angebote & Rechnungen",
      body: "Dokumente erstellen, als PDF prüfen und per E-Mail versenden.",
      bullets: ["Angebote in Rechnungen umwandeln", "Versand mit einem Klick"],
      permission: "quotes:write",
      href: "/admin/angebote",
      hrefLabel: "Zu Angeboten",
    },
    {
      id: "website",
      iconKey: "Image",
      title: "Website & Galerie",
      body: "Inhalte und Eventfotos steuerst du direkt hier.",
      bullets: ["Galerie-Bilder hochladen", "Bewertungen freigeben"],
      permission: "gallery:write",
      href: "/admin/galerie",
      hrefLabel: "Zur Galerie",
    },
    {
      id: "users",
      iconKey: "UserCog",
      title: "Benutzer & Rollen",
      body: "Admin-Zugänge und Berechtigungen verwalten.",
      bullets: ["Neue Teammitglieder einladen", "Rollen steuern, wer was darf"],
      permission: "users:read",
      href: "/admin/sicherheit/benutzer",
      hrefLabel: "Zu Benutzer & Rollen",
    },
    {
      id: "security",
      iconKey: "Shield",
      title: "Sicherheit & Protokoll",
      body: "Technische Übersicht für Super Admins.",
      bullets: ["Login-Historie prüfen", "Änderungen im Audit-Log nachverfolgen"],
      permission: "audit:read",
      href: "/admin/sicherheit/audit",
      hrefLabel: "Zum Protokoll",
    },
    {
      id: "done",
      iconKey: "Sparkles",
      title: "Fertig!",
      body: "Du kennst jetzt die wichtigsten Bereiche.",
      bullets: ["Navigation unten für den Alltag", "Bei Fragen: Erste Schritte im Menü"],
    },
  ],
  manager: [
    {
      id: "welcome",
      iconKey: "Sparkles",
      title: "Willkommen",
      body: "Kurze Einführung in deine täglichen Aufgaben.",
      bullets: ["Jederzeit überspringbar", "Später erneut unter Einstellungen"],
    },
    {
      id: "dashboard",
      iconKey: "Home",
      title: "Dashboard",
      body: "Starte hier — offene Aufgaben und Kennzahlen.",
      bullets: ["Schnellzugriffe nutzen", "Status-Chips beachten"],
      href: ADMIN_HOME_PATH,
      hrefLabel: "Zum Dashboard",
    },
    {
      id: "anfragen",
      iconKey: "Inbox",
      title: "Anfragen",
      body: "Neue Kontaktanfragen bearbeiten.",
      bullets: ["Status aktualisieren", "Kunden anlegen"],
      permission: "inquiries:write",
      href: "/admin/anfragen",
      hrefLabel: "Zu Anfragen",
    },
    {
      id: "kunden",
      iconKey: "Users",
      title: "Kunden",
      body: "Kundenstamm pflegen und Historie einsehen.",
      bullets: ["E-Mail für Versand hinterlegen", "Notizen für das Team"],
      permission: "crm:read",
      href: "/admin/kunden",
      hrefLabel: "Zu Kunden",
    },
    {
      id: "crm-docs",
      iconKey: "Receipt",
      title: "Angebote & Rechnungen",
      body: "Dokumente erstellen und versenden.",
      bullets: ["PDF vor Versand prüfen", "Status nach Zahlung setzen"],
      permission: "quotes:write",
      href: "/admin/angebote",
      hrefLabel: "Zu Angeboten",
    },
    {
      id: "website",
      iconKey: "Star",
      title: "Website & Bewertungen",
      body: "Inhalte und Kundenstimmen pflegen.",
      bullets: ["Bewertungen freigeben", "Galerie aktuell halten"],
      permission: "website:read",
      href: "/admin/bewertungen",
      hrefLabel: "Zu Bewertungen",
    },
    {
      id: "done",
      iconKey: "Sparkles",
      title: "Fertig!",
      body: "Viel Erfolg im Alltag.",
      bullets: ["Hilfe unter Erste Schritte", "Tutorial jederzeit neu starten"],
    },
  ],
  employee: [
    {
      id: "welcome",
      iconKey: "Sparkles",
      title: "Willkommen",
      body: "Deine wichtigsten Aufgaben als Mitarbeiter.",
      bullets: ["Nur erlaubte Bereiche sichtbar", "Rechte sind geschützt"],
    },
    {
      id: "anfragen",
      iconKey: "Inbox",
      title: "Anfragen",
      body: "Kontaktanfragen prüfen und bearbeiten.",
      bullets: ["Status setzen", "Bei Bedarf archivieren"],
      permission: "inquiries:write",
      href: "/admin/anfragen",
      hrefLabel: "Zu Anfragen",
    },
    {
      id: "kunden",
      iconKey: "Users",
      title: "Kunden",
      body: "Kundendaten pflegen.",
      bullets: ["Aus Anfragen anlegen", "Kontaktinfos aktuell halten"],
      permission: "crm:read",
      href: "/admin/kunden",
      hrefLabel: "Zu Kunden",
    },
    {
      id: "tasks",
      iconKey: "BookOpen",
      title: "Aufgaben & Notizen",
      body: "Interne Notizen helfen beim Team-Workflow.",
      bullets: ["Notizen bei Anfragen nutzen", "Status für alle sichtbar"],
      permission: "inquiries:write",
      href: "/admin/anfragen",
      hrefLabel: "Zu Anfragen",
    },
    {
      id: "done",
      iconKey: "Sparkles",
      title: "Fertig!",
      body: "Du bist startklar.",
      bullets: ["Fragen an deinen Admin", "Tutorial unter Einstellungen"],
    },
  ],
  readonly: [
    {
      id: "welcome",
      iconKey: "Sparkles",
      title: "Willkommen",
      body: "Du hast Lesezugriff — Ansehen ja, Bearbeiten nein.",
      bullets: ["Keine Änderungen möglich", "Rechte werden serverseitig geprüft"],
    },
    {
      id: "overview",
      iconKey: "Home",
      title: "Übersicht ansehen",
      body: "Das Dashboard zeigt Kennzahlen zur Information.",
      bullets: ["Offene Punkte einsehen", "Keine Aktionen nötig"],
      permission: "dashboard:read",
      href: ADMIN_HOME_PATH,
      hrefLabel: "Zum Dashboard",
    },
    {
      id: "areas",
      iconKey: "Layout",
      title: "Bereiche verstehen",
      body: "Navigation führt nur zu erlaubten Seiten.",
      bullets: ["Menü oben links für alles Weitere", "Bei Bedarf Admin kontaktieren"],
    },
    {
      id: "done",
      iconKey: "Sparkles",
      title: "Fertig!",
      body: "Du kannst den Admin jetzt erkunden.",
      bullets: ["Nur Ansicht — kein Speichern", "Fragen an dein Team"],
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

export function getClientOnboardingSteps(
  permissions: string[],
  roleSlug: AdminRoleSlug,
): OnboardingStep[] {
  return filterOnboardingSteps(permissions, roleSlug);
}
