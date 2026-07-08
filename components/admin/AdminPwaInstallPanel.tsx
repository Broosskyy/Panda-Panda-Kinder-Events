"use client";

import { useState } from "react";
import { CheckCircle2, RefreshCw, Smartphone } from "lucide-react";
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

  const rows: { label: string; ok: boolean }[] = probeResult
    ? [
        { label: "Manifest", ok: probeResult.manifestLoaded && probeResult.manifestValid },
        { label: "Service Worker aktiv", ok: probeResult.serviceWorkerActive },
        { label: "SW kontrolliert Seite", ok: probeResult.serviceWorkerControlling },
        { label: "Icons 192/512", ok: probeResult.icons192Ok && probeResult.icons512Ok },
        { label: "HTTPS", ok: probeResult.https },
        { label: "Install-Prompt", ok: probeResult.installPromptAvailable },
      ]
    : [];

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
          {statusChecked && rows.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-text-muted">
              {rows.map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-2">
                  <span>{row.label}</span>
                  <span className={row.ok ? "text-[#2d5a3a]" : "text-amber-700"}>{row.ok ? "OK" : "Fehlt"}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {statusChecked && probeResult?.blockers?.length ? (
            <ul className="mt-3 space-y-1.5 border-t border-border/70 pt-3 text-xs text-text-secondary">
              {probeResult.blockers.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {feedback ? (
          <p className="text-sm text-text-secondary" role="status">
            {feedback}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          {canInstall ? (
            <AdminButton variant="primary" className="w-full" onClick={() => void install()}>
              Admin-App installieren
            </AdminButton>
          ) : (
            <AdminButton variant="secondary" className="w-full" onClick={openInstallHelp}>
              Installationshilfe öffnen
            </AdminButton>
          )}

          <AdminButton
            variant="ghost"
            className="w-full"
            icon={<RefreshCw className="h-4 w-4" />}
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
        blockers={probeResult?.blockers ?? []}
      />
    </>
  );
}
