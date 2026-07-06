import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { BusinessProfile } from "./company";
import { loadLogoBytes } from "./load-logo";
import { pdfSafeDate, pdfSafeText } from "./pdf-text";
import { formatCents } from "./money";
import type { CrmCustomer, CrmDocumentStatus, CrmInvoice, CrmQuote } from "./types";
import { CRM_STATUS_LABELS } from "./types";

const MM = 2.834645669;
const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = { top: 24 * MM, bottom: 18 * MM, side: 18 * MM };
const CONTENT_WIDTH = PAGE.width - MARGIN.side * 2;
const FOOTER_RESERVE = 72;
const LOGO_MAX_HEIGHT = 45;
const LOGO_MAX_WIDTH = 120;

const BRAND = rgb(0.322, 0.337, 0.243);
const TEXT = rgb(0.12, 0.12, 0.12);
const MUTED = rgb(0.42, 0.42, 0.42);
const LIGHT = rgb(0.97, 0.96, 0.94);
const BORDER = rgb(0.86, 0.85, 0.82);
const WHITE = rgb(1, 1, 1);

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

const PLACEHOLDER_PATTERNS = [/platzhalter/i, /juristisch prüfen/i, /todo/i, /lorem ipsum/i, /beispiel\.de/i];

function isLiveText(value: string | null | undefined): value is string {
  const t = value?.trim();
  if (!t) return false;
  return !PLACEHOLDER_PATTERNS.some((p) => p.test(t));
}

function safeDraw(page: PDFPage, text: string | null | undefined, options: Parameters<PDFPage["drawText"]>[1]) {
  page.drawText(pdfSafeText(text), options);
}

function drawRight(
  page: PDFPage,
  font: PDFFont,
  text: string,
  rightX: number,
  y: number,
  size: number,
  color: ReturnType<typeof rgb>,
) {
  const f = font;
  const safe = pdfSafeText(text);
  const w = f.widthOfTextAtSize(safe, size);
  page.drawText(safe, { x: rightX - w, y, size, font: f, color });
}

function wrapText(text: string, maxLen: number): string[] {
  const safe = pdfSafeText(text);
  const words = safe.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLen) {
      if (line) lines.push(line);
      line = word.length > maxLen ? word.slice(0, maxLen) : word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function splitDescription(description: string): { title: string; details: string | null } {
  const parts = pdfSafeText(description).split("\n");
  return { title: parts[0]?.trim() || description, details: parts.slice(1).join(" ").trim() || null };
}

function splitCustomerAddress(address: string | null | undefined): { street?: string; cityLine?: string } {
  if (!address?.trim()) return {};
  const lines = address.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 2) return { street: lines[0], cityLine: lines.slice(1).join(", ") };
  return { cityLine: lines[0] };
}

interface LogoDims {
  width: number;
  height: number;
}

function fitLogo(aspect: number): LogoDims {
  let height = LOGO_MAX_HEIGHT;
  let width = height * aspect;
  if (width > LOGO_MAX_WIDTH) {
    width = LOGO_MAX_WIDTH;
    height = width / aspect;
  }
  return { width, height };
}

function drawPageFooter(page: PDFPage, font: PDFFont, _fontBold: PDFFont, company: BusinessProfile) {
  const y0 = MARGIN.bottom + 8;
  page.drawLine({
    start: { x: MARGIN.side, y: y0 + 44 },
    end: { x: PAGE.width - MARGIN.side, y: y0 + 44 },
    thickness: 0.5,
    color: BORDER,
  });

  const parts = [
    company.companyName,
    company.formattedAddress?.replace(/\n/g, " · ") || company.address?.replace(/\n/g, " · "),
    [company.phone, company.email, company.website].filter(Boolean).join(" · "),
    [company.taxNumber && `St.-Nr. ${company.taxNumber}`, company.vatId && `USt-ID ${company.vatId}`]
      .filter(Boolean)
      .join(" · "),
  ].filter(Boolean);

  let y = y0 + 32;
  for (const part of parts) {
    for (const line of wrapText(String(part), 105)) {
      safeDraw(page, line, { x: MARGIN.side, y, size: 7, font, color: MUTED });
      y -= 9;
    }
  }
}

function drawCompactHeader(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  data: PdfDocumentData,
) {
  const docLabel = data.type === "quote" ? "ANGEBOT" : "RECHNUNG";
  safeDraw(page, docLabel, {
    x: PAGE.width - MARGIN.side - 120,
    y: PAGE.height - MARGIN.top - 4,
    size: 11,
    font: fontBold,
    color: BRAND,
  });
  safeDraw(page, data.number, {
    x: PAGE.width - MARGIN.side - 120,
    y: PAGE.height - MARGIN.top - 18,
    size: 9,
    font,
    color: MUTED,
  });
}

async function drawLogoOnPage(
  pdf: PDFDocument,
  page: PDFPage,
  company: BusinessProfile,
  topY: number,
): Promise<LogoDims | null> {
  const logo = await loadLogoBytes(company.logoUrl);
  if (!logo) return null;
  try {
    const image = logo.kind === "png" ? await pdf.embedPng(logo.bytes) : await pdf.embedJpg(logo.bytes);
    const dims = fitLogo(image.width / image.height);
    page.drawImage(image, {
      x: MARGIN.side,
      y: topY - dims.height,
      width: dims.width,
      height: dims.height,
    });
    return dims;
  } catch (err) {
    console.warn("PDF logo embed failed:", err);
    return null;
  }
}

function drawMainHeader(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  company: BusinessProfile,
  data: PdfDocumentData,
  logoDims: LogoDims | null,
  topY: number,
): number {
  const leftX = logoDims ? MARGIN.side + logoDims.width + 12 : MARGIN.side;
  let leftY = topY - 14;

  safeDraw(page, company.companyName, { x: leftX, y: leftY, size: 11, font: fontBold, color: TEXT });
  leftY -= 12;

  const addressLines = pdfSafeText(company.formattedAddress || company.address || "")
    .split("\n")
    .filter(Boolean)
    .slice(0, 2);
  for (const line of addressLines) {
    safeDraw(page, line, { x: leftX, y: leftY, size: 8, font, color: MUTED });
    leftY -= 10;
  }
  for (const line of [company.phone, company.email, company.website].filter(Boolean)) {
    safeDraw(page, String(line), { x: leftX, y: leftY, size: 8, font, color: MUTED });
    leftY -= 10;
  }

  const rightX = PAGE.width - MARGIN.side;
  const docLabel = data.type === "quote" ? "ANGEBOT" : "RECHNUNG";
  drawRight(page, fontBold, docLabel, rightX, topY - 14, 14, BRAND);
  drawRight(page, font, `Nr. ${data.number}`, rightX, topY - 30, 9, MUTED);
  drawRight(page, font, `Datum: ${pdfSafeDate(data.date)}`, rightX, topY - 42, 8, MUTED);

  let metaY = topY - 54;
  if (data.type === "quote" && data.validUntil) {
    drawRight(page, font, `Gueltig bis: ${pdfSafeDate(data.validUntil)}`, rightX, metaY, 8, MUTED);
    metaY -= 11;
  }
  if (data.type === "invoice" && data.dueDate) {
    drawRight(page, font, `Faellig am: ${pdfSafeDate(data.dueDate)}`, rightX, metaY, 8, MUTED);
    metaY -= 11;
  }
  if (data.status) {
    drawRight(page, font, `Status: ${CRM_STATUS_LABELS[data.status]}`, rightX, metaY, 8, MUTED);
  }

  const headerBottom = Math.min(leftY, topY - (logoDims?.height ?? 0) - 8);
  return headerBottom - 16;
}

function drawRecipientBlock(page: PDFPage, font: PDFFont, fontBold: PDFFont, customer: CrmCustomer, yTop: number): number {
  const blockH = 68;
  page.drawRectangle({
    x: MARGIN.side,
    y: yTop - blockH,
    width: CONTENT_WIDTH,
    height: blockH,
    color: LIGHT,
    borderColor: BORDER,
    borderWidth: 0.5,
  });

  let y = yTop - 14;
  safeDraw(page, "Empfaenger", { x: MARGIN.side + 10, y, size: 8, font: fontBold, color: MUTED });
  y -= 14;
  safeDraw(page, customer.name, { x: MARGIN.side + 10, y, size: 11, font: fontBold, color: TEXT });
  y -= 12;

  const addr = splitCustomerAddress(customer.address);
  if (addr.street) {
    safeDraw(page, addr.street, { x: MARGIN.side + 10, y, size: 9, font, color: TEXT });
    y -= 11;
  }
  if (addr.cityLine) {
    safeDraw(page, addr.cityLine, { x: MARGIN.side + 10, y, size: 9, font, color: TEXT });
    y -= 11;
  }
  if (customer.phone) {
    safeDraw(page, customer.phone, { x: MARGIN.side + 10, y, size: 9, font, color: TEXT });
    y -= 11;
  }
  if (customer.email) {
    safeDraw(page, customer.email, { x: MARGIN.side + 10, y, size: 9, font, color: TEXT });
  }

  return yTop - blockH - 20;
}

const COL = {
  label: MARGIN.side + 6,
  desc: MARGIN.side + 148,
  qtyRight: MARGIN.side + 318,
  unitRight: MARGIN.side + 398,
  totalRight: PAGE.width - MARGIN.side - 6,
};

function drawTableHeader(page: PDFPage, fontBold: PDFFont, y: number): number {
  const h = 20;
  page.drawRectangle({ x: MARGIN.side, y: y - h + 4, width: CONTENT_WIDTH, height: h, color: BRAND });
  safeDraw(page, "Bezeichnung", { x: COL.label, y: y - 10, size: 8, font: fontBold, color: WHITE });
  safeDraw(page, "Beschreibung", { x: COL.desc, y: y - 10, size: 8, font: fontBold, color: WHITE });
  drawRight(page, fontBold, "Menge", COL.qtyRight, y - 10, 8, WHITE);
  drawRight(page, fontBold, "Einzelpreis", COL.unitRight, y - 10, 8, WHITE);
  drawRight(page, fontBold, "Gesamt", COL.totalRight, y - 10, 8, WHITE);
  return y - h - 2;
}

export async function generateCrmPdf(data: PdfDocumentData): Promise<Uint8Array> {
  try {
    const pdf = await PDFDocument.create();
    let page = pdf.addPage([PAGE.width, PAGE.height]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const topY = PAGE.height - MARGIN.top;
    const logoDims = await drawLogoOnPage(pdf, page, data.company, topY);
    let y = drawMainHeader(page, font, fontBold, data.company, data, logoDims, topY);

    y = drawRecipientBlock(page, font, fontBold, data.customer, y);

    const displayTitle =
      data.type === "quote"
        ? data.title || "Angebot Kinderbetreuung"
        : data.title || `Rechnung ${data.number}`;
    safeDraw(page, displayTitle, { x: MARGIN.side, y, size: 13, font: fontBold, color: TEXT });
    y -= 22;

    y = drawTableHeader(page, fontBold, y);

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const { title, details } = splitDescription(item.description);
      const rowH = details ? 28 : 18;

      if (y - rowH < MARGIN.bottom + FOOTER_RESERVE + 120) {
        drawPageFooter(page, font, fontBold, data.company);
        page = pdf.addPage([PAGE.width, PAGE.height]);
        drawCompactHeader(page, font, fontBold, data);
        y = PAGE.height - MARGIN.top - 36;
        y = drawTableHeader(page, fontBold, y);
      }

      if (i % 2 === 1) {
        page.drawRectangle({
          x: MARGIN.side,
          y: y - rowH + 4,
          width: CONTENT_WIDTH,
          height: rowH,
          color: LIGHT,
        });
      }

      const titleLines = wrapText(title, 22);
      const detailLines = details ? wrapText(details, 24) : [];
      safeDraw(page, titleLines[0] ?? "", { x: COL.label, y: y - 10, size: 9, font: fontBold, color: TEXT });
      if (detailLines[0]) {
        safeDraw(page, detailLines[0], { x: COL.desc, y: y - 10, size: 8, font, color: MUTED });
      }
      drawRight(page, font, String(item.quantity), COL.qtyRight, y - 10, 9, TEXT);
      drawRight(page, font, formatCents(item.unit_price_cents), COL.unitRight, y - 10, 9, TEXT);
      drawRight(page, fontBold, formatCents(item.line_total_cents), COL.totalRight, y - 10, 9, TEXT);
      y -= rowH;
    }

    y -= 10;
    const totalsW = 210;
    const totalsX = PAGE.width - MARGIN.side - totalsW;
    const totalsRows = data.discount_cents > 0 ? 4 : 3;
    const totalsH = 16 + totalsRows * 14 + 8;
    page.drawRectangle({
      x: totalsX,
      y: y - totalsH,
      width: totalsW,
      height: totalsH,
      color: WHITE,
      borderColor: BORDER,
      borderWidth: 0.75,
    });

    let ty = y - 14;
    safeDraw(page, "Zwischensumme", { x: totalsX + 10, y: ty, size: 9, font, color: MUTED });
    drawRight(page, font, formatCents(data.subtotal_cents), COL.totalRight, ty, 9, TEXT);
    ty -= 14;
    if (data.discount_cents > 0) {
      safeDraw(page, `Rabatt (${data.discount_percent} %)`, { x: totalsX + 10, y: ty, size: 9, font, color: MUTED });
      drawRight(page, font, `-${formatCents(data.discount_cents)}`, COL.totalRight, ty, 9, TEXT);
      ty -= 14;
    }
    safeDraw(page, `MwSt. (${data.tax_rate} %)`, { x: totalsX + 10, y: ty, size: 9, font, color: MUTED });
    drawRight(page, font, formatCents(data.tax_cents), COL.totalRight, ty, 9, TEXT);
    ty -= 16;
    safeDraw(page, "Gesamtbetrag", { x: totalsX + 10, y: ty, size: 10, font: fontBold, color: BRAND });
    drawRight(page, fontBold, formatCents(data.total_cents), COL.totalRight, ty, 10, BRAND);

    y = ty - 24;
    const inv = data.company.invoiceSettings;
    const intro =
      data.type === "quote"
        ? inv.quoteIntroText || data.company.defaultQuoteText
        : inv.invoiceIntroText || data.company.defaultInvoiceText;
    const closing =
      data.type === "quote"
        ? inv.quoteClosingText || intro
        : inv.invoiceClosingText || inv.invoiceIntroText || data.company.defaultInvoiceText;

    if (isLiveText(intro) && data.type === "quote") {
      for (const line of wrapText(intro, 92)) {
        if (y < MARGIN.bottom + FOOTER_RESERVE + 40) break;
        safeDraw(page, line, { x: MARGIN.side, y, size: 9, font, color: TEXT });
        y -= 12;
      }
      y -= 4;
    }

    if (isLiveText(closing)) {
      for (const line of wrapText(closing, 92)) {
        if (y < MARGIN.bottom + FOOTER_RESERVE + 40) break;
        safeDraw(page, line, { x: MARGIN.side, y, size: 9, font, color: TEXT });
        y -= 12;
      }
    }

    const paymentText = inv.paymentInfoText || data.company.defaultPaymentText;
    if (data.type === "invoice" && isLiveText(paymentText)) {
      y -= 6;
      safeDraw(page, "Zahlungshinweis", { x: MARGIN.side, y, size: 9, font: fontBold, color: MUTED });
      y -= 12;
      for (const line of wrapText(paymentText, 92)) {
        if (y < MARGIN.bottom + FOOTER_RESERVE + 60) break;
        safeDraw(page, line, { x: MARGIN.side, y, size: 9, font, color: TEXT });
        y -= 12;
      }
    }

    if (data.type === "invoice" && data.company.iban) {
      y -= 8;
      const bankH = 58;
      if (y - bankH < MARGIN.bottom + FOOTER_RESERVE) {
        drawPageFooter(page, font, fontBold, data.company);
        page = pdf.addPage([PAGE.width, PAGE.height]);
        y = PAGE.height - MARGIN.top - 40;
      }
      page.drawRectangle({
        x: MARGIN.side,
        y: y - bankH,
        width: CONTENT_WIDTH * 0.62,
        height: bankH,
        color: LIGHT,
        borderColor: BORDER,
        borderWidth: 0.5,
      });
      let py = y - 12;
      safeDraw(page, "Bankverbindung", { x: MARGIN.side + 10, y: py, size: 9, font: fontBold, color: MUTED });
      py -= 13;
      if (data.company.accountHolder) {
        safeDraw(page, `Kontoinhaber: ${data.company.accountHolder}`, { x: MARGIN.side + 10, y: py, size: 9, font, color: TEXT });
        py -= 11;
      }
      safeDraw(page, `IBAN: ${data.company.iban}`, { x: MARGIN.side + 10, y: py, size: 9, font, color: TEXT });
      py -= 11;
      if (data.company.bic) {
        safeDraw(page, `BIC: ${data.company.bic}`, { x: MARGIN.side + 10, y: py, size: 9, font, color: TEXT });
        py -= 11;
      }
      if (data.company.bankName) {
        safeDraw(page, `Bank: ${data.company.bankName}`, { x: MARGIN.side + 10, y: py, size: 9, font, color: TEXT });
        py -= 11;
      }
      safeDraw(page, `Verwendungszweck: ${data.number}`, { x: MARGIN.side + 10, y: py, size: 9, font: fontBold, color: TEXT });
      y -= bankH + 8;
    }

    if (isLiveText(data.remarks)) {
      y -= 4;
      safeDraw(page, "Bemerkung", { x: MARGIN.side, y, size: 9, font: fontBold, color: MUTED });
      y -= 12;
      for (const line of wrapText(data.remarks!, 92)) {
        if (y < MARGIN.bottom + FOOTER_RESERVE + 20) break;
        safeDraw(page, line, { x: MARGIN.side, y, size: 9, font, color: TEXT });
        y -= 12;
      }
    }

    safeDraw(page, "Mit freundlichen Gruessen", { x: MARGIN.side, y: MARGIN.bottom + FOOTER_RESERVE - 8, size: 9, font, color: TEXT });
    safeDraw(page, data.company.companyName, {
      x: MARGIN.side,
      y: MARGIN.bottom + FOOTER_RESERVE - 22,
      size: 10,
      font: fontBold,
      color: BRAND,
    });

    const pages = pdf.getPages();
    for (const p of pages) {
      drawPageFooter(p, font, fontBold, data.company);
    }

    return pdf.save();
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("generateCrmPdf failed:", detail, err);
    throw new Error(`PDF-Erstellung fehlgeschlagen: ${detail}`);
  }
}

export function quoteToPdfData(
  quote: CrmQuote & { items: PdfLineItem[] },
  company: BusinessProfile,
): PdfDocumentData {
  return {
    type: "quote",
    number: quote.quote_number,
    title: quote.title || "Angebot Kinderbetreuung",
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
    title: invoice.title || `Rechnung zu Angebot ${invoice.quote_id ?? ""}`,
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
