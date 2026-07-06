import { NextResponse } from "next/server";
import { adminHasPermission, resolveAdminContext } from "@/lib/auth/context";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import type { AdminContext } from "@/lib/auth/types";

export async function requireAdmin(permission?: string) {
  const ctx = await resolveAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase nicht konfiguriert." }, { status: 503 });
  }
  if (permission && !adminHasPermission(ctx, permission)) {
    return NextResponse.json({ error: "Keine Berechtigung für diesen Bereich." }, { status: 403 });
  }
  return null;
}

export async function getAdminContext(): Promise<AdminContext | null> {
  return resolveAdminContext();
}
