"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, RotateCcw } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminFilterSelect } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM } from "@/lib/admin/messages";
import { CustomerCommunicationTimeline } from "@/components/admin/email/CustomerCommunicationTimeline";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { CRM_CUSTOMER_STATUS_LABELS, type CrmCustomer, type CrmCustomerStatus } from "@/lib/crm/types";
import type { CustomerLinksSummary } from "@/lib/crm/customer-links";
import { CustomerDeleteBlockedModal } from "@/components/admin/crm/CustomerDeleteBlockedModal";
import { CustomerPermanentDeleteModal } from "@/components/admin/crm/CustomerPermanentDeleteModal";
import { CustomerLinkedDataPanel } from "@/components/admin/crm/CustomerLinkedDataPanel";

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

interface CustomerEditViewProps {
  customerId: string;
}

export function CustomerEditView({ customerId }: CustomerEditViewProps) {
  const router = useRouter();
  const { isSuperAdmin } = useAdminSession();
  const [customer, setCustomer] = useState<CrmCustomer | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [scrollToLinks, setScrollToLinks] = useState(false);
  const [blockedModal, setBlockedModal] = useState<{ open: boolean; blockers: CustomerLinksSummary }>({
    open: false,
    blockers: { bookings: 0, quotes: 0, invoices: 0, events: 0, reviews: 0 },
  });
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false);
  const [permanentDeleteReasons, setPermanentDeleteReasons] = useState<string[]>([]);
  const { error: showError } = useAdminMessages();
  const { showResult, confirm, runAction } = useAdminActionFeedback();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kunde konnte nicht geladen werden.");
      setCustomer(data.customer);
      setEditForm(customerToForm(data.customer));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Kunde konnte nicht geladen werden.");
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveEdit = async () => {
    if (!customer) return;
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
            body: JSON.stringify({ id: customer.id, ...editForm }),
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
    if (!customer) return;
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
          const res = await fetch(`/api/admin/customers/${customer.id}/archive`, { method: "POST" });
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

  const restoreCustomer = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      await runAction({
        action: async () => {
          const res = await fetch(`/api/admin/customers/${customer.id}/restore`, { method: "POST" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Wiederherstellen fehlgeschlagen.");
          await load();
        },
        success: ACTION_RESULTS.customerRestored(),
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async () => {
    if (!customer) return;
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
        body: JSON.stringify({ id: customer.id }),
      });
      const data = await res.json();
      if (res.status === 409 && (data.blockers || data.dependencies)) {
        const blockers = (data.blockers ?? {
          quotes: data.dependencies?.quotes ?? 0,
          bookings: data.dependencies?.inquiries ?? 0,
          invoices: data.dependencies?.invoices ?? 0,
          events: 0,
          reviews: 0,
        }) as CustomerLinksSummary;
        setBlockedModal({ open: true, blockers });
        if (data.links?.permanentDeleteReasons) {
          setPermanentDeleteReasons(data.links.permanentDeleteReasons as string[]);
        }
        return;
      }
      if (!res.ok) {
        const errMsg = typeof data.error === "string" ? data.error : "Kunde konnte nicht gelöscht werden.";
        const friendly =
          errMsg.includes("foreign key") || errMsg.includes("violates")
            ? "Dieser Kunde kann nicht gelöscht werden, weil noch Daten verknüpft sind. Bitte „Verknüpfte Daten“ prüfen."
            : errMsg;
        showResult(ACTION_RESULTS.genericError(friendly));
        return;
      }
      showResult(ACTION_RESULTS.customerDeleted());
      router.push("/admin/kunden");
    } finally {
      setSaving(false);
    }
  };

  const permanentDeleteCustomer = async (confirmText: string) => {
    if (!customer) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id, permanent: true, confirmText }),
      });
      const data = await res.json();
      if (!res.ok) {
        showResult(ACTION_RESULTS.genericError(data.error ?? "Löschen fehlgeschlagen."));
        return;
      }
      setPermanentDeleteOpen(false);
      showResult(ACTION_RESULTS.customerDeleted());
      router.push("/admin/kunden");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-text-muted">Kunde wird geladen…</p>;
  }

  if (loadError || !customer) {
    return (
      <AdminCard>
        <p className="text-sm text-accent-heart">{loadError ?? "Kunde nicht gefunden."}</p>
        <AdminButton className="mt-4" variant="secondary" href="/admin/kunden">
          Zurück zur Liste
        </AdminButton>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={customer.name}
        description="Kundendaten bearbeiten und verknüpfte Daten verwalten."
        whereVisible="Nur im Admin sichtbar."
      >
        <AdminButton variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} href="/admin/kunden">
          Zurück zur Liste
        </AdminButton>
      </AdminPageHeader>

      <AdminCard title="Stammdaten">
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

        <div className="admin-customer-detail-actions mt-6">
          <AdminButton variant="primary" className="admin-customer-detail-btn" onClick={() => void saveEdit()} disabled={saving} loading={saving}>
            {ADMIN_BTN.save}
          </AdminButton>
          {customer.status === "inactive" ? (
            <AdminButton
              variant="secondary"
              className="admin-customer-detail-btn"
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={() => void restoreCustomer()}
              disabled={saving}
            >
              Wiederherstellen
            </AdminButton>
          ) : (
            <AdminButton variant="secondary" className="admin-customer-detail-btn" onClick={() => void archiveCustomer()} disabled={saving}>
              Archivieren
            </AdminButton>
          )}
          <AdminButton
            variant="danger"
            className="admin-customer-detail-btn admin-customer-detail-btn-danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => void deleteCustomer()}
            disabled={saving}
          >
            Löschen
          </AdminButton>
          <AdminButton variant="ghost" className="admin-customer-detail-btn" href="/admin/kunden">
            {ADMIN_BTN.cancel}
          </AdminButton>
        </div>
      </AdminCard>

      <CustomerLinkedDataPanel
        customerId={customer.id}
        scrollIntoView={scrollToLinks}
        onLinksChanged={() => setScrollToLinks(false)}
      />

      <AdminCard title="Kommunikation">
        <CustomerCommunicationTimeline customerId={customer.id} />
      </AdminCard>

      <CustomerDeleteBlockedModal
        open={blockedModal.open}
        customerName={customer.name}
        blockers={blockedModal.blockers}
        isSuperAdmin={isSuperAdmin}
        onClose={() => setBlockedModal((s) => ({ ...s, open: false }))}
        onShowLinks={() => {
          setBlockedModal((s) => ({ ...s, open: false }));
          setScrollToLinks(true);
        }}
        onArchive={async () => {
          setBlockedModal((s) => ({ ...s, open: false }));
          await archiveCustomer();
        }}
        onPreparePermanentDelete={() => {
          setBlockedModal((s) => ({ ...s, open: false }));
          setPermanentDeleteOpen(true);
        }}
      />
      <CustomerPermanentDeleteModal
        open={permanentDeleteOpen}
        customerName={customer.name}
        reasons={permanentDeleteReasons}
        loading={saving}
        onClose={() => setPermanentDeleteOpen(false)}
        onConfirm={(text) => void permanentDeleteCustomer(text)}
      />
    </div>
  );
}
