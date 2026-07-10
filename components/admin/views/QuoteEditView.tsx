"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  QuoteLineItemsEditor,
  createEmptyLineItem,
  lineItemToApiPayload,
  type QuoteLineItemDraft,
} from "@/components/admin/crm/QuoteLineItemsEditor";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminFilterSelect } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { type CrmCustomer, type CrmLineItem } from "@/lib/crm/types";

interface QuoteEditViewProps {
  quoteId?: string;
}

const emptyForm = (taxRate = 19) => ({
  customer_id: "",
  title: "Angebot Kinderbetreuung",
  remarks: "",
  discount_percent: 0,
  tax_rate: taxRate,
  items: [createEmptyLineItem()] as QuoteLineItemDraft[],
});

function lineItemFromApi(item: CrmLineItem): QuoteLineItemDraft {
  const parts = item.description.split("\n");
  return {
    key: item.id ?? crypto.randomUUID(),
    title: parts[0] ?? "",
    details: parts.slice(1).join("\n"),
    quantity: Number(item.quantity),
    unit_price_cents: item.unit_price_cents,
  };
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-form-section">
      <h3 className="admin-form-section-title">{title}</h3>
      {children}
    </div>
  );
}

export function QuoteEditView({ quoteId }: QuoteEditViewProps) {
  const router = useRouter();
  const isNew = !quoteId;
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [defaultTaxRate, setDefaultTaxRate] = useState(19);
  const [discountInput, setDiscountInput] = useState("0");
  const [taxInput, setTaxInput] = useState("19");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { error: showError } = useAdminMessages();
  const { showResult } = useAdminActionFeedback();

  const parsePercent = (value: string, fallback: number) => {
    const trimmed = value.trim();
    if (trimmed === "") return fallback;
    const num = Number(trimmed.replace(",", "."));
    if (Number.isNaN(num)) return fallback;
    return Math.min(100, Math.max(0, num));
  };

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []));
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const rate = d.settings?.invoice?.defaultTaxRate;
        if (typeof rate === "number" && rate >= 0) {
          setDefaultTaxRate(rate);
          setTaxInput(String(rate));
          if (isNew) setForm(emptyForm(rate));
        }
      })
      .catch(() => undefined);
  }, [isNew]);

  const loadQuote = useCallback(async () => {
    if (!quoteId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`);
      const data = await res.json();
      if (!res.ok || !data.quote) throw new Error(data.error ?? "Angebot konnte nicht geladen werden.");
      const quote = data.quote;
      setQuoteNumber(quote.quote_number ?? "");
      setForm({
        customer_id: quote.customer_id,
        title: quote.title,
        remarks: quote.remarks ?? "",
        discount_percent: quote.discount_percent,
        tax_rate: quote.tax_rate,
        items: (quote.items ?? []).map(lineItemFromApi),
      });
      setDiscountInput(String(quote.discount_percent));
      setTaxInput(String(quote.tax_rate));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Angebot konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  useEffect(() => {
    if (quoteId) void loadQuote();
  }, [quoteId, loadQuote]);

  const customerOptions = useMemo(
    () => [{ value: "", label: "Kunde wählen…" }, ...customers.map((c) => ({ value: c.id, label: c.name }))],
    [customers],
  );

  const discountPercent = parsePercent(discountInput, 0);
  const taxRate = parsePercent(taxInput, defaultTaxRate);

  const saveQuote = async () => {
    if (saving) return;
    if (!form.customer_id) return showError("Angebot konnte nicht gespeichert werden.", "Bitte einen Kunden auswählen.");
    if (!form.items.some((i) => i.title.trim())) {
      return showError("Angebot konnte nicht gespeichert werden.", "Mindestens eine Position mit Bezeichnung erforderlich.");
    }

    const payload = {
      customer_id: form.customer_id,
      title: form.title,
      remarks: form.remarks,
      discount_percent: discountPercent,
      tax_rate: taxRate,
      status: "draft" as const,
      items: form.items.map(lineItemToApiPayload),
    };

    setSaving(true);
    try {
      if (quoteId) {
        const res = await fetch("/api/admin/quotes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: quoteId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) return showResult(ACTION_RESULTS.genericError(data.error ?? "Angebot konnte nicht aktualisiert werden."));
        showResult({ title: "Gespeichert", message: "Angebot wurde gespeichert.", status: "success" });
        await loadQuote();
      } else {
        const res = await fetch("/api/admin/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) return showResult(ACTION_RESULTS.genericError(data.error ?? "Angebot konnte nicht erstellt werden."));
        showResult(ACTION_RESULTS.quoteCreated());
        if (data.quote?.id) router.replace(`/admin/angebote/${data.quote.id}`);
        else router.push("/admin/angebote");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-text-muted">Angebot wird geladen…</p>;

  if (loadError) {
    return (
      <AdminCard>
        <p className="text-sm text-accent-heart">{loadError}</p>
        <AdminButton className="mt-4" variant="secondary" href="/admin/angebote">
          Zurück zur Liste
        </AdminButton>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isNew ? "Neues Angebot" : `Angebot ${quoteNumber}`}
        description={isNew ? "Angebot anlegen und Positionen erfassen." : "Angebot bearbeiten und speichern."}
      >
        <AdminButton variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} href="/admin/angebote">
          Zurück zur Liste
        </AdminButton>
      </AdminPageHeader>

      <AdminCard>
        <FormSection title="Kunde">
          <AdminFormField label="Kunde" required>
            <AdminFilterSelect
              value={form.customer_id}
              onChange={(v) => setForm({ ...form, customer_id: v })}
              options={customerOptions}
            />
          </AdminFormField>
        </FormSection>

        <FormSection title="Angebotsdaten">
          <AdminFormField label="Titel" required>
            <input
              className="admin-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </AdminFormField>
        </FormSection>

        <FormSection title="Positionen">
          <QuoteLineItemsEditor
            items={form.items}
            discountPercent={discountPercent}
            taxRate={taxRate}
            onChange={(items) => setForm({ ...form, items })}
          />
        </FormSection>

        <FormSection title="Rabatt & Steuern">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Rabatt (%)">
              <input
                className="admin-input"
                type="text"
                inputMode="decimal"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
              />
            </AdminFormField>
            <AdminFormField label="MwSt. (%)">
              <input
                className="admin-input"
                type="text"
                inputMode="decimal"
                value={taxInput}
                onChange={(e) => setTaxInput(e.target.value)}
              />
            </AdminFormField>
          </div>
        </FormSection>

        <FormSection title="Hinweise">
          <AdminFormField label="Bemerkung">
            <textarea
              className="admin-input min-h-20"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
          </AdminFormField>
        </FormSection>

        <div className="mt-6 flex flex-wrap gap-2">
          <AdminButton variant="primary" onClick={() => void saveQuote()} loading={saving} disabled={saving}>
            {ADMIN_BTN.save}
          </AdminButton>
          <AdminButton variant="secondary" href="/admin/angebote">
            {ADMIN_BTN.cancel}
          </AdminButton>
        </div>
      </AdminCard>
    </div>
  );
}
