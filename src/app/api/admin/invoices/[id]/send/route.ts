import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { CrmApiError, classifySendError, jsonApiError } from "@/lib/crm/api-errors";
import { getInvoiceWithDetails, updateInvoiceStatus } from "@/lib/crm/db";
import { getBusinessProfile } from "@/lib/crm/company";
import { formatCents } from "@/lib/crm/money";
import { generateCrmPdf, invoiceToPdfData } from "@/lib/crm/pdf";
import { logCustomerEvent } from "@/lib/crm/events";
import { getEmailSettings, getCopyEmailForDocument, isResendConfigured, sendCrmDocumentEmail } from "@/lib/email";
import { getResendSendingSetup } from "@/lib/email/resend-status";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin("invoices:write");
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
    const invoice = await getInvoiceWithDetails(id);
    if (!invoice?.customer || !invoice.items?.length) {
      return NextResponse.json(
        { error: "Rechnung nicht gefunden.", code: "invoice_not_found" },
        { status: 404 },
      );
    }

    if (!invoice.customer.email?.trim() && sendToCustomer) {
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
      pdfBytes = await generateCrmPdf(invoiceToPdfData(invoice as never, company));
    } catch (pdfErr) {
      throw new CrmApiError("PDF konnte nicht erzeugt werden.", {
        code: "pdf_generation_failed",
        status: 500,
        detail: pdfErr instanceof Error ? pdfErr.message : String(pdfErr),
      });
    }

    await sendCrmDocumentEmail({
      to: invoice.customer.email || getCopyEmailForDocument(emailSettings, "invoice"),
      customerName: invoice.customer.name,
      documentNumber: invoice.invoice_number,
      documentType: "invoice",
      totalFormatted: formatCents(invoice.total_cents),
      pdfBuffer: pdfBytes,
      copyToBusiness,
      sendToCustomer,
      company,
      relatedInvoiceId: id,
      relatedCustomerId: invoice.customer_id,
    });

    await updateInvoiceStatus(id, "sent");
    await logCustomerEvent(invoice.customer_id, "invoice_sent", `Rechnung ${invoice.invoice_number} per E-Mail versendet`, invoice.customer.email, {
      id,
      type: "invoice",
    });

    return NextResponse.json({ success: true, message: "Rechnung versendet." });
  } catch (err) {
    console.error(`[invoices/${id}/send]`, err);
    const classified = classifySendError(err);
    const { body: errBody, status } = jsonApiError(classified, "Versand fehlgeschlagen.");
    return NextResponse.json(errBody, { status });
  }
}
