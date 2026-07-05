import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getInvoiceWithDetails, updateInvoiceStatus } from "@/lib/crm/db";
import { formatCents } from "@/lib/crm/money";
import { generateCrmPdf, invoiceToPdfData } from "@/lib/crm/pdf";
import { logCustomerEvent } from "@/lib/crm/events";
import { isResendConfigured, sendCrmDocumentEmail } from "@/lib/email";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const copyToBusiness = Boolean(body.copyToBusiness ?? true);

  if (!isResendConfigured()) {
    return NextResponse.json({ error: "E-Mail ist nicht konfiguriert (RESEND_API_KEY)." }, { status: 503 });
  }

  try {
    const invoice = await getInvoiceWithDetails(id);
    if (!invoice?.customer?.email || !invoice.items?.length) {
      return NextResponse.json({ error: "Rechnung oder Kunden-E-Mail fehlt." }, { status: 400 });
    }

    const pdfBytes = await generateCrmPdf(invoiceToPdfData(invoice as never));

    await sendCrmDocumentEmail({
      to: invoice.customer.email,
      customerName: invoice.customer.name,
      documentNumber: invoice.invoice_number,
      documentType: "invoice",
      totalFormatted: formatCents(invoice.total_cents),
      pdfBuffer: pdfBytes,
      copyToBusiness,
    });

    await updateInvoiceStatus(id, "sent");
    await logCustomerEvent(invoice.customer_id, "invoice_sent", `Rechnung ${invoice.invoice_number} per E-Mail versendet`, invoice.customer.email, {
      id,
      type: "invoice",
    });

    return NextResponse.json({ success: true, message: "Rechnung versendet." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Versand fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
