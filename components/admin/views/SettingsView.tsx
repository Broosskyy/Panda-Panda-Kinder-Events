"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";

interface DebugSnapshot {
  configured: boolean;
  fetchedAt: string;
  siteSettings?: { key: string; updated_at: string }[];
  counts?: Record<string, number>;
  publicPreview?: {
    aboutIntro: string;
    contactPhone: string;
    galleryImages: number;
    publishedPosts: string[];
  };
  error?: string;
}

export function SettingsView() {
  const [debug, setDebug] = useState<DebugSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDebug = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/debug");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Debug-Laden fehlgeschlagen");
      setDebug(data);
    } catch (err) {
      setDebug({
        configured: false,
        fetchedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Unbekannter Fehler",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDebug();
  }, [loadDebug]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Einstellungen" description="Admin-Zugang, Systemhinweise und CMS-Debug." />

      <AdminCard title="Zugang">
        <p className="text-sm text-text-secondary">
          Der Admin-Bereich ist durch <code className="rounded bg-bg-secondary px-1">ADMIN_PASSWORD</code> geschützt.
        </p>
      </AdminCard>

      <AdminCard title="CMS Debug">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-text-muted">Zeigt gespeicherte Supabase-Werte und öffentliche Vorschau.</p>
          <button type="button" className="admin-btn-secondary" onClick={() => void loadDebug()} disabled={loading}>
            {loading ? "Lädt…" : "Aktualisieren"}
          </button>
        </div>

        {debug?.error ? (
          <p className="text-sm font-medium text-accent-heart">{debug.error}</p>
        ) : null}

        {debug && !debug.error ? (
          <div className="space-y-4 text-sm">
            <p className="text-text-muted">Stand: {new Date(debug.fetchedAt).toLocaleString("de-DE")}</p>

            {debug.siteSettings?.length ? (
              <div>
                <p className="font-semibold text-text-primary">Gespeicherte Sektionen</p>
                <ul className="mt-2 space-y-1 text-text-secondary">
                  {debug.siteSettings.map((row) => (
                    <li key={row.key}>
                      <strong>{row.key}</strong> — zuletzt {new Date(row.updated_at).toLocaleString("de-DE")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-text-muted">Noch keine Website-Inhalte in site_settings gespeichert.</p>
            )}

            {debug.counts ? (
              <div>
                <p className="font-semibold text-text-primary">Datenbank-Zähler</p>
                <ul className="mt-2 grid gap-1 text-text-secondary sm:grid-cols-2">
                  <li>Leistungen: {debug.counts.services}</li>
                  <li>FAQ: {debug.counts.faqs}</li>
                  <li>Galerie: {debug.counts.gallery}</li>
                  <li>Veröffentlichte Beiträge: {debug.counts.publishedPosts}</li>
                  <li>Freigegebene Bewertungen: {debug.counts.approvedReviews}</li>
                </ul>
              </div>
            ) : null}

            {debug.publicPreview ? (
              <div>
                <p className="font-semibold text-text-primary">Öffentliche Vorschau (Server-Fetch)</p>
                <ul className="mt-2 space-y-1 text-text-secondary">
                  <li>Über-uns Intro: {debug.publicPreview.aboutIntro}</li>
                  <li>Telefon: {debug.publicPreview.contactPhone}</li>
                  <li>Galerie-Bilder sichtbar: {debug.publicPreview.galleryImages}</li>
                  <li>Beiträge: {debug.publicPreview.publishedPosts.join(", ") || "—"}</li>
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </AdminCard>

      <AdminCard title="Hilfe">
        <p className="text-sm text-text-secondary">
          Anleitung: <code className="rounded bg-bg-secondary px-1">CMS_ADMIN_GUIDE.md</code>
        </p>
      </AdminCard>
    </div>
  );
}
