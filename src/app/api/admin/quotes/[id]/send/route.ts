import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { CrmApiError, classifySendError, jsonApiError } from "@/lib/crm/api-errors";
import { getQuoteWithDetails, markQuoteSent } from "@/lib/crm/db";
import { getBusinessProfile } from "@/lib/crm/company";
import { formatCents } from "@/lib/crm/money";
import { generateCrmPdf, quoteToPdfData } from "@/lib/crm/pdf";
import { logCustomerEvent } from "@/lib/crm/events";
import { getEmailSettings, getCopyEmailForDocument, isResendConfigured, sendCrmDocumentEmail } from "@/lib/email";
import { getResendSendingSetup } from "@/lib/email/resend-status";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const emailSettings = await getEmailSettings();
  const copyToBusiness = Boolean(body.copyToBusiness ?? emailSettings.crmCopyToCompanyEnabled !== false);
  const sendToCustomer = body.sendToCustomer !== false;

  if (!isResendConfigured()) {
    return NextResponse.json(
      { error: "E-Mail ist nicht konfiguriert (RESEND_API_KEY).", code: "resend_not_configured" },
      { status: 503 },
    );
  }

  try {
    const quote = await getQuoteWithDetails(id);
    if (!quote?.customer || !quote.items?.length) {
      return NextResponse.json(
        { error: "Angebot nicht gefunden.", code: "quote_not_found" },
        { status: 404 },
      );
    }

    if (!quote.customer.email?.trim() && sendToCustomer) {
      return NextResponse.json({ error: "Empfänger fehlt.", code: "missing_recipient" }, { status: 400 });
    }

    if (!sendToCustomer && !copyToBusiness) {
      return NextResponse.json({ error: "Kein Versandziel ausgewählt.", code: "missing_recipient" }, { status: 400 });
    }

    const emailSettings = await getEmailSettings();
    const sendingSetup = await getResendSendingSetup(emailSettings.senderEmail);
    if (!sendingSetup.canSend) {
      throw new CrmApiError(sendingSetup.blockReason ?? "E-Mail-Versand nicht möglich.", {
        code: "sending_not_ready",
        status: 503,
        detail: sendingSetup.sending.map((s) => `${s.label}: ${s.message}`).join("\n"),
      });
    }

    const company = await getBusinessProfile();
    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await generateCrmPdf(quoteToPdfData(quote as never, company));
    } catch (pdfErr) {
      throw new CrmApiError("PDF konnte nicht erzeugt werden.", {
        code: "pdf_generation_failed",
        status: 500,
        detail: pdfErr instanceof Error ? pdfErr.message : String(pdfErr),
      });
    }

    await sendCrmDocumentEmail({
      to: quote.customer.email || getCopyEmailForDocument(emailSettings, "quote"),
      customerName: quote.customer.name,
      documentNumber: quote.quote_number,
      documentType: "quote",
      totalFormatted: formatCents(quote.total_cents),
      pdfBuffer: pdfBytes,
      copyToBusiness,
      sendToCustomer,
      company,
      relatedQuoteId: id,
      relatedCustomerId: quote.customer_id,
    });

    await markQuoteSent(id);
    await logCustomerEvent(quote.customer_id, "quote_sent", `Angebot ${quote.quote_number} per E-Mail versendet`, quote.customer.email, {
      id,
      type: "quote",
    });

    return NextResponse.json({ success: true, message: "Angebot versendet." });
  } catch (err) {
    console.error(`[quotes/${id}/send]`, err);
    const classified = classifySendError(err);
    const { body: errBody, status } = jsonApiError(classified, "Versand fehlgeschlagen.");
    return NextResponse.json(errBody, { status });
  }
}
