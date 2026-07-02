"use client";

import { useEffect, useState } from "react";
import type { BookingRequest, BookingStatus, Review } from "@/lib/supabase/admin";

const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  confirmed: "Bestätigt",
  declined: "Abgelehnt",
  completed: "Abgeschlossen",
};

export function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"bookings" | "reviews">("bookings");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingsRes, reviewsRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/reviews"),
      ]);

      if (!bookingsRes.ok || !reviewsRes.ok) {
        throw new Error("Daten konnten nicht geladen werden.");
      }

      const bookingsData = await bookingsRes.json();
      const reviewsData = await reviewsRes.json();
      setBookings(bookingsData.bookings ?? []);
      setReviews(reviewsData.reviews ?? []);
    } catch {
      setError("Fehler beim Laden der Admin-Daten.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) loadData();
  };

  const updateReviewApproval = async (id: string, approved: boolean) => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved }),
    });
    if (res.ok) loadData();
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  };

  if (loading) {
    return <p className="text-text-secondary">Lade Daten...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("bookings")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === "bookings" ? "bg-primary text-white" : "bg-bg-secondary"
            }`}
          >
            Anfragen ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("reviews")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === "reviews" ? "bg-primary text-white" : "bg-bg-secondary"
            }`}
          >
            Bewertungen ({reviews.length})
          </button>
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-text-muted underline hover:text-text-primary"
        >
          Abmelden
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-accent-heart">{error}</p>}

      {tab === "bookings" && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-text-secondary">Noch keine Buchungsanfragen.</p>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="rounded-xl border border-border bg-bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">{b.name}</p>
                    <p className="text-sm text-text-muted">
                      {new Date(b.created_at).toLocaleString("de-DE")}
                    </p>
                  </div>
                  <select
                    value={b.status}
                    onChange={(e) => updateBookingStatus(b.id, e.target.value as BookingStatus)}
                    className="rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
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
                  {b.duration && <p>Dauer: {b.duration}</p>}
                  {b.message && <p className="sm:col-span-2">Nachricht: {b.message}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-text-secondary">Noch keine Bewertungen eingegangen.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {r.name} — {r.event_type}
                    </p>
                    <p className="text-sm text-text-muted">
                      {new Date(r.created_at).toLocaleString("de-DE")} · {r.rating}/5 Sterne
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">&ldquo;{r.text}&rdquo;</p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        r.approved ? "bg-primary/10 text-primary" : "bg-bg-secondary text-text-muted"
                      }`}
                    >
                      {r.approved ? "Freigegeben" : "Ausstehend"}
                    </span>
                    {!r.approved ? (
                      <button
                        type="button"
                        onClick={() => updateReviewApproval(r.id, true)}
                        className="rounded-lg bg-primary px-3 py-1 text-xs text-white"
                      >
                        Freigeben
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateReviewApproval(r.id, false)}
                        className="rounded-lg border border-border px-3 py-1 text-xs"
                      >
                        Ablehnen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
