import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getQuoteWithDetails, markQuoteSent } from "@/lib/crm/db";
import { getBusinessProfile } from "@/lib/crm/company";
import { formatCents } from "@/lib/crm/money";
import { generateCrmPdf, quoteToPdfData } from "@/lib/crm/pdf";
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
    const quote = await getQuoteWithDetails(id);
    if (!quote?.customer?.email || !quote.items?.length) {
      return NextResponse.json({ error: "Angebot oder Kunden-E-Mail fehlt." }, { status: 400 });
    }

    const company = await getBusinessProfile();
    const pdfBytes = await generateCrmPdf(quoteToPdfData(quote as never, company));

    await sendCrmDocumentEmail({
      to: quote.customer.email,
      customerName: quote.customer.name,
      documentNumber: quote.quote_number,
      documentType: "quote",
      totalFormatted: formatCents(quote.total_cents),
      pdfBuffer: pdfBytes,
      copyToBusiness,
      company,
    });

    await markQuoteSent(id);
    await logCustomerEvent(quote.customer_id, "quote_sent", `Angebot ${quote.quote_number} per E-Mail versendet`, quote.customer.email, {
      id,
      type: "quote",
    });

    return NextResponse.json({ success: true, message: "Angebot versendet." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Versand fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
