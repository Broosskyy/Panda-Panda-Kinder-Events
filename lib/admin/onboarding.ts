import { hasPermission } from "@/lib/auth/permissions";
import type { AdminRoleSlug } from "@/lib/auth/types";

export interface OnboardingStep {
  id: string;
  title: string;
  body: string;
  /** Required permission slug — step hidden if user lacks access */
  permission?: string;
  /** Optional role gate (e.g. super-admin-only steps) */
  roles?: AdminRoleSlug[];
  href?: string;
  hrefLabel?: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Willkommen im Panda-Bande Admin",
    body: "In wenigen Schritten zeigen wir dir die wichtigsten Bereiche. Du kannst jederzeit überspringen oder das Tutorial später erneut starten.",
  },
  {
    id: "dashboard",
    title: "Dashboard verstehen",
    body: "Die Übersicht zeigt offene Aufgaben, Kennzahlen und Schnellzugriffe. Starte hier jeden Tag.",
    permission: "dashboard:read",
    href: "/admin",
    hrefLabel: "Zum Dashboard",
  },
  {
    id: "anfragen",
    title: "Anfragen bearbeiten",
    body: "Neue Kontaktanfragen prüfen, Status setzen und bei Bedarf Kunden anlegen.",
    permission: "inquiries:write",
    href: "/admin/anfragen",
    hrefLabel: "Zu Anfragen",
  },
  {
    id: "kunden",
    title: "Kunden verwalten",
    body: "Kundenstamm pflegen — Grundlage für Angebote, Rechnungen und E-Mail-Versand.",
    permission: "crm:read",
    href: "/admin/kunden",
    hrefLabel: "Zu Kunden",
  },
  {
    id: "angebote",
    title: "Angebote erstellen",
    body: "Kunde wählen, Positionen erfassen, PDF prüfen und per E-Mail versenden.",
    permission: "quotes:write",
    href: "/admin/angebote",
    hrefLabel: "Zu Angeboten",
  },
  {
    id: "rechnungen",
    title: "Rechnungen senden",
    body: "Rechnungen aus Angeboten erzeugen, Status pflegen und PDFs versenden.",
    permission: "invoices:write",
    href: "/admin/rechnungen",
    hrefLabel: "Zu Rechnungen",
  },
  {
    id: "galerie",
    title: "Galerie & Website ändern",
    body: "Eventfotos hochladen und Website-Inhalte anpassen — Änderungen erscheinen live.",
    permission: "gallery:write",
    href: "/admin/galerie",
    hrefLabel: "Zur Galerie",
  },
  {
    id: "bewertungen",
    title: "Bewertungen freigeben",
    body: "Neue Bewertungen prüfen und freigeben — erst dann sind sie öffentlich sichtbar.",
    permission: "reviews:write",
    href: "/admin/bewertungen",
    hrefLabel: "Zu Bewertungen",
  },
  {
    id: "sicherheit",
    title: "Sicherheit & Benutzer",
    body: "Admin-Zugänge, Rollen und Sicherheitseinstellungen verwalten.",
    permission: "users:read",
    roles: ["administrator"],
    href: "/admin/sicherheit/benutzer",
    hrefLabel: "Zu Benutzer & Rollen",
  },
  {
    id: "audit",
    title: "Aktivitätsprotokoll",
    body: "Nachvollziehen, wer im Admin was geändert hat — nur für Super Admins.",
    permission: "audit:read",
    roles: ["administrator"],
    href: "/admin/sicherheit/audit",
    hrefLabel: "Zum Protokoll",
  },
  {
    id: "readonly-hint",
    title: "Nur-Lesen-Ansicht",
    body: "Deine Rolle erlaubt das Ansehen von Bereichen. Bearbeiten ist nur für berechtigte Rollen möglich — Rechte werden serverseitig geschützt.",
    roles: ["readonly"],
  },
  {
    id: "done",
    title: "Fertig!",
    body: "Du kennst jetzt die wichtigsten Bereiche. Nutze die Navigation unten oder das Menü oben links für alles Weitere.",
  },
];

export function filterOnboardingSteps(
  permissions: string[],
  roleSlug: AdminRoleSlug,
): OnboardingStep[] {
  return ONBOARDING_STEPS.filter((step) => {
    if (step.roles && !step.roles.includes(roleSlug)) return false;
    if (step.id === "readonly-hint" && roleSlug !== "readonly") return false;
    if (step.permission && !hasPermission(permissions, step.permission)) return false;
    return true;
  });
}
