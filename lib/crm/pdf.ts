import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatCents } from "./money";
import type { CrmCustomer, CrmInvoice, CrmQuote } from "./types";

const BRAND = rgb(0.322, 0.337, 0.243); // #52563e
const TEXT = rgb(0.17, 0.17, 0.17);
const MUTED = rgb(0.45, 0.45, 0.45);

interface PdfLineItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
}

interface PdfDocumentData {
  type: "quote" | "invoice";
  number: string;
  title: string;
  date: string;
  validUntil?: string | null;
  dueDate?: string | null;
  customer: CrmCustomer;
  items: PdfLineItem[];
  subtotal_cents: number;
  discount_percent: number;
  discount_cents: number;
  tax_rate: number;
  tax_cents: number;
  total_cents: number;
  remarks?: string | null;
}

function formatDateDE(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export async function generateCrmPdf(data: PdfDocumentData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 50;

  // Header bar
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: BRAND });
  page.drawText("Panda-Bande Kinderevents", {
    x: 50,
    y: height - 45,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Liebevolle Kinderbetreuung für eure besonderen Momente", {
    x: 50,
    y: height - 62,
    size: 9,
    font,
    color: rgb(0.95, 0.95, 0.92),
  });

  y = height - 110;

  const docLabel = data.type === "quote" ? "ANGEBOT" : "RECHNUNG";
  page.drawText(docLabel, { x: 50, y, size: 22, font: fontBold, color: BRAND });
  page.drawText(data.number, { x: 50, y: y - 22, size: 11, font, color: MUTED });

  page.drawText(`Datum: ${formatDateDE(data.date)}`, { x: 380, y, size: 10, font, color: TEXT });
  if (data.type === "quote" && data.validUntil) {
    page.drawText(`Gültig bis: ${formatDateDE(data.validUntil)}`, { x: 380, y: y - 14, size: 10, font, color: TEXT });
  }
  if (data.type === "invoice" && data.dueDate) {
    page.drawText(`Fällig: ${formatDateDE(data.dueDate)}`, { x: 380, y: y - 14, size: 10, font, color: TEXT });
  }

  y -= 55;
  page.drawText("An:", { x: 50, y, size: 9, font, color: MUTED });
  page.drawText(data.customer.name, { x: 50, y: y - 14, size: 12, font: fontBold, color: TEXT });
  let cy = y - 28;
  if (data.customer.address) {
    page.drawText(data.customer.address, { x: 50, y: cy, size: 10, font, color: TEXT });
    cy -= 14;
  }
  if (data.customer.email) {
    page.drawText(data.customer.email, { x: 50, y: cy, size: 10, font, color: TEXT });
    cy -= 14;
  }
  if (data.customer.phone) {
    page.drawText(data.customer.phone, { x: 50, y: cy, size: 10, font, color: TEXT });
  }

  y = cy - 30;
  page.drawText(data.title, { x: 50, y, size: 13, font: fontBold, color: TEXT });
  y -= 25;

  // Table header
  page.drawRectangle({ x: 50, y: y - 4, width: width - 100, height: 20, color: rgb(0.96, 0.96, 0.94) });
  page.drawText("Position", { x: 55, y, size: 9, font: fontBold, color: TEXT });
  page.drawText("Menge", { x: 300, y, size: 9, font: fontBold, color: TEXT });
  page.drawText("Einzelpreis", { x: 360, y, size: 9, font: fontBold, color: TEXT });
  page.drawText("Gesamt", { x: 460, y, size: 9, font: fontBold, color: TEXT });
  y -= 22;

  for (const item of data.items) {
    if (y < 120) break;
    const desc = item.description.length > 55 ? `${item.description.slice(0, 52)}…` : item.description;
    page.drawText(desc, { x: 55, y, size: 9, font, color: TEXT });
    page.drawText(String(item.quantity), { x: 300, y, size: 9, font, color: TEXT });
    page.drawText(formatCents(item.unit_price_cents), { x: 360, y, size: 9, font, color: TEXT });
    page.drawText(formatCents(item.line_total_cents), { x: 460, y, size: 9, font, color: TEXT });
    y -= 18;
  }

  y -= 10;
  const totalsX = 380;
  page.drawText(`Zwischensumme: ${formatCents(data.subtotal_cents)}`, { x: totalsX, y, size: 10, font, color: TEXT });
  y -= 14;
  if (data.discount_cents > 0) {
    page.drawText(`Rabatt (${data.discount_percent}%): -${formatCents(data.discount_cents)}`, {
      x: totalsX,
      y,
      size: 10,
      font,
      color: TEXT,
    });
    y -= 14;
  }
  page.drawText(`MwSt. (${data.tax_rate}%): ${formatCents(data.tax_cents)}`, { x: totalsX, y, size: 10, font, color: TEXT });
  y -= 18;
  page.drawText(`Gesamtbetrag: ${formatCents(data.total_cents)}`, {
    x: totalsX,
    y,
    size: 12,
    font: fontBold,
    color: BRAND,
  });

  if (data.remarks) {
    y -= 30;
    page.drawText("Bemerkung:", { x: 50, y, size: 9, font: fontBold, color: MUTED });
    const remarkLines = data.remarks.match(/.{1,80}/g) ?? [data.remarks];
    for (const line of remarkLines.slice(0, 4)) {
      y -= 12;
      page.drawText(line, { x: 50, y, size: 9, font, color: TEXT });
    }
  }

  page.drawText("Panda-Bande Kinderevents · panda-bande-events.de", {
    x: 50,
    y: 40,
    size: 8,
    font,
    color: MUTED,
  });

  return pdf.save();
}

export function quoteToPdfData(quote: CrmQuote & { items: PdfLineItem[] }): PdfDocumentData {
  return {
    type: "quote",
    number: quote.quote_number,
    title: quote.title,
    date: quote.created_at,
    validUntil: quote.valid_until,
    customer: quote.customer!,
    items: quote.items,
    subtotal_cents: quote.subtotal_cents,
    discount_percent: quote.discount_percent,
    discount_cents: quote.discount_cents,
    tax_rate: quote.tax_rate,
    tax_cents: quote.tax_cents,
    total_cents: quote.total_cents,
    remarks: quote.remarks,
  };
}

export function invoiceToPdfData(invoice: CrmInvoice & { items: PdfLineItem[] }): PdfDocumentData {
  return {
    type: "invoice",
    number: invoice.invoice_number,
    title: invoice.title,
    date: invoice.issue_date,
    dueDate: invoice.due_date,
    customer: invoice.customer!,
    items: invoice.items,
    subtotal_cents: invoice.subtotal_cents,
    discount_percent: invoice.discount_percent,
    discount_cents: invoice.discount_cents,
    tax_rate: invoice.tax_rate,
    tax_cents: invoice.tax_cents,
    total_cents: invoice.total_cents,
    remarks: invoice.remarks,
  };
}
