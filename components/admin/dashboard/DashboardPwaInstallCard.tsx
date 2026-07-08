"use client";

import { Smartphone, X } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/AdminLayout";
import { AdminPwaInstallPanel } from "@/components/admin/AdminPwaInstallPanel";
import { useAdminPwa } from "@/components/admin/AdminPwaProvider";

export function DashboardPwaInstallCard() {
  const { showInstallCard, closeCard, dontShowAgain } = useAdminPwa();

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
              onClick={closeCard}
              aria-label="Hinweis schließen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <AdminPwaInstallPanel compact showTitle={false} />
          <button
            type="button"
            className="mt-3 text-xs text-text-muted underline hover:text-text-secondary"
            onClick={dontShowAgain}
          >
            Nicht mehr anzeigen
          </button>
        </div>
      </div>
    </AdminCard>
  );
}
