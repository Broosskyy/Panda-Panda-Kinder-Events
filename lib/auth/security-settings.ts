import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { LoginPolicy, PasswordPolicy, RateLimitPolicy } from "@/lib/auth/types";

const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireNumber: true,
};

const DEFAULT_LOGIN_POLICY: LoginPolicy = {
  maxAttempts: 5,
  lockoutMinutes: 15,
  sessionHours: 8,
  rememberDays: 30,
};

const DEFAULT_RATE_LIMIT: RateLimitPolicy = {
  loginPerIp: 10,
  windowMinutes: 15,
};

export async function getPasswordPolicy(): Promise<PasswordPolicy> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("admin_security_settings")
    .select("value")
    .eq("key", "password_policy")
    .maybeSingle();
  return { ...DEFAULT_PASSWORD_POLICY, ...(data?.value as Partial<PasswordPolicy> | undefined) };
}

export async function getLoginPolicy(): Promise<LoginPolicy> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("admin_security_settings")
    .select("value")
    .eq("key", "login_policy")
    .maybeSingle();
  return { ...DEFAULT_LOGIN_POLICY, ...(data?.value as Partial<LoginPolicy> | undefined) };
}

export async function getRateLimitPolicy(): Promise<RateLimitPolicy> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("admin_security_settings")
    .select("value")
    .eq("key", "rate_limit")
    .maybeSingle();
  return { ...DEFAULT_RATE_LIMIT, ...(data?.value as Partial<RateLimitPolicy> | undefined) };
}

export async function updateSecuritySettings(input: {
  passwordPolicy?: PasswordPolicy;
  loginPolicy?: LoginPolicy;
  rateLimit?: RateLimitPolicy;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  if (input.passwordPolicy) {
    await supabase.from("admin_security_settings").upsert({
      key: "password_policy",
      value: input.passwordPolicy,
      updated_at: now,
    });
  }
  if (input.loginPolicy) {
    await supabase.from("admin_security_settings").upsert({
      key: "login_policy",
      value: input.loginPolicy,
      updated_at: now,
    });
  }
  if (input.rateLimit) {
    await supabase.from("admin_security_settings").upsert({
      key: "rate_limit",
      value: input.rateLimit,
      updated_at: now,
    });
  }
}

export async function getSecuritySettingsBundle() {
  const [passwordPolicy, loginPolicy, rateLimit] = await Promise.all([
    getPasswordPolicy(),
    getLoginPolicy(),
    getRateLimitPolicy(),
  ]);
  return { passwordPolicy, loginPolicy, rateLimit };
}
