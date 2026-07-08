"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import type { PwaProbeResult } from "@/lib/admin/pwa-install";

interface AdminPwaInstallHelpSheetProps {
  open: boolean;
  onClose: () => void;
  showIosGuide: boolean;
  blockers: string[];
}

export function AdminPwaInstallHelpSheet({
  open,
  onClose,
  showIosGuide,
  blockers,
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
          <p className="text-sm text-text-secondary">
            So fügst du die Admin-App auf deinem Gerät hinzu:
          </p>

          {showIosGuide ? (
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
              <li>Safari öffnen und den Adminbereich aufrufen</li>
              <li>
                <strong>Teilen</strong> antippen (Quadrat mit Pfeil)
              </li>
              <li>
                <strong>Zum Home-Bildschirm</strong> wählen
              </li>
              <li>
                <strong>Hinzufügen</strong> bestätigen
              </li>
            </ol>
          ) : (
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
              <li>Chrome-Menü ⋮ oben rechts öffnen</li>
              <li>
                <strong>App installieren</strong> oder <strong>Zum Startbildschirm hinzufügen</strong> wählen
              </li>
              <li>Installation bestätigen</li>
              <li>Falls die Option fehlt: Seite einmal neu laden und erneut prüfen</li>
            </ol>
          )}

          {blockers.length > 0 ? (
            <div className="mt-4 rounded-xl border border-border bg-bg-secondary/50 p-3 text-sm">
              <p className="font-medium text-text-primary">Diagnose</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-text-muted">
                {blockers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <AdminButton variant="primary" className="mt-4 w-full" onClick={onClose}>
            OK
          </AdminButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ProbeDetails({ probeResult }: { probeResult: PwaProbeResult }) {
  const rows: { label: string; ok: boolean }[] = [
    { label: "Manifest", ok: probeResult.manifestLoaded && probeResult.manifestValid },
    { label: "Service Worker aktiv", ok: probeResult.serviceWorkerActive },
    { label: "SW kontrolliert Seite", ok: probeResult.serviceWorkerControlling },
    { label: "Icons 192/512", ok: probeResult.icons192Ok && probeResult.icons512Ok },
    { label: "HTTPS", ok: probeResult.https },
    { label: "Install-Prompt", ok: probeResult.installPromptAvailable },
  ];

  return (
    <ul className="mt-2 space-y-1 text-xs text-text-muted">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center justify-between gap-2">
          <span>{row.label}</span>
          <span className={row.ok ? "text-[#2d5a3a]" : "text-amber-700"}>{row.ok ? "OK" : "Fehlt"}</span>
        </li>
      ))}
    </ul>
  );
}
