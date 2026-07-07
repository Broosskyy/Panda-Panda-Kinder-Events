import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getEmailSystemStatus } from "@/lib/admin/email-system-status";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const status = await getEmailSystemStatus();
  return NextResponse.json(status);
}
