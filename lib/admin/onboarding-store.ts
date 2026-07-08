import { getSupabaseAdmin } from "@/lib/supabase/admin";

const FALLBACK_KEY = "admin_onboarding_completed";

type FallbackStore = Record<string, string>;

async function readFallbackStore(): Promise<FallbackStore> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("admin_security_settings")
    .select("value")
    .eq("key", FALLBACK_KEY)
    .maybeSingle();
  return (data?.value as FallbackStore | undefined) ?? {};
}

async function writeFallbackStore(store: FallbackStore): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("admin_security_settings").upsert({
    key: FALLBACK_KEY,
    value: store,
    updated_at: new Date().toISOString(),
  });
}

export async function getOnboardingCompletedAt(userId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_users")
    .select("onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle();

  if (!error) {
    return (data?.onboarding_completed_at as string | null) ?? null;
  }

  console.warn("getOnboardingCompletedAt column fallback:", error.message);
  const store = await readFallbackStore();
  return store[userId] ?? null;
}

export async function setOnboardingCompleted(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("admin_users")
    .update({
      onboarding_completed_at: now,
      updated_at: now,
    })
    .eq("id", userId);

  if (!error) return;

  console.warn("setOnboardingCompleted column fallback:", error.message);
  const store = await readFallbackStore();
  store[userId] = now;
  await writeFallbackStore(store);
}

export async function resetOnboarding(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("admin_users")
    .update({
      onboarding_completed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (!error) {
    const store = await readFallbackStore();
    delete store[userId];
    await writeFallbackStore(store);
    return;
  }

  const store = await readFallbackStore();
  delete store[userId];
  await writeFallbackStore(store);
}
