import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { countAdminUsers } from "@/lib/auth/users";
import { listLoginHistory } from "@/lib/auth/login-history";
import { getSystemStatus } from "@/lib/admin/system-status";
import type { SystemStatusLevel } from "@/lib/admin/system-status";

export interface AdminSecurityDashboard {
  activeUsers: number;
  recentLogins: number;
  systemStatus: SystemStatusLevel;
  systemStatusLabel: string;
  multiUserEnabled: boolean;
}

const SYSTEM_STATUS_LABELS: Record<SystemStatusLevel, string> = {
  ok: "Alles OK",
  warn: "Hinweise",
  error: "Achtung",
};

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

  let systemStatus: SystemStatusLevel = "warn";
  try {
    const health = await getSystemStatus();
    systemStatus = health.overall;
  } catch {
    systemStatus = "warn";
  }

  return {
    activeUsers,
    recentLogins,
    systemStatus,
    systemStatusLabel: SYSTEM_STATUS_LABELS[systemStatus],
    multiUserEnabled,
  };
}
