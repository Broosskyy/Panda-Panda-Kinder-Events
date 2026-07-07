"use client";

import Link from "next/link";
import type { SystemStatusItem, SystemStatusLevel } from "@/lib/admin/system-status";
import { SystemBackupPanel } from "@/components/admin/settings/SystemBackupPanel";

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
  error: "Fehler",
};

interface SystemSettingsShellProps {
  systemTab: SystemSubTab;
  systemStatus: {
    items: SystemStatusItem[];
    summary: { ok: number; warn: number; error: number };
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
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  {systemStatus.summary.ok} OK
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                  {systemStatus.summary.warn} Hinweise
                </span>
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                  {systemStatus.summary.error} Fehler
                </span>
              </div>
              <ul className="space-y-3">
                {systemStatus.items.map((item) => (
                  <li key={item.id} className="rounded-xl border border-border bg-bg-secondary/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          SYSTEM_LEVEL_VARIANT[item.level] === "success"
                            ? "bg-green-100 text-green-800"
                            : SYSTEM_LEVEL_VARIANT[item.level] === "warning"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {SYSTEM_LEVEL_LABEL[item.level]}
                      </span>
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
