import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-route";
import { isResendConfigured, sendTestEmail } from "@/lib/email";

const testSchema = z.object({
  to: z.string().email(),
});

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  if (!isResendConfigured()) {
    return NextResponse.json({ error: "E-Mail ist nicht konfiguriert (RESEND_API_KEY)." }, { status: 503 });
  }

  const body = await request.json();
  const parsed = testSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gültige E-Mail-Adresse erforderlich." }, { status: 400 });
  }

  try {
    const result = await sendTestEmail(parsed.data.to);
    return NextResponse.json({
      success: true,
      message: "Test-E-Mail wurde erfolgreich gesendet.",
      usesTestDomain: result.sender.usesTestDomain,
      from: result.sender.displayFrom,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: `E-Mail konnte nicht gesendet werden. Grund: ${message}` }, { status: 500 });
  }
}
