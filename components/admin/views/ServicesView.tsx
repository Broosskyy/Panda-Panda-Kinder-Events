"use client";

import { useEffect, useState } from "react";
import { SERVICE_ICON_KEYS } from "@/lib/cms/icons";
import { Plus, Sparkles } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState } from "@/components/admin/ui";
import { useAdminUi } from "@/components/admin/AdminUiProvider";

interface ServiceRow {
  id: string;
  icon_key: string;
  title: string;
  description: string;
  sort_order: number;
  visible: boolean;
}

export function ServicesView() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const { toast } = useAdminUi();

  const load = () =>
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []));

  useEffect(() => {
    load();
  }, []);

  const save = async (body: Record<string, unknown>, method: "POST" | "PATCH" | "DELETE") => {
    const res = await fetch("/api/admin/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast("Gespeichert");
      load();
    } else toast("Fehler", "error");
  };

  const addNew = () =>
    save(
      {
        icon_key: "Star",
        title: "Neue Leistung",
        description: "Beschreibung...",
        sort_order: services.length,
        visible: false,
      },
      "POST",
    );

  return (
    <div>
      <AdminPageHeader title="Leistungen" description="Services auf der Website verwalten">
        <AdminButton variant="primary" onClick={addNew} icon={<Plus className="h-4 w-4" />}>
          Neue Leistung
        </AdminButton>
      </AdminPageHeader>
      <div className="space-y-4">
        {services.length === 0 ? (
          <AdminEmptyState
            icon={Sparkles}
            title="Noch keine CMS-Leistungen"
            description="Die Website zeigt Standard-Leistungen. Lege eigene Leistungen an, um sie zu überschreiben."
            actionLabel="Erste Leistung anlegen"
            onAction={addNew}
          />
        ) : null}
        {services.map((s) => (
          <AdminCard key={s.id}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                defaultValue={s.title}
                className="admin-input font-semibold"
                onBlur={(e) => e.target.value !== s.title && save({ id: s.id, title: e.target.value }, "PATCH")}
              />
              <select
                defaultValue={s.icon_key}
                className="admin-input"
                onChange={(e) => save({ id: s.id, icon_key: e.target.value }, "PATCH")}
              >
                {SERVICE_ICON_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <textarea
                defaultValue={s.description}
                rows={2}
                className="admin-input sm:col-span-2 min-h-20"
                onBlur={(e) =>
                  e.target.value !== s.description && save({ id: s.id, description: e.target.value }, "PATCH")
                }
              />
              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={s.visible}
                    onChange={(e) => save({ id: s.id, visible: e.target.checked }, "PATCH")}
                  />
                  Sichtbar
                </label>
                <input
                  type="number"
                  defaultValue={s.sort_order}
                  className="admin-input w-20"
                  title="Reihenfolge"
                  onBlur={(e) =>
                    save({ id: s.id, sort_order: parseInt(e.target.value, 10) }, "PATCH")
                  }
                />
                <button
                  type="button"
                  onClick={() => confirm("Löschen?") && save({ id: s.id }, "DELETE")}
                  className="admin-btn-danger text-xs"
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
