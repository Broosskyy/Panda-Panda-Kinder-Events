"use client";

import { AdminCard } from "@/components/admin/AdminSidebar";
import { AdminButton } from "@/components/admin/ui";
import { AdminPwaInstallPanel } from "@/components/admin/AdminPwaInstallPanel";
import { useAdminPwa } from "@/components/admin/AdminPwaProvider";

export function AdminAppSettingsCard() {
  const { isInstalled, sessionClosed, reopenInstallCard } = useAdminPwa();

  return (
    <AdminCard title="Admin-App" compact>
      <AdminPwaInstallPanel />
      {!isInstalled && sessionClosed ? (
        <div className="mt-3 border-t border-border pt-3">
          <AdminButton variant="ghost" onClick={reopenInstallCard}>
            Installationskarte erneut anzeigen
          </AdminButton>
        </div>
      ) : null}
    </AdminCard>
  );
}
