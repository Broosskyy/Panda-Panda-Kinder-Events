"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import {
  AdminButton,
  AdminEmptyState,
  AdminFilterBar,
  AdminFilterSelect,
  AdminSearchInput,
  AdminStatusBadge,
} from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM } from "@/lib/admin/messages";
import { CustomerCommunicationTimeline } from "@/components/admin/email/CustomerCommunicationTimeline";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { CRM_CUSTOMER_STATUS_LABELS, type CrmCustomer, type CrmCustomerStatus } from "@/lib/crm/types";

interface CustomerHistory {
  events: { id: string; title: string; details: string | null; created_at: string }[];
  bookings: { id: string; event_type: string; event_date: string; status: string }[];
  quotes: { id: string; quote_number: string; status: string; total_cents: number }[];
  invoices: { id: string; invoice_number: string; status: string; total_cents: number }[];
  reviews: { id: string; name: string; event_type: string; rating: number; text: string; created_at: string }[];
}

interface CustomerFormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: CrmCustomerStatus;
}

const emptyForm: CustomerFormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  status: "active",
};

function customerToForm(customer: CrmCustomer): CustomerFormState {
  return {
    name: customer.name,
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    address: customer.address ?? "",
    notes: customer.notes ?? "",
    status: customer.status,
  };
}

export function CustomersView() {
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { withLoading, error: showError } = useAdminMessages();
  const { showResult, confirm, runAction } = useAdminActionFeedback();
  const page = adminPageHeaderProps("kunden");
  const empty = ADMIN_EMPTY_STATES.customers;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const q = search ? `?q=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/customers${q}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kunden konnten nicht geladen werden.");
      setCustomers(data.customers ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Kunden konnten nicht geladen werden.");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setSelectedId(id);
  }, [searchParams]);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) {
      setEditForm(emptyForm);
      return;
    }
    setEditForm(customerToForm(selected));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset form when a different customer is selected
  }, [selected?.id]);

  useEffect(() => {
    if (!selectedId) {
      setHistory(null);
      setHistoryError(null);
      return;
    }

    let cancelled = false;
    setHistory(null);
    setHistoryLoading(true);
    setHistoryError(null);

    fetch(`/api/admin/customers/${selectedId}/history`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Historie konnte nicht geladen werden.");
        if (!cancelled) setHistory(data as CustomerHistory);
      })
      .catch((err) => {
        if (!cancelled) {
          setHistoryError(err instanceof Error ? err.message : "Historie konnte nicht geladen werden.");
        }
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const saveNew = async () => {
    if (!form.name.trim()) {
      showError("Name fehlt", "Bitte einen Namen eingeben.");
      return;
    }
    setSaving(true);
    try {
      await runAction({
        action: async () => {
          const res = await fetch("/api/admin/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Kunde konnte nicht angelegt werden.");
          setShowForm(false);
          setForm(emptyForm);
          await load();
          if (data.customer?.id) setSelectedId(data.customer.id);
        },
        success: ACTION_RESULTS.customerSaved(),
      });
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!selected) return;
    if (!editForm.name.trim()) {
      showError("Name fehlt", "Bitte einen Namen eingeben.");
      return;
    }
    setSaving(true);
    try {
      await runAction({
        action: async () => {
          const res = await fetch("/api/admin/customers", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: selected.id, ...editForm }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Kunde konnte nicht gespeichert werden.");
          await load();
        },
        success: ACTION_RESULTS.customerSaved(),
      });
    } finally {
      setSaving(false);
    }
  };

  const archiveCustomer = async () => {
    if (!selected) return;
    const ok = await confirm({
      title: "Kunde archivieren?",
      message: ADMIN_CONFIRM.archiveCustomer.replace(/\n\nFortfahren\?$/, ""),
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    setSaving(true);
    try {
      await runAction({
        action: async () => {
          const res = await fetch("/api/admin/customers", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: selected.id, status: "inactive" }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Archivieren fehlgeschlagen.");
          await load();
        },
        success: ACTION_RESULTS.customerArchived(),
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async () => {
    if (!selected) return;
    const ok = await confirm({
      title: "Kunde löschen?",
      message: ADMIN_CONFIRM.deleteCustomer.replace(/\n\nFortfahren\?$/, ""),
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id }),
      });
      const data = await res.json();
      if (res.status === 409 && data.canArchive) {
        showResult(
          ACTION_RESULTS.genericError(
            "Nutzen Sie „Archivieren“, um den Kunden zu deaktivieren, ohne verknüpfte Daten zu verlieren.",
          ),
        );
        return;
      }
      if (!res.ok) {
        showResult(ACTION_RESULTS.genericError(data.error ?? "Kunde konnte nicht gelöscht werden."));
        return;
      }
      setSelectedId(null);
      await load();
      showResult(ACTION_RESULTS.customerDeleted());
    } finally {
      setSaving(false);
    }
  };

  const closeDetail = () => setSelectedId(null);

  const detailPanel = selected ? (
    <AdminCard title="Kundendetails" className="admin-customer-detail">
      <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
        <AdminButton variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={closeDetail}>
          Zurück zur Liste
        </AdminButton>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <AdminFormField label="Name *">
          <input
            className="admin-input font-semibold"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
        </AdminFormField>
        <AdminFormField label="Telefon">
          <input
            className="admin-input"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            placeholder="Telefon"
          />
        </AdminFormField>
        <AdminFormField label="E-Mail">
          <input
            className="admin-input"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            placeholder="E-Mail"
          />
        </AdminFormField>
        <AdminFormField label="Status">
          <AdminFilterSelect
            value={editForm.status}
            onChange={(v) => setEditForm({ ...editForm, status: v as CrmCustomerStatus })}
            options={Object.entries(CRM_CUSTOMER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </AdminFormField>
        <AdminFormField label="Adresse" className="md:col-span-2">
          <input
            className="admin-input"
            value={editForm.address}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            placeholder="Adresse"
          />
        </AdminFormField>
        <AdminFormField label="Notizen" className="md:col-span-2">
          <textarea
            className="admin-input min-h-20"
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            placeholder="Notizen"
          />
        </AdminFormField>
      </div>

      <div className="admin-customer-detail-actions">
        <AdminButton variant="primary" className="admin-customer-detail-btn" onClick={() => void saveEdit()} disabled={saving}>
          {ADMIN_BTN.save}
        </AdminButton>
        <AdminButton variant="secondary" className="admin-customer-detail-btn" onClick={() => void archiveCustomer()} disabled={saving}>
          Archivieren
        </AdminButton>
        <AdminButton variant="danger" className="admin-customer-detail-btn admin-customer-detail-btn-danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void deleteCustomer()} disabled={saving}>
          Löschen
        </AdminButton>
      </div>

      <div className="mt-6 space-y-4 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-text-primary">Historie</h3>
        {historyLoading ? <p className="text-sm text-text-muted">Historie wird geladen…</p> : null}
        {historyError ? <p className="text-sm text-accent-heart">{historyError}</p> : null}
        {history ? (
          <>
            {history.bookings.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">Anfragen</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {history.bookings.map((b) => (
                    <li key={b.id}>
                      <Link href="/admin/anfragen" className="text-primary hover:underline">
                        {b.event_type} · {b.event_date} · {b.status}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {history.quotes.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">Angebote</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {history.quotes.map((q) => (
                    <li key={q.id}>
                      <Link href="/admin/angebote" className="text-primary hover:underline">
                        {q.quote_number} · {q.status}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {history.invoices.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">Rechnungen</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {history.invoices.map((i) => (
                    <li key={i.id}>
                      <Link href="/admin/rechnungen" className="text-primary hover:underline">
                        {i.invoice_number} · {i.status}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {history.reviews.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">Bewertungen</p>
                <ul className="mt-1 space-y-2 text-sm">
                  {history.reviews.map((r) => (
                    <li key={r.id} className="rounded-lg border border-border/60 bg-bg-secondary/50 p-3">
                      <p className="font-medium text-text-primary">
                        {r.rating} / 5 · {r.event_type}
                      </p>
                      <p className="mt-1 text-text-secondary">&ldquo;{r.text}&rdquo;</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {history.events.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-text-muted">Aktivitäten</p>
                <ul className="mt-1 space-y-1 text-sm text-text-muted">
                  {history.events.slice(0, 8).map((e) => (
                    <li key={e.id}>{e.title}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {!historyLoading &&
            history.bookings.length === 0 &&
            history.quotes.length === 0 &&
            history.invoices.length === 0 &&
            history.reviews.length === 0 &&
            history.events.length === 0 ? (
              <p className="text-sm text-text-muted">Noch keine Historie für diesen Kunden.</p>
            ) : null}
            <CustomerCommunicationTimeline customerId={selected.id} />
          </>
        ) : null}
      </div>
    </AdminCard>
  ) : (
    <AdminCard className="hidden lg:block">
      <div className="flex flex-col items-center py-8 text-center text-sm text-text-muted">
        <UserPlus className="mb-3 h-8 w-8 text-primary/50" />
        Kunde auswählen für Details und Historie
      </div>
    </AdminCard>
  );

  return (
    <div className="space-y-6 admin-customer-page">
      <AdminPageHeader {...page}>
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
            <input
              className="admin-input"
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="admin-input"
              placeholder="Telefon"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="admin-input"
              placeholder="E-Mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <AdminFilterSelect
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v as CrmCustomerStatus })}
              options={Object.entries(CRM_CUSTOMER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
            />
            <input
              className="admin-input md:col-span-2"
              placeholder="Adresse"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <textarea
              className="admin-input md:col-span-2 min-h-20"
              placeholder="Notizen"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AdminButton variant="primary" onClick={() => void withLoading(saveNew())} disabled={saving}>
              {ADMIN_BTN.save}
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setShowForm(false)}>
              {ADMIN_BTN.cancel}
            </AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {loading ? (
        <p className="text-sm text-text-muted">Kunden werden geladen…</p>
      ) : loadError ? (
        <AdminCard>
          <p className="text-sm text-accent-heart">{loadError}</p>
          <AdminButton className="mt-4" variant="secondary" onClick={() => void load()}>
            Erneut laden
          </AdminButton>
        </AdminCard>
      ) : (
        <div className={`grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.5fr)] ${selectedId ? "admin-customer-split" : ""}`}>
          <div className={`space-y-3 ${selectedId ? "hidden lg:block" : ""}`}>
            {customers.length === 0 ? (
              <AdminEmptyState
                icon={Users}
                title={empty.title}
                description={empty.description}
                actionLabel={empty.actionLabel}
                onAction={() => setShowForm(true)}
              />
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
                  <AdminStatusBadge
                    label={CRM_CUSTOMER_STATUS_LABELS[c.status]}
                    variant={c.status === "active" ? "success" : c.status === "lead" ? "warning" : "muted"}
                  />
                </button>
              ))
            )}
          </div>

          {detailPanel}
        </div>
      )}
    </div>
  );
}

function AdminFormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`.trim()}>
      <span className="mb-1 block text-xs font-medium text-text-muted">{label}</span>
      {children}
    </label>
  );
}
