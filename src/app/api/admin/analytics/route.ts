import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { fetchFullAnalyticsDashboard } from "@/lib/analytics/full-stats";

export async function GET() {
  const authError = await requireAdmin("analytics:read");
  if (authError) return authError;

  try {
    const analytics = await fetchFullAnalyticsDashboard();
    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json({ error: "Analytics konnten nicht geladen werden." }, { status: 500 });
  }
}
