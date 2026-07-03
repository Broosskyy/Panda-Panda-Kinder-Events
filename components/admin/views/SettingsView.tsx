"use client";

import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";

export function SettingsView() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Einstellungen" description="Admin-Zugang und Systemhinweise." />
      <AdminCard title="Zugang">
        <p className="text-sm text-slate-600">
          Der Admin-Bereich ist durch das Umgebungsvariable <code className="rounded bg-slate-100 px-1">ADMIN_PASSWORD</code> geschützt.
          Änderungen am Passwort erfolgen in der Hosting-Umgebung (z.&nbsp;B. Vercel).
        </p>
      </AdminCard>
      <AdminCard title="Speicher & Bilder">
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>Galerie: Bucket <strong>gallery</strong></li>
          <li>Bewertungen: Bucket <strong>reviews</strong></li>
          <li>Website-Assets: Bucket <strong>site-assets</strong></li>
          <li>Erlaubte Formate: JPG, PNG, WebP (max. 5 MB)</li>
        </ul>
      </AdminCard>
      <AdminCard title="Hilfe">
        <p className="text-sm text-slate-600">
          Eine ausführliche Anleitung finden Sie in <code className="rounded bg-slate-100 px-1">CMS_ADMIN_GUIDE.md</code> im Projekt.
        </p>
      </AdminCard>
    </div>
  );
}
