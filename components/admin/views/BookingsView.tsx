"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BookingStatus } from "@/lib/supabase/admin";
import { Inbox, UserPlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminSidebar";
import {
  AdminButton,
  AdminEmptyState,
  AdminFilterBar,
  AdminFilterSelect,
  AdminLoadingCard,
  AdminPage,
  AdminSearchInput,
  AdminStatusBadge,
  bookingStatusVariant,
} from "@/components/admin/ui";
import { AdminCard } from "@/components/admin/ui/AdminLayout";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_MSG } from "@/lib/admin/messages";

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
}

export function BookingsView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const { toast, saveFailed, fromApi } = useAdminMessages();
  const page = adminPageHeaderProps("anfragen");
  const empty = ADMIN_EMPTY_STATES.bookings;
  const activeFilters = (filter ? 1 : 0) + (search.trim() ? 1 : 0);

  const load = () =>
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const update = async (id: string, updates: { status?: BookingStatus; admin_notes?: string }) => {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.ok) {
      toast(ADMIN_MSG.bookingSaved);
      load();
    } else saveFailed();
  };

  const createCustomer = async (bookingId: string) => {
    const res = await fetch("/api/admin/customers/from-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId }),
    });
    const data = await res.json();
    if (!res.ok) return fromApi(data, "Kunde konnte nicht angelegt werden.");
    toast(ADMIN_MSG.customerCreated);
    load();
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
        }}
      >
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Name, E-Mail oder Event suchen…" />
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
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={Inbox}
          title={bookings.length === 0 ? empty.title : "Keine Anfragen gefunden"}
          description={bookings.length === 0 ? empty.description : "Passe Suche oder Filter an."}
          actionLabel={bookings.length === 0 ? empty.actionLabel : undefined}
          actionHref={bookings.length === 0 ? empty.actionHref : undefined}
        />
      ) : (
        <div className="admin-list-stack">
          {filtered.map((b) => (
            <AdminCard key={b.id} compact>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">{b.name}</p>
                    <AdminStatusBadge label={STATUS_LABELS[b.status]} variant={bookingStatusVariant(b.status)} />
                  </div>
                  <p className="text-xs text-text-muted">{new Date(b.created_at).toLocaleString("de-DE")}</p>
                </div>
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
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {b.customer_id ? (
                  <AdminStatusBadge label="Kunde verknüpft" variant="info" />
                ) : (
                  <AdminButton
                    variant="secondary"
                    icon={<UserPlus className="h-4 w-4" />}
                    onClick={() => createCustomer(b.id)}
                  >
                    Kunde erstellen
                  </AdminButton>
                )}
                {b.customer_id ? (
                  <Link href={`/admin/kunden?id=${b.customer_id}`} className="text-xs font-medium text-primary hover:underline">
                    Zum Kunden
                  </Link>
                ) : null}
              </div>
              <div className="mt-3 grid gap-1 text-sm text-text-secondary sm:grid-cols-2">
                <p>E-Mail: {b.email}</p>
                <p>Telefon: {b.phone}</p>
                <p>Event: {b.event_type}</p>
                <p>
                  Datum: {b.event_date} · {b.event_time}
                </p>
                <p>Ort: {b.location}</p>
                <p>Kinder: {b.children_count}</p>
                {b.message ? <p className="sm:col-span-2">Nachricht: {b.message}</p> : null}
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-text-muted">Notizen (intern)</label>
                <textarea
                  defaultValue={b.admin_notes ?? ""}
                  rows={2}
                  className="admin-input min-h-16"
                  onBlur={(e) => {
                    if (e.target.value !== (b.admin_notes ?? "")) {
                      update(b.id, { admin_notes: e.target.value });
                    }
                  }}
                />
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
