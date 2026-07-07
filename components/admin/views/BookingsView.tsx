"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BookingStatus } from "@/lib/supabase/admin";
import { Inbox, UserPlus } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminHelpBlock } from "@/components/admin/ui/AdminHelpBlock";
import { AdminButton, AdminEmptyState, AdminFilterBar, AdminFilterSelect, AdminSearchInput } from "@/components/admin/ui";
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
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const { toast, saveFailed, fromApi } = useAdminMessages();
  const page = adminPageHeaderProps("anfragen");
  const empty = ADMIN_EMPTY_STATES.bookings;

  const load = () =>
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []));

  useEffect(() => {
    load();
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
    <div>
      <AdminPageHeader {...page} />

      <AdminHelpBlock title="Tipp" variant="tip" className="mb-6">
        Neue Anfragen kommen vom Kontaktformular auf der Website. Setze den Status und lege bei Bedarf direkt einen Kunden an — Notizen sind nur intern sichtbar.
      </AdminHelpBlock>
      <AdminFilterBar>
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
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <AdminEmptyState
            icon={Inbox}
            title={bookings.length === 0 ? empty.title : "Keine Anfragen gefunden"}
            description={bookings.length === 0 ? empty.description : "Passe Suche oder Filter an."}
            actionLabel={bookings.length === 0 ? empty.actionLabel : undefined}
            actionHref={bookings.length === 0 ? empty.actionHref : undefined}
          />
        ) : (
          filtered.map((b) => (
            <AdminCard key={b.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{b.name}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(b.created_at).toLocaleString("de-DE")}
                  </p>
                </div>
                <select
                  value={b.status}
                  onChange={(e) => update(b.id, { status: e.target.value as BookingStatus })}
                  className="admin-input"
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {b.customer_id ? (
                  <Link
                    href={`/admin/kunden?id=${b.customer_id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    Kunde verknüpft
                  </Link>
                ) : (
                  <AdminButton
                    variant="secondary"
                    icon={<UserPlus className="h-4 w-4" />}
                    onClick={() => createCustomer(b.id)}
                  >
                    Kunde erstellen
                  </AdminButton>
                )}
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
                {b.message && <p className="sm:col-span-2">Nachricht: {b.message}</p>}
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-text-muted">Notizen</label>
                <textarea
                  defaultValue={b.admin_notes ?? ""}
                  rows={2}
                  className="admin-input min-h-20"
                  onBlur={(e) => {
                    if (e.target.value !== (b.admin_notes ?? "")) {
                      update(b.id, { admin_notes: e.target.value });
                    }
                  }}
                />
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </div>
  );
}
