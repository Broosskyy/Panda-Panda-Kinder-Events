import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { LOGO_ASPECT_RATIO, LOGO_SIZE_PX } from "@/lib/brand";
import type { BusinessProfile } from "./company";
import { getSiteUrl } from "@/lib/site-url";
import { formatCents } from "./money";
import type { CrmCustomer, CrmDocumentStatus, CrmInvoice, CrmQuote } from "./types";
import { CRM_STATUS_LABELS } from "./types";

const BRAND_COLOR = rgb(0.322, 0.337, 0.243);
const TEXT = rgb(0.17, 0.17, 0.17);
const MUTED = rgb(0.45, 0.45, 0.45);
const LIGHT = rgb(0.97, 0.96, 0.94);
const BORDER = rgb(0.88, 0.87, 0.84);
const WHITE = rgb(1, 1, 1);

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 48;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;
const PDF_LOGO_WIDTH = LOGO_SIZE_PX.pdfWidth;
const PDF_LOGO_HEIGHT = PDF_LOGO_WIDTH / LOGO_ASPECT_RATIO;

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
    const base = getSiteUrl();
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

function splitDescription(description: string): { title: string; details: string | null } {
  const parts = description.split("\n");
  return { title: parts[0] ?? description, details: parts[1]?.trim() || null };
}

function drawFooter(page: PDFPage, font: PDFFont, company: BusinessProfile) {
  const footerY = 42;
  page.drawLine({ start: { x: MARGIN, y: 56 }, end: { x: PAGE.width - MARGIN, y: 56 }, thickness: 0.5, color: BORDER });

  const customFooter = company.invoiceSettings?.pdfFooterText?.trim();
  const parts = customFooter
    ? [customFooter]
    : [
        company.companyName,
        company.formattedAddress?.replace(/\n/g, " · ") || company.address?.replace(/\n/g, " · "),
        [company.phone, company.email, company.website].filter(Boolean).join(" · "),
        [
          company.taxNumber && `St.-Nr. ${company.taxNumber}`,
          company.vatId && `USt-ID ${company.vatId}`,
          company.invoiceSettings?.legalNoticeText?.trim(),
        ]
          .filter(Boolean)
          .join(" · "),
      ].filter(Boolean);

  let y = footerY;
  for (const part of parts) {
    for (const line of wrapText(String(part), 110)) {
      page.drawText(line, { x: MARGIN, y, size: 7, font, color: MUTED });
      y -= 9;
    }
  }
}

function drawHeader(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  company: BusinessProfile,
  data: PdfDocumentData,
  hasLogo: boolean,
) {
  const headerH = 88;
  page.drawRectangle({ x: 0, y: PAGE.height - headerH, width: PAGE.width, height: headerH, color: BRAND_COLOR });

  const textX = hasLogo ? MARGIN + PDF_LOGO_WIDTH + 14 : MARGIN;
  page.drawText(company.companyName, {
    x: textX,
    y: PAGE.height - 28,
    size: 14,
    font: fontBold,
    color: WHITE,
  });

  const addressLines = (company.formattedAddress || company.address || "").split("\n").filter(Boolean);
  let leftY = PAGE.height - 44;
  for (const line of [...addressLines.slice(0, 2), company.phone, company.email].filter(Boolean).slice(0, 3)) {
    page.drawText(String(line), { x: textX, y: leftY, size: 8, font, color: rgb(0.94, 0.94, 0.9) });
    leftY -= 10;
  }

  const docLabel = data.type === "quote" ? "ANGEBOT" : "RECHNUNG";
  page.drawText(docLabel, { x: 380, y: PAGE.height - 30, size: 16, font: fontBold, color: WHITE });
  page.drawText(`Nr. ${data.number}`, { x: 380, y: PAGE.height - 46, size: 9, font, color: rgb(0.92, 0.92, 0.88) });
  page.drawText(`Datum: ${formatDateDE(data.date)}`, { x: 380, y: PAGE.height - 58, size: 8, font, color: rgb(0.92, 0.92, 0.88) });

  if (data.type === "quote" && data.validUntil) {
    page.drawText(`Gültig bis: ${formatDateDE(data.validUntil)}`, { x: 380, y: PAGE.height - 68, size: 8, font, color: rgb(0.92, 0.92, 0.88) });
  }
  if (data.type === "invoice" && data.dueDate) {
    page.drawText(`Fällig: ${formatDateDE(data.dueDate)}`, { x: 380, y: PAGE.height - 68, size: 8, font, color: rgb(0.92, 0.92, 0.88) });
  }
  if (data.status) {
    page.drawText(`Status: ${CRM_STATUS_LABELS[data.status]}`, { x: 380, y: PAGE.height - (data.validUntil || data.dueDate ? 78 : 68), size: 7, font, color: rgb(0.92, 0.92, 0.88) });
  }
}

export async function generateCrmPdf(data: PdfDocumentData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([PAGE.width, PAGE.height]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const logo = await fetchLogoBytes(data.company.logoUrl);
  const hasLogo = Boolean(logo);
  if (logo) {
    const image = logo.kind === "png" ? await pdf.embedPng(logo.bytes) : await pdf.embedJpg(logo.bytes);
    page.drawImage(image, {
      x: MARGIN,
      y: PAGE.height - MARGIN - PDF_LOGO_HEIGHT + 8,
      width: PDF_LOGO_WIDTH,
      height: PDF_LOGO_HEIGHT,
    });
  }

  drawHeader(page, font, fontBold, data.company, data, hasLogo);

  let y = PAGE.height - 108;

  // Customer block
  const customerBlockH = 56;
  page.drawRectangle({
    x: MARGIN,
    y: y - customerBlockH,
    width: CONTENT_WIDTH,
    height: customerBlockH,
    color: LIGHT,
    borderColor: BORDER,
    borderWidth: 0.5,
  });
  page.drawText("Empfänger", { x: MARGIN + 10, y: y - 14, size: 8, font: fontBold, color: MUTED });
  page.drawText(data.customer.name, { x: MARGIN + 10, y: y - 28, size: 11, font: fontBold, color: TEXT });
  let cy = y - 40;
  for (const line of [data.customer.address, data.customer.email, data.customer.phone].filter(Boolean)) {
    page.drawText(String(line), { x: MARGIN + 10, y: cy, size: 9, font, color: TEXT });
    cy -= 11;
  }

  y = y - customerBlockH - 16;
  page.drawText(data.title, { x: MARGIN, y, size: 12, font: fontBold, color: TEXT });
  y -= 18;

  // Table header
  const colDesc = MARGIN + 8;
  const colQty = 330;
  const colUnit = 385;
  const colTotal = 475;
  const rowH = 18;

  page.drawRectangle({ x: MARGIN, y: y - 4, width: CONTENT_WIDTH, height: rowH, color: BRAND_COLOR });
  page.drawText("Bezeichnung", { x: colDesc, y: y, size: 9, font: fontBold, color: WHITE });
  page.drawText("Menge", { x: colQty, y: y, size: 9, font: fontBold, color: WHITE });
  page.drawText("Einzelpreis", { x: colUnit, y: y, size: 9, font: fontBold, color: WHITE });
  page.drawText("Gesamt", { x: colTotal, y: y, size: 9, font: fontBold, color: WHITE });
  y -= rowH + 4;

  for (let i = 0; i < data.items.length; i++) {
    if (y < 200) {
      drawFooter(page, font, data.company);
      page = pdf.addPage([PAGE.width, PAGE.height]);
      y = PAGE.height - 64;
    }

    const item = data.items[i];
    const { title, details } = splitDescription(item.description);
    const bg = i % 2 === 0 ? WHITE : LIGHT;
    page.drawRectangle({ x: MARGIN, y: y - rowH + 2, width: CONTENT_WIDTH, height: rowH + (details ? 10 : 0), color: bg });

    page.drawText(title.slice(0, 48), { x: colDesc, y, size: 10, font: fontBold, color: TEXT });
    if (details) {
      page.drawText(details.slice(0, 60), { x: colDesc, y: y - 11, size: 8, font, color: MUTED });
    }
    page.drawText(String(item.quantity), { x: colQty, y, size: 10, font, color: TEXT });
    page.drawText(formatCents(item.unit_price_cents), { x: colUnit, y, size: 10, font, color: TEXT });
    page.drawText(formatCents(item.line_total_cents), { x: colTotal, y, size: 10, font: fontBold, color: TEXT });
    y -= rowH + (details ? 12 : 6);
  }

  y -= 8;
  const totalsW = 200;
  const totalsX = PAGE.width - MARGIN - totalsW;
  const totalsH = data.discount_cents > 0 ? 78 : 64;
  page.drawRectangle({ x: totalsX, y: y - totalsH, width: totalsW, height: totalsH, color: LIGHT, borderColor: BORDER, borderWidth: 0.5 });

  let ty = y - 14;
  page.drawText("Zwischensumme", { x: totalsX + 10, y: ty, size: 9, font, color: MUTED });
  page.drawText(formatCents(data.subtotal_cents), { x: colTotal, y: ty, size: 9, font, color: TEXT });
  ty -= 14;
  if (data.discount_cents > 0) {
    page.drawText(`Rabatt (${data.discount_percent} %)`, { x: totalsX + 10, y: ty, size: 9, font, color: MUTED });
    page.drawText(`-${formatCents(data.discount_cents)}`, { x: colTotal, y: ty, size: 9, font, color: TEXT });
    ty -= 14;
  }
  page.drawText(`MwSt. (${data.tax_rate} %)`, { x: totalsX + 10, y: ty, size: 9, font, color: MUTED });
  page.drawText(formatCents(data.tax_cents), { x: colTotal, y: ty, size: 9, font, color: TEXT });
  ty -= 16;
  page.drawText("Gesamtbetrag", { x: totalsX + 10, y: ty, size: 11, font: fontBold, color: BRAND_COLOR });
  page.drawText(formatCents(data.total_cents), { x: colTotal, y: ty, size: 11, font: fontBold, color: BRAND_COLOR });

  y = ty - 24;
  const inv = data.company.invoiceSettings;
  const closing =
    data.type === "invoice"
      ? inv.invoiceClosingText || inv.invoiceIntroText || data.company.defaultInvoiceText
      : inv.quoteClosingText || inv.quoteIntroText || data.company.defaultQuoteText;

  for (const line of wrapText(closing, 95)) {
    if (y < 120) break;
    page.drawText(line, { x: MARGIN, y, size: 9, font, color: TEXT });
    y -= 12;
  }

  const paymentText = inv.paymentInfoText || data.company.defaultPaymentText;
  if (data.type === "invoice" && paymentText) {
    y -= 4;
    for (const line of wrapText(paymentText, 95)) {
      if (y < 120) break;
      page.drawText(line, { x: MARGIN, y, size: 9, font, color: TEXT });
      y -= 12;
    }
  }

  if (data.remarks) {
    y -= 6;
    page.drawText("Bemerkung", { x: MARGIN, y, size: 9, font: fontBold, color: MUTED });
    for (const line of wrapText(data.remarks, 95).slice(0, 3)) {
      y -= 12;
      if (y < 120) break;
      page.drawText(line, { x: MARGIN, y, size: 9, font, color: TEXT });
    }
  }

  if (data.type === "invoice" && data.company.iban) {
    y -= 10;
    page.drawRectangle({ x: MARGIN, y: y - 52, width: CONTENT_WIDTH * 0.55, height: 52, color: LIGHT, borderColor: BORDER, borderWidth: 0.5 });
    page.drawText("Zahlungsinformationen", { x: MARGIN + 10, y: y - 2, size: 9, font: fontBold, color: MUTED });
    let py = y - 16;
    page.drawText(`IBAN: ${data.company.iban}`, { x: MARGIN + 10, y: py, size: 9, font, color: TEXT });
    py -= 12;
    if (data.company.bic) {
      page.drawText(`BIC: ${data.company.bic}`, { x: MARGIN + 10, y: py, size: 9, font, color: TEXT });
      py -= 12;
    }
    if (data.company.bankName) {
      page.drawText(`Bank: ${data.company.bankName}`, { x: MARGIN + 10, y: py, size: 9, font, color: TEXT });
      py -= 12;
    }
    page.drawText(`Verwendungszweck: ${data.number}`, { x: MARGIN + 10, y: py, size: 9, font: fontBold, color: TEXT });
  }

  page.drawText("Mit freundlichen Grüßen", { x: MARGIN, y: 88, size: 9, font, color: TEXT });
  page.drawText(data.company.companyName, { x: MARGIN, y: 74, size: 10, font: fontBold, color: BRAND_COLOR });

  drawFooter(page, font, data.company);

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
