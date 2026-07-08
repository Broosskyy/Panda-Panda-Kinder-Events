"use client";

import { useState } from "react";
import { CheckCircle2, Smartphone } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { AdminPwaInstallHelpSheet } from "@/components/admin/AdminPwaInstallHelpSheet";
import { useAdminPwa } from "@/components/admin/AdminPwaProvider";

interface AdminPwaInstallPanelProps {
  compact?: boolean;
  showTitle?: boolean;
}

function feedbackMessage(feedback: ReturnType<typeof useAdminPwa>["installFeedback"]): string | null {
  switch (feedback.type) {
    case "started":
      return "Installation gestartet…";
    case "accepted":
      return "Installation akzeptiert — die App wird hinzugefügt.";
    case "dismissed":
      return "Installation abgelehnt.";
    case "unavailable":
      return "Installation nicht verfügbar — bitte Installationshilfe nutzen.";
    default:
      return null;
  }
}

function ProbeDetails({ checked }: { checked: boolean }) {
  const { probeResult } = useAdminPwa();
  if (!checked || !probeResult) return null;

  const rows = [
    ["Manifest", probeResult.manifestLoaded && probeResult.manifestValid],
    ["Service Worker", probeResult.serviceWorkerActive],
    ["Icons 192/512", probeResult.icons192Ok && probeResult.icons512Ok],
    ["Offline-Vorbereitung", probeResult.offlineCapable],
    ["Install-Prompt", probeResult.installPromptAvailable],
    ["HTTPS", probeResult.https],
  ] as const;

  return (
    <ul className="mt-2 space-y-1 text-xs text-text-muted">
      {rows.map(([label, ok]) => (
        <li key={label} className="flex items-center justify-between gap-2">
          <span>{label}</span>
          <span className={ok ? "text-[#2d5a3a]" : "text-text-muted"}>{ok ? "OK" : "Fehlt"}</span>
        </li>
      ))}
    </ul>
  );
}

export function AdminPwaInstallPanel({ compact = false, showTitle = true }: AdminPwaInstallPanelProps) {
  const {
    canInstall,
    showIosGuide,
    isInstalled,
    install,
    checkInstallStatus,
    probeResult,
    installFeedback,
    helpOpen,
    openInstallHelp,
    closeInstallHelp,
  } = useAdminPwa();
  const [statusChecked, setStatusChecked] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    await checkInstallStatus();
    setStatusChecked(true);
    setChecking(false);
  };

  const feedback = feedbackMessage(installFeedback);

  if (isInstalled) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-[#2d5a3a]">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Bereits installiert
        </div>
        <p className="text-sm text-text-muted">Die Admin-App läuft im Vollbildmodus auf diesem Gerät.</p>
      </div>
    );
  }

  return (
    <>
      <div className={compact ? "space-y-3" : "space-y-4"}>
        {showTitle ? (
          <div className="flex items-start gap-3">
            <div className="admin-pwa-install-card-icon" aria-hidden>
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold text-text-primary">Admin-App installieren</h3>
              <p className="mt-1 text-sm text-text-muted">
                Schneller Zugriff, Vollbild und Offline-Vorbereitung für den Adminbereich.
              </p>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-border bg-bg-secondary/40 p-3 text-sm">
          <p className="font-medium text-text-primary">Status</p>
          <p className="mt-1 text-text-muted">{probeResult?.statusLabel ?? "Wird geprüft…"}</p>
          <ProbeDetails checked={statusChecked} />
        </div>

        {feedback ? (
          <p
            className={`text-sm ${
              installFeedback.type === "accepted"
                ? "text-[#2d5a3a]"
                : installFeedback.type === "dismissed"
                  ? "text-text-muted"
                  : "text-text-secondary"
            }`}
            role="status"
          >
            {feedback}
          </p>
        ) : null}

        {!canInstall && !showIosGuide ? (
          <p className="text-sm text-text-secondary">
            Dein Browser meldet aktuell keine installierbare App.
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {canInstall ? (
            <AdminButton variant="primary" className="w-full sm:w-auto" onClick={() => void install()}>
              App installieren
            </AdminButton>
          ) : (
            <AdminButton variant="secondary" className="w-full sm:w-auto" onClick={openInstallHelp}>
              Installationshilfe öffnen
            </AdminButton>
          )}

          <AdminButton
            variant="ghost"
            className="w-full sm:w-auto"
            disabled={checking}
            onClick={() => void handleCheckStatus()}
          >
            {checking ? "Prüfe…" : "Installationsstatus prüfen"}
          </AdminButton>
        </div>
      </div>

      <AdminPwaInstallHelpSheet
        open={helpOpen}
        onClose={closeInstallHelp}
        showIosGuide={showIosGuide}
        probeIssues={probeResult?.issues ?? []}
      />
    </>
  );
}
