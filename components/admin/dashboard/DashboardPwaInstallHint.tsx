"use client";

import { useAdminPwa } from "@/components/admin/AdminPwaProvider";
import { AdminButton } from "@/components/admin/ui";

/** Re-open PWA install card from dashboard help section. */
export function DashboardPwaInstallHint() {
  const { isInstalled, sessionClosed, reopenInstallCard, openInstallHelp } = useAdminPwa();

  if (isInstalled) return null;

  return (
    <AdminButton
      variant="ghost"
      className="text-xs"
      onClick={sessionClosed ? reopenInstallCard : openInstallHelp}
    >
      Admin-App installieren
    </AdminButton>
  );
}
