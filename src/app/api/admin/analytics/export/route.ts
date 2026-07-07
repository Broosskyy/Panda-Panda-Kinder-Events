import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { analyticsToCsv, fetchFullAnalyticsDashboard } from "@/lib/analytics/full-stats";

export async function GET() {
  const authError = await requireAdmin("analytics:read");
  if (authError) return authError;

  try {
    const data = await fetchFullAnalyticsDashboard();
    const csv = analyticsToCsv(data);
    const filename = `panda-bande-analytics-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export fehlgeschlagen." }, { status: 500 });
  }
}
