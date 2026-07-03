"use client";

import { useEffect, useState } from "react";
import type { BookingStatus } from "@/lib/supabase/admin";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { useAdminUi } from "@/components/admin/AdminUiProvider";

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
}

export function BookingsView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const { toast } = useAdminUi();

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
      toast("Gespeichert");
      load();
    } else toast("Fehler beim Speichern", "error");
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
      <AdminPageHeader title="Anfragen" description="Alle Buchungsanfragen verwalten" />
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-11 flex-1 rounded-xl border border-border px-4 text-sm sm:max-w-xs"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="min-h-11 rounded-xl border border-border px-4 text-sm"
        >
          <option value="">Alle Status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-text-muted">Keine Anfragen gefunden.</p>
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
                  className="min-h-10 rounded-lg border border-border px-3 text-sm"
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
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
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm"
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
