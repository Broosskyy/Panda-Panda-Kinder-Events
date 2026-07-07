import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashIp } from "@/lib/auth/crypto";
import { parseUserAgent } from "@/lib/auth/ua";

export interface LoginHistoryRow {
  id: string;
  user_id: string | null;
  identifier_attempt: string | null;
  success: boolean;
  device_label: string | null;
  os_label: string | null;
  browser_label: string | null;
  created_at: string;
  user_display_name?: string | null;
}

export async function recordLoginHistory(input: {
  userId?: string;
  identifier: string;
  success: boolean;
  ip: string;
  userAgent: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const ua = parseUserAgent(input.userAgent);

  const { error } = await supabase.from("admin_login_history").insert({
    user_id: input.userId ?? null,
    identifier_attempt: input.identifier,
    success: input.success,
    ip_hash: hashIp(input.ip),
    user_agent: input.userAgent,
    device_label: ua.device,
    os_label: ua.os,
    browser_label: ua.browser,
  });

  if (error) {
    console.error("[login-history] insert failed:", error.message);
  }
}

export async function listLoginHistory(userId?: string, limit = 50): Promise<LoginHistoryRow[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("admin_login_history")
    .select(
      "id, user_id, identifier_attempt, success, device_label, os_label, browser_label, created_at, admin_users(display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const users = row.admin_users as { display_name?: string } | { display_name?: string }[] | null;
    const userDisplay =
      users && !Array.isArray(users) ? users.display_name : Array.isArray(users) ? users[0]?.display_name : null;

    return {
      id: row.id,
      user_id: row.user_id,
      identifier_attempt: row.identifier_attempt,
      success: row.success,
      device_label: row.device_label,
      os_label: row.os_label,
      browser_label: row.browser_label,
      created_at: row.created_at,
      user_display_name: userDisplay ?? null,
    };
  });
}
