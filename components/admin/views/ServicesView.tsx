"use client";

import { useEffect, useState } from "react";
import { SERVICE_ICON_KEYS } from "@/lib/cms/icons";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
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
        <button
          type="button"
          onClick={addNew}
          className="min-h-11 rounded-full bg-primary px-6 text-sm font-medium text-white"
        >
          + Neue Leistung
        </button>
      </AdminPageHeader>
      <div className="space-y-4">
        {services.map((s) => (
          <AdminCard key={s.id}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                defaultValue={s.title}
                className="rounded-lg border border-border px-3 py-2 text-sm font-semibold"
                onBlur={(e) => e.target.value !== s.title && save({ id: s.id, title: e.target.value }, "PATCH")}
              />
              <select
                defaultValue={s.icon_key}
                className="rounded-lg border border-border px-3 py-2 text-sm"
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
                className="sm:col-span-2 rounded-lg border border-border px-3 py-2 text-sm"
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
                  className="w-20 rounded-lg border border-border px-2 py-1 text-sm"
                  title="Reihenfolge"
                  onBlur={(e) =>
                    save({ id: s.id, sort_order: parseInt(e.target.value, 10) }, "PATCH")
                  }
                />
                <button
                  type="button"
                  onClick={() => confirm("Löschen?") && save({ id: s.id }, "DELETE")}
                  className="text-xs text-accent-heart underline"
                >
                  Löschen
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
        {services.length === 0 && (
          <p className="text-text-muted">
            Noch keine CMS-Leistungen — Website zeigt Standard-Leistungen. Neue Leistung anlegen
            um zu überschreiben.
          </p>
        )}
      </div>
    </div>
  );
}
