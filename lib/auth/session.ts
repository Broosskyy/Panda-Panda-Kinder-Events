import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sha256, randomToken } from "@/lib/auth/crypto";
import { getLoginPolicy } from "@/lib/auth/security-settings";
import { parseUserAgent } from "@/lib/auth/ua";
import type { AdminSession } from "@/lib/auth/types";

export const SESSION_COOKIE = "pb_admin_session";
export const PENDING_2FA_COOKIE = "pb_admin_2fa_pending";

export async function createSession(input: {
  userId: string;
  userAgent: string | null;
  ip: string;
  rememberDays?: number;
  trustedDays?: number;
}): Promise<{ token: string; session: AdminSession; maxAgeSec: number }> {
  const supabase = getSupabaseAdmin();
  const policy = await getLoginPolicy();
  const token = randomToken(48);
  const tokenHash = sha256(token);
  const now = new Date();
  const rememberDays = input.rememberDays ?? policy.sessionHours / 24;
  const expiresAt = new Date(
    now.getTime() + (input.rememberDays ? rememberDays * 24 * 60 * 60 * 1000 : policy.sessionHours * 60 * 60 * 1000),
  );

  const ua = parseUserAgent(input.userAgent);
  const trustedUntil =
    input.trustedDays && input.trustedDays > 0
      ? new Date(now.getTime() + input.trustedDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const { data, error } = await supabase
    .from("admin_sessions")
    .insert({
      user_id: input.userId,
      token_hash: tokenHash,
      user_agent: input.userAgent,
      device_label: `${ua.browser} · ${ua.device}`,
      ip_hash: sha256(input.ip),
      trusted_until: trustedUntil,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const maxAgeSec = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
  return { token, session: data as AdminSession, maxAgeSec };
}

export async function getSessionByToken(token: string): Promise<AdminSession | null> {
  const supabase = getSupabaseAdmin();
  const tokenHash = sha256(token);
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("*")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;
  return data as AdminSession;
}

export async function touchSession(sessionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("admin_sessions")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", sessionId);
}

export async function rotateSessionToken(sessionId: string, userId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const newToken = randomToken(48);
  const tokenHash = sha256(newToken);
  await supabase.from("admin_sessions").update({ token_hash: tokenHash }).eq("id", sessionId).eq("user_id", userId);
  return newToken;
}

export async function listUserSessions(userId: string): Promise<AdminSession[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("*")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("last_active_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminSession[];
}

export async function revokeSession(sessionId: string, userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("admin_sessions").delete().eq("id", sessionId).eq("user_id", userId);
}

export async function revokeOtherSessions(userId: string, keepSessionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("admin_sessions").delete().eq("user_id", userId).neq("id", keepSessionId);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("admin_sessions").delete().eq("user_id", userId);
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export function sessionCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

export function clearSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
