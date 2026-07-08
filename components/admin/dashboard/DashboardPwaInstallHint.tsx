"use client";

import { useAdminPwa } from "@/components/admin/AdminPwaProvider";
import { AdminButton } from "@/components/admin/ui";

/** Re-open PWA install card from dashboard help section. */
export function DashboardPwaInstallHint() {
  const { isInstalled, showInstallHelp } = useAdminPwa();

  if (isInstalled) return null;

  return (
    <AdminButton variant="ghost" className="text-xs" onClick={showInstallHelp}>
      Admin-App installieren
    </AdminButton>
  );
}
