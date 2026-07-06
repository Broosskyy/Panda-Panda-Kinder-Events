"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, Pencil, Plus, Send, Trash2 } from "lucide-react";
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
import { ADMIN_CONFIRM, ADMIN_MSG, confirmDanger } from "@/lib/admin/messages";
import { downloadAdminPdf, openAdminPdf } from "@/lib/admin/open-pdf";
import { formatCents } from "@/lib/crm/money";
import { CRM_STATUS_LABELS, type CrmCustomer, type CrmDocumentStatus, type CrmLineItem } from "@/lib/crm/types";

interface QuoteRow {
  id: string;
  quote_number: string;
  title: string;
  status: CrmDocumentStatus;
  total_cents: number;
  archived_at?: string | null;
  customer?: { name: string; email?: string | null };
}

type QuoteView = "active" | "archived";

const VIEW_OPTIONS = [
  { value: "active", label: "Aktiv" },
  { value: "archived", label: "Archiviert" },
];

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

export function QuotesView() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<QuoteView>("active");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [defaultTaxRate, setDefaultTaxRate] = useState(19);
  const [discountInput, setDiscountInput] = useState("0");
  const [taxInput, setTaxInput] = useState("19");
  const [sendTarget, setSendTarget] = useState<QuoteRow | null>(null);
  const [sendToCustomer, setSendToCustomer] = useState(true);
  const [copyToBusiness, setCopyToBusiness] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<{ message: string; detail?: string; code?: string } | null>(null);
  const {
    toast,
    withLoading,
    quoteCreated,
    quoteSent,
    quoteUpdated,
    quoteArchived,
    quoteDeleted,
    invoiceCreated,
    error: showError,
  } = useAdminMessages();
  const page = adminPageHeaderProps("angebote");
  const empty = ADMIN_EMPTY_STATES.quotes;

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("view", view);
    fetch(`/api/admin/quotes?${params}`).then((r) => r.json()).then((d) => setQuotes(d.quotes ?? []));
  }, [search, view]);

  useEffect(() => {
    load();
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? []));
  }, [load]);

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
    setEditingId(null);
  };

  const parsePercent = (value: string, fallback: number) => {
    const trimmed = value.trim();
    if (trimmed === "") return fallback;
    const num = Number(trimmed.replace(",", "."));
    if (Number.isNaN(num)) return fallback;
    return Math.min(100, Math.max(0, num));
  };

  const saveQuote = async () => {
    if (!form.customer_id) return showError("Angebot konnte nicht gespeichert werden.", "Bitte einen Kunden auswählen.");
    if (!form.items.some((i) => i.title.trim())) {
      return showError("Angebot konnte nicht gespeichert werden.", "Mindestens eine Position mit Bezeichnung erforderlich.");
    }

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

    if (editingId) {
      const res = await fetch("/api/admin/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) return showError("Angebot konnte nicht aktualisiert werden.", data.error);
      quoteUpdated();
    } else {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return showError("Angebot konnte nicht erstellt werden.", data.error);
      quoteCreated();
    }

    setShowForm(false);
    resetForm();
    load();
  };

  const startEdit = async (quoteId: string) => {
    const res = await fetch(`/api/admin/quotes/${quoteId}`);
    const data = await res.json();
    if (!res.ok || !data.quote) {
      return showError("Angebot konnte nicht geladen werden.", data.error);
    }
    const quote = data.quote;
    setEditingId(quoteId);
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
    setShowForm(true);
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
        setSendError({
          message: data.error ?? ADMIN_MSG.sendFailed,
          detail: data.detail,
          code: data.code,
        });
        return;
      }
      quoteSent();
      setSendTarget(null);
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : ADMIN_MSG.sendFailed;
      setSendError({ message });
      showError("Die E-Mail konnte nicht versendet werden.", message, "Bitte E-Mail-Einstellungen und Empfänger-Adresse prüfen.");
    } finally {
      setSending(false);
    }
  };

  const pdfUrl = (id: string) => `/api/admin/quotes/${id}/pdf`;

  const handlePdfError = (err: { message: string; detail?: string }) => {
    toast(err.message, "error");
    if (err.detail) console.error("PDF error:", err.detail);
  };

  const archiveQuote = async (id: string) => {
    if (!confirmDanger(ADMIN_CONFIRM.archiveQuote)) return;
    const res = await fetch("/api/admin/quotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "archive" }),
    });
    const data = await res.json();
    if (!res.ok) return showError("Archivieren fehlgeschlagen.", data.error);
    quoteArchived();
    load();
  };

  const deleteQuote = async (id: string) => {
    if (!confirmDanger(ADMIN_CONFIRM.deleteQuote)) return;
    const res = await fetch("/api/admin/quotes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) return showError("Löschen fehlgeschlagen.", data.error);
    quoteDeleted();
    load();
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
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { resetForm(); setShowForm(true); }}>
          Neues Angebot
        </AdminButton>
      </AdminPageHeader>

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Angebote suchen…" />
        <AdminFilterSelect value={view} onChange={(v) => setView(v as QuoteView)} options={VIEW_OPTIONS} />
      </AdminFilterBar>

      {showForm ? (
        <AdminCard title={editingId ? "Angebot bearbeiten" : "Neues Angebot"}>
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
            <AdminFormField label="Titel" required hint="z. B. Angebot Kinderbetreuung">
              <input
                className="admin-input"
                placeholder="Angebot Kinderbetreuung"
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
            <AdminButton variant="primary" onClick={() => void withLoading(saveQuote())}>
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
          title={view === "archived" ? "Keine archivierten Angebote" : empty.title}
          description={view === "archived" ? "Archivierte Angebote erscheinen hier." : empty.description}
          actionLabel={view === "active" ? empty.actionLabel : undefined}
          onAction={view === "active" ? () => setShowForm(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <AdminCard key={q.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{q.quote_number} — {q.title}</p>
                  <p className="text-sm text-text-muted">{q.customer?.name} · {formatCents(q.total_cents)}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <AdminStatusBadge label={CRM_STATUS_LABELS[q.status]} variant={crmDocumentStatusVariant(q.status)} />
                    {q.archived_at ? <AdminStatusBadge label="Archiviert" variant="muted" /> : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => void startEdit(q.id)}>
                    {ADMIN_BTN.edit}
                  </AdminButton>
                  <AdminButton variant="secondary" onClick={() => void openAdminPdf(pdfUrl(q.id), handlePdfError)}>
                    {ADMIN_BTN.pdfOpen}
                  </AdminButton>
                  <AdminButton
                    variant="secondary"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => void downloadAdminPdf(pdfUrl(q.id), handlePdfError, `${q.quote_number}.pdf`)}
                  >
                    {ADMIN_BTN.pdfDownload}
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
                  {!q.archived_at ? (
                    <AdminButton variant="secondary" onClick={() => void archiveQuote(q.id)}>
                      {ADMIN_BTN.archive}
                    </AdminButton>
                  ) : null}
                  <AdminButton variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void deleteQuote(q.id)}>
                    {ADMIN_BTN.delete}
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
