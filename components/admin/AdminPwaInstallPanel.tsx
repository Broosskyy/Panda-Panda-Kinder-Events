"use client";

import { Smartphone } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { useAdminPwa } from "@/components/admin/AdminPwaProvider";

interface AdminPwaInstallPanelProps {
  compact?: boolean;
  showTitle?: boolean;
}

export function AdminPwaInstallPanel({ compact = false, showTitle = true }: AdminPwaInstallPanelProps) {
  const {
    canInstall,
    showIosGuide,
    showAndroidGuide,
    showUnsupportedGuide,
    isInstalled,
    install,
    checkInstallStatus,
    debugStatus,
  } = useAdminPwa();

  if (isInstalled) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#2d5a3a]">Installiert</p>
        <p className="text-sm text-text-muted">
          Die Admin-App läuft im Vollbildmodus auf diesem Gerät.
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {showTitle ? (
        <div className="flex items-start gap-3">
          <div className="admin-pwa-install-card-icon" aria-hidden>
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold text-text-primary">Admin-App installieren</h3>
            <p className="mt-1 text-sm text-text-muted">
              Installiere den Adminbereich als App auf deinem Gerät — schneller Zugriff, Vollbild, Offline-Vorbereitung.
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-bg-secondary/40 p-3 text-sm">
        <p className="font-medium text-text-primary">Installationsstatus</p>
        <p className="mt-1 text-text-muted">
          {debugStatus?.standalone
            ? "Installiert (Standalone)"
            : canInstall
              ? "Bereit zur Installation"
              : showIosGuide
                ? "Manuelle Installation (iOS)"
                : "Nicht installiert"}
        </p>
      </div>

      {showIosGuide ? (
        <div className="space-y-2 rounded-xl border border-border bg-bg-card p-3 text-sm text-text-secondary">
          <p className="font-medium text-text-primary">Installation auf iPhone/iPad</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Safari öffnen und diese Seite aufrufen</li>
            <li><strong>Teilen</strong> antippen (Quadrat mit Pfeil)</li>
            <li><strong>Zum Home-Bildschirm</strong> wählen</li>
            <li><strong>Hinzufügen</strong> bestätigen</li>
          </ol>
        </div>
      ) : canInstall ? (
        <AdminButton variant="primary" onClick={() => void install()}>
          App installieren
        </AdminButton>
      ) : showAndroidGuide ? (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Falls kein Installationsfenster erscheint: Chrome-Menü ⋮ → <strong>App installieren</strong>
          </p>
          <AdminButton variant="secondary" onClick={() => void checkInstallStatus()}>
            Installationsstatus prüfen
          </AdminButton>
        </div>
      ) : showUnsupportedGuide ? (
        <p className="text-sm text-text-secondary">
          Dein Browser unterstützt keine direkte App-Installation. Nutze Chrome auf Android oder Safari auf iOS,
          oder öffne den Adminbereich als Lesezeichen.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Chrome-Menü ⋮ → <strong>App installieren</strong> (Desktop oder Android)
          </p>
          <AdminButton variant="secondary" onClick={() => void checkInstallStatus()}>
            Installationsstatus prüfen
          </AdminButton>
        </div>
      )}
    </div>
  );
}
