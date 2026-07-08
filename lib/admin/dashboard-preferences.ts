import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { DashboardPreferences } from "@/lib/admin/dashboard-v2/types";

const PREFS_KEY = "dashboard_user_preferences";

type PrefsStore = Record<string, DashboardPreferences>;

function normalizePrefs(raw: Partial<DashboardPreferences> | undefined): DashboardPreferences {
  return {
    todayCardOrder: Array.isArray(raw?.todayCardOrder) ? raw.todayCardOrder : [],
    quickActionOrder: Array.isArray(raw?.quickActionOrder) ? raw.quickActionOrder : [],
    pinnedTodayCards: Array.isArray(raw?.pinnedTodayCards) ? raw.pinnedTodayCards : [],
    pinnedQuickActions: Array.isArray(raw?.pinnedQuickActions) ? raw.pinnedQuickActions : [],
    hiddenWidgets: Array.isArray(raw?.hiddenWidgets) ? raw.hiddenWidgets : [],
  };
}

async function readStore(): Promise<PrefsStore> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("admin_security_settings")
    .select("value")
    .eq("key", PREFS_KEY)
    .maybeSingle();
  return (data?.value as PrefsStore | undefined) ?? {};
}

export async function getDashboardPreferences(userId: string): Promise<DashboardPreferences> {
  const store = await readStore();
  return normalizePrefs(store[userId]);
}

export async function saveDashboardPreferences(
  userId: string,
  prefs: DashboardPreferences,
): Promise<DashboardPreferences> {
  const supabase = getSupabaseAdmin();
  const store = await readStore();
  const next = normalizePrefs(prefs);
  store[userId] = next;

  await supabase.from("admin_security_settings").upsert({
    key: PREFS_KEY,
    value: store,
    updated_at: new Date().toISOString(),
  });

  return next;
}

