import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { fetchCmsDebugSnapshot } from "@/lib/cms/data";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const snapshot = await fetchCmsDebugSnapshot();
    return NextResponse.json(snapshot);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Debug-Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
