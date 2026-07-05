"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save, Send } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import type { SiteBusinessSettings, SiteEmailSettings, SiteSettingsBundle } from "@/lib/cms/types";

interface EmailStatusResponse {
  resendConfigured: boolean;
  domain: { status: string; domain: string | null; message: string };
  resolved: { from: string; replyTo: string; usesTestDomain: boolean; domainStatus: string };
}

const DOMAIN_STATUS_LABELS: Record<string, string> = {
  test: "Resend-Testdomain",
  verified: "Domain verifiziert",
  pending: "Verifizierung ausstehend",
  failed: "Verifizierung fehlgeschlagen",
  not_configured: "Nicht konfiguriert",
};

export function SettingsView() {
  const [debug, setDebug] = useState<{
    configured: boolean;
    fetchedAt: string;
    siteSettings?: { key: string; updated_at: string }[];
    counts?: Record<string, number>;
    error?: string;
  } | null>(null);
  const [business, setBusiness] = useState<SiteBusinessSettings | null>(null);
  const [email, setEmail] = useState<SiteEmailSettings | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatusResponse | null>(null);
  const [testTo, setTestTo] = useState("");
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
    if (res.ok) {
      const settings = data.settings as SiteSettingsBundle;
      setBusiness(settings.business);
      setEmail(settings.email);
    }
  }, []);

  const loadEmailStatus = useCallback(async () => {
    const res = await fetch("/api/admin/email/status");
    const data = await res.json();
    if (res.ok) setEmailStatus(data);
  }, []);

  useEffect(() => {
    void loadDebug();
    void loadSettings();
    void loadEmailStatus();
  }, [loadDebug, loadSettings, loadEmailStatus]);

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

  const saveEmail = async () => {
    if (!email) return;
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "email", value: email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast("E-Mail-Einstellungen gespeichert");
        await loadEmailStatus();
      })(),
    );
  };

  const sendTest = async () => {
    if (!testTo.trim()) return toast("Bitte Empfänger-Adresse eingeben", "error");
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/email/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: testTo.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Versand fehlgeschlagen");
        toast(data.message ?? "Test-E-Mail gesendet");
      })(),
    );
  };

  const setBusinessField = <K extends keyof SiteBusinessSettings>(key: K, value: SiteBusinessSettings[K]) => {
    if (!business) return;
    setBusiness({ ...business, [key]: value });
  };

  const setEmailField = <K extends keyof SiteEmailSettings>(key: K, value: SiteEmailSettings[K]) => {
    if (!email) return;
    setEmail({ ...email, [key]: value });
  };

  const usesTestDomain = emailStatus?.resolved.usesTestDomain ?? true;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Einstellungen" description="E-Mail, Unternehmensdaten, Admin-Zugang und Systemhinweise." />

      {email ? (
        <AdminCard title="E-Mail">
          {usesTestDomain ? (
            <div className="mb-4 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>Resend-Testdomain aktiv.</strong> Momentan wird die Resend-Testdomain verwendet.
              Nach der Verifizierung einer eigenen Domain werden alle E-Mails automatisch über Ihre Firmenadresse versendet.
            </div>
          ) : (
            <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-text-primary">
              <strong>Eigene Domain aktiv.</strong> E-Mails werden über{" "}
              <code className="rounded bg-bg-secondary px-1">{emailStatus?.resolved.from}</code> versendet.
            </div>
          )}

          {!emailStatus?.resendConfigured ? (
            <p className="mb-4 text-sm text-accent-heart">
              <strong>RESEND_API_KEY</strong> ist nicht gesetzt — E-Mail-Versand ist deaktiviert.
            </p>
          ) : null}

          <div className="mb-4 rounded-xl border border-border bg-bg-secondary/50 p-4 text-sm">
            <p className="font-semibold text-text-primary">Resend Domain Status</p>
            <p className="mt-1 text-text-secondary">
              {DOMAIN_STATUS_LABELS[emailStatus?.domain.status ?? "not_configured"] ?? "Unbekannt"}
              {emailStatus?.domain.domain ? ` — ${emailStatus.domain.domain}` : ""}
            </p>
            <p className="mt-1 text-text-muted">{emailStatus?.domain.message ?? "Status wird geladen…"}</p>
            <p className="mt-2 text-text-secondary">
              Aktueller Absender: <strong>{emailStatus?.resolved.from ?? "—"}</strong>
            </p>
            <p className="text-text-secondary">
              Reply-To: <strong>{emailStatus?.resolved.replyTo ?? "—"}</strong>
            </p>
            <AdminButton variant="secondary" className="mt-3" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadEmailStatus()}>
              Domain-Status prüfen
            </AdminButton>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Firmenname" required className="md:col-span-2">
              <input className="admin-input" value={email.companyName} onChange={(e) => setEmailField("companyName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Absendername" required hint="Wird im From-Feld angezeigt">
              <input className="admin-input" value={email.senderName} onChange={(e) => setEmailField("senderName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Absender-E-Mail" required hint="z. B. info@panda-bande-events.de">
              <input className="admin-input" type="email" value={email.senderEmail} onChange={(e) => setEmailField("senderEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Reply-To-Adresse" required className="md:col-span-2">
              <input className="admin-input" type="email" value={email.replyTo} onChange={(e) => setEmailField("replyTo", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Benachrichtigungs-E-Mail" hint="Anfragen & Kopien (CRM)" className="md:col-span-2">
              <input className="admin-input" type="email" value={email.notificationEmail} onChange={(e) => setEmailField("notificationEmail", e.target.value)} />
            </AdminFormField>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <AdminButton variant="primary" icon={<Save className="h-4 w-4" />} onClick={() => void saveEmail()}>
              E-Mail-Einstellungen speichern
            </AdminButton>
          </div>

          <p className="mt-4 text-xs text-text-muted">
            Ausführliche Anleitung: <code className="rounded bg-bg-secondary px-1">docs/EMAIL_SETUP.md</code> (Resend, DNS, Domainwechsel)
          </p>

          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-3 text-sm font-semibold text-text-primary">Test-E-Mail senden</p>
            <div className="flex flex-wrap gap-2">
              <input
                className="admin-input min-w-[16rem] flex-1"
                type="email"
                placeholder="empfaenger@beispiel.de"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
              />
              <AdminButton variant="secondary" icon={<Send className="h-4 w-4" />} onClick={() => void sendTest()} disabled={!emailStatus?.resendConfigured}>
                Test-E-Mail senden
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      ) : null}

      {business ? (
        <AdminCard title="Unternehmensdaten">
          <p className="mb-4 text-sm text-text-muted">Diese Daten werden in PDFs für Angebote und Rechnungen verwendet.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Firmenname" required className="md:col-span-2">
              <input className="admin-input" value={business.companyName} onChange={(e) => setBusinessField("companyName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Logo-URL" hint="Wird in PDFs angezeigt" className="md:col-span-2">
              <input className="admin-input" value={business.logoUrl} onChange={(e) => setBusinessField("logoUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Adresse" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={business.address} onChange={(e) => setBusinessField("address", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Telefon">
              <input className="admin-input" value={business.phone} onChange={(e) => setBusinessField("phone", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="E-Mail" required>
              <input className="admin-input" type="email" value={business.email} onChange={(e) => setBusinessField("email", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Website">
              <input className="admin-input" value={business.website} onChange={(e) => setBusinessField("website", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Geschäftsführer">
              <input className="admin-input" value={business.managingDirector} onChange={(e) => setBusinessField("managingDirector", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="IBAN">
              <input className="admin-input" value={business.iban} onChange={(e) => setBusinessField("iban", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="BIC">
              <input className="admin-input" value={business.bic} onChange={(e) => setBusinessField("bic", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Bank">
              <input className="admin-input" value={business.bankName} onChange={(e) => setBusinessField("bankName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Steuernummer">
              <input className="admin-input" value={business.taxNumber} onChange={(e) => setBusinessField("taxNumber", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="USt-ID">
              <input className="admin-input" value={business.vatId} onChange={(e) => setBusinessField("vatId", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Zahlungsziel (Tage)">
              <input className="admin-input" type="number" min={1} value={business.defaultPaymentDays} onChange={(e) => setBusinessField("defaultPaymentDays", Number(e.target.value) || 14)} />
            </AdminFormField>
            <AdminFormField label="Standard Angebotstext" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={business.defaultQuoteText} onChange={(e) => setBusinessField("defaultQuoteText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Standard Rechnungstext" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={business.defaultInvoiceText} onChange={(e) => setBusinessField("defaultInvoiceText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Zahlungshinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={business.defaultPaymentText} onChange={(e) => setBusinessField("defaultPaymentText", e.target.value)} />
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
          E-Mail-Versand erfordert <code className="rounded bg-bg-secondary px-1">RESEND_API_KEY</code> in den Umgebungsvariablen.
        </p>
      </AdminCard>

      <AdminCard title="CMS Debug">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-text-muted">Zeigt gespeicherte Supabase-Werte.</p>
          <AdminButton variant="secondary" onClick={() => void loadDebug()} disabled={loading}>
            {loading ? "Lädt…" : "Aktualisieren"}
          </AdminButton>
        </div>
        {debug?.error ? <p className="text-sm font-medium text-accent-heart">{debug.error}</p> : null}
        {debug && !debug.error && debug.siteSettings?.length ? (
          <ul className="space-y-1 text-sm text-text-secondary">
            {debug.siteSettings.map((row) => (
              <li key={row.key}>
                <strong>{row.key}</strong> — {new Date(row.updated_at).toLocaleString("de-DE")}
              </li>
            ))}
          </ul>
        ) : null}
      </AdminCard>
    </div>
  );
}
