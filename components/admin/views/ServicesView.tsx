"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { SERVICE_ICON_KEYS } from "@/lib/cms/icons";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminLoadingCard, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM, confirmDanger } from "@/lib/admin/messages";

interface ServiceRow {
  id: string;
  icon_key: string;
  title: string;
  description: string;
  detail_text?: string;
  image_url?: string;
  button_label?: string;
  button_link?: string;
  category?: string;
  price_from?: string;
  highlights?: string[];
  sort_order: number;
  visible: boolean;
}

const SERVICE_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=250&fit=crop&q=80";

const emptyForm = () => ({
  icon_key: "Star",
  title: "",
  description: "",
  detail_text: "",
  image_url: "",
  button_label: "Mehr erfahren",
  button_link: "#kontakt",
  category: "",
  price_from: "",
  highlights: "",
  visible: true,
});

export function ServicesView() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<"create" | string>("create");
  const { toast, saved, saveFailed, withLoading } = useAdminMessages();
  const page = adminPageHeaderProps("leistungen");
  const empty = ADMIN_EMPTY_STATES.services;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    if (res.ok) {
      setServices(data.services ?? []);
      if (data.meta?.seeded) {
        toast("Vorhandene Website-Leistungen wurden als bearbeitbare Startdaten übernommen.", "success");
      }
    } else {
      saveFailed();
    }
    setLoading(false);
  }, [saveFailed, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (body: Record<string, unknown>, method: "POST" | "PATCH" | "DELETE") => {
    const res = await fetch("/api/admin/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      saved();
      await load();
      return true;
    }
    const data = await res.json();
    toast(data.error ?? "Speichern fehlgeschlagen.", "error");
    return false;
  };

  const reorder = async (id: string, direction: "up" | "down") => {
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", id, direction }),
    });
    if (res.ok) {
      saved();
      await load();
    } else saveFailed();
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowCreate(true);
  };

  const openEdit = (service: ServiceRow) => {
    setShowCreate(false);
    setEditingId(service.id);
    setForm({
      icon_key: service.icon_key,
      title: service.title,
      description: service.description,
      detail_text: service.detail_text ?? "",
      image_url: service.image_url ?? "",
      button_label: service.button_label ?? "Mehr erfahren",
      button_link: service.button_link ?? "#kontakt",
      category: service.category ?? "",
      price_from: service.price_from ?? "",
      highlights: (service.highlights ?? []).join("\n"),
      visible: service.visible,
    });
  };

  const submitForm = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      return toast("Titel und Beschreibung sind Pflichtfelder.", "error");
    }
    const payload = {
      icon_key: form.icon_key,
      title: form.title.trim(),
      description: form.description.trim(),
      detail_text: form.detail_text.trim(),
      image_url: form.image_url.trim(),
      button_label: form.button_label.trim() || "Mehr erfahren",
      button_link: form.button_link.trim(),
      category: form.category.trim(),
      price_from: form.price_from.trim(),
      highlights: form.highlights
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      visible: form.visible,
      ...(showCreate ? { sort_order: services.length } : {}),
      ...(editingId ? { id: editingId } : {}),
    };

    await withLoading(
      (async () => {
        const ok = await save(payload, showCreate ? "POST" : "PATCH");
        if (ok) {
          setShowCreate(false);
          setEditingId(null);
        }
      })(),
    );
  };

  const toggleVisible = async (service: ServiceRow) => {
    await save({ id: service.id, visible: !service.visible }, "PATCH");
  };

  const remove = async (service: ServiceRow) => {
    if (!confirmDanger(ADMIN_CONFIRM.deleteService)) return;
    await save({ id: service.id }, "DELETE");
    if (editingId === service.id) {
      setEditingId(null);
      setShowCreate(false);
    }
  };

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "gallery");
    fd.append("folder", "services");
    const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const upData = await up.json();
    if (!up.ok) throw new Error(upData.error ?? "Upload fehlgeschlagen");
    const url = upData.url ?? "";
    setForm((f) => ({ ...f, image_url: url }));
    if (uploadTarget !== "create" && editingId) {
      await save({ id: editingId, image_url: url }, "PATCH");
    }
  };

  const editingOpen = showCreate || editingId !== null;

  return (
    <div className="admin-services-page space-y-6">
      <AdminPageHeader {...page}>
        <AdminButton variant="primary" onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
          Leistung hinzufügen
        </AdminButton>
      </AdminPageHeader>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            void withLoading(uploadImage(file));
          }
          e.target.value = "";
        }}
      />

      {editingOpen ? (
        <AdminCard title={showCreate ? "Neue Leistung" : "Leistung bearbeiten"}>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Titel" required className="md:col-span-2">
              <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Kategorie">
              <input className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="z. B. Geburtstage" />
            </AdminFormField>
            <AdminFormField label="Icon">
              <select className="admin-input" value={form.icon_key} onChange={(e) => setForm({ ...form, icon_key: e.target.value })}>
                {SERVICE_ICON_KEYS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Kurzbeschreibung" required className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Detailtext" className="md:col-span-2">
              <textarea className="admin-input min-h-24" value={form.detail_text} onChange={(e) => setForm({ ...form, detail_text: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Bild-URL" className="md:col-span-2" hint="Optional — sonst Standardbild auf der Website.">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input className="admin-input min-w-0 flex-1" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                <AdminButton
                  variant="secondary"
                  onClick={() => {
                    setUploadTarget(editingId ?? "create");
                    fileRef.current?.click();
                  }}
                >
                  Bild hochladen
                </AdminButton>
              </div>
            </AdminFormField>
            <AdminFormField label="Button-Text">
              <input className="admin-input" value={form.button_label} onChange={(e) => setForm({ ...form, button_label: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Button-Link" hint="z. B. #kontakt oder https://...">
              <input className="admin-input" value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Preis ab">
              <input className="admin-input" value={form.price_from} onChange={(e) => setForm({ ...form, price_from: e.target.value })} placeholder="z. B. 120 €" />
            </AdminFormField>
            <AdminFormField label="Highlights" hint="Ein Highlight pro Zeile" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} />
            </AdminFormField>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
              Auf der Website sichtbar
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <AdminButton variant="primary" onClick={() => void submitForm()}>{ADMIN_BTN.save}</AdminButton>
            <AdminButton
              variant="secondary"
              onClick={() => {
                setShowCreate(false);
                setEditingId(null);
              }}
            >
              {ADMIN_BTN.cancel}
            </AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {loading ? (
        <AdminLoadingCard message="Leistungen werden geladen…" />
      ) : services.length === 0 ? (
        <AdminEmptyState
          icon={Sparkles}
          title={empty.title}
          description={empty.description}
          actionLabel="Leistung hinzufügen"
          onAction={openCreate}
        />
      ) : (
        <div className="admin-services-list space-y-3">
          {services.map((service, index) => (
            <AdminCard key={service.id} className="admin-service-card">
              <div className="admin-service-card-inner">
                <div className="admin-service-card-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.image_url?.trim() || SERVICE_IMAGE_FALLBACK}
                    alt=""
                    className="admin-service-card-image"
                  />
                </div>
                <div className="admin-service-card-body min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary">{service.title}</p>
                      {service.category ? (
                        <p className="text-xs text-text-muted">{service.category}</p>
                      ) : null}
                      <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{service.description}</p>
                    </div>
                    <AdminStatusBadge
                      label={service.visible ? "Sichtbar" : "Ausgeblendet"}
                      variant={service.visible ? "success" : "muted"}
                    />
                  </div>
                  <div className="admin-service-card-actions">
                    <AdminButton variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => openEdit(service)}>
                      Bearbeiten
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      icon={service.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      onClick={() => void toggleVisible(service)}
                    >
                      {service.visible ? "Ausblenden" : "Einblenden"}
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      icon={<ChevronUp className="h-4 w-4" />}
                      disabled={index === 0}
                      onClick={() => void reorder(service.id, "up")}
                      aria-label="Nach oben"
                    >
                      <span className="sr-only">Nach oben</span>
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      icon={<ChevronDown className="h-4 w-4" />}
                      disabled={index === services.length - 1}
                      onClick={() => void reorder(service.id, "down")}
                      aria-label="Nach unten"
                    >
                      <span className="sr-only">Nach unten</span>
                    </AdminButton>
                    <AdminButton variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void remove(service)}>
                      Löschen
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
