import { Suspense } from "react";
import { adminDynamicView } from "@/lib/admin/dynamic-view";

const SettingsView = adminDynamicView(
  () => import("@/components/admin/views/SettingsView"),
  "SettingsView",
  "Einstellungen werden geladen…",
);

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-text-muted">Einstellungen werden geladen…</p>}>
      <SettingsView />
    </Suspense>
  );
}
