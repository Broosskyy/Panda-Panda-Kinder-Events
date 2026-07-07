import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getEmailLogById } from "@/lib/email/log";
import { sendTransactionalEmail } from "@/lib/email";
import { renderEmailFromTemplate } from "@/lib/email/render";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const log = await getEmailLogById(id);
  if (!log) {
    return NextResponse.json({ error: "E-Mail-Protokolleintrag nicht gefunden." }, { status: 404 });
  }

  const to = log.original_recipient || log.recipient;
  if (!to) {
    return NextResponse.json({ error: "Kein Empfänger hinterlegt." }, { status: 400 });
  }

  try {
    if (log.template_slug) {
      const rendered = await renderEmailFromTemplate(log.template_slug, {});
      if (rendered) {
        await sendTransactionalEmail({
          to,
          subject: log.subject.replace(/^\[(TEST|STAGING|DEV)\]\s*/, ""),
          html: rendered.html,
          text: rendered.text,
          templateSlug: log.template_slug,
          area: log.area ?? "resend",
        });
        return NextResponse.json({ success: true, message: `E-Mail erneut an ${to} gesendet.` });
      }
    }

    await sendTransactionalEmail({
      to,
      subject: log.subject,
      html: `<p>${log.body_preview ?? "Erneuter Versand aus dem Kommunikationsprotokoll."}</p>`,
      templateSlug: log.template_slug ?? "resend",
      area: log.area ?? "resend",
    });

    return NextResponse.json({ success: true, message: `E-Mail erneut an ${to} gesendet.` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erneut senden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
