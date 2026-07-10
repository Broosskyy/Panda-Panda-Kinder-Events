import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { runSafeApi } from "@/lib/api/safe-route";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return runSafeApi(async () => {
    const authError = await requireAdmin("crm:read");
    if (authError) return authError;

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("booking_requests").select("*").eq("id", id).maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({ booking: data });
  }, "Anfrage konnte nicht geladen werden.");
}
