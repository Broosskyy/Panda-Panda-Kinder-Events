"use client";

import { useEffect, useState } from "react";
import { Receipt, Send } from "lucide-react";
import { CrmSendModal } from "@/components/admin/crm/CrmSendModal";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminFilterBar, AdminFilterSelect, AdminSearchInput, AdminStatusBadge, crmDocumentStatusVariant } from "@/components/admin/ui";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { formatCents } from "@/lib/crm/money";
import { CRM_STATUS_LABELS, type CrmDocumentStatus } from "@/lib/crm/types";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  title: string;
  status: CrmDocumentStatus;
  total_cents: number;
  customer?: { name: string; email?: string | null };
}

const STATUS_OPTIONS = Object.entries(CRM_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export function InvoicesView() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [search, setSearch] = useState("");
  const [sendTarget, setSendTarget] = useState<InvoiceRow | null>(null);
  const [sendToCustomer, setSendToCustomer] = useState(true);
  const [copyToBusiness, setCopyToBusiness] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useAdminUi();

  const load = () => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/invoices${q}`).then((r) => r.json()).then((d) => setInvoices(d.invoices ?? []));
  };

  useEffect(() => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/invoices${q}`).then((r) => r.json()).then((d) => setInvoices(d.invoices ?? []));
  }, [search]);

  const confirmSend = async () => {
    if (!sendTarget || !sendToCustomer) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/invoices/${sendTarget.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyToBusiness }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Versand fehlgeschlagen");
      toast("Rechnung versendet");
      setSendTarget(null);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Versand fehlgeschlagen", "error");
    } finally {
      setSending(false);
    }
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
                  <div className="mt-1">
                    <AdminStatusBadge label={CRM_STATUS_LABELS[inv.status]} variant={crmDocumentStatusVariant(inv.status)} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminFilterSelect value={inv.status} onChange={(v) => setStatus(inv.id, v)} options={STATUS_OPTIONS} />
                  <AdminButton variant="secondary" href={`/api/admin/invoices/${inv.id}/pdf`} target="_blank">PDF</AdminButton>
                  <AdminButton
                    variant="primary"
                    icon={<Send className="h-4 w-4" />}
                    onClick={() => {
                      setSendTarget(inv);
                      setSendToCustomer(true);
                      setCopyToBusiness(true);
                    }}
                  >
                    Senden
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <CrmSendModal
        open={Boolean(sendTarget)}
        title={`Rechnung ${sendTarget?.invoice_number ?? ""} versenden`}
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
