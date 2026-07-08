import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AdminContext, AuditLogFilters, AuditLogInput } from "@/lib/auth/types";

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
      ip_address: input.ipAddress ?? null,
      user_agent: input.userAgent ?? null,
    });
  } catch {
    // Audit failures must not break primary operations
  }
}

export async function writeAuditLogFromRequest(
  ctx: AdminContext | null,
  request: Request,
  input: Omit<AuditLogInput, "ipAddress" | "userAgent">,
): Promise<void> {
  await writeAuditLog(ctx, {
    ...input,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
  });
}

export async function listAuditLogs(filters: AuditLogFilters = {}) {
  const supabase = getSupabaseAdmin();
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 1000);

  let query = supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.area) query = query.eq("area", filters.area);
  if (filters.action) query = query.ilike("action", `%${filters.action}%`);
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);
  if (filters.search?.trim()) {
    const term = filters.search.trim();
    query = query.or(
      `user_display_name.ilike.%${term}%,action.ilike.%${term}%,area.ilike.%${term}%,entity_id.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function auditLogsToCsv(logs: Array<Record<string, unknown>>): string {
  const headers = [
    "created_at",
    "user_display_name",
    "role_slug",
    "action",
    "area",
    "entity_id",
    "success",
    "ip_address",
    "user_agent",
    "error_message",
  ];
  const rows = logs.map((log) =>
    headers
      .map((h) => {
        const val = log[h];
        const str = val == null ? "" : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}
