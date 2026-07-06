import { authenticator } from "otplib";
import QRCode from "qrcode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { randomToken } from "@/lib/auth/crypto";

authenticator.options = { window: 1 };

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTotpCode(secret: string, code: string): boolean {
  try {
    return authenticator.verify({ token: code.replace(/\s/g, ""), secret });
  } catch {
    return false;
  }
}

export async function getTotpQrDataUrl(email: string, secret: string): Promise<string> {
  const issuer = "Panda-Bande CMS";
  const otpauth = authenticator.keyuri(email, issuer, secret);
  return QRCode.toDataURL(otpauth);
}

export async function generateBackupCodes(userId: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  await supabase.from("admin_backup_codes").delete().eq("user_id", userId).is("used_at", null);

  const codes: string[] = [];
  const rows: { user_id: string; code_hash: string }[] = [];

  for (let i = 0; i < 10; i++) {
    const code = randomToken(4).slice(0, 8).toUpperCase();
    codes.push(code);
    rows.push({ user_id: userId, code_hash: await hashPassword(code) });
  }

  const { error } = await supabase.from("admin_backup_codes").insert(rows);
  if (error) throw new Error(error.message);
  return codes;
}

export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_backup_codes")
    .select("id, code_hash")
    .eq("user_id", userId)
    .is("used_at", null);

  if (error || !data?.length) return false;

  for (const row of data) {
    const match = await verifyPassword(code.trim().toUpperCase(), row.code_hash);
    if (match) {
      await supabase
        .from("admin_backup_codes")
        .update({ used_at: new Date().toISOString() })
        .eq("id", row.id);
      return true;
    }
  }
  return false;
}

export async function countUnusedBackupCodes(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("admin_backup_codes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("used_at", null);
  return count ?? 0;
}
