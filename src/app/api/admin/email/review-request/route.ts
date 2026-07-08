import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-route";
import { isResendConfigured, sendReviewRequestEmail } from "@/lib/email";

const schema = z.object({
  to: z.string().email(),
  customerName: z.string().min(1),
  eventType: z.string().optional(),
  reviewLink: z.string().url().optional(),
});

export async function POST(request: Request) {
  const authError = await requireAdmin("email:write");
  if (authError) return authError;

  if (!isResendConfigured()) {
    return NextResponse.json({ error: "E-Mail ist nicht konfiguriert (RESEND_API_KEY)." }, { status: 503 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gültige E-Mail und Kundenname erforderlich." }, { status: 400 });
  }

  try {
    await sendReviewRequestEmail(parsed.data);
    return NextResponse.json({
      success: true,
      message: `Bewertungsanfrage an ${parsed.data.to} gesendet.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bewertungsanfrage konnte nicht gesendet werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
