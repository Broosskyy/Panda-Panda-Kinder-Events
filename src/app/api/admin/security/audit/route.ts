import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { listAuditLogs } from "@/lib/auth/audit";
import type { AuditLogFilters } from "@/lib/auth/types";

function parseFilters(searchParams: URLSearchParams): AuditLogFilters {
  return {
    limit: Number.parseInt(searchParams.get("limit") ?? "100", 10),
    area: searchParams.get("area") ?? undefined,
    action: searchParams.get("action") ?? undefined,
    userId: searchParams.get("userId") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  };
}

export async function GET(request: Request) {
  const authError = await requireAdmin("audit:read");
  if (authError) return authError;

  const { searchParams } = new URL(request.url);

  try {
    const logs = await listAuditLogs(parseFilters(searchParams));
    return NextResponse.json({ logs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
