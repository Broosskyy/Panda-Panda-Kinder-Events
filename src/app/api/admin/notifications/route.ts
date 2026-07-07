import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { fetchAdminNotificationData } from "@/lib/admin/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin("dashboard:read");
  if (authError) return authError;

  try {
    const data = await fetchAdminNotificationData();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ error: "Benachrichtigungen konnten nicht geladen werden." }, { status: 500 });
  }
}
