"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";

interface AdminPwaInstallHelpSheetProps {
  open: boolean;
  onClose: () => void;
  showIosGuide: boolean;
  probeIssues: string[];
}

export function AdminPwaInstallHelpSheet({
  open,
  onClose,
  showIosGuide,
  probeIssues,
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
    document.addEventListener("keydown", onKeyDown);

    return () => {
      root.removeAttribute("data-admin-pwa-help-sheet");
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollLockY.current);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="admin-pwa-help-sheet-root" role="presentation">
      <button
        type="button"
        className="admin-pwa-help-sheet-backdrop"
        aria-label="Hilfe schließen"
        onClick={onClose}
      />
      <div
        className="admin-pwa-help-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-pwa-help-title"
      >
        <div className="admin-pwa-help-sheet-handle" aria-hidden />
        <div className="admin-pwa-help-sheet-header">
          <h2 id="admin-pwa-help-title" className="admin-pwa-help-sheet-title">
            Installationshilfe
          </h2>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Schließen">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="admin-pwa-help-sheet-body">
          <p className="text-sm text-text-secondary">
            Dein Browser meldet aktuell keine installierbare App. So kannst du die Admin-App trotzdem
            hinzufügen:
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
            </ol>
          )}

          {probeIssues.length > 0 ? (
            <div className="mt-4 rounded-xl border border-border bg-bg-secondary/50 p-3 text-sm">
              <p className="font-medium text-text-primary">Technische Hinweise</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-text-muted">
                {probeIssues.includes("manifest_missing") ? <li>Manifest nicht erreichbar</li> : null}
                {probeIssues.includes("manifest_invalid") ? <li>Manifest unvollständig</li> : null}
                {probeIssues.includes("service_worker_missing") ? <li>Service Worker nicht registriert</li> : null}
                {probeIssues.includes("service_worker_inactive") ? (
                  <li>Service Worker noch nicht aktiv — Seite neu laden</li>
                ) : null}
                {probeIssues.includes("icons_missing") ? <li>App-Icons nicht erreichbar</li> : null}
                {probeIssues.includes("offline_missing") ? <li>Offline-Vorbereitung fehlt</li> : null}
                {probeIssues.includes("https_required") ? <li>HTTPS erforderlich</li> : null}
              </ul>
            </div>
          ) : null}

          <AdminButton variant="secondary" className="mt-4 w-full" onClick={onClose}>
            Schließen
          </AdminButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
