"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import {
  AdminButton,
  AdminEmptyState,
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatusBadge,
  reviewStatusVariant,
} from "@/components/admin/ui";
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
}

export function ReviewsView() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const { toast, withLoading, saved, saveFailed, success } = useAdminMessages();
  const page = adminPageHeaderProps("bewertungen");
  const empty = ADMIN_EMPTY_STATES.reviews;

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
      saved();
      load();
    } else saveFailed();
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
      toast(err instanceof Error ? err.message : "Upload fehlgeschlagen", "error");
    }
  };

  const remove = async (id: string) => {
    if (!confirmDanger(ADMIN_CONFIRM.deleteReview)) return;
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      success("Bewertung gelöscht.");
      load();
    } else toast(ADMIN_MSG.deleteFailed, "error");
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  return (
    <div>
      <AdminPageHeader {...page} />

      <AdminFilterBar>
        <AdminFilterSelect
          value={filter}
          onChange={(v) => setFilter(v as typeof filter)}
          label="Status filtern"
          options={[
            { value: "all", label: "Alle" },
            { value: "pending", label: "Ausstehend" },
            { value: "approved", label: "Freigegeben" },
          ]}
        />
      </AdminFilterBar>

      {filtered.length === 0 ? (
        <AdminEmptyState
          icon={Star}
          title={reviews.length === 0 ? empty.title : "Keine Bewertungen gefunden"}
          description={reviews.length === 0 ? empty.description : "Passe den Filter an."}
          actionLabel={reviews.length === 0 ? empty.actionLabel : undefined}
          actionHref={reviews.length === 0 ? empty.actionHref : undefined}
        />
      ) : (
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
                    <AdminStatusBadge
                      label={r.approved ? "Freigegeben" : "Ausstehend"}
                      variant={reviewStatusVariant(r.approved)}
                    />
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
                    <label className="admin-form-label mb-1 block">Antwort von Panda-Bande</label>
                    <textarea
                      defaultValue={r.admin_reply ?? ""}
                      rows={2}
                      className="admin-input min-h-20"
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
                      <AdminButton variant="primary" onClick={() => patch(r.id, { approved: true })}>
                        Freigeben
                      </AdminButton>
                    ) : (
                      <AdminButton variant="secondary" onClick={() => patch(r.id, { approved: false })}>
                        Ablehnen
                      </AdminButton>
                    )}
                    <AdminButton variant="secondary" onClick={() => patch(r.id, { verified: !r.verified })}>
                      {r.verified ? "Verifizierung entfernen" : "Als verifiziert markieren"}
                    </AdminButton>
                    <AdminButton variant="danger" onClick={() => void remove(r.id)}>
                      {ADMIN_BTN.delete}
                    </AdminButton>
                  </div>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
