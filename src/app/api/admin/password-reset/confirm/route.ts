import { NextResponse } from "next/server";
import { z } from "zod";
import { consumePasswordResetToken } from "@/lib/auth/password-reset";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { getPasswordPolicy } from "@/lib/auth/security-settings";
import { updateUser } from "@/lib/auth/users";
import { revokeAllSessions } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/auth/audit";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  const userId = await consumePasswordResetToken(parsed.data.token);
  if (!userId) {
    return NextResponse.json({ error: "Link ungültig oder abgelaufen." }, { status: 400 });
  }

  const policy = await getPasswordPolicy();
  const validationError = validatePassword(parsed.data.password, policy);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await updateUser(userId, { passwordHash, failedLoginAttempts: 0, lockedUntil: null });
  await revokeAllSessions(userId);
  await writeAuditLog(null, { action: "password_reset", area: "auth", entityId: userId });

  return NextResponse.json({ success: true, message: "Passwort wurde aktualisiert." });
}
