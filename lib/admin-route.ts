import { NextResponse } from "next/server";
import { adminHasPermission, resolveAdminContext } from "@/lib/auth/context";
import { isSuperAdmin } from "@/lib/auth/critical-action";
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
    return NextResponse.json(
      { error: "Du hast für diesen Bereich keine Berechtigung." },
      { status: 403 },
    );
  }
  return null;
}

export async function requireSuperAdmin() {
  const ctx = await resolveAdminContext();
  if (!ctx) {
    return { error: NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 }), ctx: null };
  }
  if (!isSuperAdmin(ctx)) {
    return {
      error: NextResponse.json(
        { error: "Nur Super Admins dürfen diese Einstellung ändern." },
        { status: 403 },
      ),
      ctx: null,
    };
  }
  return { error: null, ctx };
}

export async function getAdminContext(): Promise<AdminContext | null> {
  return resolveAdminContext();
}
