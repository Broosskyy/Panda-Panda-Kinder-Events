"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Archive, Trash2 } from "lucide-react";
import type { BookingStatus } from "@/lib/supabase/admin";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminStatusBadge, bookingStatusVariant } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { ADMIN_BTN } from "@/lib/admin/buttons";
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

interface BookingDetailViewProps {
  bookingId: string;
}

export function BookingDetailView({ bookingId }: BookingDetailViewProps) {
  const router = useRouter();
  const { permissions } = useAdminSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState<BookingStatus>("new");
  const { showResult, confirm, runAction } = useAdminActionFeedback();
  const canWrite = hasPermission(permissions, "inquiries:write");
  const canDelete = hasPermission(permissions, "inquiries:delete");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Anfrage konnte nicht geladen werden.");
      setBooking(data.booking);
      setAdminNotes(data.booking.admin_notes ?? "");
      setStatus(data.booking.status);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Anfrage konnte nicht geladen werden.");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!booking) return;
    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: booking.id, status, admin_notes: adminNotes }),
        });
        if (!res.ok) throw new Error("Speichern fehlgeschlagen");
        await load();
      },
      success: ACTION_RESULTS.bookingSaved(),
    });
  };

  const archiveBooking = async () => {
    if (!booking) return;
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
          body: JSON.stringify({ id: booking.id, action: "archive" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Archivierung fehlgeschlagen.");
        router.push("/admin/anfragen");
      },
      success: ACTION_RESULTS.bookingArchived(),
    });
  };

  const deleteBooking = async () => {
    if (!booking) return;
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
      body: JSON.stringify({ id: booking.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      showResult(
        ACTION_RESULTS.genericError(
          data.error ?? (res.status === 409 ? BOOKING_DELETE_BLOCKED_MESSAGE : "Anfrage konnte nicht gelöscht werden."),
        ),
      );
      return;
    }
    showResult(ACTION_RESULTS.bookingDeleted());
    router.push("/admin/anfragen");
  };

  const createCustomer = async () => {
    if (!booking) return;
    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/customers/from-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_id: booking.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Kunde konnte nicht angelegt werden.");
        await load();
      },
      success: { title: "Kunde angelegt", message: "Der Kunde wurde aus der Anfrage erstellt.", status: "success" },
    });
  };

  if (loading) return <p className="text-sm text-text-muted">Anfrage wird geladen…</p>;

  if (loadError || !booking) {
    return (
      <AdminCard>
        <p className="text-sm text-accent-heart">{loadError ?? "Anfrage nicht gefunden."}</p>
        <AdminButton className="mt-4" variant="secondary" href="/admin/anfragen">
          Zurück zur Liste
        </AdminButton>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`${booking.event_type} — ${booking.name}`}
        description={`Veranstaltung am ${booking.event_date} um ${booking.event_time}`}
      >
        <AdminButton variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} href="/admin/anfragen">
          Zurück zur Liste
        </AdminButton>
      </AdminPageHeader>

      <AdminCard title="Kontakt">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-text-muted">Name</dt>
            <dd className="font-medium text-text-primary">{booking.name}</dd>
          </div>
          <div>
            <dt className="text-text-muted">E-Mail</dt>
            <dd>{booking.email}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Telefon</dt>
            <dd>{booking.phone}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Status</dt>
            <dd>
              {canWrite ? (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookingStatus)}
                  className="admin-input admin-filter-select mt-1"
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              ) : (
                <AdminStatusBadge label={STATUS_LABELS[booking.status]} variant={bookingStatusVariant(booking.status)} />
              )}
            </dd>
          </div>
        </dl>
      </AdminCard>

      <AdminCard title="Veranstaltung">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-text-muted">Art</dt>
            <dd className="font-medium">{booking.event_type}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Datum & Uhrzeit</dt>
            <dd>
              {booking.event_date} · {booking.event_time}
              {booking.duration ? ` (${booking.duration})` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Ort</dt>
            <dd>{booking.location}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Kinder</dt>
            <dd>{booking.children_count}</dd>
          </div>
          {booking.message ? (
            <div className="md:col-span-2">
              <dt className="text-text-muted">Nachricht</dt>
              <dd className="mt-1 whitespace-pre-wrap">{booking.message}</dd>
            </div>
          ) : null}
        </dl>
      </AdminCard>

      {canWrite ? (
        <AdminCard title="Interne Notizen">
          <AdminFormField label="Admin-Notizen">
            <textarea
              className="admin-input min-h-24"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Interne Notizen zur Anfrage…"
            />
          </AdminFormField>
        </AdminCard>
      ) : null}

      <AdminCard title="Verknüpfungen">
        {booking.customer_id ? (
          <AdminButton variant="secondary" href={`/admin/kunden/${booking.customer_id}`}>
            Verknüpften Kunden öffnen
          </AdminButton>
        ) : canWrite ? (
          <AdminButton variant="primary" onClick={() => void createCustomer()}>
            Kunde aus Anfrage anlegen
          </AdminButton>
        ) : (
          <p className="text-sm text-text-muted">Kein Kunde verknüpft.</p>
        )}
      </AdminCard>

      <div className="flex flex-wrap gap-2">
        {canWrite ? (
          <AdminButton variant="primary" onClick={() => void save()}>
            {ADMIN_BTN.save}
          </AdminButton>
        ) : null}
        {canWrite ? (
          <AdminButton variant="secondary" icon={<Archive className="h-4 w-4" />} onClick={() => void archiveBooking()}>
            Archivieren
          </AdminButton>
        ) : null}
        {canDelete ? (
          <AdminButton variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void deleteBooking()}>
            Löschen
          </AdminButton>
        ) : null}
        <AdminButton variant="ghost" href="/admin/anfragen">
          {ADMIN_BTN.cancel}
        </AdminButton>
      </div>
    </div>
  );
}
