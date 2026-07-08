"use client";

import { useAdminPwa } from "@/components/admin/AdminPwaProvider";

/** Subtle hint when native install prompt is not yet available. */
export function DashboardPwaInstallHint() {
  const { isInstalled, dismissed, canInstall, showIosGuide } = useAdminPwa();

  if (isInstalled || dismissed || canInstall || showIosGuide) return null;

  return (
    <p className="text-xs text-text-muted">
      Installation über das Browser-Menü möglich, sobald dein Gerät es unterstützt.
    </p>
  );
}
