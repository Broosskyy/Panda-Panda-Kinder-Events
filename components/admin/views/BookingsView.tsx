"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Archive, Inbox, Trash2, UserPlus } from "lucide-react";
import type { BookingStatus } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin/AdminSidebar";
import {
  AdminEmptyState,
  AdminFilterBar,
  AdminFilterSelect,
  AdminLoadingCard,
  AdminPage,
  AdminSearchInput,
  AdminStatusBadge,
  AdminActionMenu,
  AdminButton,
  bookingStatusVariant,
} from "@/components/admin/ui";
import { AdminCard } from "@/components/admin/ui/AdminLayout";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { BOOKING_DELETE_BLOCKED_MESSAGE } from "@/lib/admin/booking-lifecycle";
import { hasPermission } from "@/lib/auth/permissions";

const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  confirmed: "Bestätigt",
  declined: "Abgelehnt",
  cancelled: "Abgesagt",
  completed: "Abgeschlossen",
};

interface Booking {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  event_type: string;
  event_date: string;
  event_time: string;
  duration: string | null;
  location: string;
  children_count: number;
  message: string | null;
  status: BookingStatus;
  admin_notes: string | null;
  customer_id: string | null;
  archived_at?: string | null;
}

type BookingView = "active" | "archived";

export function BookingsView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<BookingView>("active");
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const { permissions } = useAdminSession();
  const { showResult, confirm, runAction } = useAdminActionFeedback();
  const page = adminPageHeaderProps("anfragen");
  const empty = ADMIN_EMPTY_STATES.bookings;
  const canWrite = hasPermission(permissions, "inquiries:write");
  const canDelete = hasPermission(permissions, "inquiries:delete");
  const activeFilters = (filter ? 1 : 0) + (search.trim() ? 1 : 0) + (view !== "active" ? 1 : 0);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    fetch(`/api/admin/bookings?view=${view}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Anfragen konnten nicht geladen werden.");
        setBookings(d.bookings ?? []);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Anfragen konnten nicht geladen werden.");
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, [view]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = async (id: string, updates: { status?: BookingStatus; admin_notes?: string }) => {
    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        });
        if (!res.ok) throw new Error("Speichern fehlgeschlagen");
        await load();
      },
      success: ACTION_RESULTS.bookingSaved(),
    });
  };

  const archiveBooking = async (id: string) => {
    const ok = await confirm({
      title: "Anfrage archivieren?",
      message: "Die Anfrage wird archiviert und standardmäßig ausgeblendet.",
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "archive" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Archivierung fehlgeschlagen.");
        load();
      },
      success: ACTION_RESULTS.bookingArchived(),
    });
  };

  const deleteBooking = async (id: string) => {
    const ok = await confirm({
      title: "Anfrage löschen?",
      message: "Diese Anfrage wird dauerhaft gelöscht.",
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    const res = await fetch("/api/admin/bookings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      showResult(
        ACTION_RESULTS.genericError(
          data.error ??
            (res.status === 409 ? BOOKING_DELETE_BLOCKED_MESSAGE : "Anfrage konnte nicht gelöscht werden."),
        ),
      );
      return;
    }
    showResult(ACTION_RESULTS.bookingDeleted());
    load();
  };

  const createCustomer = async (bookingId: string) => {
    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/customers/from-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_id: bookingId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Kunde konnte nicht angelegt werden.");
        load();
      },
      success: {
        title: "Kunde angelegt",
        message: "Der Kunde wurde aus der Anfrage erstellt.",
        status: "success",
      },
    });
  };

  const filtered = bookings.filter((b) => {
    if (filter && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.event_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminPage>
      <AdminPageHeader {...page} />

      <AdminFilterBar
        collapsible
        activeCount={activeFilters}
        onReset={() => {
          setFilter("");
          setSearch("");
          setView("active");
        }}
      >
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Name, E-Mail oder Event suchen…" />
        <AdminFilterSelect
          value={view}
          onChange={(v) => setView(v as BookingView)}
          label="Ansicht"
          options={[
            { value: "active", label: "Aktiv" },
            { value: "archived", label: "Archiviert" },
          ]}
        />
        <AdminFilterSelect
          value={filter}
          onChange={setFilter}
          label="Status filtern"
          options={[
            { value: "", label: "Alle Status" },
            ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
          ]}
        />
      </AdminFilterBar>

      {loading ? (
        <AdminLoadingCard message="Anfragen werden geladen…" />
      ) : loadError ? (
        <AdminCard>
          <p className="admin-text-body">{loadError}</p>
          <AdminButton variant="secondary" className="mt-4" onClick={() => void load()}>
            Erneut laden
          </AdminButton>
        </AdminCard>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={Inbox}
          title={bookings.length === 0 ? empty.title : "Keine Anfragen gefunden"}
          description={bookings.length === 0 ? empty.description : "Passe Suche oder Filter an."}
          actionLabel={bookings.length === 0 ? empty.actionLabel : undefined}
          actionHref={bookings.length === 0 ? empty.actionHref : undefined}
        />
      ) : (
        <>
          <div className="hidden lg:block admin-bookings-table-wrap">
            <table className="admin-bookings-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Event</th>
                  <th>Datum</th>
                  <th>Ort</th>
                  <th>Kinder</th>
                  <th>Status</th>
                  <th className="text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className={b.archived_at ? "opacity-90" : ""}>
                    <td>
                      <p className="font-semibold text-text-primary">{b.name}</p>
                      <p className="text-xs text-text-muted">{b.email}</p>
                    </td>
                    <td>{b.event_type}</td>
                    <td>
                      {b.event_date}
                      <br />
                      <span className="text-xs text-text-muted">{b.event_time}</span>
                    </td>
                    <td className="max-w-[12rem] truncate" title={b.location}>
                      {b.location}
                    </td>
                    <td>{b.children_count}</td>
                    <td>
                      {canWrite ? (
                        <select
                          value={b.status}
                          onChange={(e) => update(b.id, { status: e.target.value as BookingStatus })}
                          className="admin-input admin-filter-select"
                          aria-label={`Status für ${b.name}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <AdminStatusBadge label={STATUS_LABELS[b.status]} variant={bookingStatusVariant(b.status)} />
                      )}
                    </td>
                    <td>
                      <div className="flex justify-end">
                        {canWrite ? (
                          <AdminActionMenu
                            primary={
                              b.customer_id
                                ? {
                                    label: "Zum Kunden",
                                    onClick: () => {
                                      window.location.href = `/admin/kunden?id=${b.customer_id}`;
                                    },
                                  }
                                : {
                                    label: "Kunde erstellen",
                                    icon: <UserPlus className="h-4 w-4" />,
                                    onClick: () => void createCustomer(b.id),
                                  }
                            }
                            items={[
                              ...(!b.archived_at
                                ? [
                                    {
                                      id: "archive",
                                      label: "Archivieren",
                                      icon: <Archive className="h-4 w-4" />,
                                      onClick: () => void archiveBooking(b.id),
                                    },
                                  ]
                                : []),
                            ]}
                            dangerItems={
                              canDelete
                                ? [
                                    {
                                      id: "delete",
                                      label: "Löschen",
                                      icon: <Trash2 className="h-4 w-4" />,
                                      onClick: () => void deleteBooking(b.id),
                                    },
                                  ]
                                : []
                            }
                          />
                        ) : (
                          "—"
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-list-stack lg:hidden">
          {filtered.map((b) => {
            const longMessage = Boolean(b.message && b.message.length > 120);
            return (
              <AdminCard key={b.id} compact className={b.archived_at ? "opacity-90" : ""}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-text-primary">{b.name}</p>
                      <AdminStatusBadge label={STATUS_LABELS[b.status]} variant={bookingStatusVariant(b.status)} />
                      {b.archived_at ? <AdminStatusBadge label="Archiviert" variant="muted" /> : null}
                      {b.customer_id ? <AdminStatusBadge label="Kunde verknüpft" variant="info" /> : null}
                    </div>
                    <p className="text-xs text-text-muted">{new Date(b.created_at).toLocaleString("de-DE")}</p>
                  </div>
                  {canWrite ? (
                    <select
                      value={b.status}
                      onChange={(e) => update(b.id, { status: e.target.value as BookingStatus })}
                      className="admin-input admin-filter-select w-full sm:w-auto"
                      aria-label={`Status für ${b.name}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>

                <dl className="admin-booking-meta mt-2">
                  <div><dt>E-Mail</dt><dd>{b.email}</dd></div>
                  <div><dt>Telefon</dt><dd>{b.phone}</dd></div>
                  <div><dt>Event</dt><dd>{b.event_type}</dd></div>
                  <div><dt>Datum</dt><dd>{b.event_date} · {b.event_time}</dd></div>
                  <div><dt>Ort</dt><dd>{b.location}</dd></div>
                  <div><dt>Kinder</dt><dd>{b.children_count}</dd></div>
                </dl>

                {b.message ? (
                  longMessage ? (
                    <details className="admin-booking-message mt-2">
                      <summary className="cursor-pointer text-sm text-text-secondary">Nachricht anzeigen</summary>
                      <p className="mt-1 text-sm text-text-secondary">{b.message}</p>
                    </details>
                  ) : (
                    <p className="mt-2 text-sm text-text-secondary">{b.message}</p>
                  )
                ) : null}

                {canWrite ? (
                  <details
                    className="mt-2"
                    open={expandedNotes.has(b.id)}
                    onToggle={(e) => {
                      const open = (e.target as HTMLDetailsElement).open;
                      setExpandedNotes((prev) => {
                        const next = new Set(prev);
                        if (open) next.add(b.id);
                        else next.delete(b.id);
                        return next;
                      });
                    }}
                  >
                    <summary className="cursor-pointer text-xs font-medium text-text-muted">
                      {b.admin_notes ? "Notizen bearbeiten" : "Notizen hinzufügen"}
                    </summary>
                    <textarea
                      defaultValue={b.admin_notes ?? ""}
                      rows={2}
                      className="admin-input mt-2 min-h-16"
                      placeholder="Interne Notizen…"
                      onBlur={(e) => {
                        if (e.target.value !== (b.admin_notes ?? "")) {
                          update(b.id, { admin_notes: e.target.value });
                        }
                      }}
                    />
                  </details>
                ) : null}

                {canWrite ? (
                  <div className="admin-document-actions mt-3">
                    <AdminActionMenu
                      primary={
                        b.customer_id
                          ? {
                              label: "Zum Kunden",
                              onClick: () => {
                                window.location.href = `/admin/kunden?id=${b.customer_id}`;
                              },
                            }
                          : {
                              label: "Kunde erstellen",
                              icon: <UserPlus className="h-4 w-4" />,
                              onClick: () => void createCustomer(b.id),
                            }
                      }
                      items={[
                        {
                          id: "open",
                          label: "Öffnen",
                          onClick: () => {
                            setExpandedNotes((prev) => new Set(prev).add(b.id));
                          },
                        },
                        ...(b.customer_id
                          ? [
                              {
                                id: "customer",
                                label: "Zum Kunden",
                                onClick: () => {
                                  window.location.href = `/admin/kunden?id=${b.customer_id}`;
                                },
                              },
                            ]
                          : [
                              {
                                id: "create-customer",
                                label: "Kunde erstellen",
                                icon: <UserPlus className="h-4 w-4" />,
                                onClick: () => void createCustomer(b.id),
                              },
                            ]),
                        ...(!b.archived_at
                          ? [
                              {
                                id: "archive",
                                label: "Archivieren",
                                icon: <Archive className="h-4 w-4" />,
                                onClick: () => void archiveBooking(b.id),
                              },
                            ]
                          : []),
                      ]}
                      dangerItems={
                        canDelete
                          ? [
                              {
                                id: "delete",
                                label: "Löschen",
                                icon: <Trash2 className="h-4 w-4" />,
                                onClick: () => void deleteBooking(b.id),
                              },
                            ]
                          : []
                      }
                    />
                  </div>
                ) : (
                  <div className="mt-3">
                    {b.customer_id ? (
                      <Link href={`/admin/kunden?id=${b.customer_id}`} className="text-sm font-medium text-primary hover:underline">
                        Zum Kunden
                      </Link>
                    ) : (
                      <AdminStatusBadge label="Nur Ansicht" variant="muted" />
                    )}
                  </div>
                )}
                <span id={`booking-${b.id}`} className="sr-only" />
              </AdminCard>
            );
          })}
          </div>
        </>
      )}
    </AdminPage>
  );
}
