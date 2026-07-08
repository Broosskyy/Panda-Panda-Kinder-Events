"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Download, FileText, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { CrmDocumentListControls } from "@/components/admin/crm/CrmDocumentListControls";
import { CrmSendModal } from "@/components/admin/crm/CrmSendModal";
import {
  QuoteLineItemsEditor,
  createEmptyLineItem,
  lineItemToApiPayload,
  type QuoteLineItemDraft,
} from "@/components/admin/crm/QuoteLineItemsEditor";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import {
  AdminButton,
  AdminEmptyState,
  AdminFilterBar,
  AdminFilterSelect,
  AdminLoadingCard,
  AdminSearchInput,
  AdminStatusBadge,
  AdminActionMenu,
  crmDocumentStatusVariant,
} from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { paginateRows, sortCrmRows, type CrmSortDir, type CrmSortField } from "@/lib/admin/crm-list";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { useAdminPdf } from "@/lib/admin/use-admin-pdf";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM, ADMIN_MSG } from "@/lib/admin/messages";
import { formatCents } from "@/lib/crm/money";
import { CRM_STATUS_LABELS, type CrmCustomer, type CrmDocumentStatus, type CrmLineItem } from "@/lib/crm/types";

interface QuoteRow {
  id: string;
  quote_number: string;
  title: string;
  status: CrmDocumentStatus;
  total_cents: number;
  created_at?: string;
  archived_at?: string | null;
  customer?: { name: string; email?: string | null };
}

type QuoteView = "active" | "archived";

const VIEW_OPTIONS = [
  { value: "active", label: "Aktiv" },
  { value: "archived", label: "Archiviert" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Alle Status" },
  ...Object.entries(CRM_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const PAGE_SIZE = 10;

const emptyForm = (taxRate = 19) => ({
  customer_id: "",
  title: "Angebot Kinderbetreuung",
  remarks: "",
  discount_percent: 0,
  tax_rate: taxRate,
  items: [createEmptyLineItem()] as QuoteLineItemDraft[],
});

function lineItemFromApi(item: CrmLineItem): QuoteLineItemDraft {
  const parts = item.description.split("\n");
  return {
    key: item.id ?? crypto.randomUUID(),
    title: parts[0] ?? "",
    details: parts.slice(1).join("\n"),
    quantity: Number(item.quantity),
    unit_price_cents: item.unit_price_cents,
  };
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-form-section">
      <h3 className="admin-form-section-title">{title}</h3>
      {children}
    </div>
  );
}

function exportQuotesCsv(rows: QuoteRow[]) {
  const headers = ["Nummer", "Titel", "Kunde", "Status", "Betrag", "Erstellt"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((q) =>
    [
      q.quote_number,
      q.title,
      q.customer?.name ?? "",
      CRM_STATUS_LABELS[q.status],
      (q.total_cents / 100).toFixed(2).replace(".", ","),
      q.created_at ? new Date(q.created_at).toLocaleDateString("de-DE") : "",
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
  anchor.download = `angebote-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function QuotesView() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listLoadError, setListLoadError] = useState<string | null>(null);
  const [savingQuote, setSavingQuote] = useState(false);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<QuoteView>("active");
  const [sortField, setSortField] = useState<CrmSortField>("date");
  const [sortDir, setSortDir] = useState<CrmSortDir>("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [defaultTaxRate, setDefaultTaxRate] = useState(19);
  const [discountInput, setDiscountInput] = useState("0");
  const [taxInput, setTaxInput] = useState("19");
  const [sendTarget, setSendTarget] = useState<QuoteRow | null>(null);
  const [sendToCustomer, setSendToCustomer] = useState(true);
  const [copyToBusiness, setCopyToBusiness] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<{ message: string; detail?: string; code?: string } | null>(null);
  const {
    withLoading,
    success,
    error: showError,
  } = useAdminMessages();
  const { showResult, confirm, runAction } = useAdminActionFeedback();
  const pageMeta = adminPageHeaderProps("angebote");
  const empty = ADMIN_EMPTY_STATES.quotes;

  const handlePdfError = useCallback(
    (err: { message: string; detail?: string }) => {
      showError("PDF konnte nicht erstellt werden.", err.detail ?? err.message, "Bitte Seite neu laden und erneut versuchen.");
    },
    [showError],
  );
  const { open: openPdf, download: downloadPdf, isLoading: isPdfLoading } = useAdminPdf(handlePdfError);

  const load = useCallback(() => {
    setListLoading(true);
    setListLoadError(null);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("view", view);
    fetch(`/api/admin/quotes?${params}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Angebote konnten nicht geladen werden.");
        setQuotes(d.quotes ?? []);
        setSelected(new Set());
      })
      .catch((err) => {
        setListLoadError(err instanceof Error ? err.message : "Angebote konnten nicht geladen werden.");
        setQuotes([]);
      })
      .finally(() => setListLoading(false));
  }, [search, view]);

  useEffect(() => {
    load();
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []));
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, view, statusFilter, sortField, sortDir]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const rate = d.settings?.invoice?.defaultTaxRate;
        if (typeof rate === "number" && rate >= 0) {
          setDefaultTaxRate(rate);
          setTaxInput(String(rate));
          setForm(emptyForm(rate));
        }
      })
      .catch(() => undefined);
  }, []);

  const filteredQuotes = useMemo(() => {
    let rows = quotes;
    if (statusFilter !== "all") {
      rows = rows.filter((q) => q.status === statusFilter);
    }
    return sortCrmRows(rows, sortField, sortDir);
  }, [quotes, statusFilter, sortField, sortDir]);

  const { pageRows, totalPages } = useMemo(
    () => paginateRows(filteredQuotes, page, PAGE_SIZE),
    [filteredQuotes, page],
  );

  const resetForm = () => {
    setForm(emptyForm(defaultTaxRate));
    setDiscountInput("0");
    setTaxInput(String(defaultTaxRate));
    setEditingId(null);
  };

  const parsePercent = (value: string, fallback: number) => {
    const trimmed = value.trim();
    if (trimmed === "") return fallback;
    const num = Number(trimmed.replace(",", "."));
    if (Number.isNaN(num)) return fallback;
    return Math.min(100, Math.max(0, num));
  };

  const saveQuote = async () => {
    if (savingQuote) return;
    if (!form.customer_id) return showError("Angebot konnte nicht gespeichert werden.", "Bitte einen Kunden auswählen.");
    if (!form.items.some((i) => i.title.trim())) {
      return showError("Angebot konnte nicht gespeichert werden.", "Mindestens eine Position mit Bezeichnung erforderlich.");
    }
    if (form.items.some((i) => !i.quantity || i.quantity < 1)) {
      return showError("Angebot konnte nicht gespeichert werden.", "Jede Position benötigt eine Menge von mindestens 1.");
    }

    const discount_percent = parsePercent(discountInput, 0);
    const tax_rate = parsePercent(taxInput, defaultTaxRate);
    const payload = {
      customer_id: form.customer_id,
      title: form.title,
      remarks: form.remarks,
      discount_percent,
      tax_rate,
      status: "draft" as const,
      items: form.items.map(lineItemToApiPayload),
    };

    setSavingQuote(true);
    try {
    if (editingId) {
      const res = await fetch("/api/admin/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) return showResult(ACTION_RESULTS.genericError(data.error ?? "Angebot konnte nicht aktualisiert werden."));
      showResult(ACTION_RESULTS.quoteCreated());
    } else {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return showResult(ACTION_RESULTS.genericError(data.error ?? "Angebot konnte nicht erstellt werden."));
      showResult(ACTION_RESULTS.quoteCreated());
    }

    setShowForm(false);
    resetForm();
    load();
    } finally {
      setSavingQuote(false);
    }
  };

  const startEdit = async (quoteId: string) => {
    const res = await fetch(`/api/admin/quotes/${quoteId}`);
    const data = await res.json();
    if (!res.ok || !data.quote) {
      return showError("Angebot konnte nicht geladen werden.", data.error);
    }
    const quote = data.quote;
    setEditingId(quoteId);
    setForm({
      customer_id: quote.customer_id,
      title: quote.title,
      remarks: quote.remarks ?? "",
      discount_percent: quote.discount_percent,
      tax_rate: quote.tax_rate,
      items: (quote.items ?? []).map(lineItemFromApi),
    });
    setDiscountInput(String(quote.discount_percent));
    setTaxInput(String(quote.tax_rate));
    setShowForm(true);
  };

  const confirmSend = async () => {
    if (!sendTarget || (!sendToCustomer && !copyToBusiness)) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/admin/quotes/${sendTarget.id}/send`, {
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
      showResult(ACTION_RESULTS.quoteSent());
      setSendTarget(null);
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : ADMIN_MSG.sendFailed;
      setSendError({ message });
      showResult(ACTION_RESULTS.genericError(message));
    } finally {
      setSending(false);
    }
  };

  const pdfUrl = (id: string) => `/api/admin/quotes/${id}/pdf`;
  const pdfKey = (id: string, action: "open" | "download") => `${id}-${action}`;

  const archiveQuote = async (id: string) => {
    const ok = await confirm({
      title: "Angebot archivieren?",
      message: ADMIN_CONFIRM.archiveQuote.replace(/\n\nFortfahren\?$/, ""),
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/quotes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "archive" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Archivieren fehlgeschlagen.");
        load();
      },
      success: {
        title: "Angebot archiviert",
        message: "Das Angebot wurde archiviert.",
        status: "warning",
      },
    });
  };

  const deleteQuote = async (id: string) => {
    const ok = await confirm({
      title: "Angebot löschen?",
      message: ADMIN_CONFIRM.deleteQuote,
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/quotes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Dokument konnte nicht gelöscht werden.");
        load();
      },
      success: ACTION_RESULTS.quoteDeleted(),
    });
  };

  const duplicateQuote = async (id: string) => {
    const res = await fetch("/api/admin/quotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "duplicate" }),
    });
    const data = await res.json();
    if (!res.ok) return showError("Duplizieren fehlgeschlagen.", data.error);
    success(`Angebot ${data.quote?.quote_number ?? ""} als Kopie erstellt.`);
    load();
  };

  const bulkArchive = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    const ok = await confirm({
      title: "Angebote archivieren?",
      message: `Möchten Sie ${ids.length} Angebot(e) archivieren?`,
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/quotes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "bulk_archive", ids }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Archivieren fehlgeschlagen.");
        load();
      },
      success: {
        title: "Angebote archiviert",
        message: "Die ausgewählten Angebote wurden archiviert.",
        status: "warning",
      },
    });
  };

  const bulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    const ok = await confirm({
      title: "Angebote löschen?",
      message: `Möchten Sie ${ids.length} Angebot(e) wirklich löschen?`,
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/quotes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "bulk_delete", ids }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Dokument konnte nicht gelöscht werden.");
        load();
      },
      success: ACTION_RESULTS.quoteDeleted(),
    });
  };

  const toInvoice = async (quoteId: string) => {
    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quote_id: quoteId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Rechnung konnte nicht erstellt werden.");
        return data;
      },
      success: ACTION_RESULTS.invoiceCreated(),
    });
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
      setSelected(new Set(pageRows.map((q) => q.id)));
    }
  };

  const customerOptions = useMemo(
    () => [{ value: "", label: "Kunde wählen…" }, ...customers.map((c) => ({ value: c.id, label: c.name }))],
    [customers],
  );

  const discountPercent = parsePercent(discountInput, 0);
  const taxRate = parsePercent(taxInput, 19);

  return (
    <div className="space-y-6">
      <AdminPageHeader {...pageMeta}>
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { resetForm(); setShowForm(true); }}>
          Neues Angebot
        </AdminButton>
      </AdminPageHeader>

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Angebote suchen…" />
        <AdminFilterSelect value={view} onChange={(v) => setView(v as QuoteView)} options={VIEW_OPTIONS} />
      </AdminFilterBar>

      {quotes.length > 0 ? (
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
          onExport={() => exportQuotesCsv(filteredQuotes.filter((q) => selected.has(q.id)).length ? filteredQuotes.filter((q) => selected.has(q.id)) : filteredQuotes)}
        />
      ) : null}

      {showForm ? (
        <AdminCard title={editingId ? "Angebot bearbeiten" : "Neues Angebot"}>
          <FormSection title="Kunde">
            <AdminFormField label="Kunde" required>
              <AdminFilterSelect
                value={form.customer_id}
                onChange={(v) => setForm({ ...form, customer_id: v })}
                options={customerOptions}
              />
            </AdminFormField>
          </FormSection>

          <FormSection title="Angebotsdaten">
            <AdminFormField label="Titel" required hint="z. B. Angebot Kinderbetreuung">
              <input
                className="admin-input"
                placeholder="Angebot Kinderbetreuung"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </AdminFormField>
          </FormSection>

          <FormSection title="Positionen">
            <QuoteLineItemsEditor
              items={form.items}
              discountPercent={discountPercent}
              taxRate={taxRate}
              onChange={(items) => setForm({ ...form, items })}
            />
          </FormSection>

          <FormSection title="Rabatt & Steuern">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminFormField label="Rabatt (%)" hint="Standard: 0">
                <input
                  className="admin-input"
                  type="text"
                  inputMode="decimal"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  onBlur={() => setDiscountInput(String(parsePercent(discountInput, 0)))}
                />
              </AdminFormField>
              <AdminFormField label="MwSt. (%)" hint="Standard: 19">
                <input
                  className="admin-input"
                  type="text"
                  inputMode="decimal"
                  value={taxInput}
                  onChange={(e) => setTaxInput(e.target.value)}
                  onBlur={() => setTaxInput(String(parsePercent(taxInput, 19)))}
                />
              </AdminFormField>
            </div>
          </FormSection>

          <FormSection title="Hinweise">
            <AdminFormField label="Bemerkung">
              <textarea
                className="admin-input min-h-20"
                placeholder="Zusätzliche Hinweise für den Kunden…"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </AdminFormField>
          </FormSection>

          <div className="mt-6 flex flex-wrap gap-2">
            <AdminButton
              variant="primary"
              disabled={savingQuote}
              onClick={() => void withLoading(() => saveQuote())}
            >
              {savingQuote ? "Speichern…" : ADMIN_BTN.save}
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>
              {ADMIN_BTN.cancel}
            </AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {listLoading ? (
        <AdminLoadingCard message="Angebote werden geladen…" />
      ) : listLoadError ? (
        <AdminCard>
          <p className="admin-text-body">{listLoadError}</p>
          <AdminButton variant="secondary" className="mt-4" onClick={() => void load()}>
            Erneut laden
          </AdminButton>
        </AdminCard>
      ) : filteredQuotes.length === 0 ? (
        <AdminEmptyState
          icon={FileText}
          title={view === "archived" ? "Keine archivierten Angebote" : empty.title}
          description={view === "archived" ? "Archivierte Angebote erscheinen hier." : empty.description}
          actionLabel={view === "active" ? empty.actionLabel : undefined}
          onAction={view === "active" ? () => setShowForm(true) : undefined}
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
          {pageRows.map((q) => {
            const openKey = pdfKey(q.id, "open");
            const downloadKey = pdfKey(q.id, "download");
            const pdfBusy = isPdfLoading(openKey) || isPdfLoading(downloadKey);

            return (
              <AdminCard key={q.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <input
                      type="checkbox"
                      checked={selected.has(q.id)}
                      onChange={() => toggleSelect(q.id)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-border"
                      aria-label={`${q.quote_number} auswählen`}
                    />
                    <div>
                      <p className="font-semibold text-text-primary">{q.quote_number} — {q.title}</p>
                      <p className="text-sm text-text-muted">{q.customer?.name} · {formatCents(q.total_cents)}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <AdminStatusBadge
                          label={CRM_STATUS_LABELS[q.status]}
                          variant={crmDocumentStatusVariant(q.status, Boolean(q.archived_at))}
                        />
                        {q.archived_at ? <AdminStatusBadge label="Archiviert" variant="muted" /> : null}
                      </div>
                    </div>
                  </div>
                  <div className="admin-document-actions">
                    <AdminActionMenu
                      primary={{
                        label: ADMIN_BTN.send,
                        icon: <Send className="h-4 w-4" />,
                        onClick: () => {
                          setSendTarget(q);
                          setSendToCustomer(true);
                          setCopyToBusiness(true);
                          setSendError(null);
                        },
                      }}
                      items={[
                        {
                          id: "edit",
                          label: ADMIN_BTN.edit,
                          icon: <Pencil className="h-4 w-4" />,
                          onClick: () => void startEdit(q.id),
                        },
                        {
                          id: "duplicate",
                          label: ADMIN_BTN.duplicate,
                          icon: <Copy className="h-4 w-4" />,
                          onClick: () => void duplicateQuote(q.id),
                        },
                        {
                          id: "pdf-open",
                          label: isPdfLoading(openKey) ? "PDF wird erstellt…" : ADMIN_BTN.pdfOpen,
                          disabled: pdfBusy,
                          onClick: () => void openPdf(pdfUrl(q.id), openKey),
                        },
                        {
                          id: "pdf-download",
                          label: isPdfLoading(downloadKey) ? "Wird heruntergeladen…" : ADMIN_BTN.pdfDownload,
                          icon: <Download className="h-4 w-4" />,
                          disabled: pdfBusy,
                          onClick: () => void downloadPdf(pdfUrl(q.id), downloadKey, `${q.quote_number}.pdf`),
                        },
                        {
                          id: "invoice",
                          label: "→ Rechnung",
                          onClick: () => toInvoice(q.id),
                        },
                        ...(!q.archived_at
                          ? [
                              {
                                id: "archive",
                                label: ADMIN_BTN.archive,
                                onClick: () => void archiveQuote(q.id),
                              },
                            ]
                          : []),
                      ]}
                      dangerItems={[
                        {
                          id: "delete",
                          label: ADMIN_BTN.delete,
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => void deleteQuote(q.id),
                        },
                      ]}
                    />
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      <CrmSendModal
        open={Boolean(sendTarget)}
        title={`Angebot ${sendTarget?.quote_number ?? ""} versenden`}
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
