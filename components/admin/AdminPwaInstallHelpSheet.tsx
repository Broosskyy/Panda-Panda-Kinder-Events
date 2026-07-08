"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import {
  expectsBeforeInstallPrompt,
  type BrowserInstallGuide,
  type PwaBrowserInfo,
  type PwaDebugStatus,
  type PwaProbeResult,
} from "@/lib/admin/pwa-install";

interface AdminPwaInstallHelpSheetProps {
  open: boolean;
  onClose: () => void;
  installGuide: BrowserInstallGuide;
  blockers: string[];
  debugStatus?: PwaDebugStatus | null;
  canInstall?: boolean;
  onInstall?: () => void;
}

export function AdminPwaInstallHelpSheet({
  open,
  onClose,
  installGuide,
  blockers,
  debugStatus,
  canInstall = false,
  onInstall,
}: AdminPwaInstallHelpSheetProps) {
  const scrollLockY = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    if (!open) {
      root.removeAttribute("data-admin-pwa-help-sheet");
      return;
    }

    scrollLockY.current = window.scrollY;
    root.setAttribute("data-admin-pwa-help-sheet", "open");

    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockY.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      root.removeAttribute("data-admin-pwa-help-sheet");
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollLockY.current);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="admin-pwa-help-sheet-root" role="presentation">
      <button
        type="button"
        className="admin-pwa-help-sheet-backdrop"
        onClick={onClose}
        aria-label="Schließen"
      />
      <div
        className="admin-pwa-help-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-pwa-help-sheet-title"
      >
        <div className="admin-pwa-help-sheet-handle" aria-hidden />
        <header className="admin-pwa-help-sheet-header">
          <h2 id="admin-pwa-help-sheet-title" className="admin-pwa-help-sheet-title">
            Installationshilfe
          </h2>
          <button type="button" className="admin-icon-btn shrink-0" onClick={onClose} aria-label="Schließen">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="admin-pwa-help-sheet-body">
          {debugStatus?.causeMessage ? (
            <div
              className={`rounded-xl border p-3 text-sm ${
                debugStatus.detectedCause === "manual_install_path" ||
                debugStatus.detectedCause === "true_installable"
                  ? "border-[#c8e6d0] bg-[#f0faf3] text-[#1e4a2e]"
                  : "border-amber-200 bg-amber-50 text-amber-950"
              }`}
            >
              {debugStatus.causeMessage}
            </div>
          ) : !canInstall && installGuide.expectsNativePrompt ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              {installGuide.browserId === "chrome_android"
                ? "Chrome bietet aktuell keinen nativen Installationsdialog an — Status prüfen oder Seite neu laden."
                : "Aktuell kein nativer Installationsdialog — Status prüfen oder Anleitung befolgen."}
            </div>
          ) : null}

          <p className="mt-3 text-sm font-medium text-text-primary">{installGuide.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{installGuide.introduction}</p>

          {installGuide.showShortcutVsPwaNote ? (
            <>
              <p className="mt-4 text-sm font-medium text-text-primary">Echte PWA vs. Verknüpfung</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-text-secondary">
                <li>
                  <strong>App installieren</strong> = echte PWA (Vollbild, standalone, Service Worker aktiv)
                </li>
                <li>
                  <strong>Zum Startbildschirm hinzufügen</strong> = nur Verknüpfung im Browser —{" "}
                  <strong>keine</strong> echte PWA-Installation
                </li>
              </ul>
            </>
          ) : null}

          <p className="mt-4 text-sm text-text-secondary">So installierst du die Admin-App:</p>

          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
            {installGuide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          {installGuide.note ? (
            <p className="mt-3 text-xs leading-relaxed text-text-muted">{installGuide.note}</p>
          ) : null}

          {debugStatus ? (
            <details className="mt-4 rounded-xl border border-border bg-bg-secondary p-3 text-sm">
              <summary className="cursor-pointer font-medium text-text-primary">Technische Diagnose</summary>
              <PwaDebugDetails debug={debugStatus} className="mt-2" />
            </details>
          ) : null}

          {blockers.length > 0 ? (
            <div className="mt-4 rounded-xl border border-border bg-bg-secondary p-3 text-sm">
              <p className="font-medium text-text-primary">Hinweise</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-text-muted">
                {blockers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2">
            {canInstall && onInstall ? (
              <AdminButton variant="primary" className="w-full" onClick={onInstall}>
                Nativen Installationsdialog öffnen
              </AdminButton>
            ) : null}
            <AdminButton variant="secondary" className="w-full" onClick={onClose}>
              Schließen
            </AdminButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ProbeDetails({
  probeResult,
  browserInfo,
}: {
  probeResult: PwaProbeResult;
  browserInfo?: PwaBrowserInfo;
}) {
  const expectsPrompt = browserInfo ? expectsBeforeInstallPrompt(browserInfo) : true;
  const promptLabel = expectsPrompt ? "Echter Install-Prompt" : "Install-Prompt (Browser)";
  const promptValue = expectsPrompt
    ? probeResult.installPromptAvailable
      ? "OK"
      : "Fehlt"
    : "N/A — manuell";

  const rows: { label: string; value: string; ok?: boolean }[] = [
    {
      label: "Manifest",
      value: probeResult.manifestLoaded && probeResult.manifestValid ? "OK" : "Fehlt",
      ok: probeResult.manifestLoaded && probeResult.manifestValid,
    },
    {
      label: "Service Worker aktiv",
      value: probeResult.serviceWorkerActive ? "OK" : browserInfo?.installMethod === "manual_ios" ? "Optional" : "Fehlt",
      ok: probeResult.serviceWorkerActive || browserInfo?.installMethod === "manual_ios",
    },
    {
      label: "SW kontrolliert /admin",
      value: probeResult.serviceWorkerControlling
        ? "OK"
        : browserInfo?.installMethod === "manual_ios"
          ? "Optional"
          : "Fehlt",
      ok: probeResult.serviceWorkerControlling || browserInfo?.installMethod === "manual_ios",
    },
    {
      label: "Icons 192/512",
      value: probeResult.icons192Ok && probeResult.icons512Ok ? "OK" : "Fehlt",
      ok: probeResult.icons192Ok && probeResult.icons512Ok,
    },
    {
      label: "Maskable Icons",
      value: probeResult.iconsMaskable192Ok && probeResult.iconsMaskable512Ok ? "OK" : "Fehlt",
      ok: probeResult.iconsMaskable192Ok && probeResult.iconsMaskable512Ok,
    },
    {
      label: "HTTPS",
      value: probeResult.https ? "OK" : "Fehlt",
      ok: probeResult.https,
    },
    { label: promptLabel, value: promptValue, ok: expectsPrompt ? probeResult.installPromptAvailable : true },
  ];

  return (
    <ul className="mt-2 space-y-1 text-xs text-text-muted">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center justify-between gap-2">
          <span>{row.label}</span>
          <span
            className={
              row.value.startsWith("N/A") || row.value === "Optional"
                ? "text-text-secondary"
                : row.ok
                  ? "text-[#2d5a3a]"
                  : "text-amber-700"
            }
          >
            {row.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function yesNo(value: boolean) {
  return value ? "ja" : "nein";
}

export function PwaDebugDetails({ debug, className = "" }: { debug: PwaDebugStatus; className?: string }) {
  const rows: { label: string; value: string }[] = [
    { label: "Manifest erreichbar", value: yesNo(debug.manifestReachable) },
    { label: "Service Worker registriert", value: yesNo(debug.serviceWorkerRegistered) },
    { label: "SW kontrolliert Seite", value: yesNo(debug.serviceWorkerControlling) },
    { label: "HTTPS", value: yesNo(debug.https) },
    { label: "Icons erreichbar", value: yesNo(debug.iconsReachable) },
    { label: "display-mode standalone", value: yesNo(debug.displayModeStandalone) },
    { label: "beforeinstallprompt gefeuert", value: yesNo(debug.beforeInstallPromptFired) },
    { label: "deferredPrompt gespeichert", value: yesNo(debug.deferredPromptStored) },
    { label: "appinstalled gefeuert", value: yesNo(debug.appInstalledFired) },
    { label: "Install-Hinweis ausgeblendet", value: yesNo(debug.installDismissedLocal) },
    { label: "Browser", value: debug.browserProfile },
    { label: "Route", value: debug.currentRoute },
    { label: "start_url", value: debug.startUrl },
    { label: "scope", value: debug.scope },
    { label: "Install-Modus", value: debug.installMode },
  ];

  return (
    <ul className={`space-y-1 text-xs text-text-muted ${className}`.trim()}>
      {rows.map((row) => (
        <li key={row.label} className="flex items-start justify-between gap-3">
          <span className="text-text-secondary">{row.label}</span>
          <span className="text-right font-medium text-text-primary">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}
