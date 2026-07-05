import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "pb_admin_auth";
const SESSION_MAX_AGE_SEC = 60 * 60 * 8;

function getSessionSecret(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  return password?.trim() ? password : null;
}

export function createAdminSessionToken(): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const sessionId = randomBytes(32).toString("hex");
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const payload = `${sessionId}.${expires}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifyAdminSessionToken(token: string): boolean {
  const secret = getSessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [sessionId, expiresStr, sig] = parts;
  const expires = Number.parseInt(expiresStr ?? "", 10);
  if (!sessionId || !Number.isFinite(expires) || Math.floor(Date.now() / 1000) > expires) {
    return false;
  }

  const payload = `${sessionId}.${expiresStr}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminSessionToken(token);
}

export function getAdminCookieName() {
  return ADMIN_COOKIE;
}

export function getAdminSessionMaxAge() {
  return SESSION_MAX_AGE_SEC;
}

export function isAdminConfigured(): boolean {
  return Boolean(getSessionSecret());
}

/** @deprecated Use createAdminSessionToken — never expose password-derived tokens. */
export function getAdminToken(): string | null {
  return null;
}
