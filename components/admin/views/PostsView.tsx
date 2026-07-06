"use client";

import { useCallback, useEffect, useState } from "react";
import { Newspaper, Save, Trash2 } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminSearchInput, AdminStatusBadge, postStatusVariant } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM, ADMIN_MSG, confirmDanger } from "@/lib/admin/messages";
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
  const { toast, withLoading, postCreated, postUpdated } = useAdminMessages();
  const page = adminPageHeaderProps("beitraege");
  const empty = ADMIN_EMPTY_STATES.posts;
  const [posts, setPosts] = useState<CmsPost[]>([]);
  const [draft, setDraft] = useState<PostDraft>(emptyPost());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/posts");
    if (!res.ok) throw new Error("Laden fehlgeschlagen");
    const data = await res.json();
    setPosts(data.posts ?? []);
  }, []);

  useEffect(() => {
    void withLoading(load());
  }, [load, withLoading]);

  const save = async () => {
    if (!draft.title.trim()) {
      toast("Titel ist Pflicht", "error");
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

    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/posts", {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        if (editingId) postUpdated();
        else postCreated();
        setDraft(emptyPost());
        setEditingId(null);
        await load();
      })(),
    );
  };

  const remove = async (id: string) => {
    if (!confirmDanger(ADMIN_CONFIRM.deletePost)) return;
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/posts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error("Löschen fehlgeschlagen");
        toast(ADMIN_MSG.postDeleted);
        await load();
      })(),
    );
  };

  const uploadHero = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "site-assets");
    fd.append("folder", "posts");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error ?? ADMIN_MSG.uploadFailed, "error");
      console.error("uploadHero:", data);
      return;
    }
    setDraft((d) => ({ ...d, hero_image_path: data.path, hero_image_url: data.url }));
    toast("✓ Hero-Bild hochgeladen — bitte Beitrag speichern.");
  };

  const filtered = posts.filter((p) =>
    `${p.title} ${p.category} ${p.slug}`.toLowerCase().includes(search.toLowerCase()),
  );

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
          <label className="flex cursor-pointer items-center gap-2 text-sm">
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
          <AdminButton variant="primary" icon={<Save className="h-4 w-4" />} onClick={() => void save()}>
            {ADMIN_BTN.save}
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
                <p className="font-semibold text-text-primary">{p.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <AdminStatusBadge label={p.published ? "Veröffentlicht" : "Entwurf"} variant={postStatusVariant(p.published)} />
                  <span className="text-sm text-text-muted">/aktuelles/{p.slug}</span>
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
