"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Download, Receipt, Send, Trash2 } from "lucide-react";
import { CrmSendModal } from "@/components/admin/crm/CrmSendModal";
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
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM, ADMIN_MSG, confirmDanger } from "@/lib/admin/messages";
import { downloadAdminPdf, openAdminPdf } from "@/lib/admin/open-pdf";
import { formatCents } from "@/lib/crm/money";
import { CRM_STATUS_LABELS, type CrmDocumentStatus } from "@/lib/crm/types";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  title: string;
  status: CrmDocumentStatus;
  total_cents: number;
  archived_at?: string | null;
  customer?: { name: string; email?: string | null };
}

type InvoiceView = "active" | "archived";

const VIEW_OPTIONS = [
  { value: "active", label: "Aktiv" },
  { value: "archived", label: "Archiviert" },
];

const STATUS_OPTIONS = Object.entries(CRM_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export function InvoicesView() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<InvoiceView>("active");
  const [sendTarget, setSendTarget] = useState<InvoiceRow | null>(null);
  const [sendToCustomer, setSendToCustomer] = useState(true);
  const [copyToBusiness, setCopyToBusiness] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<{ message: string; detail?: string; code?: string } | null>(null);
  const {
    toast,
    invoiceSent,
    invoiceArchived,
    invoiceDeleted,
    invoiceCancelled,
    error: showError,
  } = useAdminMessages();
  const page = adminPageHeaderProps("rechnungen");
  const empty = ADMIN_EMPTY_STATES.invoices;

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("view", view);
    fetch(`/api/admin/invoices?${params}`).then((r) => r.json()).then((d) => setInvoices(d.invoices ?? []));
  }, [search, view]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmSend = async () => {
    if (!sendTarget || !sendToCustomer) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${sendTarget.id}/send`, {
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
      invoiceSent();
      setSendTarget(null);
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : ADMIN_MSG.sendFailed;
      setSendError({ message });
      showError(
        "Die E-Mail konnte nicht versendet werden.",
        message,
        "Bitte E-Mail-Einstellungen und Empfänger-Adresse prüfen.",
      );
    } finally {
      setSending(false);
    }
  };

  const pdfUrl = (id: string) => `/api/admin/invoices/${id}/pdf`;

  const handlePdfError = (err: { message: string; detail?: string }) => {
    toast(err.message, "error");
    if (err.detail) console.error("PDF error:", err.detail);
  };

  const setStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast(ADMIN_MSG.statusUpdated);
      load();
    } else {
      const data = await res.json();
      showError("Status konnte nicht aktualisiert werden.", data.error, "Bitte erneut versuchen.");
    }
  };

  const archiveInvoice = async (id: string) => {
    if (!confirmDanger(ADMIN_CONFIRM.archiveInvoice)) return;
    const res = await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "archive" }),
    });
    const data = await res.json();
    if (!res.ok) return showError("Archivieren fehlgeschlagen.", data.error);
    invoiceArchived();
    load();
  };

  const cancelInvoice = async (id: string) => {
    if (!confirmDanger(ADMIN_CONFIRM.cancelInvoice)) return;
    const res = await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "cancel" }),
    });
    const data = await res.json();
    if (!res.ok) return showError("Stornieren fehlgeschlagen.", data.error);
    invoiceCancelled();
    load();
  };

  const deleteInvoice = async (inv: InvoiceRow) => {
    if (inv.status !== "draft") {
      return showError(
        "Löschen nicht erlaubt.",
        "Nur Rechnungs-Entwürfe können gelöscht werden.",
        "Gesendete oder bezahlte Rechnungen bitte archivieren oder stornieren.",
      );
    }
    if (!confirmDanger(ADMIN_CONFIRM.deleteInvoiceDraft)) return;
    const res = await fetch("/api/admin/invoices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inv.id }),
    });
    const data = await res.json();
    if (!res.ok) return showError("Löschen fehlgeschlagen.", data.error);
    invoiceDeleted();
    load();
  };

  const canDelete = (status: CrmDocumentStatus) => status === "draft";
  const canCancel = (status: CrmDocumentStatus) => status !== "paid" && status !== "cancelled";

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page} />

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Rechnungen suchen…" />
        <AdminFilterSelect value={view} onChange={(v) => setView(v as InvoiceView)} options={VIEW_OPTIONS} />
      </AdminFilterBar>

      {invoices.length === 0 ? (
        <AdminEmptyState
          icon={Receipt}
          title={view === "archived" ? "Keine archivierten Rechnungen" : empty.title}
          description={view === "archived" ? "Archivierte Rechnungen erscheinen hier." : empty.description}
          actionHref={view === "active" ? empty.actionHref : undefined}
          actionLabel={view === "active" ? empty.actionLabel : undefined}
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <AdminCard key={inv.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{inv.invoice_number} — {inv.title}</p>
                  <p className="text-sm text-text-muted">{inv.customer?.name} · {formatCents(inv.total_cents)}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <AdminStatusBadge label={CRM_STATUS_LABELS[inv.status]} variant={crmDocumentStatusVariant(inv.status)} />
                    {inv.archived_at ? <AdminStatusBadge label="Archiviert" variant="muted" /> : null}
                  </div>
                  {inv.status === "paid" ? (
                    <p className="mt-1 text-xs text-text-muted">Bezahlte Rechnungen können nicht gelöscht werden.</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminFilterSelect value={inv.status} onChange={(v) => setStatus(inv.id, v)} options={STATUS_OPTIONS} />
                  <AdminButton variant="secondary" onClick={() => void openAdminPdf(pdfUrl(inv.id), handlePdfError)}>
                    {ADMIN_BTN.pdfOpen}
                  </AdminButton>
                  <AdminButton
                    variant="secondary"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => void downloadAdminPdf(pdfUrl(inv.id), handlePdfError, `${inv.invoice_number}.pdf`)}
                  >
                    {ADMIN_BTN.pdfDownload}
                  </AdminButton>
                  <AdminButton
                    variant="primary"
                    icon={<Send className="h-4 w-4" />}
                    onClick={() => {
                      setSendTarget(inv);
                      setSendToCustomer(true);
                      setCopyToBusiness(true);
                      setSendError(null);
                    }}
                  >
                    {ADMIN_BTN.send}
                  </AdminButton>
                  {!inv.archived_at ? (
                    <AdminButton variant="secondary" onClick={() => void archiveInvoice(inv.id)}>
                      {ADMIN_BTN.archive}
                    </AdminButton>
                  ) : null}
                  {canCancel(inv.status) ? (
                    <AdminButton variant="secondary" icon={<Ban className="h-4 w-4" />} onClick={() => void cancelInvoice(inv.id)}>
                      Stornieren
                    </AdminButton>
                  ) : null}
                  {canDelete(inv.status) ? (
                    <AdminButton variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void deleteInvoice(inv)}>
                      {ADMIN_BTN.delete}
                    </AdminButton>
                  ) : null}
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
        error={sendError}
        onChangeSendToCustomer={setSendToCustomer}
        onChangeCopyToBusiness={setCopyToBusiness}
        onClose={() => setSendTarget(null)}
        onConfirm={() => void confirmSend()}
      />
    </div>
  );
}
