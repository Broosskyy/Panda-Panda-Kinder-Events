import { hasPermission } from "@/lib/auth/permissions";
import type { AdminSecurityDashboard } from "@/lib/admin/dashboard-stats";
import type { AdminNotificationPeriodCounts } from "@/lib/admin/notifications";
import type { AdminAnalyticsDashboard } from "@/lib/analytics/types";
import type { ActiveAdminRoleSlug } from "@/lib/admin/roles";
import { isActiveRoleSlug } from "@/lib/admin/roles";

export interface DashboardTaskCard {
  id: string;
  label: string;
  value: number | string;
  href: string;
  sublabel: string;
  highlight: boolean;
  iconKey: string;
  permission: string;
  section: "today" | "crm" | "security" | "stats" | "modules";
}

export interface DashboardModuleLink {
  href: string;
  label: string;
  permission: string;
}

interface BuildDashboardTasksInput {
  permissions: string[];
  roleSlug: ActiveAdminRoleSlug | "legacy";
  period: AdminNotificationPeriodCounts;
  stats: AdminAnalyticsDashboard | null;
  security: AdminSecurityDashboard | null;
  emailTestSucceeded: boolean;
  badgeCounts: { bookings: number; reviews: number; customers: number; emails: number };
}

function allowed(permissions: string[], permission: string): boolean {
  return hasPermission(permissions, permission);
}

function emptySublabel(count: number, active: string, done = "Alles erledigt."): string {
  return count > 0 ? active : done;
}

export function buildDashboardTasks(input: BuildDashboardTasksInput): DashboardTaskCard[] {
  const { permissions, roleSlug, period, stats, security, emailTestSucceeded, badgeCounts } = input;
  const tasks: DashboardTaskCard[] = [];
  const role = roleSlug === "legacy" || !isActiveRoleSlug(roleSlug) ? "administrator" : roleSlug;

  if (allowed(permissions, "inquiries:write")) {
    tasks.push({
      id: "inquiries-new",
      label: "Neue Anfragen",
      value: badgeCounts.bookings,
      href: "/admin/anfragen",
      sublabel: emptySublabel(badgeCounts.bookings, `${badgeCounts.bookings} unbearbeitet`),
      highlight: badgeCounts.bookings > 0,
      iconKey: "Inbox",
      permission: "inquiries:write",
      section: "today",
    });
  }

  if (allowed(permissions, "reviews:write")) {
    tasks.push({
      id: "reviews-pending",
      label: "Bewertungen prüfen",
      value: period.reviewsPending,
      href: "/admin/bewertungen",
      sublabel: emptySublabel(period.reviewsPending, "Wartet auf Freigabe", "Keine offenen"),
      highlight: period.reviewsPending > 0,
      iconKey: "Star",
      permission: "reviews:write",
      section: "today",
    });
  }

  if (allowed(permissions, "quotes:write")) {
    tasks.push({
      id: "quotes-open",
      label: "Offene Angebote",
      value: stats?.crm.openQuotesCount ?? 0,
      href: "/admin/angebote",
      sublabel: emptySublabel(stats?.crm.openQuotesCount ?? 0, "Offen im CRM", "Alles erledigt."),
      highlight: (stats?.crm.openQuotesCount ?? 0) > 0,
      iconKey: "FileText",
      permission: "quotes:write",
      section: "today",
    });
  }

  if (allowed(permissions, "invoices:write")) {
    tasks.push({
      id: "invoices-open",
      label: "Offene Rechnungen",
      value: stats?.crm.openInvoicesCount ?? 0,
      href: "/admin/rechnungen",
      sublabel: emptySublabel(stats?.crm.openInvoicesCount ?? 0, "Offen im CRM", "Alles erledigt."),
      highlight: (stats?.crm.openInvoicesCount ?? 0) > 0,
      iconKey: "Receipt",
      permission: "invoices:write",
      section: "today",
    });
  }

  if (allowed(permissions, "customers:write") && role === "employee") {
    tasks.push({
      id: "customers-leads",
      label: "Interessenten",
      value: period.customersLeads,
      href: "/admin/kunden",
      sublabel: emptySublabel(period.customersLeads, "Unbearbeitete Kontakte"),
      highlight: period.customersLeads > 0,
      iconKey: "Users",
      permission: "customers:write",
      section: "today",
    });
  }

  if (allowed(permissions, "settings:system") && role === "administrator") {
    tasks.push({
      id: "email-status",
      label: "E-Mail-Status",
      value: emailTestSucceeded ? "Funktioniert" : "Prüfen",
      href: "/admin/einstellungen?tab=email",
      sublabel: emailTestSucceeded ? "Testmail erfolgreich" : "Testmail empfohlen",
      highlight: !emailTestSucceeded,
      iconKey: "Mail",
      permission: "settings:system",
      section: "today",
    });
  } else if (allowed(permissions, "email:write") && role === "manager") {
    tasks.push({
      id: "email-templates",
      label: "E-Mail-Vorlagen",
      value: "Prüfen",
      href: "/admin/einstellungen?tab=email",
      sublabel: "Vorlagen und Signatur pflegen",
      highlight: false,
      iconKey: "Mail",
      permission: "email:write",
      section: "today",
    });
  }

  if (allowed(permissions, "settings:system") && security) {
    tasks.push({
      id: "system-status",
      label: "Systemstatus",
      value: security.systemStatusLabel,
      href: "/admin/einstellungen?tab=system",
      sublabel:
        security.systemStatus === "ok"
          ? "Alle wichtigen Prüfungen bestanden"
          : security.systemStatus === "warn"
            ? "Einige Hinweise vorhanden"
            : "Kritische Punkte offen",
      highlight: security.systemStatus === "error",
      iconKey: "Shield",
      permission: "settings:system",
      section: "security",
    });
  }

  if (allowed(permissions, "users:read") && security) {
    tasks.push({
      id: "active-users",
      label: "Aktive Benutzer",
      value: security.activeUsers,
      href: "/admin/sicherheit/benutzer",
      sublabel: "Benutzer & Rollen verwalten",
      highlight: false,
      iconKey: "Users",
      permission: "users:read",
      section: "security",
    });
  }

  if (allowed(permissions, "security:read") && security) {
    tasks.push({
      id: "recent-logins",
      label: "Letzte Logins",
      value: security.recentLogins,
      href: "/admin/sicherheit",
      sublabel: "Sicherheitsübersicht",
      highlight: false,
      iconKey: "Shield",
      permission: "security:read",
      section: "security",
    });
  }

  if (allowed(permissions, "audit:read") && role === "administrator") {
    tasks.push({
      id: "audit-logs",
      label: "Aktivitätsprotokoll",
      value: "Prüfen",
      href: "/admin/sicherheit/audit",
      sublabel: "Letzte Änderungen im System",
      highlight: false,
      iconKey: "ScrollText",
      permission: "audit:read",
      section: "security",
    });
  }

  if (allowed(permissions, "crm:read")) {
    tasks.push({
      id: "crm-customers",
      label: "Kunden",
      value: stats?.crm.customersCount ?? 0,
      href: "/admin/kunden",
      sublabel: "CRM-Übersicht",
      highlight: false,
      iconKey: "Users",
      permission: "crm:read",
      section: "crm",
    });
  }

  if (allowed(permissions, "analytics:read") && stats) {
    const statsMissing = !stats.trackingEnabled || stats.trackingTableReady === false;
    tasks.push({
      id: "visitors-today",
      label: "Besucher heute",
      value: statsMissing ? "—" : stats.visitors.today,
      href: "/admin/analytics",
      sublabel: statsMissing ? "Statistik nicht aktiv" : "Besucherstatistik",
      highlight: false,
      iconKey: "BarChart3",
      permission: "analytics:read",
      section: "stats",
    });
  }

  if (allowed(permissions, "website:read") && role === "readonly") {
    tasks.push({
      id: "website-overview",
      label: "Website",
      value: "Ansehen",
      href: "/",
      sublabel: "Öffentliche Seite öffnen",
      highlight: false,
      iconKey: "Image",
      permission: "website:read",
      section: "today",
    });
  }

  return tasks;
}

export const DASHBOARD_MODULE_LINKS: DashboardModuleLink[] = [
  { href: "/admin/kunden", label: "Kunden & CRM", permission: "crm:read" },
  { href: "/admin/angebote", label: "Angebote", permission: "quotes:write" },
  { href: "/admin/inhalte", label: "Website-Inhalte", permission: "website:write" },
  { href: "/admin/analytics", label: "Besucherstatistik", permission: "analytics:read" },
];

export function filterDashboardModuleLinks(
  permissions: string[],
): DashboardModuleLink[] {
  return DASHBOARD_MODULE_LINKS.filter((link) => hasPermission(permissions, link.permission));
}
