import { hasPermission } from "@/lib/auth/permissions";
import type { AdminSecurityDashboard } from "@/lib/admin/dashboard-stats";
import type { AdminNotificationPeriodCounts } from "@/lib/admin/notifications";
import type { AdminAnalyticsDashboard } from "@/lib/analytics/types";
import type { RoleHelpItem } from "@/lib/admin/role-help";
import { ROLE_DASHBOARD_HELP } from "@/lib/admin/role-help";
import type { ActiveAdminRoleSlug } from "@/lib/admin/roles";
import { isActiveRoleSlug } from "@/lib/admin/roles";
import type {
  DashboardSessionMeta,
  DashboardStatItem,
  DashboardStatusChip,
  DashboardTodayCard,
  DashboardV2Payload,
} from "@/lib/admin/dashboard-v2/types";

interface BuildDashboardV2Input {
  permissions: string[];
  roleSlug: string;
  period: AdminNotificationPeriodCounts;
  stats: AdminAnalyticsDashboard | null;
  security: AdminSecurityDashboard | null;
  badgeCounts: { bookings: number; reviews: number; customers: number; emails: number };
  sessionMeta: DashboardSessionMeta;
  emailTestMode: { enabled: boolean; address: string } | null;
}

function allowed(permissions: string[], permission: string): boolean {
  return hasPermission(permissions, permission);
}

export function buildStatusChips(input: BuildDashboardV2Input): DashboardStatusChip[] {
  const chips: DashboardStatusChip[] = [];
  const { permissions, security, period, badgeCounts } = input;

  if (security && allowed(permissions, "settings:system")) {
    const tone =
      security.systemStatus === "ok" ? "success" : security.systemStatus === "warn" ? "warning" : "danger";
    chips.push({
      id: "system",
      label: security.systemStatus === "ok" ? "System OK" : security.systemStatusLabel,
      tone,
      href: "/admin/einstellungen?tab=system",
    });
  }

  if (allowed(permissions, "crm:read") && period.customersLeads > 0) {
    chips.push({
      id: "leads",
      label: `${period.customersLeads} offene Interessenten`,
      tone: "warning",
      href: "/admin/kunden",
    });
  }

  if (allowed(permissions, "invoices:write") && (input.stats?.crm.openInvoicesCount ?? 0) > 0) {
    chips.push({
      id: "invoices",
      label: `${input.stats?.crm.openInvoicesCount} Rechnung${(input.stats?.crm.openInvoicesCount ?? 0) === 1 ? "" : "en"} offen`,
      tone: "warning",
      href: "/admin/rechnungen",
    });
  }

  if (allowed(permissions, "reviews:write") && (period.reviewsPending > 0 || badgeCounts.reviews > 0)) {
    const count = Math.max(period.reviewsPending, badgeCounts.reviews);
    chips.push({
      id: "reviews",
      label: count === 1 ? "Neue Bewertung" : `${count} neue Bewertungen`,
      tone: "info",
      href: "/admin/bewertungen",
    });
  }

  if (input.emailTestMode?.enabled && allowed(permissions, "settings:system")) {
    chips.push({
      id: "email-test",
      label: "E-Mail Testmodus aktiv",
      tone: "warning",
      href: "/admin/einstellungen?tab=email&emailTab=testmode",
    });
  }

  return chips.slice(0, 4);
}

export function buildTodayCards(input: BuildDashboardV2Input): DashboardTodayCard[] {
  const { permissions, period, stats, security, badgeCounts } = input;
  const cards: DashboardTodayCard[] = [];

  if (allowed(permissions, "inquiries:write")) {
    cards.push({
      id: "inquiries-new",
      label: "Neue Anfragen",
      value: badgeCounts.bookings,
      href: "/admin/anfragen",
      tone: badgeCounts.bookings > 0 ? "warning" : "muted",
    });
  }

  if (allowed(permissions, "invoices:write")) {
    const open = stats?.crm.openInvoicesCount ?? 0;
    cards.push({
      id: "invoices-open",
      label: "Offene Rechnungen",
      value: open,
      href: "/admin/rechnungen",
      tone: open > 0 ? "warning" : "muted",
    });
  }

  if (allowed(permissions, "reviews:write")) {
    const pending = Math.max(period.reviewsPending, badgeCounts.reviews);
    cards.push({
      id: "reviews-pending",
      label: "Neue Bewertungen",
      value: pending,
      href: "/admin/bewertungen",
      tone: pending > 0 ? "info" : "muted",
    });
  }

  if (allowed(permissions, "crm:read")) {
    cards.push({
      id: "customers-leads",
      label: "Interessenten",
      value: period.customersLeads,
      href: "/admin/kunden",
      tone: period.customersLeads > 0 ? "warning" : "muted",
    });
  }

  if (allowed(permissions, "settings:system") && security && security.systemStatus !== "ok") {
    cards.push({
      id: "system-warnings",
      label: "Systemwarnungen",
      value: security.systemStatus === "error" ? "Kritisch" : "Hinweise",
      href: "/admin/einstellungen?tab=system",
      tone: security.systemStatus === "error" ? "danger" : "warning",
    });
  }

  return cards.slice(0, 5);
}

export function buildStatsGrid(input: BuildDashboardV2Input): DashboardStatItem[] {
  const { permissions, period, stats } = input;
  const items: DashboardStatItem[] = [];
  const statsMissing = Boolean(stats && (!stats.trackingEnabled || stats.trackingTableReady === false));

  if (allowed(permissions, "analytics:read") && stats) {
    items.push({
      id: "visitors",
      label: "Besucher",
      value: statsMissing ? "—" : stats.visitors.today,
      href: "/admin/analytics",
    });
  }

  if (allowed(permissions, "inquiries:write")) {
    items.push({
      id: "inquiries",
      label: "Anfragen",
      value: period.bookingsTotal,
      href: "/admin/anfragen",
    });
  }

  if (allowed(permissions, "quotes:write")) {
    items.push({
      id: "quotes",
      label: "Angebote",
      value: stats?.crm.openQuotesCount ?? 0,
      href: "/admin/angebote",
    });
  }

  if (allowed(permissions, "invoices:write")) {
    items.push({
      id: "invoices",
      label: "Rechnungen",
      value: stats?.crm.openInvoicesCount ?? 0,
      href: "/admin/rechnungen",
    });
  }

  if (allowed(permissions, "reviews:write")) {
    items.push({
      id: "reviews",
      label: "Bewertungen",
      value: period.reviewsTotal,
      href: "/admin/bewertungen",
    });
  }

  if (allowed(permissions, "crm:read")) {
    items.push({
      id: "customers",
      label: "Kunden",
      value: stats?.crm.customersCount ?? 0,
      href: "/admin/kunden",
    });
  }

  return items;
}

export function buildDashboardV2Payload(input: BuildDashboardV2Input): DashboardV2Payload {
  const role = isActiveRoleSlug(input.roleSlug) ? input.roleSlug : "manager";
  const roleHelp: RoleHelpItem[] = ROLE_DASHBOARD_HELP[role as ActiveAdminRoleSlug] ?? [];

  return {
    sessionMeta: input.sessionMeta,
    statusChips: buildStatusChips(input),
    todayCards: buildTodayCards(input),
    stats: buildStatsGrid(input),
    roleHelp,
    emailTestMode: input.emailTestMode,
  };
}
