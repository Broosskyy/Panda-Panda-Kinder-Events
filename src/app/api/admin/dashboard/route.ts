import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { fetchAdminAnalyticsDashboard } from "@/lib/analytics/stats";
import { fetchSecurityDashboardStats } from "@/lib/admin/dashboard-stats";
import { fetchAdminNotificationData } from "@/lib/admin/notifications";
import { buildDashboardV2Payload } from "@/lib/admin/dashboard-v2/build-payload";
import { getDashboardPreferences } from "@/lib/admin/dashboard-preferences";
import { roleDisplayLabel, isActiveRoleSlug } from "@/lib/admin/roles";
import { fetchSiteSettings } from "@/lib/cms/data";
import { getUserById } from "@/lib/auth/users";
import { getSessionByToken, getSessionTokenFromCookies } from "@/lib/auth/session";

export async function GET() {
  const authError = await requireAdmin("dashboard:read");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const [stats, security, notifications, settings] = await Promise.all([
      fetchAdminAnalyticsDashboard(),
      fetchSecurityDashboardStats(),
      fetchAdminNotificationData(),
      fetchSiteSettings().catch(() => null),
    ]);

    const roleSlug = isActiveRoleSlug(ctx.roleSlug) ? ctx.roleSlug : "manager";

    const sessionToken = await getSessionTokenFromCookies();
    const session = sessionToken ? await getSessionByToken(sessionToken) : null;
    const user = await getUserById(ctx.userId);
    const preferences = await getDashboardPreferences(ctx.userId);

    const v2 = buildDashboardV2Payload({
      permissions: ctx.permissions,
      roleSlug,
      period: notifications.period,
      stats,
      security,
      badgeCounts: notifications.counts,
      sessionMeta: {
        lastLoginAt: user?.last_login ?? null,
        sessionStartedAt: session?.created_at ?? null,
        lastActivityAt: session?.last_active_at ?? null,
      },
      emailTestMode: settings?.email?.testMode?.enabled
        ? { enabled: true, address: settings.email.testMode.testAddress ?? "" }
        : null,
    });

    return NextResponse.json({
      user: {
        displayName: ctx.displayName,
        roleSlug,
        roleLabel: roleDisplayLabel(roleSlug, ctx.roleSlug),
      },
      v2,
      preferences,
    });
  } catch {
    return NextResponse.json({ error: "Statistiken konnten nicht geladen werden." }, { status: 500 });
  }
}
