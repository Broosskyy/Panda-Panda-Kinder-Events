import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getInvoiceWithDetails } from "@/lib/crm/db";
import { generateCrmPdf, invoiceToPdfData } from "@/lib/crm/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;

  try {
    const invoice = await getInvoiceWithDetails(id);
    if (!invoice?.customer || !invoice.items?.length) {
      return NextResponse.json({ error: "Rechnung nicht gefunden." }, { status: 404 });
    }

    const pdfBytes = await generateCrmPdf(invoiceToPdfData(invoice as never));

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF konnte nicht erstellt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
