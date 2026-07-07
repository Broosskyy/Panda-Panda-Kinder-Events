"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminSidebar";
import { AdminButton } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";

function parseWarningsHeader(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function SystemBackupPanel() {
  const { withLoading, success, error } = useAdminMessages();
  const [lastWarnings, setLastWarnings] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  const downloadBackup = async () => {
    setDownloading(true);
    setLastWarnings([]);
    try {
      await withLoading(
        (async () => {
          const res = await fetch("/api/admin/backup/export");
          if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(data.error ?? "Backup konnte nicht erstellt werden.");
          }

          const warnings = parseWarningsHeader(res.headers.get("X-Backup-Warnings"));
          const partial = res.headers.get("X-Backup-Partial") === "true";
          setLastWarnings(warnings);

          const blob = await res.blob();
          const disposition = res.headers.get("Content-Disposition") ?? "";
          const match = disposition.match(/filename="([^"]+)"/);
          const filename = match?.[1] ?? `panda-bande-backup-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.zip`;

          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = filename;
          anchor.click();
          URL.revokeObjectURL(url);

          if (partial && warnings.length > 0) {
            error(
              "Backup konnte nicht vollständig erstellt werden.",
              warnings.join(" · "),
              "Die ZIP-Datei wurde trotzdem heruntergeladen — bitte backup-info.json prüfen.",
            );
          } else {
            success("Backup wurde erstellt.");
          }
        })(),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      error("Backup konnte nicht vollständig erstellt werden.", message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminCard title="Daten sichern">
      <p className="mb-4 text-sm text-text-muted">
        Dieses Backup sichert wichtige Panda-Bande Daten wie Anfragen, Kunden, Bewertungen, Galerie, Blog, Angebote,
        Rechnungen und E-Mail-Vorlagen. Es ersetzt kein vollständiges Datenbank-Backup, reicht aber als Sicherheitskopie
        für den Alltag.
      </p>

      <AdminButton
        variant="primary"
        icon={<Download className="h-4 w-4" />}
        onClick={() => void downloadBackup()}
        disabled={downloading}
      >
        Backup herunterladen
      </AdminButton>

      {lastWarnings.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Hinweise zum letzten Export:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {lastWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-text-muted">
        Enthalten: JSON- und CSV-Dateien pro Tabelle, plus backup-info.json mit Exportdatum und Datensatz-Zählern. Keine
        Passwörter, API-Keys oder Session-Tokens.
      </p>
    </AdminCard>
  );
}
