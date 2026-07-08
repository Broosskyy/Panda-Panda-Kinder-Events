"use client";

import Link from "next/link";
import type { SystemStatusItem, SystemStatusLevel } from "@/lib/admin/system-status";
import { SystemBackupPanel } from "@/components/admin/settings/SystemBackupPanel";
import { AdminStatusBadge } from "@/components/admin/ui";

export type SystemSubTab = "health" | "backup";

const SYSTEM_SUB_TABS: { id: SystemSubTab; label: string; hint: string }[] = [
  { id: "health", label: "Systemstatus", hint: "Ampel-Übersicht über Konfiguration und Zustand" },
  { id: "backup", label: "Backup", hint: "CMS- und CRM-Daten als ZIP sichern" },
];

const SYSTEM_LEVEL_VARIANT: Record<SystemStatusLevel, "success" | "warning" | "danger"> = {
  ok: "success",
  warn: "warning",
  error: "danger",
};

const SYSTEM_LEVEL_LABEL: Record<SystemStatusLevel, string> = {
  ok: "OK",
  warn: "Hinweis",
  error: "Kritisch",
};

const OVERALL_LABEL: Record<SystemStatusLevel, string> = {
  ok: "Alles in Ordnung",
  warn: "Einige Hinweise — bitte prüfen",
  error: "Kritische Punkte — bitte beheben",
};

const OVERALL_CHIP: Record<SystemStatusLevel, string> = {
  ok: "dash-v2-chip-success",
  warn: "dash-v2-chip-warning",
  error: "dash-v2-chip-danger",
};

interface SystemSettingsShellProps {
  systemTab: SystemSubTab;
  systemStatus: {
    items: SystemStatusItem[];
    summary: { ok: number; warn: number; error: number };
    overall?: SystemStatusLevel;
  } | null;
  systemError: string | null;
}

export function SystemSettingsShell({
  systemTab,
  systemStatus,
  systemError,
}: SystemSettingsShellProps) {
  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-2">
        {SYSTEM_SUB_TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/einstellungen?tab=system&systemTab=${tab.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              systemTab === tab.id
                ? "bg-primary text-white"
                : "border border-border bg-bg-card text-text-secondary hover:bg-bg-secondary"
            }`}
            title={tab.hint}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {systemTab === "backup" ? <SystemBackupPanel /> : null}

      {systemTab === "health" ? (
        <div className="space-y-4">
          {systemError ? <p className="text-sm font-medium text-accent-heart">{systemError}</p> : null}

          {systemStatus ? (
            <>
              {systemStatus.overall ? (
                <div className={`dash-v2-chip ${OVERALL_CHIP[systemStatus.overall]} w-full justify-center px-4 py-3 text-sm`}>
                  <strong>{OVERALL_LABEL[systemStatus.overall]}</strong>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <AdminStatusBadge label={`${systemStatus.summary.ok} OK`} variant="success" />
                <AdminStatusBadge label={`${systemStatus.summary.warn} Hinweise`} variant="warning" />
                <AdminStatusBadge label={`${systemStatus.summary.error} Kritisch`} variant="danger" />
              </div>
              <ul className="space-y-3">
                {systemStatus.items.map((item) => (
                  <li key={item.id} className="admin-card admin-card-compact">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <AdminStatusBadge
                        label={SYSTEM_LEVEL_LABEL[item.level]}
                        variant={SYSTEM_LEVEL_VARIANT[item.level]}
                      />
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{item.message}</p>
                    {item.action ? <p className="mt-1 text-xs text-text-muted">{item.action}</p> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : !systemError ? (
            <p className="text-sm text-text-muted">Status wird geladen…</p>
          ) : null}

          <div className="border-t border-border pt-6">
            <p className="text-sm text-text-secondary">
              Admin-Benutzer und 2FA verwaltest du unter{" "}
              <Link href="/admin/sicherheit/benutzer" className="text-primary underline">
                Sicherheit → Benutzer & Rollen
              </Link>
              . Legacy-Zugang per <code className="rounded bg-bg-secondary px-1">ADMIN_PASSWORD</code>, solange kein
              Benutzer existiert.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function parseSystemSubTab(value: string | null): SystemSubTab {
  const valid: SystemSubTab[] = ["health", "backup"];
  return valid.includes(value as SystemSubTab) ? (value as SystemSubTab) : "health";
}
