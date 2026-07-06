"use client";

import { useEffect, useState } from "react";
import { Plus, UserPlus, Users } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminFilterBar, AdminFilterSelect, AdminSearchInput, AdminStatusBadge } from "@/components/admin/ui";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { CRM_CUSTOMER_STATUS_LABELS, type CrmCustomer, type CrmCustomerStatus } from "@/lib/crm/types";

interface CustomerHistory {
  events: { id: string; title: string; details: string | null; created_at: string }[];
  bookings: { id: string; event_type: string; event_date: string; status: string }[];
  quotes: { id: string; quote_number: string; status: string; total_cents: number }[];
  invoices: { id: string; invoice_number: string; status: string; total_cents: number }[];
}

const emptyForm = { name: "", phone: "", email: "", address: "", notes: "", status: "active" as CrmCustomerStatus };

export function CustomersView() {
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useAdminUi();

  const load = () => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/customers${q}`)
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []));
  };

  useEffect(() => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/customers${q}`)
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []));
  }, [search]);

  useEffect(() => {
    if (!selectedId) {
      setHistory(null);
      return;
    }
    fetch(`/api/admin/customers/${selectedId}/history`)
      .then((r) => r.json())
      .then((d) => setHistory(d));
  }, [selectedId]);

  const save = async () => {
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return toast(data.error ?? "Fehler", "error");
    toast("Kunde gespeichert");
    setShowForm(false);
    setForm(emptyForm);
    load();
  };

  const updateField = async (id: string, field: string, value: string) => {
    const res = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    if (res.ok) {
      toast("Gespeichert");
      load();
    } else toast("Fehler", "error");
  };

  const selected = customers.find((c) => c.id === selectedId);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Kunden" description="Kundenstamm verwalten — Anfragen, Angebote und Rechnungen verknüpfen.">
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
          Neuer Kunde
        </AdminButton>
      </AdminPageHeader>

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Kunden suchen…" />
      </AdminFilterBar>

      {showForm ? (
        <AdminCard title="Neuer Kunde">
          <div className="grid gap-3 md:grid-cols-2">
            <input className="admin-input" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="admin-input" placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="admin-input" placeholder="E-Mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <AdminFilterSelect
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v as CrmCustomerStatus })}
              options={Object.entries(CRM_CUSTOMER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
            />
            <input className="admin-input md:col-span-2" placeholder="Adresse" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <textarea className="admin-input md:col-span-2 min-h-20" placeholder="Notizen" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="mt-4 flex gap-2">
            <AdminButton variant="primary" onClick={save}>Speichern</AdminButton>
            <AdminButton variant="secondary" onClick={() => setShowForm(false)}>Abbrechen</AdminButton>
          </div>
        </AdminCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {customers.length === 0 ? (
            <AdminEmptyState icon={Users} title="Noch keine Kunden angelegt." description="Lege Kunden manuell an oder erstelle sie aus einer Anfrage." actionLabel="Kunde anlegen" onAction={() => setShowForm(true)} />
          ) : (
            customers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`admin-card w-full text-left transition-colors ${selectedId === c.id ? "border-primary/40 bg-primary/5" : ""}`}
              >
                <p className="font-semibold text-text-primary">{c.name}</p>
                <p className="text-sm text-text-muted">{c.email || c.phone || "—"}</p>
                <AdminStatusBadge label={CRM_CUSTOMER_STATUS_LABELS[c.status]} variant={c.status === "active" ? "success" : c.status === "lead" ? "warning" : "muted"} />
              </button>
            ))
          )}
        </div>

        {selected ? (
          <AdminCard title="Kundendetails">
            <div className="grid gap-3">
              <input className="admin-input font-semibold" defaultValue={selected.name} onBlur={(e) => updateField(selected.id, "name", e.target.value)} />
              <input className="admin-input" defaultValue={selected.phone ?? ""} placeholder="Telefon" onBlur={(e) => updateField(selected.id, "phone", e.target.value)} />
              <input className="admin-input" defaultValue={selected.email ?? ""} placeholder="E-Mail" onBlur={(e) => updateField(selected.id, "email", e.target.value)} />
              <input className="admin-input" defaultValue={selected.address ?? ""} placeholder="Adresse" onBlur={(e) => updateField(selected.id, "address", e.target.value)} />
              <textarea className="admin-input min-h-20" defaultValue={selected.notes ?? ""} placeholder="Notizen" onBlur={(e) => updateField(selected.id, "notes", e.target.value)} />
            </div>

            {history ? (
              <div className="mt-6 space-y-4 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-text-primary">Historie</h3>
                {history.bookings.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-text-muted">Anfragen</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {history.bookings.map((b) => (
                        <li key={b.id}>{b.event_type} · {b.event_date} · {b.status}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {history.quotes.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-text-muted">Angebote</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {history.quotes.map((q) => (
                        <li key={q.id}>{q.quote_number} · {q.status}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {history.invoices.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-text-muted">Rechnungen</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {history.invoices.map((i) => (
                        <li key={i.id}>{i.invoice_number} · {i.status}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {history.events.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-text-muted">Events</p>
                    <ul className="mt-1 space-y-1 text-sm text-text-muted">
                      {history.events.slice(0, 8).map((e) => (
                        <li key={e.id}>{e.title}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </AdminCard>
        ) : (
          <AdminCard>
            <div className="flex flex-col items-center py-8 text-center text-sm text-text-muted">
              <UserPlus className="mb-3 h-8 w-8 text-primary/50" />
              Kunde auswählen für Details und Historie
            </div>
          </AdminCard>
        )}
      </div>
    </div>
  );
}
