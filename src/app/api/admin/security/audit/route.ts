import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { listAuditLogs } from "@/lib/auth/audit";

export async function GET(request: Request) {
  const authError = await requireAdmin("audit:read");
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") ?? undefined;
  const limit = Number.parseInt(searchParams.get("limit") ?? "100", 10);

  try {
    const logs = await listAuditLogs(limit, area);
    return NextResponse.json({ logs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
