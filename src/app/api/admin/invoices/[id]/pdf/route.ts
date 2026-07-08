import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { jsonApiError } from "@/lib/crm/api-errors";
import { getInvoiceWithDetails } from "@/lib/crm/db";
import { getBusinessProfile } from "@/lib/crm/company";
import { generateCrmPdf, invoiceToPdfData } from "@/lib/crm/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin("crm:read");
  if (authError) return authError;

  const { id } = await params;

  try {
    const invoice = await getInvoiceWithDetails(id);
    if (!invoice?.customer || !invoice.items?.length) {
      return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 });
    }

    const company = await getBusinessProfile();
    if (!company.logoUrl?.trim()) {
      console.warn(`[invoices/${id}/pdf] Kein Logo konfiguriert — PDF ohne Bildmarke.`);
    }
    const pdfBytes = await generateCrmPdf(invoiceToPdfData(invoice as never, company));

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error(`[invoices/${id}/pdf]`, err);
    const { body, status } = jsonApiError(err, "PDF konnte nicht erstellt werden.");
    return NextResponse.json({ ...body, code: body.code ?? "pdf_generation_failed" }, { status });
  }
}
