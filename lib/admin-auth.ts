import { cookies } from "next/headers";

const ADMIN_COOKIE = "pb_admin_auth";

export function getAdminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return Buffer.from(`pb-admin:${password}`).toString("base64");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === token;
}

export function getAdminCookieName() {
  return ADMIN_COOKIE;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}
