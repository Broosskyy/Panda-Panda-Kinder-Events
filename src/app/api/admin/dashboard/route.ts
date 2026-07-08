import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { fetchAdminAnalyticsDashboard } from "@/lib/analytics/stats";
import { fetchSecurityDashboardStats } from "@/lib/admin/dashboard-stats";
import { fetchAdminNotificationData } from "@/lib/admin/notifications";
import { buildDashboardTasks } from "@/lib/admin/dashboard-tasks";
import { roleDisplayLabel, isActiveRoleSlug } from "@/lib/admin/roles";
import { ROLE_DASHBOARD_HELP, dashboardDescriptionForRole } from "@/lib/admin/role-help";
import type { ActiveAdminRoleSlug } from "@/lib/admin/roles";
import { fetchSiteSettings } from "@/lib/cms/data";
import { listEmailLogs } from "@/lib/email/log";
import { isTestEmailLog } from "@/lib/email/domain-status-copy";

async function hasSuccessfulEmailTest(): Promise<boolean> {
  try {
    const logs = await listEmailLogs(30);
    return logs.some(isTestEmailLog);
  } catch {
    return false;
  }
}

export async function GET() {
  const authError = await requireAdmin("dashboard:read");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const [stats, security, notifications, settings, emailStatus] = await Promise.all([
      fetchAdminAnalyticsDashboard(),
      fetchSecurityDashboardStats(),
      fetchAdminNotificationData(),
      fetchSiteSettings().catch(() => null),
      hasSuccessfulEmailTest(),
    ]);

    const roleSlug = ctx.isLegacy
      ? ("administrator" as ActiveAdminRoleSlug)
      : isActiveRoleSlug(ctx.roleSlug)
        ? ctx.roleSlug
        : ("manager" as ActiveAdminRoleSlug);

    const tasks = buildDashboardTasks({
      permissions: ctx.permissions,
      roleSlug: ctx.isLegacy ? "legacy" : roleSlug,
      period: notifications.period,
      stats,
      security,
      emailTestSucceeded: emailStatus,
      badgeCounts: notifications.counts,
    });

    return NextResponse.json({
      ...stats,
      security,
      user: {
        displayName: ctx.displayName,
        roleSlug,
        roleLabel: roleDisplayLabel(roleSlug, ctx.roleSlug),
      },
      roleHelp: ROLE_DASHBOARD_HELP[roleSlug],
      dashboardDescription: dashboardDescriptionForRole(roleSlug),
      tasks,
      emailTestMode: settings?.email?.testMode?.enabled
        ? { enabled: true, address: settings.email.testMode.testAddress ?? "" }
        : null,
    });
  } catch {
    return NextResponse.json({ error: "Statistiken konnten nicht geladen werden." }, { status: 500 });
  }
}
