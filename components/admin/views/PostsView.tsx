"use client";

import { useCallback, useEffect, useState } from "react";
import { Newspaper, Save, Trash2 } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminLoadingCard, AdminSearchInput, AdminStatusBadge, postStatusVariant } from "@/components/admin/ui";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM } from "@/lib/admin/messages";
import type { CmsPost } from "@/lib/cms/types";

type PostDraft = {
  title: string;
  subtitle: string;
  content: string;
  hero_image_path: string | null;
  hero_image_url: string | null;
  category: string;
  published_at: string;
  published: boolean;
  slug: string;
};

const emptyPost = (): PostDraft => ({
  title: "",
  subtitle: "",
  content: "",
  hero_image_path: null,
  hero_image_url: null,
  category: "aktuelles",
  published_at: new Date().toISOString().slice(0, 10),
  published: false,
  slug: "",
});

export function PostsView() {
  const { confirm, runAction } = useAdminActionFeedback();
  const page = adminPageHeaderProps("beitraege");
  const empty = ADMIN_EMPTY_STATES.posts;
  const [posts, setPosts] = useState<CmsPost[]>([]);
  const [draft, setDraft] = useState<PostDraft>(emptyPost());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/posts");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error ?? "Beiträge konnten nicht geladen werden.");
    }
    const data = await res.json();
    setPosts(data.posts ?? []);
  }, []);

  useEffect(() => {
    void load()
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Beiträge konnten nicht geladen werden.");
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [load]);

  const save = async () => {
    if (saving) return;
    if (!draft.title.trim()) {
      await runAction({
        action: async () => {
          throw new Error("Titel ist Pflicht.");
        },
        success: ACTION_RESULTS.postCreated(),
        error: (error) => ACTION_RESULTS.genericError(error instanceof Error ? error.message : undefined),
      });
      return;
    }
    const payload = {
      title: draft.title,
      subtitle: draft.subtitle,
      content: draft.content,
      hero_image_path: draft.hero_image_path,
      category: draft.category,
      published_at: draft.published_at ? new Date(draft.published_at).toISOString() : null,
      published: draft.published,
      slug: draft.slug || undefined,
    };

    const result = await runAction({
      action: async () => {
        setSaving(true);
        try {
          const res = await fetch("/api/admin/posts", {
            method: editingId ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
          await load();
          return data;
        } finally {
          setSaving(false);
        }
      },
      success: editingId ? ACTION_RESULTS.postUpdated() : ACTION_RESULTS.postCreated(),
      error: (error) => ACTION_RESULTS.genericError(error instanceof Error ? error.message : undefined),
    });

    if (result) {
      setDraft(emptyPost());
      setEditingId(null);
    }
  };

  const remove = async (id: string) => {
    const ok = await confirm({
      title: "Beitrag löschen",
      message: ADMIN_CONFIRM.deletePost,
      confirmLabel: "Löschen",
      destructive: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/posts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error("Löschen fehlgeschlagen");
        await load();
      },
      success: ACTION_RESULTS.postDeleted(),
      error: (error) => ACTION_RESULTS.genericError(error instanceof Error ? error.message : undefined),
    });
  };

  const uploadHero = async (file: File) => {
    await runAction({
      action: async () => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("bucket", "site-assets");
        fd.append("folder", "posts");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload fehlgeschlagen");
        setDraft((d) => ({ ...d, hero_image_path: data.path, hero_image_url: data.url }));
        return data;
      },
      success: ACTION_RESULTS.imageUploaded(),
      error: (error) => ACTION_RESULTS.genericError(error instanceof Error ? error.message : undefined),
    });
  };

  const filtered = posts.filter((p) =>
    `${p.title} ${p.category} ${p.slug}`.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader {...page} />
        <AdminLoadingCard message="Beiträge werden geladen…" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <AdminPageHeader {...page} />
        <AdminCard>
          <p className="admin-text-body">{loadError}</p>
          <AdminButton variant="secondary" className="mt-4" onClick={() => { setLoadError(null); setLoading(true); void load().finally(() => setLoading(false)); }}>
            Erneut laden
          </AdminButton>
        </AdminCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page} />

      <AdminCard title={editingId ? "Beitrag bearbeiten" : "Neuer Beitrag"}>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="admin-input" placeholder="Titel" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <input className="admin-input" placeholder="Untertitel" value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
          <input className="admin-input" placeholder="Kategorie" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          <input className="admin-input" type="date" value={draft.published_at} onChange={(e) => setDraft({ ...draft, published_at: e.target.value })} />
          <input className="admin-input md:col-span-2" placeholder="Slug (optional, wird automatisch erzeugt)" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          <textarea className="admin-input md:col-span-2 min-h-32" placeholder="Text" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
          <label className="flex cursor-pointer items-center gap-2 text-sm admin-text-body">
            <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
            Veröffentlicht
          </label>
          <label className="admin-btn-secondary cursor-pointer text-center">
            Hero-Bild
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && void uploadHero(e.target.files[0])} />
          </label>
        </div>
        {draft.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={draft.hero_image_url} alt="" className="mt-4 h-32 w-full rounded-xl object-cover" />
        ) : null}
        <div className="mt-4 flex gap-2">
          <AdminButton variant="primary" icon={<Save className="h-4 w-4" />} onClick={() => void save()} disabled={saving}>
            {saving ? "Speichern…" : ADMIN_BTN.save}
          </AdminButton>
          {editingId ? (
            <AdminButton variant="secondary" onClick={() => { setEditingId(null); setDraft(emptyPost()); }}>
              {ADMIN_BTN.cancel}
            </AdminButton>
          ) : null}
        </div>
      </AdminCard>

      <AdminCard title="Alle Beiträge">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Beiträge suchen…" className="mb-4" />
        {filtered.length === 0 ? (
          <AdminEmptyState
            icon={Newspaper}
            title={posts.length === 0 ? empty.title : "Keine Beiträge gefunden"}
            description={posts.length === 0 ? empty.description : "Passe die Suche an."}
            actionLabel={posts.length === 0 ? empty.actionLabel : undefined}
            onAction={posts.length === 0 ? () => window.scrollTo({ top: 0, behavior: "smooth" }) : undefined}
          />
        ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="admin-list-card">
              <div>
                <p className="font-semibold admin-text-body">{p.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <AdminStatusBadge label={p.published ? "Veröffentlicht" : "Entwurf"} variant={postStatusVariant(p.published)} />
                  <span className="text-sm admin-text-muted">/aktuelles/{p.slug}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <AdminButton
                  variant="secondary"
                  onClick={() => {
                    setEditingId(p.id);
                    setDraft({
                      title: p.title,
                      subtitle: p.subtitle,
                      content: p.content,
                      hero_image_path: p.hero_image_path,
                      hero_image_url: p.hero_image_url ?? null,
                      category: p.category,
                      published_at: p.published_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
                      published: p.published,
                      slug: p.slug,
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Bearbeiten
                </AdminButton>
                <AdminButton variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void remove(p.id)}>
                  {ADMIN_BTN.delete}
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
        )}
      </AdminCard>
    </div>
  );
}
