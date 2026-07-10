"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus, Users } from "lucide-react";
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
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { CRM_CUSTOMER_STATUS_LABELS, type CrmCustomer, type CrmCustomerStatus } from "@/lib/crm/types";

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

export function CustomersView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [listView, setListView] = useState<"active" | "archived" | "all">("active");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { withLoading, error: showError } = useAdminMessages();
  const { runAction } = useAdminActionFeedback();
  const page = adminPageHeaderProps("kunden");
  const empty = ADMIN_EMPTY_STATES.customers;

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) router.replace(`/admin/kunden/${id}`);
  }, [searchParams, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (listView !== "active") params.set("view", listView);
      const q = params.toString() ? `?${params.toString()}` : "";
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
  }, [search, listView]);

  useEffect(() => {
    void load();
  }, [load]);

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
          if (data.customer?.id) {
            router.push(`/admin/kunden/${data.customer.id}`);
          } else {
            await load();
          }
        },
        success: ACTION_RESULTS.customerSaved(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page}>
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
          Neuer Kunde
        </AdminButton>
      </AdminPageHeader>

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Kunden suchen…" />
        <AdminFilterSelect
          value={listView}
          onChange={(v) => setListView(v as "active" | "archived" | "all")}
          options={[
            { value: "active", label: "Aktive Kunden" },
            { value: "archived", label: "Archiv" },
            { value: "all", label: "Alle" },
          ]}
        />
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
            <AdminButton variant="primary" onClick={() => void withLoading(saveNew())} disabled={saving} loading={saving}>
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
      ) : customers.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title={empty.title}
          description={empty.description}
          actionLabel={empty.actionLabel}
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/admin/kunden/${c.id}`}
              className="admin-card flex items-center justify-between gap-3 transition-colors hover:border-primary/30"
            >
              <div className="min-w-0">
                <p className="font-semibold text-text-primary">{c.name}</p>
                <p className="text-sm text-text-muted">{c.email || c.phone || "—"}</p>
                <AdminStatusBadge
                  label={CRM_CUSTOMER_STATUS_LABELS[c.status]}
                  variant={c.status === "active" ? "success" : c.status === "lead" ? "warning" : "muted"}
                />
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-text-muted" aria-hidden />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
