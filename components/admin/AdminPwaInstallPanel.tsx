"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, RefreshCw, Smartphone } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { AdminPwaInstallHelpSheet, ProbeDetails, PwaDebugDetails } from "@/components/admin/AdminPwaInstallHelpSheet";
import { useAdminPwa } from "@/components/admin/AdminPwaProvider";
import { getPwaPanelStatus, resolvePwaRealityStatus, getPwaRealityHeadline, isStandalonePwa } from "@/lib/admin/pwa-install";

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
      return "Installation abgelehnt — Chrome blockiert den Prompt ggf. temporär. Manuelle Installation nutzen.";
    case "unavailable":
      return null;
    default:
      return null;
  }
}

export function AdminPwaInstallPanel({ compact = false, showTitle = true }: AdminPwaInstallPanelProps) {
  const {
    canInstall,
    browserInfo,
    installGuide,
    isInstalled,
    install,
    checkInstallStatus,
    probeResult,
    debugStatus,
    installFeedback,
    helpOpen,
    openInstallHelp,
    closeInstallHelp,
    resetInstallHints,
  } = useAdminPwa();
  const [statusChecked, setStatusChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    await checkInstallStatus();
    setStatusChecked(true);
    setChecking(false);
  };

  const handlePrimaryAction = async () => {
    if (canInstall) {
      const outcome = await install();
      if (outcome === "unavailable") openInstallHelp();
      return;
    }
    openInstallHelp();
  };

  const feedback = feedbackMessage(installFeedback);
  const panelStatus = getPwaPanelStatus({
    canInstall,
    installMode: probeResult?.installMode,
    browser: browserInfo,
    causeMessage: debugStatus?.causeMessage ?? null,
  });
  const realityStatus = resolvePwaRealityStatus({
    canInstall,
    isInstalled,
    probe: probeResult,
  });
  const realityHeadline = getPwaRealityHeadline(realityStatus);

  if (isInstalled) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-[#2d5a3a]">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Bereits installiert
        </div>
        <p className="text-sm text-text-muted">
          {isStandalonePwa()
            ? "Die Admin-App läuft im Vollbildmodus auf diesem Gerät."
            : "Die Admin-App ist auf diesem Gerät installiert. Öffne sie über das App-Icon im Startbildschirm oder App-Drawer."}
        </p>
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

        <div className="rounded-xl border border-border bg-bg-secondary p-3 text-sm">
          <p className="font-medium text-text-primary">Status · {browserInfo.label}</p>
          {!canInstall && realityStatus !== "installable" && realityStatus !== "installed" ? (
            <p
              className={`mt-1 text-sm font-semibold ${
                realityStatus === "technical_error" ? "text-amber-800" : "text-text-secondary"
              }`}
            >
              {realityHeadline}
            </p>
          ) : null}
          <p className={`mt-1 ${panelStatus.isError ? "text-amber-800" : "text-text-muted"}`}>
            {canInstall ? panelStatus.headline : panelStatus.detail ?? panelStatus.headline}
          </p>
          {panelStatus.detail ? (
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">{panelStatus.detail}</p>
          ) : null}
          {statusChecked && probeResult ? (
            <ProbeDetails probeResult={probeResult} browserInfo={browserInfo} />
          ) : null}
          {statusChecked && debugStatus ? (
            <div className="mt-3 border-t border-border/70 pt-3">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 text-xs font-medium text-text-secondary"
                onClick={() => setDebugOpen((v) => !v)}
              >
                Technische Diagnose
                {debugOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {debugOpen ? <PwaDebugDetails debug={debugStatus} className="mt-2" /> : null}
            </div>
          ) : null}
          {statusChecked && debugStatus?.chromeInstallBlockers?.length ? (
            <ul className="mt-3 space-y-1.5 border-t border-border/70 pt-3 text-xs text-text-secondary">
              <li className="font-medium text-text-primary">Chrome Installability</li>
              {debugStatus.chromeInstallBlockers.map((item) => (
                <li key={item}>• {item}</li>
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
          <AdminButton variant="primary" className="w-full" onClick={() => void handlePrimaryAction()}>
            {canInstall ? "Admin-App installieren" : "Installationshilfe öffnen"}
          </AdminButton>

          {canInstall ? (
            <AdminButton variant="secondary" className="w-full" onClick={openInstallHelp}>
              Installationshilfe öffnen
            </AdminButton>
          ) : null}

          <AdminButton
            variant="ghost"
            className="w-full"
            icon={<RefreshCw className="h-4 w-4" />}
            disabled={checking}
            onClick={() => void handleCheckStatus()}
          >
            {checking ? "Prüfe…" : "Installationsstatus prüfen"}
          </AdminButton>

          <AdminButton variant="ghost" className="w-full text-xs" onClick={resetInstallHints}>
            PWA-Installationsstatus zurücksetzen
          </AdminButton>
        </div>
      </div>

      <AdminPwaInstallHelpSheet
        open={helpOpen}
        onClose={closeInstallHelp}
        installGuide={installGuide}
        blockers={probeResult?.blockers ?? []}
        debugStatus={debugStatus}
        canInstall={canInstall}
        onInstall={() => void install()}
      />
    </>
  );
}
