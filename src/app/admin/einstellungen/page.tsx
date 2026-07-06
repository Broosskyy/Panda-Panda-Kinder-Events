import { Suspense } from "react";
import { SettingsView } from "@/components/admin/views/SettingsView";

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-text-muted">Einstellungen werden geladen…</p>}>
      <SettingsView />
    </Suspense>
  );
}
