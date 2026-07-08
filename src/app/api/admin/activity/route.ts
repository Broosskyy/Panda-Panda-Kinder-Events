import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { fetchAdminRecentActivity } from "@/lib/admin/activity";

export async function GET() {
  const authError = await requireAdmin("dashboard:read");
  if (authError) return authError;

  try {
    const activity = await fetchAdminRecentActivity();
    return NextResponse.json({ activity });
  } catch {
    return NextResponse.json({ error: "Aktivitäten konnten nicht geladen werden." }, { status: 500 });
  }
}
