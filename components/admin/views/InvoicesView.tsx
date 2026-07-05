"use client";

import { useEffect, useState } from "react";
import { Receipt, Send } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminFilterBar, AdminFilterSelect, AdminSearchInput } from "@/components/admin/ui";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { formatCents } from "@/lib/crm/money";
import { CRM_STATUS_LABELS, type CrmDocumentStatus } from "@/lib/crm/types";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  title: string;
  status: CrmDocumentStatus;
  total_cents: number;
  customer?: { name: string };
}

const STATUS_OPTIONS = Object.entries(CRM_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export function InvoicesView() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useAdminUi();

  const load = () => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/invoices${q}`).then((r) => r.json()).then((d) => setInvoices(d.invoices ?? []));
  };

  useEffect(() => {
    load();
  }, [search]);

  const send = async (id: string) => {
    const res = await fetch(`/api/admin/invoices/${id}/send`, { method: "POST", body: JSON.stringify({ copyToBusiness: true }) });
    const data = await res.json();
    if (!res.ok) return toast(data.error ?? "Versand fehlgeschlagen", "error");
    toast("Rechnung versendet");
    load();
  };

  const setStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast("Status aktualisiert");
      load();
    } else toast("Fehler", "error");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Rechnungen" description="Rechnungen aus Angeboten — PDF, Versand und Statusverwaltung." />

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Rechnungen suchen…" />
      </AdminFilterBar>

      {invoices.length === 0 ? (
        <AdminEmptyState icon={Receipt} title="Noch keine Rechnungen" description="Erstelle Rechnungen aus bestätigten Angeboten." actionHref="/admin/angebote" actionLabel="Zu Angeboten" />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <AdminCard key={inv.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{inv.invoice_number} — {inv.title}</p>
                  <p className="text-sm text-text-muted">{inv.customer?.name} · {formatCents(inv.total_cents)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminFilterSelect value={inv.status} onChange={(v) => setStatus(inv.id, v)} options={STATUS_OPTIONS} />
                  <AdminButton variant="secondary" href={`/api/admin/invoices/${inv.id}/pdf`} target="_blank">PDF</AdminButton>
                  <AdminButton variant="primary" icon={<Send className="h-4 w-4" />} onClick={() => send(inv.id)}>Senden</AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
