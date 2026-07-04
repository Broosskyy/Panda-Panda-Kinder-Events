"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { useAdminUi } from "@/components/admin/AdminUiProvider";

interface Review {
  id: string;
  created_at: string;
  name: string;
  event_type: string;
  rating: number;
  text: string;
  approved: boolean;
  profile_image_url: string | null;
  event_image_url: string | null;
  admin_reply: string | null;
  verified: boolean;
}

export function ReviewsView() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const { toast } = useAdminUi();

  const load = () =>
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []));

  useEffect(() => {
    load();
  }, []);

  const patch = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (res.ok) {
      toast("Gespeichert");
      load();
    } else toast("Fehler", "error");
  };

  const uploadReviewImage = async (id: string, file: File, type: "profile" | "event") => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "reviews");
      fd.append("folder", type === "profile" ? "profiles" : "events");
      const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error ?? "Upload fehlgeschlagen");

      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          [type === "profile" ? "profile_image_url" : "event_image_url"]: upData.path,
        }),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");

      toast(type === "profile" ? "Profilbild hochgeladen" : "Eventfoto hochgeladen");
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload fehlgeschlagen", "error");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Bewertung wirklich löschen?")) return;
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast("Gelöscht");
      load();
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  return (
    <div>
      <AdminPageHeader title="Bewertungen" description="Freigeben, beantworten und verwalten" />
      <div className="mb-4 flex gap-2">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              filter === f ? "bg-primary text-white" : "bg-bg-card border border-border"
            }`}
          >
            {f === "all" ? "Alle" : f === "pending" ? "Ausstehend" : "Freigegeben"}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((r) => (
          <AdminCard key={r.id}>
            <div className="flex flex-wrap gap-4">
              {r.profile_image_url && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                  <Image src={r.profile_image_url} alt="" fill className="object-cover" unoptimized={r.profile_image_url.includes("supabase.co")} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {r.name} — {r.event_type}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(r.created_at).toLocaleString("de-DE")} · {r.rating}/5
                      {r.verified && " · Verifiziert"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      r.approved ? "bg-primary/10 text-primary" : "bg-bg-secondary text-text-muted"
                    }`}
                  >
                    {r.approved ? "Freigegeben" : "Ausstehend"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">&ldquo;{r.text}&rdquo;</p>
                {r.event_image_url && (
                  <div className="relative mt-3 h-32 w-48 overflow-hidden rounded-xl">
                    <Image src={r.event_image_url} alt="Eventfoto" fill className="object-cover" unoptimized={r.event_image_url.includes("supabase.co")} />
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <label className="admin-btn-secondary cursor-pointer text-xs">
                    Profilbild
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadReviewImage(r.id, file, "profile");
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <label className="admin-btn-secondary cursor-pointer text-xs">
                    Eventfoto
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadReviewImage(r.id, file, "event");
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-medium text-text-muted">
                    Antwort von Panda-Bande
                  </label>
                  <textarea
                    defaultValue={r.admin_reply ?? ""}
                    rows={2}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="Antwort schreiben..."
                    onBlur={(e) => {
                      if (e.target.value !== (r.admin_reply ?? "")) {
                        patch(r.id, { admin_reply: e.target.value });
                      }
                    }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!r.approved ? (
                    <button
                      type="button"
                      onClick={() => patch(r.id, { approved: true })}
                      className="rounded-lg bg-primary px-4 py-2 text-xs text-white"
                    >
                      Freigeben
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => patch(r.id, { approved: false })}
                      className="rounded-lg border border-border px-4 py-2 text-xs"
                    >
                      Ablehnen
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => patch(r.id, { verified: !r.verified })}
                    className="rounded-lg border border-border px-4 py-2 text-xs"
                  >
                    {r.verified ? "Verifizierung entfernen" : "Als verifiziert markieren"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="rounded-lg border border-accent-heart/40 px-4 py-2 text-xs text-accent-heart"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
