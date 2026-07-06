import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AdminContext, AuditLogInput } from "@/lib/auth/types";

export async function writeAuditLog(ctx: AdminContext | null, input: AuditLogInput): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("admin_audit_logs").insert({
      user_id: ctx?.userId ?? null,
      user_display_name: ctx?.displayName ?? "System",
      role_slug: ctx?.roleSlug ?? null,
      action: input.action,
      area: input.area,
      entity_id: input.entityId ?? null,
      before_json: input.before ?? null,
      after_json: input.after ?? null,
      success: input.success ?? true,
      error_message: input.errorMessage ?? null,
    });
  } catch {
    // Audit failures must not break primary operations
  }
}

export async function listAuditLogs(limit = 100, area?: string) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (area) query = query.eq("area", area);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
