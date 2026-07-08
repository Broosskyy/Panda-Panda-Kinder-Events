"use client";

import { Smartphone, X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { AdminCard } from "@/components/admin/ui/AdminLayout";
import { useAdminPwa } from "@/components/admin/AdminPwaProvider";

export function DashboardPwaInstallCard() {
  const {
    canInstall,
    showIosGuide,
    showManualGuide,
    showInstallCard,
    install,
    dismiss,
    checkInstallStatus,
    installHelpVisible,
  } = useAdminPwa();

  if (!showInstallCard) return null;

  return (
    <AdminCard compact className="admin-pwa-install-card">
      <div className="flex items-start gap-3">
        <div className="admin-pwa-install-card-icon" aria-hidden>
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-heading text-base font-semibold text-text-primary">Admin-App installieren</h2>
            <button
              type="button"
              className="admin-icon-btn shrink-0"
              onClick={dismiss}
              aria-label="Hinweis ausblenden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Installiere den Adminbereich als App auf deinem Handy.
          </p>

          {showIosGuide ? (
            <p className="mt-2 text-sm text-text-secondary">
              Auf dem iPhone: <strong>Teilen</strong> → <strong>Zum Home-Bildschirm</strong>
            </p>
          ) : canInstall ? (
            <div className="mt-3">
              <AdminButton variant="primary" onClick={() => void install()}>
                App installieren
              </AdminButton>
            </div>
          ) : showManualGuide || installHelpVisible ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-text-secondary">
                Falls kein Installationsfenster erscheint: Chrome-Menü ⋮ → <strong>App installieren</strong>.
              </p>
              <p className="text-xs text-text-muted">
                Öffne das Chrome-Menü oben rechts und wähle „App installieren“.
              </p>
              <AdminButton variant="secondary" onClick={() => void checkInstallStatus()}>
                Installationsstatus prüfen
              </AdminButton>
            </div>
          ) : (
            <div className="mt-3">
              <AdminButton variant="secondary" onClick={() => void checkInstallStatus()}>
                Installationsstatus prüfen
              </AdminButton>
            </div>
          )}
        </div>
      </div>
    </AdminCard>
  );
}
