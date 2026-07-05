"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Send } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminFilterBar, AdminFilterSelect, AdminSearchInput } from "@/components/admin/ui";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { formatCents, parseEuroToCents } from "@/lib/crm/money";
import { CRM_STATUS_LABELS, type CrmCustomer, type CrmDocumentStatus } from "@/lib/crm/types";

interface QuoteRow {
  id: string;
  quote_number: string;
  title: string;
  status: CrmDocumentStatus;
  total_cents: number;
  customer?: { name: string };
}

const defaultItem = { description: "Kinderbetreuung", quantity: 1, unit_price_cents: 0 };

export function QuotesView() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer_id: "",
    title: "Angebot Kinderbetreuung",
    remarks: "",
    discount_percent: 0,
    tax_rate: 19,
    items: [defaultItem],
  });
  const { toast } = useAdminUi();

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
    const res = await fetch("/api/admin/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: "draft" }),
    });
    const data = await res.json();
    if (!res.ok) return toast(data.error ?? "Fehler", "error");
    toast("Angebot erstellt");
    setShowForm(false);
    load();
  };

  const send = async (id: string) => {
    const res = await fetch(`/api/admin/quotes/${id}/send`, { method: "POST", body: JSON.stringify({ copyToBusiness: true }) });
    const data = await res.json();
    if (!res.ok) return toast(data.error ?? "Versand fehlgeschlagen", "error");
    toast("Angebot versendet");
    load();
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

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Angebote" description="Angebote erstellen, als PDF versenden und in Rechnungen umwandeln.">
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>Neues Angebot</AdminButton>
      </AdminPageHeader>

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Angebote suchen…" />
      </AdminFilterBar>

      {showForm ? (
        <AdminCard title="Neues Angebot">
          <div className="grid gap-3 md:grid-cols-2">
            <AdminFilterSelect
              value={form.customer_id}
              onChange={(v) => setForm({ ...form, customer_id: v })}
              label="Kunde"
              options={[{ value: "", label: "Kunde wählen…" }, ...customers.map((c) => ({ value: c.id, label: c.name }))]}
            />
            <input className="admin-input" placeholder="Titel" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="admin-input" type="number" placeholder="Rabatt %" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} />
            <input className="admin-input" type="number" placeholder="MwSt. %" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })} />
            <textarea className="admin-input md:col-span-2 min-h-20" placeholder="Bemerkung" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Positionen</p>
            {form.items.map((item, i) => (
              <div key={i} className="grid gap-2 md:grid-cols-3">
                <input className="admin-input md:col-span-2" placeholder="Beschreibung" value={item.description} onChange={(e) => {
                  const items = [...form.items];
                  items[i] = { ...items[i], description: e.target.value };
                  setForm({ ...form, items });
                }} />
                <input className="admin-input" placeholder="Einzelpreis €" onChange={(e) => {
                  const items = [...form.items];
                  items[i] = { ...items[i], unit_price_cents: parseEuroToCents(e.target.value) };
                  setForm({ ...form, items });
                }} />
              </div>
            ))}
            <AdminButton variant="secondary" onClick={() => setForm({ ...form, items: [...form.items, defaultItem] })}>+ Position</AdminButton>
          </div>
          <div className="mt-4 flex gap-2">
            <AdminButton variant="primary" onClick={create}>Angebot speichern</AdminButton>
            <AdminButton variant="secondary" onClick={() => setShowForm(false)}>Abbrechen</AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {quotes.length === 0 ? (
        <AdminEmptyState icon={FileText} title="Noch keine Angebote" description="Erstelle ein Angebot für einen Kunden." actionLabel="Angebot erstellen" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <AdminCard key={q.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{q.quote_number} — {q.title}</p>
                  <p className="text-sm text-text-muted">{q.customer?.name} · {formatCents(q.total_cents)}</p>
                  <span className="mt-1 inline-block rounded-full bg-bg-secondary px-2 py-0.5 text-xs">{CRM_STATUS_LABELS[q.status]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton variant="secondary" href={`/api/admin/quotes/${q.id}/pdf`} target="_blank">PDF</AdminButton>
                  <AdminButton variant="primary" icon={<Send className="h-4 w-4" />} onClick={() => send(q.id)}>Senden</AdminButton>
                  <AdminButton variant="secondary" onClick={() => toInvoice(q.id)}>→ Rechnung</AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
