import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { fetchDashboardStats } from "@/lib/cms/data";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const stats = await fetchDashboardStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Statistiken konnten nicht geladen werden." }, { status: 500 });
  }
}
