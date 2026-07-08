"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_CONFIRM, confirmDanger } from "@/lib/admin/messages";
import { ADMIN_BTN } from "@/lib/admin/buttons";

interface GalleryItem {
  id: string;
  storage_path: string;
  title: string;
  alt_text: string;
  category: string;
  sort_order: number;
  visible: boolean;
  url: string;
}

export function GalleryView() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast, withLoading, gallerySaved, imageUploaded, imageDeleted, uploading, saveFailed } = useAdminMessages();
  const page = adminPageHeaderProps("galerie");
  const empty = ADMIN_EMPTY_STATES.gallery;

  const load = () =>
    fetch("/api/admin/gallery")
      .then((r) => r.json())
      .then((d) => setImages(d.images ?? []));

  useEffect(() => {
    load();
  }, []);

  const upload = async (file: File) => {
    uploading();
    try {
      await withLoading(
        (async () => {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("bucket", "gallery");
          fd.append("folder", "images");
          const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
          const upData = await up.json();
          if (!up.ok) throw new Error(upData.error);

          const res = await fetch("/api/admin/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storage_path: upData.path,
              title: file.name.replace(/\.[^.]+$/, ""),
              alt_text: file.name.replace(/\.[^.]+$/, ""),
              sort_order: images.length,
            }),
          });
          if (!res.ok) throw new Error("DB Fehler");
          imageUploaded();
          await load();
        })(),
      );
    } catch (e) {
      toast(e instanceof Error ? e.message : "❌ Upload fehlgeschlagen.", "error");
    }
  };

  const update = async (id: string, updates: Partial<GalleryItem>) => {
    const res = await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.ok) {
      gallerySaved();
      load();
    } else saveFailed();
  };

  const remove = async (id: string) => {
    if (!confirmDanger(ADMIN_CONFIRM.deleteImage)) return;
    const res = await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      imageDeleted();
      load();
    } else toast("❌ Löschen fehlgeschlagen.", "error");
  };

  return (
    <div>
      <AdminPageHeader {...page}>
        <AdminButton variant="primary" onClick={() => fileRef.current?.click()}>
          {ADMIN_BTN.upload}
        </AdminButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
      </AdminPageHeader>

      {images.length === 0 ? (
        <AdminEmptyState
          icon={ImageIcon}
          title={empty.title}
          description={empty.description}
          actionLabel={empty.actionLabel}
          onAction={() => fileRef.current?.click()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <AdminCard key={img.id} className="!p-0 overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image src={img.url} alt={img.alt_text} fill className="object-cover" unoptimized={img.url.includes("supabase.co")} />
              </div>
              <div className="space-y-3 p-4">
                <input
                  defaultValue={img.title}
                  className="admin-input"
                  placeholder="Titel"
                  onBlur={(e) => e.target.value !== img.title && update(img.id, { title: e.target.value })}
                />
                <input
                  defaultValue={img.alt_text}
                  className="admin-input"
                  placeholder="Alt-Text"
                  onBlur={(e) =>
                    e.target.value !== img.alt_text && update(img.id, { alt_text: e.target.value })
                  }
                />
                <input
                  defaultValue={img.category}
                  className="admin-input"
                  placeholder="Kategorie"
                  onBlur={(e) =>
                    e.target.value !== img.category && update(img.id, { category: e.target.value })
                  }
                />
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={img.visible}
                      onChange={(e) => update(img.id, { visible: e.target.checked })}
                    />
                    Sichtbar
                  </label>
                  <AdminButton variant="danger" onClick={() => void remove(img.id)}>
                    Löschen
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
