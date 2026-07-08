import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { findUserByIdentifier } from "@/lib/auth/users";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-pw-reset:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Zu viele Anfragen." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gültige E-Mail erforderlich." }, { status: 400 });
  }

  const user = await findUserByIdentifier(parsed.data.email);
  if (user?.active) {
    const { token } = await createPasswordResetToken(user.id);
    const resetUrl = `${getSiteUrl()}/admin/passwort-reset?token=${token}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        adminName: user.display_name,
        resetUrl,
      });
      await writeAuditLogFromRequest(null, request, {
        action: "password_reset_requested",
        area: "auth",
        entityId: user.id,
      });
    } catch {
      // Do not reveal email delivery failures
    }
  }

  return NextResponse.json({
    success: true,
    message: "Falls ein Konto existiert, wurde eine E-Mail versendet.",
  });
}
