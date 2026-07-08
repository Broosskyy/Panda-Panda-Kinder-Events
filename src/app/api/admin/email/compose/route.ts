import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { isResendConfigured } from "@/lib/email";
import { resolveEmailSender } from "@/lib/email/sender";
import { logEmailSend, saveEmailDraft } from "@/lib/email/log";
import { renderEmailFromTemplate } from "@/lib/email/render";
import { applyTemplateVariables } from "@/lib/email/variables";
import { buildEmailVariableContext } from "@/lib/email/render";
import { wrapBrandedEmailHtml } from "@/lib/email/wrap-branded";
import { sendEmailWithRetry } from "@/lib/email/transport";

export async function POST(request: Request) {
  const authError = await requireAdmin("email:write");
  if (authError) return authError;

  if (!isResendConfigured()) {
    return NextResponse.json({ error: "RESEND_API_KEY ist nicht konfiguriert." }, { status: 503 });
  }

  const ctx = await getAdminContext();
  const body = await request.json();
  const {
    to,
    subject,
    bodyHtml,
    layout,
    templateSlug,
    variables,
    copyTo,
    saveDraft,
    draftId,
    area,
  } = body as {
    to: string;
    subject?: string;
    bodyHtml?: string;
    layout?: import("@/lib/cms/types").EmailTemplateLayout | null;
    templateSlug?: string;
    variables?: Record<string, string>;
    copyTo?: string;
    saveDraft?: boolean;
    draftId?: string;
    area?: string;
  };

  if (!to?.trim()) {
    return NextResponse.json({ error: "Empfänger ist erforderlich." }, { status: 400 });
  }

  if (saveDraft) {
    const id = await saveEmailDraft({
      id: draftId,
      recipient: to,
      subject,
      bodyHtml,
      templateSlug,
      adminId: ctx?.userId ?? undefined,
    });
    return NextResponse.json({ message: "Entwurf gespeichert.", draftId: id });
  }

  try {
    let finalSubject = subject?.trim() ?? "";
    let finalHtml = bodyHtml ?? "";
    let finalText = "";

    if (templateSlug) {
      const rendered = await renderEmailFromTemplate(templateSlug, variables ?? {}, {
        subject,
        bodyHtml,
        layout: layout ?? undefined,
      });
      if (rendered) {
        finalSubject = rendered.subject;
        finalHtml = rendered.html;
        finalText = rendered.text;
      }
    }

    if (!finalSubject || !finalHtml) {
      const vars = await buildEmailVariableContext(variables ?? {});
      finalSubject = finalSubject || applyTemplateVariables("Nachricht von {{company_name}}", vars);
      const inner = bodyHtml || applyTemplateVariables("<p>{{message}}</p>", vars);
      finalHtml = await wrapBrandedEmailHtml(inner, vars.company_name);
      finalText = inner.replace(/<[^>]+>/g, "");
    }

    const sender = await resolveEmailSender();

    const mainResult = await sendEmailWithRetry({
      payload: {
        from: sender.from,
        to: to.trim(),
        replyTo: sender.replyTo,
        subject: finalSubject,
        html: finalHtml,
        text: finalText || undefined,
      },
      log: {
        recipient: to.trim(),
        subject: finalSubject,
        templateSlug: templateSlug ?? null,
        area: area ?? templateSlug ?? "general",
      },
    });

    if (!mainResult.success) {
      throw new Error(mainResult.error ?? "Versand fehlgeschlagen.");
    }

    await logEmailSend({
      recipient: to.trim(),
      subject: finalSubject,
      templateSlug: templateSlug ?? null,
      area: area ?? templateSlug ?? "general",
      status: "sent",
      sentByAdminId: ctx?.userId ?? null,
    });

    await writeAuditLogFromRequest(ctx, request, {
      action: "email_sent",
      area: area ?? templateSlug ?? "email",
      after: { recipient: to.trim(), subject: finalSubject },
    });

    if (copyTo?.trim()) {
      const copyResult = await sendEmailWithRetry({
        payload: {
          from: sender.from,
          to: copyTo.trim(),
          replyTo: sender.replyTo,
          subject: `[Kopie] ${finalSubject}`,
          html: finalHtml,
          text: finalText || undefined,
        },
        log: {
          recipient: copyTo.trim(),
          subject: `[Kopie] ${finalSubject}`,
          templateSlug: templateSlug ?? null,
          area: area ?? "general",
        },
      });
      if (!copyResult.success) {
        throw new Error(copyResult.error ?? "Kopie konnte nicht gesendet werden.");
      }
    }

    return NextResponse.json({ message: "E-Mail wurde gesendet." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Versand fehlgeschlagen.";
    await logEmailSend({
      recipient: to.trim(),
      subject: subject ?? "",
      templateSlug: templateSlug ?? null,
      area: area ?? "general",
      status: "failed",
      errorMessage: message,
      sentByAdminId: ctx?.userId ?? null,
    });
    await writeAuditLogFromRequest(ctx, request, {
      action: "email_failed",
      area: area ?? "email",
      success: false,
      errorMessage: message,
      after: { recipient: to.trim(), subject: subject ?? "" },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
