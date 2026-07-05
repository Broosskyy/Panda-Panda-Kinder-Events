"use client";

import { Copy, Trash2 } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { calculateDocumentTotals, formatCents, parseEuroToCents } from "@/lib/crm/money";

export interface QuoteLineItemDraft {
  key: string;
  title: string;
  details: string;
  quantity: number;
  unit_price_cents: number;
}

export function createEmptyLineItem(): QuoteLineItemDraft {
  return {
    key: crypto.randomUUID(),
    title: "",
    details: "",
    quantity: 1,
    unit_price_cents: 0,
  };
}

export function lineItemToApiPayload(item: QuoteLineItemDraft) {
  const description = item.details.trim()
    ? `${item.title.trim()}\n${item.details.trim()}`
    : item.title.trim();
  return {
    description: description || "Position",
    quantity: item.quantity,
    unit_price_cents: item.unit_price_cents,
  };
}

interface QuoteLineItemsEditorProps {
  items: QuoteLineItemDraft[];
  discountPercent: number;
  taxRate: number;
  onChange: (items: QuoteLineItemDraft[]) => void;
}

export function QuoteLineItemsEditor({ items, discountPercent, taxRate, onChange }: QuoteLineItemsEditorProps) {
  const totals = calculateDocumentTotals(
    items.map((i) => ({ quantity: i.quantity, unit_price_cents: i.unit_price_cents })),
    discountPercent,
    taxRate,
  );

  const updateItem = (index: number, patch: Partial<QuoteLineItemDraft>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-text-primary">Positionen</p>
        <AdminButton variant="secondary" onClick={() => onChange([...items, createEmptyLineItem()])}>
          + Neue Position
        </AdminButton>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const lineTotal = Math.round(item.quantity * item.unit_price_cents);
          return (
            <div key={item.key} className="admin-line-item-card">
              <div className="grid gap-3 md:grid-cols-2">
                <AdminFormField label="Bezeichnung" className="md:col-span-2">
                  <input
                    className="admin-input"
                    placeholder="z. B. Kinderbetreuung Hochzeit"
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                  />
                </AdminFormField>
                <AdminFormField label="Beschreibung (optional)" className="md:col-span-2">
                  <textarea
                    className="admin-input min-h-16"
                    placeholder="Details zur Leistung…"
                    value={item.details}
                    onChange={(e) => updateItem(index, { details: e.target.value })}
                  />
                </AdminFormField>
                <AdminFormField label="Menge">
                  <input
                    className="admin-input"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                  />
                </AdminFormField>
                <AdminFormField label="Einzelpreis (€)">
                  <input
                    className="admin-input"
                    placeholder="0,00"
                    defaultValue={item.unit_price_cents ? (item.unit_price_cents / 100).toFixed(2).replace(".", ",") : ""}
                    onBlur={(e) => updateItem(index, { unit_price_cents: parseEuroToCents(e.target.value) })}
                  />
                </AdminFormField>
                <div className="flex items-end justify-between gap-3 md:col-span-2">
                  <p className="text-sm font-medium text-text-secondary">
                    Gesamt: <span className="text-text-primary">{formatCents(lineTotal)}</span>
                  </p>
                  <div className="flex gap-2">
                    <AdminButton
                      variant="ghost"
                      icon={<Copy className="h-4 w-4" />}
                      onClick={() => onChange([...items, { ...item, key: crypto.randomUUID() }])}
                    >
                      Duplizieren
                    </AdminButton>
                    {items.length > 1 ? (
                      <AdminButton
                        variant="danger"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => onChange(items.filter((_, i) => i !== index))}
                      >
                        Löschen
                      </AdminButton>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-totals-panel">
        <div className="flex justify-between text-sm"><span>Zwischensumme</span><span>{formatCents(totals.subtotal_cents)}</span></div>
        {discountPercent > 0 ? (
          <div className="flex justify-between text-sm text-text-muted">
            <span>Rabatt ({discountPercent}%)</span>
            <span>-{formatCents(totals.discount_cents)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-sm"><span>MwSt. ({taxRate}%)</span><span>{formatCents(totals.tax_cents)}</span></div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-text-primary">
          <span>Gesamtbetrag</span>
          <span>{formatCents(totals.total_cents)}</span>
        </div>
      </div>
    </div>
  );
}
