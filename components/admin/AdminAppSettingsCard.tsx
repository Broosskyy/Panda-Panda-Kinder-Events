"use client";

import { Smartphone } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminSidebar";
import { AdminButton } from "@/components/admin/ui";
import { AdminPwaInstallPanel } from "@/components/admin/AdminPwaInstallPanel";
import { useAdminPwa } from "@/components/admin/AdminPwaProvider";

export function AdminAppSettingsCard() {
  const { isInstalled, showInstallHelp, reopenInstallCard, hiddenPermanently } = useAdminPwa();

  return (
    <AdminCard title="Admin-App" compact>
      <AdminPwaInstallPanel />
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        {!isInstalled ? (
          <AdminButton variant="secondary" icon={<Smartphone className="h-4 w-4" />} onClick={showInstallHelp}>
            Installationshilfe anzeigen
          </AdminButton>
        ) : null}
        {!isInstalled && hiddenPermanently ? (
          <AdminButton variant="ghost" onClick={reopenInstallCard}>
            Installationskarte erneut anzeigen
          </AdminButton>
        ) : null}
        {isInstalled ? (
          <AdminButton variant="ghost" onClick={showInstallHelp}>
            App erneut installieren
          </AdminButton>
        ) : null}
      </div>
    </AdminCard>
  );
}
