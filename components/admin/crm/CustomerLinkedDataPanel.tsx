"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Link2Off, Archive, Trash2, MoreHorizontal, UserRoundCog } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminOverlayModal } from "@/components/admin/ui/AdminOverlayModal";
import { AdminFilterSelect } from "@/components/admin/ui";
import type { CustomerLinkItem, CustomerLinksPayload } from "@/lib/crm/customer-links";
import { VISIBILITY_LABELS } from "@/lib/crm/customer-dependencies";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import type { CrmCustomer } from "@/lib/crm/types";

interface CustomerLinkedDataPanelProps {
  customerId: string;
  scrollIntoView?: boolean;
  onLinksChanged?: () => void;
}

type LinkSection = {
  title: string;
  count: number;
  items: CustomerLinkItem[];
  empty: string;
  countSingular: string;
  countPlural: string;
};

export function CustomerLinkedDataPanel({
  customerId,
  scrollIntoView = false,
  onLinksChanged,
}: CustomerLinkedDataPanelProps) {
  const { confirm, runAction } = useAdminActionFeedback();
  const [links, setLinks] = useState<CustomerLinksPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionItem, setActionItem] = useState<CustomerLinkItem | null>(null);
  const [reassignItem, setReassignItem] = useState<CustomerLinkItem | null>(null);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [reassignTargetId, setReassignTargetId] = useState("");
  const panelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && scrollIntoView) {
        node.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [scrollIntoView],
  );

  const loadLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/links`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verknüpfungen konnten nicht geladen werden.");
      setLinks(data as CustomerLinksPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verknüpfungen konnten nicht geladen werden.");
      setLinks(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const loadCustomers = useCallback(async () => {
    const res = await fetch("/api/admin/customers?view=all");
    const data = await res.json();
    if (res.ok) setCustomers((data.customers ?? []) as CrmCustomer[]);
  }, []);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  const runLinkAction = async (item: CustomerLinkItem, action: "unlink" | "archive" | "delete") => {
    const labels = {
      unlink: "Verknüpfung lösen",
      archive: "Archivieren",
      delete: "Löschen",
    };
    const ok = await confirm({
      title: `${labels[action]}?`,
      message:
        action === "unlink"
          ? `„${item.label}“ wird von diesem Kunden gelöst.`
          : action === "archive"
            ? `„${item.label}“ wird archiviert.`
            : `„${item.label}“ wird gelöscht.`,
      destructive: action !== "archive",
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch(`/api/admin/customers/${customerId}/unlink`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: item.type, targetId: item.id, action }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Aktion fehlgeschlagen.");
        await loadLinks();
        onLinksChanged?.();
        return data;
      },
      success: {
        title: "Erfolg",
        message: dataMessage(action),
        status: "success",
      },
    });
    setActionItem(null);
  };

  const runReassign = async () => {
    if (!reassignItem || !reassignTargetId) return;
    await runAction({
      action: async () => {
        const res = await fetch(`/api/admin/customers/${customerId}/unlink`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: reassignItem.type,
            targetId: reassignItem.id,
            action: "reassign",
            newCustomerId: reassignTargetId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Kunde konnte nicht geändert werden.");
        await loadLinks();
        onLinksChanged?.();
        return data;
      },
      success: {
        title: "Erfolg",
        message: "Angebot wurde einem anderen Kunden zugeordnet.",
        status: "success",
      },
    });
    setReassignItem(null);
    setReassignTargetId("");
    setActionItem(null);
  };

  const openReassign = async (item: CustomerLinkItem) => {
    await loadCustomers();
    setReassignItem(item);
    setReassignTargetId("");
    setActionItem(null);
  };

  const sections: LinkSection[] = links
    ? [
        {
          title: "Anfragen",
          count: links.dependencies.inquiries,
          items: links.bookings,
          empty: "Keine verknüpften Anfragen.",
          countSingular: "verknüpfte Anfrage",
          countPlural: "verknüpfte Anfragen",
        },
        {
          title: "Angebote",
          count: links.dependencies.quotes,
          items: links.quotes,
          empty: "Keine verknüpften Angebote.",
          countSingular: "verknüpftes Angebot",
          countPlural: "verknüpfte Angebote",
        },
        {
          title: "Rechnungen",
          count: links.dependencies.invoices,
          items: links.invoices,
          empty: "Keine verknüpften Rechnungen.",
          countSingular: "verknüpfte Rechnung",
          countPlural: "verknüpfte Rechnungen",
        },
        {
          title: "Bewertungen",
          count: links.reviews.length,
          items: links.reviews,
          empty: "Keine passenden Bewertungen.",
          countSingular: "passende Bewertung",
          countPlural: "passende Bewertungen",
        },
        {
          title: "Aktivitäten",
          count: links.events.length,
          items: links.events,
          empty: "Keine Aktivitäten protokolliert.",
          countSingular: "Aktivität",
          countPlural: "Aktivitäten",
        },
      ]
    : [];

  const reassignOptions = customers
    .filter((c) => c.id !== customerId)
    .map((c) => ({ value: c.id, label: c.name }));

  return (
    <div ref={panelRef} className="mt-6 space-y-4 border-t border-border pt-4" id="customer-linked-data">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-primary">Verknüpfte Daten</h3>
        <AdminButton variant="ghost" className="min-h-10 text-xs" onClick={() => void loadLinks()} disabled={loading}>
          Aktualisieren
        </AdminButton>
      </div>

      {loading ? <p className="text-sm text-text-muted">Verknüpfungen werden geladen…</p> : null}
      {error ? <p className="text-sm text-accent-heart">{error}</p> : null}

      {!loading && links ? (
        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {section.title}
                {section.title === "Angebote" || section.title === "Anfragen" || section.title === "Rechnungen" ? (
                  <span className="ml-2 normal-case text-text-secondary">
                    (
                    {section.count === 1
                      ? `1 ${section.countSingular}`
                      : section.count === 0
                        ? "keine"
                        : `${section.count} ${section.countPlural}`}
                    )
                  </span>
                ) : null}
              </p>
              {section.count === 0 && (section.title === "Angebote" || section.title === "Anfragen" || section.title === "Rechnungen") ? (
                <p className="mt-2 text-sm text-text-muted">{section.empty}</p>
              ) : section.items.length === 0 ? (
                <p className="mt-2 text-sm text-text-muted">{section.empty}</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {section.items.map((item) => (
                    <li key={item.id} className="admin-card p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-text-primary">{item.label}</p>
                            {item.visibility !== "active" ? (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-text-muted">
                                {VISIBILITY_LABELS[item.visibility]}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-sm text-text-muted line-clamp-3">{item.subtitle}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.actions.canOpen && item.href ? (
                            <>
                              <AdminButton
                                variant="secondary"
                                className="min-h-10 flex-1 sm:flex-none"
                                href={item.href}
                                icon={<ExternalLink className="h-4 w-4" />}
                              >
                                Öffnen
                              </AdminButton>
                              {item.type === "quote" || item.type === "invoice" || item.type === "booking" ? (
                                <AdminButton
                                  variant="secondary"
                                  className="min-h-10 flex-1 sm:flex-none"
                                  href={item.href}
                                >
                                  Bearbeiten
                                </AdminButton>
                              ) : null}
                            </>
                          ) : null}
                          <AdminButton
                            variant="ghost"
                            className="min-h-10 flex-1 sm:hidden"
                            icon={<MoreHorizontal className="h-4 w-4" />}
                            onClick={() => setActionItem(item)}
                          >
                            Aktionen
                          </AdminButton>
                          <div className="hidden flex-wrap gap-2 sm:flex">
                            <LinkActionButtons
                              item={item}
                              onAction={(action) => void runLinkAction(item, action)}
                              onReassign={() => void openReassign(item)}
                            />
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <AdminOverlayModal
        open={Boolean(actionItem)}
        onClose={() => setActionItem(null)}
        title="Aktion wählen"
        footer={
          <AdminButton variant="ghost" className="min-h-11 w-full" onClick={() => setActionItem(null)}>
            Schließen
          </AdminButton>
        }
      >
        {actionItem ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-primary">{actionItem.label}</p>
            <div className="flex flex-col gap-2">
              <LinkActionButtons
                item={actionItem}
                stacked
                onAction={(action) => void runLinkAction(actionItem, action)}
                onReassign={() => void openReassign(actionItem)}
              />
            </div>
          </div>
        ) : null}
      </AdminOverlayModal>

      <AdminOverlayModal
        open={Boolean(reassignItem)}
        onClose={() => {
          setReassignItem(null);
          setReassignTargetId("");
        }}
        title="Kunde ändern"
        footer={
          <div className="flex flex-col gap-2">
            <AdminButton
              variant="primary"
              className="min-h-11 w-full"
              disabled={!reassignTargetId}
              onClick={() => void runReassign()}
            >
              Zuordnen
            </AdminButton>
            <AdminButton
              variant="ghost"
              className="min-h-11 w-full"
              onClick={() => {
                setReassignItem(null);
                setReassignTargetId("");
              }}
            >
              Abbrechen
            </AdminButton>
          </div>
        }
      >
        {reassignItem ? (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Angebot <strong>{reassignItem.label}</strong> einem anderen Kunden zuordnen:
            </p>
            <AdminFilterSelect
              label="Neuer Kunde"
              value={reassignTargetId}
              onChange={setReassignTargetId}
              options={[{ value: "", label: "Bitte wählen…" }, ...reassignOptions]}
            />
          </div>
        ) : null}
      </AdminOverlayModal>
    </div>
  );
}

function LinkActionButtons({
  item,
  stacked = false,
  onAction,
  onReassign,
}: {
  item: CustomerLinkItem;
  stacked?: boolean;
  onAction: (action: "unlink" | "archive" | "delete") => void;
  onReassign: () => void;
}) {
  const btnClass = stacked ? "w-full min-h-11 justify-start" : "min-h-10";

  return (
    <>
      {item.actions.canReassignCustomer ? (
        <AdminButton
          variant="secondary"
          className={btnClass}
          icon={<UserRoundCog className="h-4 w-4" />}
          onClick={onReassign}
        >
          Kunde ändern
        </AdminButton>
      ) : item.actions.reassignReason ? null : null}
      {item.actions.canUnlink ? (
        <AdminButton
          variant="secondary"
          className={btnClass}
          icon={<Link2Off className="h-4 w-4" />}
          onClick={() => onAction("unlink")}
        >
          Verknüpfung lösen
        </AdminButton>
      ) : item.actions.unlinkReason ? (
        <p className="text-xs text-text-muted">{item.actions.unlinkReason}</p>
      ) : null}
      {item.actions.canArchive ? (
        <AdminButton
          variant="secondary"
          className={btnClass}
          icon={<Archive className="h-4 w-4" />}
          onClick={() => onAction("archive")}
        >
          Archivieren
        </AdminButton>
      ) : null}
      {item.actions.canDelete ? (
        <AdminButton
          variant="danger"
          className={btnClass}
          icon={<Trash2 className="h-4 w-4" />}
          onClick={() => onAction("delete")}
        >
          Löschen
        </AdminButton>
      ) : null}
    </>
  );
}

function dataMessage(action: "unlink" | "archive" | "delete"): string {
  if (action === "unlink") return "Verknüpfung wurde gelöst.";
  if (action === "archive") return "Eintrag wurde archiviert.";
  return "Eintrag wurde gelöscht.";
}
