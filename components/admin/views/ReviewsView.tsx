"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import {
  AdminButton,
  AdminEmptyState,
  AdminFilterBar,
  AdminFilterSelect,
  AdminLoadingCard,
  AdminStatusBadge,
  getReviewDisplayStatus,
  ReviewAdminImages,
} from "@/components/admin/ui";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { StarRating } from "@/components/ui/StarRating";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM, ADMIN_MSG, confirmDanger } from "@/lib/admin/messages";

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
  sort_order: number;
}

function formatReviewDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ReviewsView() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [lightboxItems, setLightboxItems] = useState<LightboxItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast, withLoading, reviewPublished, reviewSaved, error: showError } = useAdminMessages();
  const page = adminPageHeaderProps("bewertungen");
  const empty = ADMIN_EMPTY_STATES.reviews;

  const load = async () => {
    const res = await fetch("/api/admin/reviews");
    const d = await res.json();
    setReviews(d.reviews ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [reviews],
  );

  const filtered = sortedReviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  const patch = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    const data = await res.json();
    if (res.ok) {
      reviewSaved();
      await load();
      return true;
    }
    showError("Bewertung konnte nicht gespeichert werden.", data.error, "Bitte Pflichtfelder prüfen und erneut versuchen.");
    return false;
  };

  const uploadReviewImage = async (id: string, file: File, type: "profile" | "event") => {
    try {
      await withLoading(
        (async () => {
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

          toast(ADMIN_MSG.imageUploaded);
          await load();
        })(),
      );
    } catch (err) {
      showError(
        "Bild konnte nicht geladen werden.",
        err instanceof Error ? err.message : undefined,
        "Bitte JPEG, PNG oder WebP unter 5 MB verwenden.",
      );
    }
  };

  const remove = async (id: string) => {
    if (!confirmDanger(ADMIN_CONFIRM.deleteReview)) return;
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (res.ok) {
      toast("Bewertung gelöscht.");
      load();
    } else {
      showError("Bewertung konnte nicht gelöscht werden.", data.error, "Bitte erneut versuchen.");
    }
  };

  const openImageLightbox = (review: Review, type: "profile" | "event") => {
    const src = type === "profile" ? review.profile_image_url : review.event_image_url;
    if (!src) return;
    const items: LightboxItem[] = [];
    if (review.event_image_url) {
      items.push({
        src: review.event_image_url,
        alt: `Eventfoto von ${review.name}`,
        name: review.name,
        rating: review.rating,
        reviewText: review.text,
        category: review.event_type,
        date: formatReviewDate(review.created_at),
      });
    }
    if (review.profile_image_url) {
      items.push({
        src: review.profile_image_url,
        alt: review.name,
        name: review.name,
        rating: review.rating,
        reviewText: review.text,
        category: review.event_type,
        date: formatReviewDate(review.created_at),
      });
    }
    const idx = items.findIndex((i) => i.src === src);
    setLightboxItems(items);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const moveReview = async (id: string, direction: "up" | "down") => {
    const idx = sortedReviews.findIndex((r) => r.id === id);
    const neighborIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || neighborIdx < 0 || neighborIdx >= sortedReviews.length) return;

    const current = sortedReviews[idx];
    const neighbor = sortedReviews[neighborIdx];

    const [resA, resB] = await Promise.all([
      fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: current.id, sort_order: neighbor.sort_order }),
      }),
      fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: neighbor.id, sort_order: current.sort_order }),
      }),
    ]);

    if (resA.ok && resB.ok) {
      reviewSaved();
      await load();
    } else {
      showError("Reihenfolge konnte nicht geändert werden.", undefined, "Bitte erneut versuchen.");
    }
  };

  const toggleApproved = async (review: Review) => {
    const ok = await patch(review.id, { approved: !review.approved });
    if (ok && !review.approved) reviewPublished();
  };

  return (
    <div className="review-admin-page">
      <AdminPageHeader {...page} />

      <AdminFilterBar>
        <AdminFilterSelect
          value={filter}
          onChange={(v) => setFilter(v as typeof filter)}
          label="Status filtern"
          options={[
            { value: "all", label: "Alle" },
            { value: "pending", label: "Ausstehend" },
            { value: "approved", label: "Veröffentlicht" },
          ]}
        />
      </AdminFilterBar>

      {loading ? (
        <AdminLoadingCard message="Bewertungen werden geladen…" />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={Star}
          title={reviews.length === 0 ? empty.title : "Keine Bewertungen gefunden"}
          description={reviews.length === 0 ? empty.description : "Passe den Filter an."}
          actionLabel={reviews.length === 0 ? empty.actionLabel : undefined}
          actionHref={reviews.length === 0 ? empty.actionHref : undefined}
        />
      ) : (
        <div className="review-admin-list">
          {filtered.map((r) => {
            const isEditing = editingId === r.id;
            const globalIdx = sortedReviews.findIndex((s) => s.id === r.id);
            const status = getReviewDisplayStatus(r);

            return (
              <AdminCard key={r.id} className="review-admin-card">
                <div className="review-admin-card-header">
                  <div className="review-admin-sort">
                    <AdminButton
                      variant="secondary"
                      className="review-admin-sort-btn"
                      disabled={globalIdx === 0}
                      icon={<ChevronUp className="h-4 w-4" />}
                      onClick={() => void moveReview(r.id, "up")}
                      aria-label="Nach oben"
                    >
                      <span className="sr-only">Nach oben</span>
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      className="review-admin-sort-btn"
                      disabled={globalIdx === sortedReviews.length - 1}
                      icon={<ChevronDown className="h-4 w-4" />}
                      onClick={() => void moveReview(r.id, "down")}
                      aria-label="Nach unten"
                    >
                      <span className="sr-only">Nach unten</span>
                    </AdminButton>
                  </div>
                  <div className="review-admin-status-row">
                    <AdminStatusBadge label={status.label} variant={status.variant} />
                    {r.verified && status.label !== "Verifiziert" ? (
                      <AdminStatusBadge label="Verifiziert" variant="success" />
                    ) : null}
                  </div>
                </div>

                <ReviewAdminImages
                  profileUrl={r.profile_image_url}
                  eventUrl={r.event_image_url}
                  name={r.name}
                  onOpen={(type) => openImageLightbox(r, type)}
                />

                <div className="review-admin-body">
                  {isEditing ? (
                    <div className="review-admin-edit-fields">
                      <input
                        className="admin-input"
                        defaultValue={r.name}
                        placeholder="Name"
                        onBlur={(e) => {
                          if (e.target.value !== r.name) void patch(r.id, { name: e.target.value });
                        }}
                      />
                      <input
                        className="admin-input"
                        defaultValue={r.event_type}
                        placeholder="Anlass"
                        onBlur={(e) => {
                          if (e.target.value !== r.event_type) void patch(r.id, { event_type: e.target.value });
                        }}
                      />
                      <div>
                        <p className="admin-form-label mb-1">Sterne</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <StarRating rating={r.rating} size="sm" />
                          <select
                            className="admin-input w-full max-w-[10rem]"
                            defaultValue={String(r.rating)}
                            onChange={(e) => void patch(r.id, { rating: Number(e.target.value) })}
                          >
                            {[5, 4, 3, 2, 1].map((n) => (
                              <option key={n} value={n}>
                                {n} Sterne
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <textarea
                        className="admin-input min-h-24 w-full"
                        defaultValue={r.text}
                        placeholder="Bewertungstext"
                        onBlur={(e) => {
                          if (e.target.value !== r.text) void patch(r.id, { text: e.target.value });
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="review-admin-name">
                        {r.name} <span className="text-text-muted">·</span> {r.event_type}
                      </p>
                      <div className="review-admin-meta">
                        <StarRating rating={r.rating} size="sm" />
                        <span className="text-xs text-text-muted">{formatReviewDate(r.created_at)}</span>
                      </div>
                      <blockquote className="review-admin-quote">&ldquo;{r.text}&rdquo;</blockquote>
                    </>
                  )}
                </div>

                <div className="review-admin-uploads">
                  <label className="review-admin-upload-btn">
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
                  <label className="review-admin-upload-btn">
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

                <div className="review-admin-reply">
                  <label className="admin-form-label mb-1 block">Antwort von Panda-Bande</label>
                  <textarea
                    defaultValue={r.admin_reply ?? ""}
                    rows={3}
                    className="admin-input min-h-[5.5rem] w-full"
                    placeholder="Antwort schreiben…"
                    onBlur={(e) => {
                      if (e.target.value !== (r.admin_reply ?? "")) {
                        void patch(r.id, { admin_reply: e.target.value });
                      }
                    }}
                  />
                </div>

                <div className="review-admin-actions">
                  <AdminButton variant="secondary" onClick={() => setEditingId(isEditing ? null : r.id)}>
                    {isEditing ? ADMIN_BTN.close : ADMIN_BTN.edit}
                  </AdminButton>
                  <AdminButton variant={r.approved ? "secondary" : "primary"} onClick={() => void toggleApproved(r)}>
                    {r.approved ? "Zurückziehen" : "Veröffentlichen"}
                  </AdminButton>
                  <AdminButton variant="secondary" onClick={() => void patch(r.id, { verified: !r.verified })}>
                    {r.verified ? "Verifizierung entfernen" : "Verifizieren"}
                  </AdminButton>
                  <AdminButton variant="danger" onClick={() => void remove(r.id)}>
                    {ADMIN_BTN.delete}
                  </AdminButton>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      {lightboxItems.length > 0 ? (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxItems([])}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </div>
  );
}
