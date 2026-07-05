import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getQuoteWithDetails } from "@/lib/crm/db";
import { generateCrmPdf, quoteToPdfData } from "@/lib/crm/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;

  try {
    const quote = await getQuoteWithDetails(id);
    if (!quote?.customer || !quote.items?.length) {
      return NextResponse.json({ error: "Angebot nicht gefunden." }, { status: 404 });
    }

    const pdfBytes = await generateCrmPdf(quoteToPdfData(quote as never));

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${quote.quote_number}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF konnte nicht erstellt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
