import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { listLoginHistory } from "@/lib/auth/login-history";

export async function GET(request: Request) {
  const authError = await requireAdmin("security:read");
  if (authError) return authError;

  const url = new URL(request.url);
  const filters = {
    userId: url.searchParams.get("userId") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    ipMasked: url.searchParams.get("ip") ?? undefined,
    device: url.searchParams.get("device") ?? undefined,
    success:
      url.searchParams.get("success") === "true"
        ? true
        : url.searchParams.get("success") === "false"
          ? false
          : undefined,
    limit: Number(url.searchParams.get("limit") ?? "100"),
  };

  try {
    const history = await listLoginHistory(filters);
    return NextResponse.json({ history });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
