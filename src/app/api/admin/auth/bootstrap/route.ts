import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { countAdminUsers, createUser, listRoles } from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/password";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(12),
  displayName: z.string().min(1),
  adminPassword: z.string().min(1),
});

function passwordsMatch(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Bootstrap first admin when no users exist — requires legacy ADMIN_PASSWORD */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`bootstrap:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte später erneut versuchen." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const userCount = await countAdminUsers();
  if (userCount > 0) {
    return NextResponse.json({ error: "Bootstrap nicht verfügbar." }, { status: 403 });
  }

  const expected = process.env.ADMIN_PASSWORD ?? "";
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  if (!expected || !passwordsMatch(parsed.data.adminPassword, expected)) {
    return NextResponse.json({ error: "Legacy-Admin-Passwort ungültig." }, { status: 401 });
  }

  const roles = await listRoles();
  const adminRole = roles.find((r) => r.slug === "administrator");
  if (!adminRole) {
    return NextResponse.json({ error: "Administrator-Rolle fehlt. Migration ausführen." }, { status: 503 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await createUser({
    username: parsed.data.username,
    email: parsed.data.email,
    passwordHash,
    displayName: parsed.data.displayName,
    roleId: adminRole.id,
  });

  return NextResponse.json({ user, message: "Erster Administrator angelegt." });
}
