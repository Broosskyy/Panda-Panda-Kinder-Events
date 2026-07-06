import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sha256, randomToken } from "@/lib/auth/crypto";

export async function createPasswordResetToken(userId: string): Promise<{ token: string; expiresAt: string }> {
  const supabase = getSupabaseAdmin();
  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await supabase.from("admin_password_resets").insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  return { token, expiresAt };
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const tokenHash = sha256(token);
  const { data, error } = await supabase
    .from("admin_password_resets")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data || data.used_at) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  await supabase
    .from("admin_password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("id", data.id);

  return data.user_id;
}
