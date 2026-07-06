"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Send } from "lucide-react";
import { CrmSendModal } from "@/components/admin/crm/CrmSendModal";
import {
  QuoteLineItemsEditor,
  createEmptyLineItem,
  lineItemToApiPayload,
  type QuoteLineItemDraft,
} from "@/components/admin/crm/QuoteLineItemsEditor";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import {
  AdminButton,
  AdminEmptyState,
  AdminFilterBar,
  AdminFilterSelect,
  AdminSearchInput,
  AdminStatusBadge,
  crmDocumentStatusVariant,
} from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_MSG } from "@/lib/admin/messages";
import { formatCents } from "@/lib/crm/money";
import { CRM_STATUS_LABELS, type CrmCustomer, type CrmDocumentStatus } from "@/lib/crm/types";

interface QuoteRow {
  id: string;
  quote_number: string;
  title: string;
  status: CrmDocumentStatus;
  total_cents: number;
  customer?: { name: string; email?: string | null };
}

const emptyForm = (taxRate = 19) => ({
  customer_id: "",
  title: "Angebot Kinderbetreuung",
  remarks: "",
  discount_percent: 0,
  tax_rate: taxRate,
  items: [createEmptyLineItem()] as QuoteLineItemDraft[],
});

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-form-section">
      <h3 className="admin-form-section-title">{title}</h3>
      {children}
    </div>
  );
}

export function QuotesView() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [defaultTaxRate, setDefaultTaxRate] = useState(19);
  const [discountInput, setDiscountInput] = useState("0");
  const [taxInput, setTaxInput] = useState("19");
  const [sendTarget, setSendTarget] = useState<QuoteRow | null>(null);
  const [sendToCustomer, setSendToCustomer] = useState(true);
  const [copyToBusiness, setCopyToBusiness] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<{ message: string; detail?: string } | null>(null);
  const { withLoading, quoteCreated, quoteSent, invoiceCreated, error: showError } = useAdminMessages();
  const page = adminPageHeaderProps("angebote");
  const empty = ADMIN_EMPTY_STATES.quotes;

  const load = () => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/quotes${q}`).then((r) => r.json()).then((d) => setQuotes(d.quotes ?? []));
  };

  useEffect(() => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/quotes${q}`).then((r) => r.json()).then((d) => setQuotes(d.quotes ?? []));
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? []));
  }, [search]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const rate = d.settings?.invoice?.defaultTaxRate;
        if (typeof rate === "number" && rate >= 0) {
          setDefaultTaxRate(rate);
          setTaxInput(String(rate));
          setForm(emptyForm(rate));
        }
      })
      .catch(() => undefined);
  }, []);

  const resetForm = () => {
    setForm(emptyForm(defaultTaxRate));
    setDiscountInput("0");
    setTaxInput(String(defaultTaxRate));
  };

  const parsePercent = (value: string, fallback: number) => {
    const trimmed = value.trim();
    if (trimmed === "") return fallback;
    const num = Number(trimmed.replace(",", "."));
    if (Number.isNaN(num)) return fallback;
    return Math.min(100, Math.max(0, num));
  };

  const create = async () => {
    if (!form.customer_id) return showError("Angebot konnte nicht erstellt werden.", "Bitte einen Kunden auswählen.");
    if (!form.items.some((i) => i.title.trim())) return showError("Angebot konnte nicht erstellt werden.", "Mindestens eine Position mit Bezeichnung erforderlich.");

    const discount_percent = parsePercent(discountInput, 0);
    const tax_rate = parsePercent(taxInput, defaultTaxRate);

    const payload = {
      customer_id: form.customer_id,
      title: form.title,
      remarks: form.remarks,
      discount_percent,
      tax_rate,
      status: "draft" as const,
      items: form.items.map(lineItemToApiPayload),
    };

    const res = await fetch("/api/admin/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return showError("Angebot konnte nicht erstellt werden.", data.error);
    quoteCreated();
    setShowForm(false);
    resetForm();
    load();
  };

  const confirmSend = async () => {
    if (!sendTarget || !sendToCustomer) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/admin/quotes/${sendTarget.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyToBusiness }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError({ message: data.error ?? ADMIN_MSG.sendFailed, detail: data.detail });
        return;
      }
      quoteSent();
      setSendTarget(null);
      load();
    } catch (err) {
      showError("Die E-Mail konnte nicht versendet werden.", err instanceof Error ? err.message : undefined);
    } finally {
      setSending(false);
    }
  };

  const toInvoice = async (quoteId: string) => {
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quote_id: quoteId }),
    });
    const data = await res.json();
    if (!res.ok) return showError("Rechnung konnte nicht erstellt werden.", data.error);
    invoiceCreated(data.invoice?.invoice_number);
  };

  const customerOptions = useMemo(
    () => [{ value: "", label: "Kunde wählen…" }, ...customers.map((c) => ({ value: c.id, label: c.name }))],
    [customers],
  );

  const discountPercent = parsePercent(discountInput, 0);
  const taxRate = parsePercent(taxInput, 19);

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page}>
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
          Neues Angebot
        </AdminButton>
      </AdminPageHeader>

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Angebote suchen…" />
      </AdminFilterBar>

      {showForm ? (
        <AdminCard title="Neues Angebot">
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
                placeholder="z. B. Angebot Kinderbetreuung Hochzeit"
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
              <AdminFormField label="Rabatt (%)" hint="Standard: 0">
                <input
                  className="admin-input"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  onBlur={() => setDiscountInput(String(parsePercent(discountInput, 0)))}
                />
              </AdminFormField>
              <AdminFormField label="MwSt. (%)" hint="Standard: 19">
                <input
                  className="admin-input"
                  type="text"
                  inputMode="decimal"
                  placeholder="19"
                  value={taxInput}
                  onChange={(e) => setTaxInput(e.target.value)}
                  onBlur={() => setTaxInput(String(parsePercent(taxInput, 19)))}
                />
              </AdminFormField>
            </div>
          </FormSection>

          <FormSection title="Hinweise">
            <AdminFormField label="Bemerkung">
              <textarea
                className="admin-input min-h-20"
                placeholder="Zusätzliche Hinweise für den Kunden…"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </AdminFormField>
          </FormSection>

          <div className="mt-6 flex flex-wrap gap-2">
            <AdminButton variant="primary" onClick={() => void withLoading(create())}>
              {ADMIN_BTN.save}
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>
              {ADMIN_BTN.cancel}
            </AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {quotes.length === 0 ? (
        <AdminEmptyState
          icon={FileText}
          title={empty.title}
          description={empty.description}
          actionLabel={empty.actionLabel}
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <AdminCard key={q.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{q.quote_number} — {q.title}</p>
                  <p className="text-sm text-text-muted">{q.customer?.name} · {formatCents(q.total_cents)}</p>
                  <div className="mt-1">
                    <AdminStatusBadge label={CRM_STATUS_LABELS[q.status]} variant={crmDocumentStatusVariant(q.status)} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton variant="secondary" href={`/api/admin/quotes/${q.id}/pdf`} target="_blank">
                    {ADMIN_BTN.pdf}
                  </AdminButton>
                  <AdminButton
                    variant="primary"
                    icon={<Send className="h-4 w-4" />}
                    onClick={() => {
                      setSendTarget(q);
                      setSendToCustomer(true);
                      setCopyToBusiness(true);
                      setSendError(null);
                    }}
                  >
                    {ADMIN_BTN.send}
                  </AdminButton>
                  <AdminButton variant="secondary" onClick={() => toInvoice(q.id)}>
                    → Rechnung
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <CrmSendModal
        open={Boolean(sendTarget)}
        title={`Angebot ${sendTarget?.quote_number ?? ""} versenden`}
        customerEmail={sendTarget?.customer?.email}
        sendToCustomer={sendToCustomer}
        copyToBusiness={copyToBusiness}
        loading={sending}
        error={sendError}
        onChangeSendToCustomer={setSendToCustomer}
        onChangeCopyToBusiness={setCopyToBusiness}
        onClose={() => setSendTarget(null)}
        onConfirm={() => void confirmSend()}
      />
    </div>
  );
}
