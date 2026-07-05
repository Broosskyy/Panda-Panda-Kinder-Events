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
import { useAdminUi } from "@/components/admin/AdminUiProvider";
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

const emptyForm = () => ({
  customer_id: "",
  title: "Angebot Kinderbetreuung",
  remarks: "",
  discount_percent: 0,
  tax_rate: 19,
  items: [createEmptyLineItem()] as QuoteLineItemDraft[],
});

export function QuotesView() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [sendTarget, setSendTarget] = useState<QuoteRow | null>(null);
  const [sendToCustomer, setSendToCustomer] = useState(true);
  const [copyToBusiness, setCopyToBusiness] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast, withLoading } = useAdminUi();

  const load = () => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/quotes${q}`).then((r) => r.json()).then((d) => setQuotes(d.quotes ?? []));
  };

  useEffect(() => {
    load();
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => setCustomers(d.customers ?? []));
  }, [search]);

  const create = async () => {
    if (!form.customer_id) return toast("Bitte Kunde wählen", "error");
    if (!form.items.some((i) => i.title.trim())) return toast("Mindestens eine Position mit Bezeichnung erforderlich", "error");

    const payload = {
      customer_id: form.customer_id,
      title: form.title,
      remarks: form.remarks,
      discount_percent: form.discount_percent,
      tax_rate: form.tax_rate,
      status: "draft" as const,
      items: form.items.map(lineItemToApiPayload),
    };

    const res = await fetch("/api/admin/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return toast(data.error ?? "Fehler", "error");
    toast("Angebot erstellt");
    setShowForm(false);
    setForm(emptyForm());
    load();
  };

  const confirmSend = async () => {
    if (!sendTarget || !sendToCustomer) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/quotes/${sendTarget.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyToBusiness }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Versand fehlgeschlagen");
      toast("Angebot versendet");
      setSendTarget(null);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Versand fehlgeschlagen", "error");
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
    if (!res.ok) return toast(data.error ?? "Fehler", "error");
    toast(`Rechnung ${data.invoice?.invoice_number} erstellt`);
  };

  const customerOptions = useMemo(
    () => [{ value: "", label: "Kunde wählen…" }, ...customers.map((c) => ({ value: c.id, label: c.name }))],
    [customers],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Angebote" description="Angebote erstellen, als PDF versenden und in Rechnungen umwandeln.">
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
          Neues Angebot
        </AdminButton>
      </AdminPageHeader>

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Angebote suchen…" />
      </AdminFilterBar>

      {showForm ? (
        <AdminCard title="Neues Angebot">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Kunde" required>
              <AdminFilterSelect
                value={form.customer_id}
                onChange={(v) => setForm({ ...form, customer_id: v })}
                options={customerOptions}
              />
            </AdminFormField>
            <AdminFormField label="Titel" required>
              <input
                className="admin-input"
                placeholder="z. B. Angebot Kinderbetreuung Hochzeit"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </AdminFormField>
            <AdminFormField label="Rabatt (%)" hint="Rabatt optional">
              <input
                className="admin-input"
                type="number"
                min={0}
                max={100}
                placeholder="0"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) || 0 })}
              />
            </AdminFormField>
            <AdminFormField label="MwSt. (%)" hint="MwSt. Standard 19 %">
              <input
                className="admin-input"
                type="number"
                min={0}
                max={100}
                placeholder="19"
                value={form.tax_rate}
                onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) || 19 })}
              />
            </AdminFormField>
            <AdminFormField label="Bemerkung" className="md:col-span-2">
              <textarea
                className="admin-input min-h-20"
                placeholder="Zusätzliche Hinweise für den Kunden…"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </AdminFormField>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <QuoteLineItemsEditor
              items={form.items}
              discountPercent={form.discount_percent}
              taxRate={form.tax_rate}
              onChange={(items) => setForm({ ...form, items })}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <AdminButton variant="primary" onClick={() => void withLoading(create())}>
              Angebot speichern
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => { setShowForm(false); setForm(emptyForm()); }}>
              Abbrechen
            </AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {quotes.length === 0 ? (
        <AdminEmptyState
          icon={FileText}
          title="Noch keine Angebote"
          description="Erstelle ein Angebot für einen Kunden."
          actionLabel="Angebot erstellen"
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
                    PDF
                  </AdminButton>
                  <AdminButton
                    variant="primary"
                    icon={<Send className="h-4 w-4" />}
                    onClick={() => {
                      setSendTarget(q);
                      setSendToCustomer(true);
                      setCopyToBusiness(true);
                    }}
                  >
                    Senden
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
        onChangeSendToCustomer={setSendToCustomer}
        onChangeCopyToBusiness={setCopyToBusiness}
        onClose={() => setSendTarget(null)}
        onConfirm={() => void confirmSend()}
      />
    </div>
  );
}
