import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { fetchAdminAnalyticsDashboard } from "@/lib/analytics/stats";
import { fetchSecurityDashboardStats } from "@/lib/admin/dashboard-stats";

export async function GET() {
  const authError = await requireAdmin("dashboard:read");
  if (authError) return authError;

  try {
    const [stats, security] = await Promise.all([
      fetchAdminAnalyticsDashboard(),
      fetchSecurityDashboardStats(),
    ]);
    return NextResponse.json({ ...stats, security });
  } catch {
    return NextResponse.json({ error: "Statistiken konnten nicht geladen werden." }, { status: 500 });
  }
}
