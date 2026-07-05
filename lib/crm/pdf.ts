import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { BusinessProfile } from "./company";
import { formatCents } from "./money";
import type { CrmCustomer, CrmDocumentStatus, CrmInvoice, CrmQuote } from "./types";
import { CRM_STATUS_LABELS } from "./types";

const BRAND = rgb(0.322, 0.337, 0.243);
const TEXT = rgb(0.17, 0.17, 0.17);
const MUTED = rgb(0.45, 0.45, 0.45);
const LIGHT = rgb(0.96, 0.96, 0.94);

interface PdfLineItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
}

export interface PdfDocumentData {
  type: "quote" | "invoice";
  number: string;
  title: string;
  date: string;
  validUntil?: string | null;
  dueDate?: string | null;
  status?: CrmDocumentStatus;
  customer: CrmCustomer;
  items: PdfLineItem[];
  subtotal_cents: number;
  discount_percent: number;
  discount_cents: number;
  tax_rate: number;
  tax_cents: number;
  total_cents: number;
  remarks?: string | null;
  company: BusinessProfile;
}

function formatDateDE(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function fetchLogoBytes(logoUrl: string): Promise<{ bytes: Uint8Array; kind: "png" | "jpg" } | null> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://panda-bande-events.de";
    const url = logoUrl.startsWith("http") ? logoUrl : `${base}${logoUrl}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const kind = url.toLowerCase().includes(".png") ? "png" : "jpg";
    return { bytes, kind };
  } catch {
    return null;
  }
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLen) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawHeader(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  company: BusinessProfile,
  data: PdfDocumentData,
  width: number,
  height: number,
  hasLogo = false,
) {
  page.drawRectangle({ x: 0, y: height - 92, width, height: 92, color: BRAND });

  const textX = hasLogo ? 96 : 50;
  page.drawText(company.companyName, {
    x: textX,
    y: height - 38,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  let leftY = height - 54;
  const leftLines = [company.address, company.phone, company.email, company.website].filter(Boolean);
  for (const line of leftLines) {
    page.drawText(line, { x: textX, y: leftY, size: 8, font, color: rgb(0.95, 0.95, 0.92) });
    leftY -= 11;
  }

  const docLabel = data.type === "quote" ? "ANGEBOT" : "RECHNUNG";
  page.drawText(docLabel, { x: 360, y: height - 36, size: 18, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText(`Nr. ${data.number}`, { x: 360, y: height - 52, size: 10, font, color: rgb(0.92, 0.92, 0.88) });
  page.drawText(`Datum: ${formatDateDE(data.date)}`, { x: 360, y: height - 66, size: 9, font, color: rgb(0.92, 0.92, 0.88) });

  if (data.type === "quote" && data.validUntil) {
    page.drawText(`Gültig bis: ${formatDateDE(data.validUntil)}`, { x: 360, y: height - 78, size: 9, font, color: rgb(0.92, 0.92, 0.88) });
  }
  if (data.type === "invoice" && data.dueDate) {
    page.drawText(`Fällig: ${formatDateDE(data.dueDate)}`, { x: 360, y: height - 78, size: 9, font, color: rgb(0.92, 0.92, 0.88) });
  }
  if (data.status) {
    page.drawText(`Status: ${CRM_STATUS_LABELS[data.status]}`, { x: 360, y: height - 90, size: 8, font, color: rgb(0.92, 0.92, 0.88) });
  }
}

export async function generateCrmPdf(data: PdfDocumentData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  const logo = await fetchLogoBytes(data.company.logoUrl);
  const hasLogo = Boolean(logo);
  if (logo) {
    const image = logo.kind === "png" ? await pdf.embedPng(logo.bytes) : await pdf.embedJpg(logo.bytes);
    page.drawImage(image, { x: 50, y: height - 82, width: 36, height: 36 });
  }

  drawHeader(page, font, fontBold, data.company, data, width, height, hasLogo);

  let y = height - 120;

  page.drawRectangle({ x: 50, y: y - 58, width: width - 100, height: 58, color: LIGHT, borderColor: rgb(0.9, 0.9, 0.88), borderWidth: 1 });
  page.drawText("Rechnungsempfänger", { x: 60, y: y - 14, size: 8, font: fontBold, color: MUTED });
  page.drawText(data.customer.name, { x: 60, y: y - 28, size: 12, font: fontBold, color: TEXT });
  let cy = y - 42;
  for (const line of [data.customer.address, data.customer.email, data.customer.phone].filter(Boolean)) {
    page.drawText(String(line), { x: 60, y: cy, size: 9, font, color: TEXT });
    cy -= 12;
  }

  y = cy - 24;
  page.drawText(data.title, { x: 50, y, size: 13, font: fontBold, color: TEXT });
  y -= 22;

  page.drawRectangle({ x: 50, y: y - 4, width: width - 100, height: 22, color: BRAND });
  page.drawText("Bezeichnung", { x: 55, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Menge", { x: 300, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Einzelpreis", { x: 355, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Gesamt", { x: 460, y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  y -= 24;

  for (const item of data.items) {
    if (y < 220) {
      page = pdf.addPage([595.28, 841.89]);
      y = height - 80;
    }
    const descLines = wrapText(item.description, 42).slice(0, 2);
    page.drawText(descLines[0] ?? "", { x: 55, y, size: 9, font, color: TEXT });
    if (descLines[1]) {
      y -= 11;
      page.drawText(descLines[1], { x: 55, y, size: 8, font, color: MUTED });
    }
    page.drawText(String(item.quantity), { x: 300, y, size: 9, font, color: TEXT });
    page.drawText(formatCents(item.unit_price_cents), { x: 355, y, size: 9, font, color: TEXT });
    page.drawText(formatCents(item.line_total_cents), { x: 460, y, size: 9, font, color: TEXT });
    y -= 20;
  }

  y -= 8;
  const totalsX = 355;
  page.drawRectangle({ x: totalsX - 10, y: y - 72, width: 200, height: 78, color: LIGHT, borderColor: rgb(0.9, 0.9, 0.88), borderWidth: 1 });
  let ty = y;
  page.drawText(`Zwischensumme`, { x: totalsX, y: ty, size: 9, font, color: MUTED });
  page.drawText(formatCents(data.subtotal_cents), { x: 460, y: ty, size: 9, font, color: TEXT });
  ty -= 14;
  if (data.discount_cents > 0) {
    page.drawText(`Rabatt (${data.discount_percent}%)`, { x: totalsX, y: ty, size: 9, font, color: MUTED });
    page.drawText(`-${formatCents(data.discount_cents)}`, { x: 460, y: ty, size: 9, font, color: TEXT });
    ty -= 14;
  }
  page.drawText(`MwSt. (${data.tax_rate}%)`, { x: totalsX, y: ty, size: 9, font, color: MUTED });
  page.drawText(formatCents(data.tax_cents), { x: 460, y: ty, size: 9, font, color: TEXT });
  ty -= 18;
  page.drawText("Gesamtbetrag", { x: totalsX, y: ty, size: 11, font: fontBold, color: BRAND });
  page.drawText(formatCents(data.total_cents), { x: 460, y: ty, size: 11, font: fontBold, color: BRAND });

  y = ty - 28;
  const closing =
    data.type === "invoice"
      ? data.company.defaultInvoiceText || "Vielen Dank für Ihren Auftrag."
      : data.company.defaultQuoteText || "Vielen Dank für Ihre Anfrage.";

  for (const line of wrapText(closing, 90)) {
    page.drawText(line, { x: 50, y, size: 9, font, color: TEXT });
    y -= 12;
  }

  if (data.type === "invoice" && data.company.defaultPaymentText) {
    y -= 4;
    for (const line of wrapText(data.company.defaultPaymentText, 90)) {
      page.drawText(line, { x: 50, y, size: 9, font, color: TEXT });
      y -= 12;
    }
  }

  if (data.remarks) {
    y -= 8;
    page.drawText("Bemerkung", { x: 50, y, size: 9, font: fontBold, color: MUTED });
    for (const line of wrapText(data.remarks, 90).slice(0, 3)) {
      y -= 12;
      page.drawText(line, { x: 50, y, size: 9, font, color: TEXT });
    }
  }

  if (data.type === "invoice" && data.company.iban) {
    y -= 16;
    page.drawText("Bankverbindung", { x: 50, y, size: 9, font: fontBold, color: MUTED });
    y -= 12;
    page.drawText(`IBAN: ${data.company.iban}`, { x: 50, y, size: 9, font, color: TEXT });
    if (data.company.bic) {
      y -= 12;
      page.drawText(`BIC: ${data.company.bic}`, { x: 50, y, size: 9, font, color: TEXT });
    }
    if (data.company.bankName) {
      y -= 12;
      page.drawText(`Bank: ${data.company.bankName}`, { x: 50, y, size: 9, font, color: TEXT });
    }
    y -= 12;
    page.drawText(`Verwendungszweck: ${data.number}`, { x: 50, y, size: 9, font, color: TEXT });
  }

  y = Math.min(y, 120);
  page.drawText("Mit freundlichen Grüßen", { x: 50, y: 72, size: 9, font, color: TEXT });
  page.drawText(data.company.companyName, { x: 50, y: 58, size: 10, font: fontBold, color: BRAND });

  const footerParts = [data.company.website, data.company.email, data.company.phone].filter(Boolean);
  page.drawText(footerParts.join(" · "), { x: 50, y: 36, size: 7, font, color: MUTED });

  return pdf.save();
}

export function quoteToPdfData(
  quote: CrmQuote & { items: PdfLineItem[] },
  company: BusinessProfile,
): PdfDocumentData {
  return {
    type: "quote",
    number: quote.quote_number,
    title: quote.title,
    date: quote.created_at,
    validUntil: quote.valid_until,
    status: quote.status,
    customer: quote.customer!,
    items: quote.items,
    subtotal_cents: quote.subtotal_cents,
    discount_percent: quote.discount_percent,
    discount_cents: quote.discount_cents,
    tax_rate: quote.tax_rate,
    tax_cents: quote.tax_cents,
    total_cents: quote.total_cents,
    remarks: quote.remarks,
    company,
  };
}

export function invoiceToPdfData(
  invoice: CrmInvoice & { items: PdfLineItem[] },
  company: BusinessProfile,
): PdfDocumentData {
  return {
    type: "invoice",
    number: invoice.invoice_number,
    title: invoice.title,
    date: invoice.issue_date,
    dueDate: invoice.due_date,
    status: invoice.status,
    customer: invoice.customer!,
    items: invoice.items,
    subtotal_cents: invoice.subtotal_cents,
    discount_percent: invoice.discount_percent,
    discount_cents: invoice.discount_cents,
    tax_rate: invoice.tax_rate,
    tax_cents: invoice.tax_cents,
    total_cents: invoice.total_cents,
    remarks: invoice.remarks,
    company,
  };
}
