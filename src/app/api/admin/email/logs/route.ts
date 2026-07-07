import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { listEmailLogs } from "@/lib/email/log";

export async function GET(request: Request) {
  const authError = await requireAdmin("email:write");
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const logs = await listEmailLogs(limit);
  return NextResponse.json({ logs });
}
