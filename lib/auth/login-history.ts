import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashIp } from "@/lib/auth/crypto";
import { parseUserAgent } from "@/lib/auth/ua";

export async function recordLoginHistory(input: {
  userId?: string;
  identifier: string;
  success: boolean;
  ip: string;
  userAgent: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const ua = parseUserAgent(input.userAgent);

  await supabase.from("admin_login_history").insert({
    user_id: input.userId ?? null,
    identifier_attempt: input.identifier,
    success: input.success,
    ip_hash: hashIp(input.ip),
    user_agent: input.userAgent,
    device_label: ua.device,
    os_label: ua.os,
    browser_label: ua.browser,
  });
}

export async function listLoginHistory(userId?: string, limit = 50) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("admin_login_history")
    .select("id, user_id, identifier_attempt, success, device_label, os_label, browser_label, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
