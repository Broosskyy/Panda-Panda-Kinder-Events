"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Download, Loader2, Receipt, Send, Trash2 } from "lucide-react";
import { CrmDocumentListControls } from "@/components/admin/crm/CrmDocumentListControls";
import { CrmSendModal } from "@/components/admin/crm/CrmSendModal";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import {
  AdminButton,
  AdminEmptyState,
  AdminFilterBar,
  AdminFilterSelect,
  AdminLoadingCard,
  AdminSearchInput,
  AdminStatusBadge,
  crmDocumentStatusVariant,
} from "@/components/admin/ui";
import { paginateRows, sortCrmRows, type CrmSortDir, type CrmSortField } from "@/lib/admin/crm-list";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { useAdminPdf } from "@/lib/admin/use-admin-pdf";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM, ADMIN_MSG, confirmDanger } from "@/lib/admin/messages";
import { formatCents } from "@/lib/crm/money";
import { CRM_STATUS_LABELS, type CrmDocumentStatus } from "@/lib/crm/types";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  title: string;
  status: CrmDocumentStatus;
  total_cents: number;
  created_at?: string;
  issue_date?: string;
  archived_at?: string | null;
  customer?: { name: string; email?: string | null };
}

type InvoiceView = "active" | "archived";

const VIEW_OPTIONS = [
  { value: "active", label: "Aktiv" },
  { value: "archived", label: "Archiviert" },
];

const STATUS_OPTIONS = Object.entries(CRM_STATUS_LABELS).map(([value, label]) => ({ value, label }));

const STATUS_FILTER_OPTIONS = [{ value: "all", label: "Alle Status" }, ...STATUS_OPTIONS];

const PAGE_SIZE = 10;

function exportInvoicesCsv(rows: InvoiceRow[]) {
  const headers = ["Nummer", "Titel", "Kunde", "Status", "Betrag", "Datum"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((inv) =>
    [
      inv.invoice_number,
      inv.title,
      inv.customer?.name ?? "",
      CRM_STATUS_LABELS[inv.status],
      (inv.total_cents / 100).toFixed(2).replace(".", ","),
      inv.issue_date ?? inv.created_at
        ? new Date(inv.issue_date ?? inv.created_at!).toLocaleDateString("de-DE")
        : "",
    ]
      .map(String)
      .map(escape)
      .join(","),
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `rechnungen-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function InvoicesView() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<InvoiceView>("active");
  const [sortField, setSortField] = useState<CrmSortField>("date");
  const [sortDir, setSortDir] = useState<CrmSortDir>("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendTarget, setSendTarget] = useState<InvoiceRow | null>(null);
  const [sendToCustomer, setSendToCustomer] = useState(true);
  const [copyToBusiness, setCopyToBusiness] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<{ message: string; detail?: string; code?: string } | null>(null);
  const {
    invoiceSent,
    invoiceArchived,
    invoiceDeleted,
    invoiceCancelled,
    error: showError,
  } = useAdminMessages();

  const handlePdfError = useCallback(
    (err: { message: string; detail?: string }) => {
      showError("PDF konnte nicht erstellt werden.", err.detail ?? err.message, "Bitte Seite neu laden und erneut versuchen.");
    },
    [showError],
  );
  const { open: openPdf, download: downloadPdf, isLoading: isPdfLoading } = useAdminPdf(handlePdfError);

  const pageMeta = adminPageHeaderProps("rechnungen");
  const empty = ADMIN_EMPTY_STATES.invoices;

  const load = useCallback(() => {
    setListLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("view", view);
    fetch(`/api/admin/invoices?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setInvoices(d.invoices ?? []);
        setSelected(new Set());
      })
      .finally(() => setListLoading(false));
  }, [search, view]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, view, statusFilter, sortField, sortDir]);

  const filteredInvoices = useMemo(() => {
    let rows = invoices;
    if (statusFilter !== "all") {
      rows = rows.filter((inv) => inv.status === statusFilter);
    }
    return sortCrmRows(rows, sortField, sortDir);
  }, [invoices, statusFilter, sortField, sortDir]);

  const { pageRows, totalPages } = useMemo(
    () => paginateRows(filteredInvoices, page, PAGE_SIZE),
    [filteredInvoices, page],
  );

  const confirmSend = async () => {
    if (!sendTarget || (!sendToCustomer && !copyToBusiness)) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${sendTarget.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyToBusiness, sendToCustomer }),
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
  const pdfKey = (id: string, action: "open" | "download") => `${id}-${action}`;

  const setStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
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
    if (!res.ok) return showError("Dokument konnte nicht gelöscht werden.", data.error);
    invoiceDeleted();
    load();
  };

  const bulkArchive = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirmDanger(`Möchten Sie ${ids.length} Rechnung(en) archivieren?`)) return;
    const res = await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulk_archive", ids }),
    });
    const data = await res.json();
    if (!res.ok) return showError("Archivieren fehlgeschlagen.", data.error);
    invoiceArchived();
    load();
  };

  const bulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirmDanger(`Möchten Sie ${ids.length} Rechnung(en) wirklich löschen?`)) return;
    const res = await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulk_delete", ids }),
    });
    const data = await res.json();
    if (!res.ok) return showError("Dokument konnte nicht gelöscht werden.", data.error, "Nur Entwürfe können gelöscht werden.");
    invoiceDeleted();
    load();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === pageRows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageRows.map((inv) => inv.id)));
    }
  };

  const canDelete = (status: CrmDocumentStatus) => status === "draft";
  const canCancel = (status: CrmDocumentStatus) => status !== "paid" && status !== "cancelled";

  return (
    <div className="space-y-6">
      <AdminPageHeader {...pageMeta} />

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Rechnungen suchen…" />
        <AdminFilterSelect value={view} onChange={(v) => setView(v as InvoiceView)} options={VIEW_OPTIONS} />
      </AdminFilterBar>

      {invoices.length > 0 ? (
        <CrmDocumentListControls
          sortField={sortField}
          sortDir={sortDir}
          onSortFieldChange={setSortField}
          onSortDirChange={setSortDir}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={STATUS_FILTER_OPTIONS}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          selectedCount={selected.size}
          onBulkArchive={view === "active" ? () => void bulkArchive() : undefined}
          onBulkDelete={() => void bulkDelete()}
          onExport={() =>
            exportInvoicesCsv(
              filteredInvoices.filter((inv) => selected.has(inv.id)).length
                ? filteredInvoices.filter((inv) => selected.has(inv.id))
                : filteredInvoices,
            )
          }
        />
      ) : null}

      {listLoading ? (
        <AdminLoadingCard message="Rechnungen werden geladen…" />
      ) : filteredInvoices.length === 0 ? (
        <AdminEmptyState
          icon={Receipt}
          title={view === "archived" ? "Keine archivierten Rechnungen" : empty.title}
          description={view === "archived" ? "Archivierte Rechnungen erscheinen hier." : empty.description}
          actionHref={view === "active" ? empty.actionHref : undefined}
          actionLabel={view === "active" ? empty.actionLabel : undefined}
        />
      ) : (
        <div className="space-y-3">
          {pageRows.length > 1 ? (
            <label className="flex items-center gap-2 px-1 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={selected.size === pageRows.length && pageRows.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-border"
              />
              Alle auf dieser Seite auswählen
            </label>
          ) : null}
          {pageRows.map((inv) => {
            const openKey = pdfKey(inv.id, "open");
            const downloadKey = pdfKey(inv.id, "download");
            const pdfBusy = isPdfLoading(openKey) || isPdfLoading(downloadKey);

            return (
              <AdminCard key={inv.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <input
                      type="checkbox"
                      checked={selected.has(inv.id)}
                      onChange={() => toggleSelect(inv.id)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-border"
                      aria-label={`${inv.invoice_number} auswählen`}
                    />
                    <div>
                      <p className="font-semibold text-text-primary">{inv.invoice_number} — {inv.title}</p>
                      <p className="text-sm text-text-muted">{inv.customer?.name} · {formatCents(inv.total_cents)}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <AdminStatusBadge
                          label={CRM_STATUS_LABELS[inv.status]}
                          variant={crmDocumentStatusVariant(inv.status, Boolean(inv.archived_at))}
                        />
                        {inv.archived_at ? <AdminStatusBadge label="Archiviert" variant="muted" /> : null}
                      </div>
                      {inv.status === "paid" ? (
                        <p className="mt-1 text-xs text-text-muted">Bezahlte Rechnungen können nicht gelöscht werden.</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminFilterSelect
                      value={inv.status}
                      onChange={(v) => setStatus(inv.id, v)}
                      options={STATUS_OPTIONS}
                      label="Status"
                    />
                    <AdminButton
                      variant="secondary"
                      disabled={pdfBusy}
                      icon={isPdfLoading(openKey) ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                      onClick={() => void openPdf(pdfUrl(inv.id), openKey)}
                    >
                      {isPdfLoading(openKey) ? "PDF wird erstellt…" : ADMIN_BTN.pdfOpen}
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      disabled={pdfBusy}
                      icon={
                        isPdfLoading(downloadKey) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )
                      }
                      onClick={() => void downloadPdf(pdfUrl(inv.id), downloadKey, `${inv.invoice_number}.pdf`)}
                    >
                      {isPdfLoading(downloadKey) ? "Wird heruntergeladen…" : ADMIN_BTN.pdfDownload}
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
            );
          })}
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
