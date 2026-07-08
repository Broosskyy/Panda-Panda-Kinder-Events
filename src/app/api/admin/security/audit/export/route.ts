import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { listAuditLogs, auditLogsToCsv, writeAuditLogFromRequest } from "@/lib/auth/audit";
import { parseCriticalBody, verifyCriticalConfirmation } from "@/lib/auth/critical-action";
import type { AuditLogFilters } from "@/lib/auth/types";

function parseFilters(searchParams: URLSearchParams): AuditLogFilters {
  return {
    limit: Math.min(Number.parseInt(searchParams.get("limit") ?? "1000", 10), 5000),
    area: searchParams.get("area") ?? undefined,
    action: searchParams.get("action") ?? undefined,
    userId: searchParams.get("userId") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  };
}

export async function POST(request: Request) {
  const authError = await requireAdmin("audit:export");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const critical = await verifyCriticalConfirmation(ctx, parseCriticalBody(body));
  if (!critical.ok) return critical.response;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "json" ? "json" : "csv";

  try {
    const logs = await listAuditLogs(parseFilters(searchParams));

    await writeAuditLogFromRequest(ctx, request, {
      action: "audit_export",
      area: "audit",
      after: { format, count: logs.length },
    });

    if (format === "json") {
      return new NextResponse(JSON.stringify(logs, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="aktivitaetsprotokoll.json"',
        },
      });
    }

    return new NextResponse(auditLogsToCsv(logs as Array<Record<string, unknown>>), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="aktivitaetsprotokoll.csv"',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
