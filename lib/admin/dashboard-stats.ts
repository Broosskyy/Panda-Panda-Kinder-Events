import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { countAdminUsers } from "@/lib/auth/users";
import { listLoginHistory } from "@/lib/auth/login-history";

export interface AdminSecurityDashboard {
  activeUsers: number;
  recentLogins: number;
  systemStatus: "ok" | "degraded" | "legacy";
  multiUserEnabled: boolean;
}

export async function fetchSecurityDashboardStats(): Promise<AdminSecurityDashboard> {
  const multiUserEnabled = (await countAdminUsers()) > 0;
  let activeUsers = multiUserEnabled ? await countAdminUsers() : 1;

  if (multiUserEnabled) {
    const supabase = getSupabaseAdmin();
    const { count } = await supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("active", true);
    activeUsers = count ?? 0;
  }

  let recentLogins = 0;
  try {
    const history = await listLoginHistory(undefined, 20);
    recentLogins = history.filter((h) => h.success).length;
  } catch {
    recentLogins = 0;
  }

  return {
    activeUsers,
    recentLogins,
    systemStatus: multiUserEnabled ? "ok" : "legacy",
    multiUserEnabled,
  };
}
