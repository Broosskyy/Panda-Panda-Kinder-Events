export function formatCents(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function parseEuroToCents(value: string | number): number {
  if (typeof value === "number") return Math.round(value * 100);
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const num = parseFloat(normalized);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

export interface LineItemInput {
  quantity: number;
  unit_price_cents: number;
}

export interface TotalsResult {
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  items: { line_total_cents: number }[];
}

export function calculateDocumentTotals(
  items: LineItemInput[],
  discountPercent: number,
  taxRate: number,
): TotalsResult {
  const computedItems = items.map((item) => ({
    line_total_cents: Math.round(item.quantity * item.unit_price_cents),
  }));

  const subtotal_cents = computedItems.reduce((sum, i) => sum + i.line_total_cents, 0);
  const discount_cents = Math.round(subtotal_cents * (discountPercent / 100));
  const taxable = subtotal_cents - discount_cents;
  const tax_cents = Math.round(taxable * (taxRate / 100));
  const total_cents = taxable + tax_cents;

  return {
    subtotal_cents,
    discount_cents,
    tax_cents,
    total_cents,
    items: computedItems,
  };
}
