import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { listLoginHistory } from "@/lib/auth/login-history";

export async function GET() {
  const authError = await requireAdmin("security:read");
  if (authError) return authError;

  try {
    const history = await listLoginHistory(undefined, 100);
    return NextResponse.json({ history });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
