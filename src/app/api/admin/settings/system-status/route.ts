import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin-route";
import { getSystemStatus } from "@/lib/admin/system-status";

export async function GET() {
  const { error: authError } = await requireSuperAdmin();
  if (authError) return authError;

  try {
    const status = await getSystemStatus();
    return NextResponse.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Status konnte nicht geladen werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
