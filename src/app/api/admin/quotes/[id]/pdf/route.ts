import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { jsonApiError } from "@/lib/crm/api-errors";
import { getQuoteWithDetails } from "@/lib/crm/db";
import { getBusinessProfile } from "@/lib/crm/company";
import { generateCrmPdf, quoteToPdfData } from "@/lib/crm/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin("crm:read");
  if (authError) return authError;

  const { id } = await params;

  try {
    const quote = await getQuoteWithDetails(id);
    if (!quote?.customer || !quote.items?.length) {
      return NextResponse.json({ error: "Angebot nicht gefunden." }, { status: 404 });
    }

    const company = await getBusinessProfile();
    if (!company.logoUrl?.trim()) {
      console.warn(`[quotes/${id}/pdf] Kein Logo konfiguriert — PDF ohne Bildmarke.`);
    }
    const pdfBytes = await generateCrmPdf(quoteToPdfData(quote as never, company));

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${quote.quote_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error(`[quotes/${id}/pdf]`, err);
    const { body, status } = jsonApiError(err, "PDF konnte nicht erstellt werden.");
    return NextResponse.json({ ...body, code: body.code ?? "pdf_generation_failed" }, { status });
  }
}
