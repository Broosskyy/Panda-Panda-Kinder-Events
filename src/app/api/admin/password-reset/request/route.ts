import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { findUserByIdentifier } from "@/lib/auth/users";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { sendTransactionalEmail } from "@/lib/email";

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
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const resetUrl = `${baseUrl}/admin/passwort-reset?token=${token}`;

    try {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Passwort zurücksetzen — Panda-Bande CMS",
        html: `<p>Hallo ${user.display_name},</p><p><a href="${resetUrl}">Passwort zurücksetzen</a></p><p>Link gültig für 1 Stunde, einmal verwendbar.</p>`,
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
