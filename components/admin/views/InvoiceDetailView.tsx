"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, Download, Send, Trash2 } from "lucide-react";
import { CrmSendModal } from "@/components/admin/crm/CrmSendModal";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminStatusBadge, crmDocumentStatusVariant } from "@/components/admin/ui";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { useAdminPdf } from "@/lib/admin/use-admin-pdf";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM, ADMIN_MSG } from "@/lib/admin/messages";
import { formatCents } from "@/lib/crm/money";
import { CRM_STATUS_LABELS, type CrmDocumentStatus, type CrmLineItem } from "@/lib/crm/types";

interface InvoiceDetailViewProps {
  invoiceId: string;
}

export function InvoiceDetailView({ invoiceId }: InvoiceDetailViewProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<{
    id: string;
    invoice_number: string;
    title: string;
    status: CrmDocumentStatus;
    total_cents: number;
    issue_date?: string;
    remarks?: string;
    archived_at?: string | null;
    customer?: { id: string; name: string; email?: string | null };
    items?: CrmLineItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendToCustomer, setSendToCustomer] = useState(true);
  const [copyToBusiness, setCopyToBusiness] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<{ message: string; detail?: string } | null>(null);
  const { error: showError } = useAdminMessages();
  const { showResult, confirm, runAction } = useAdminActionFeedback();
  const handlePdfError = useCallback(
    (err: { message: string; detail?: string }) => {
      showError("PDF konnte nicht erstellt werden.", err.detail ?? err.message);
    },
    [showError],
  );
  const { open: openPdf, download: downloadPdf, isLoading: isPdfLoading } = useAdminPdf(handlePdfError);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Rechnung konnte nicht geladen werden.");
      setInvoice(data.invoice);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Rechnung konnte nicht geladen werden.");
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const archiveInvoice = async () => {
    if (!invoice) return;
    const ok = await confirm({
      title: "Rechnung archivieren?",
      message: ADMIN_CONFIRM.archiveInvoice.replace(/\n\nFortfahren\?$/, ""),
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/invoices", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: invoice.id, action: "archive" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Archivieren fehlgeschlagen.");
        router.push("/admin/rechnungen");
      },
      success: { title: "Rechnung archiviert", message: "Die Rechnung wurde archiviert.", status: "warning" },
    });
  };

  const cancelInvoice = async () => {
    if (!invoice) return;
    const ok = await confirm({
      title: "Rechnung stornieren?",
      message: ADMIN_CONFIRM.cancelInvoice.replace(/\n\nFortfahren\?$/, ""),
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/invoices", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: invoice.id, action: "cancel" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Stornieren fehlgeschlagen.");
        await load();
      },
      success: ACTION_RESULTS.invoiceCancelled(),
    });
  };

  const deleteInvoice = async () => {
    if (!invoice || invoice.status !== "draft") {
      return showResult(
        ACTION_RESULTS.genericError(
          "Nur Rechnungs-Entwürfe können gelöscht werden. Gesendete oder bezahlte Rechnungen bitte archivieren oder stornieren.",
        ),
      );
    }
    const ok = await confirm({
      title: "Rechnung löschen?",
      message: ADMIN_CONFIRM.deleteInvoiceDraft,
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/invoices", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: invoice.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Dokument konnte nicht gelöscht werden.");
        router.push("/admin/rechnungen");
      },
      success: ACTION_RESULTS.invoiceDeleted(),
    });
  };

  const confirmSend = async () => {
    if (!invoice || (!sendToCustomer && !copyToBusiness)) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyToBusiness, sendToCustomer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError({ message: data.error ?? ADMIN_MSG.sendFailed, detail: data.detail });
        return;
      }
      showResult(ACTION_RESULTS.invoiceSent());
      setSendOpen(false);
      await load();
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-sm text-text-muted">Rechnung wird geladen…</p>;

  if (loadError || !invoice) {
    return (
      <AdminCard>
        <p className="text-sm text-accent-heart">{loadError ?? "Rechnung nicht gefunden."}</p>
        <AdminButton className="mt-4" variant="secondary" href="/admin/rechnungen">
          Zurück zur Liste
        </AdminButton>
      </AdminCard>
    );
  }

  const pdfUrl = `/api/admin/invoices/${invoice.id}/pdf`;
  const canDelete = invoice.status === "draft";
  const canCancel = invoice.status !== "paid" && invoice.status !== "cancelled";

  return (
    <div className="space-y-6">
      <AdminPageHeader title={`Rechnung ${invoice.invoice_number}`} description={invoice.title}>
        <AdminButton variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} href="/admin/rechnungen">
          Zurück zur Liste
        </AdminButton>
      </AdminPageHeader>

      <AdminCard title="Übersicht">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted">Kunde</p>
            <p className="font-semibold text-text-primary">{invoice.customer?.name ?? "—"}</p>
            {invoice.customer?.id ? (
              <AdminButton variant="ghost" className="mt-1 px-0" href={`/admin/kunden/${invoice.customer.id}`}>
                Kunde öffnen
              </AdminButton>
            ) : null}
          </div>
          <div className="text-right">
            <AdminStatusBadge
              label={CRM_STATUS_LABELS[invoice.status]}
              variant={crmDocumentStatusVariant(invoice.status, Boolean(invoice.archived_at))}
            />
            <p className="mt-2 text-lg font-semibold text-text-primary">{formatCents(invoice.total_cents)}</p>
          </div>
        </div>
      </AdminCard>

      {invoice.items && invoice.items.length > 0 ? (
        <AdminCard title="Positionen">
          <ul className="space-y-2 text-sm">
            {invoice.items.map((item) => (
              <li key={item.id ?? item.description} className="flex justify-between gap-4 border-b border-border pb-2">
                <span>{item.description}</span>
                <span className="shrink-0 text-text-muted">
                  {item.quantity} × {formatCents(item.unit_price_cents)}
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <AdminButton variant="primary" icon={<Send className="h-4 w-4" />} onClick={() => setSendOpen(true)}>
          {ADMIN_BTN.send}
        </AdminButton>
        <AdminButton
          variant="secondary"
          icon={<Download className="h-4 w-4" />}
          onClick={() => openPdf(pdfUrl, `${invoice.invoice_number}.pdf`)}
          loading={isPdfLoading(`${invoice.id}-open`)}
        >
          {ADMIN_BTN.pdfOpen}
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={() => downloadPdf(pdfUrl, `${invoice.invoice_number}.pdf`)}
          loading={isPdfLoading(`${invoice.id}-download`)}
        >
          {ADMIN_BTN.pdfDownload}
        </AdminButton>
        <AdminButton variant="secondary" onClick={() => void archiveInvoice()}>
          Archivieren
        </AdminButton>
        {canCancel ? (
          <AdminButton variant="secondary" icon={<Ban className="h-4 w-4" />} onClick={() => void cancelInvoice()}>
            Stornieren
          </AdminButton>
        ) : null}
        {canDelete ? (
          <AdminButton variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void deleteInvoice()}>
            Löschen
          </AdminButton>
        ) : null}
      </div>

      <CrmSendModal
        open={sendOpen}
        title={`Rechnung ${invoice.invoice_number} versenden`}
        customerEmail={invoice.customer?.email}
        sendToCustomer={sendToCustomer}
        copyToBusiness={copyToBusiness}
        loading={sending}
        error={sendError}
        onChangeSendToCustomer={setSendToCustomer}
        onChangeCopyToBusiness={setCopyToBusiness}
        onClose={() => setSendOpen(false)}
        onConfirm={() => void confirmSend()}
      />
    </div>
  );
}
