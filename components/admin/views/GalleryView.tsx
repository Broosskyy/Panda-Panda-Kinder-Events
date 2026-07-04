"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { useAdminUi } from "@/components/admin/AdminUiProvider";

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
  const { toast, setLoading } = useAdminUi();

  const load = () =>
    fetch("/api/admin/gallery")
      .then((r) => r.json())
      .then((d) => setImages(d.images ?? []));

  useEffect(() => {
    load();
  }, []);

  const upload = async (file: File) => {
    setLoading(true);
    try {
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
      toast("Bild hochgeladen");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload fehlgeschlagen", "error");
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, updates: Partial<GalleryItem>) => {
    const res = await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.ok) {
      toast("Gespeichert");
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Bild wirklich löschen?")) return;
    const res = await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast("Gelöscht");
      load();
    }
  };

  return (
    <div>
      <AdminPageHeader title="Galerie" description="Bilder hochladen und verwalten">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="min-h-11 rounded-full bg-primary px-6 text-sm font-medium text-white"
        >
          + Bild hochladen
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
      </AdminPageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <AdminCard key={img.id} className="!p-0 overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image src={img.url} alt={img.alt_text} fill className="object-cover" unoptimized={img.url.includes("supabase.co")} />
            </div>
            <div className="space-y-3 p-4">
              <input
                defaultValue={img.title}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Titel"
                onBlur={(e) => e.target.value !== img.title && update(img.id, { title: e.target.value })}
              />
              <input
                defaultValue={img.alt_text}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Alt-Text"
                onBlur={(e) =>
                  e.target.value !== img.alt_text && update(img.id, { alt_text: e.target.value })
                }
              />
              <input
                defaultValue={img.category}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
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
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="text-xs text-accent-heart underline"
                >
                  Löschen
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
