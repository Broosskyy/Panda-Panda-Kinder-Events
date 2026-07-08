"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard } from "@/components/admin/AdminSidebar";
import { AdminStickySave } from "@/components/admin/ui/AdminStickySave";
import { CriticalActionModal, withCriticalConfirmation } from "@/components/admin/CriticalActionModal";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { MODULE_DEFINITIONS } from "@/lib/cms/modules";
import type { SiteModulesSettings } from "@/lib/cms/types";

interface ModulesSettingsPanelProps {
  initial: SiteModulesSettings;
  isSuperAdmin: boolean;
  isLegacy?: boolean;
}

export function ModulesSettingsPanel({ initial, isSuperAdmin, isLegacy = false }: ModulesSettingsPanelProps) {
  const [modules, setModules] = useState<SiteModulesSettings>(initial);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState<SiteModulesSettings | null>(null);
  const { withLoading, saved, error: showError } = useAdminMessages();

  useEffect(() => {
    setModules(initial);
  }, [initial]);

  const toggle = (key: keyof SiteModulesSettings) => {
    if (!isSuperAdmin) return;
    setModules((m) => ({ ...m, [key]: !m[key] }));
  };

  const saveModules = useCallback(
    async (value: SiteModulesSettings, confirmation?: { confirmPassword?: string; criticalAcknowledged?: boolean }) => {
      await withLoading(
        (async () => {
          const res = await fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              withCriticalConfirmation({ section: "modules", value }, confirmation ?? {}),
            ),
          });
          const data = await res.json();
          if (!res.ok) {
            if (data.needsPassword || data.needsConfirmation) {
              setPendingSave(value);
              setConfirmOpen(true);
              return;
            }
            throw new Error(data.error ?? "Speichern fehlgeschlagen.");
          }
          saved();
          setConfirmOpen(false);
          setPendingSave(null);
        })(),
      );
    },
    [saved, withLoading],
  );

  const requestSave = () => {
    if (!isSuperAdmin) {
      showError("Keine Berechtigung", "Nur Super Admins dürfen Module ändern.");
      return;
    }
    void saveModules(modules);
  };

  if (!isSuperAdmin) {
    return (
      <AdminCard title="Module">
        <p className="text-sm text-text-muted">
          Nur Super Admins dürfen Bereiche der Website und des Admin-Bereichs ein- oder ausschalten.
          Bitte wenden Sie sich an einen Super Admin, wenn Sie etwas ändern möchten.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {MODULE_DEFINITIONS.map((mod) => (
            <li key={mod.key} className="flex justify-between gap-2 rounded-lg border border-border px-3 py-2">
              <span>{mod.label}</span>
              <span className={modules[mod.key] !== false ? "text-primary" : "text-text-muted"}>
                {modules[mod.key] !== false ? "Aktiv" : "Aus"}
              </span>
            </li>
          ))}
        </ul>
      </AdminCard>
    );
  }

  return (
    <>
      <AdminCard title="Was können Sie hier machen?">
        <p className="text-sm text-text-muted">
          Schalten Sie einzelne Bereiche der Website und des Admin-Bereichs ein oder aus.
          Deaktivierte Bereiche werden auf der öffentlichen Website ausgeblendet — es gibt keine kaputten Links.
          Änderungen werden im Aktivitätsprotokoll gespeichert.
        </p>
      </AdminCard>

      <AdminCard title="Module">
        <div className="space-y-3">
          {MODULE_DEFINITIONS.map((mod) => {
            const enabled = modules[mod.key] !== false;
            return (
              <div
                key={mod.key}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary">{mod.label}</p>
                  <p className="mt-1 text-sm text-text-muted">{mod.description}</p>
                  <p className="mt-1 text-xs text-primary">
                    Öffentlich: {mod.publicHint}
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggle(mod.key)}
                    className="h-4 w-4"
                  />
                  {enabled ? "An" : "Aus"}
                </label>
              </div>
            );
          })}
        </div>
      </AdminCard>

      <AdminStickySave onSave={requestSave} label="Module speichern" />

      <CriticalActionModal
        open={confirmOpen}
        title="Module ändern — Bestätigung nötig"
        description="Das Ein- oder Ausschalten von Modulen betrifft die gesamte Website. Bitte bestätigen Sie mit Ihrem Passwort."
        isLegacy={isLegacy}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingSave(null);
        }}
        onConfirm={async (confirmation) => {
          if (pendingSave) await saveModules(pendingSave, confirmation);
          else await saveModules(modules, confirmation);
        }}
      />
    </>
  );
}
