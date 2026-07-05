"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import type { SiteBusinessSettings, SiteSettingsBundle } from "@/lib/cms/types";

export function SettingsView() {
  const [debug, setDebug] = useState<{
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
  } | null>(null);
  const [business, setBusiness] = useState<SiteBusinessSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, withLoading } = useAdminUi();

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

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    if (res.ok) setBusiness((data.settings as SiteSettingsBundle).business);
  }, []);

  useEffect(() => {
    void loadDebug();
    void loadSettings();
  }, [loadDebug, loadSettings]);

  const saveBusiness = async () => {
    if (!business) return;
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "business", value: business }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast(data.message ?? "Unternehmensdaten gespeichert");
      })(),
    );
  };

  const setField = <K extends keyof SiteBusinessSettings>(key: K, value: SiteBusinessSettings[K]) => {
    if (!business) return;
    setBusiness({ ...business, [key]: value });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Einstellungen" description="Unternehmensdaten, Admin-Zugang und Systemhinweise." />

      {business ? (
        <AdminCard title="Unternehmensdaten">
          <p className="mb-4 text-sm text-text-muted">
            Diese Daten werden in allen PDFs und E-Mails für Angebote und Rechnungen verwendet.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Firmenname" required className="md:col-span-2">
              <input className="admin-input" value={business.companyName} onChange={(e) => setField("companyName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Logo-URL" hint="Wird in PDFs angezeigt" className="md:col-span-2">
              <input className="admin-input" value={business.logoUrl} onChange={(e) => setField("logoUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Adresse" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={business.address} onChange={(e) => setField("address", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Telefon">
              <input className="admin-input" value={business.phone} onChange={(e) => setField("phone", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="E-Mail" required>
              <input className="admin-input" type="email" value={business.email} onChange={(e) => setField("email", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Website">
              <input className="admin-input" value={business.website} onChange={(e) => setField("website", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Geschäftsführer">
              <input className="admin-input" value={business.managingDirector} onChange={(e) => setField("managingDirector", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="IBAN">
              <input className="admin-input" value={business.iban} onChange={(e) => setField("iban", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="BIC">
              <input className="admin-input" value={business.bic} onChange={(e) => setField("bic", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Bank">
              <input className="admin-input" value={business.bankName} onChange={(e) => setField("bankName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Steuernummer">
              <input className="admin-input" value={business.taxNumber} onChange={(e) => setField("taxNumber", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="USt-ID">
              <input className="admin-input" value={business.vatId} onChange={(e) => setField("vatId", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Zahlungsziel (Tage)">
              <input className="admin-input" type="number" min={1} value={business.defaultPaymentDays} onChange={(e) => setField("defaultPaymentDays", Number(e.target.value) || 14)} />
            </AdminFormField>
            <AdminFormField label="Absendername" required>
              <input className="admin-input" value={business.senderName} onChange={(e) => setField("senderName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Absender-E-Mail" required>
              <input className="admin-input" type="email" value={business.senderEmail} onChange={(e) => setField("senderEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Standard Angebotstext" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={business.defaultQuoteText} onChange={(e) => setField("defaultQuoteText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Standard Rechnungstext" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={business.defaultInvoiceText} onChange={(e) => setField("defaultInvoiceText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Zahlungshinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={business.defaultPaymentText} onChange={(e) => setField("defaultPaymentText", e.target.value)} />
            </AdminFormField>
          </div>
          <div className="mt-6">
            <AdminButton variant="primary" icon={<Save className="h-4 w-4" />} onClick={() => void saveBusiness()}>
              Unternehmensdaten speichern
            </AdminButton>
          </div>
        </AdminCard>
      ) : null}

      <AdminCard title="Zugang">
        <p className="text-sm text-text-secondary">
          Der Admin-Bereich ist durch <code className="rounded bg-bg-secondary px-1">ADMIN_PASSWORD</code> geschützt.
        </p>
      </AdminCard>

      <AdminCard title="CMS Debug">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-text-muted">Zeigt gespeicherte Supabase-Werte und öffentliche Vorschau.</p>
          <AdminButton variant="secondary" onClick={() => void loadDebug()} disabled={loading}>
            {loading ? "Lädt…" : "Aktualisieren"}
          </AdminButton>
        </div>

        {debug?.error ? <p className="text-sm font-medium text-accent-heart">{debug.error}</p> : null}

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
          </div>
        ) : null}
      </AdminCard>
    </div>
  );
}
