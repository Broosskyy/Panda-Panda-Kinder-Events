"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RefreshCw, Save, Send } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { CONTROL_CENTER_TABS, type ControlCenterTab } from "@/lib/cms/settings-compat";
import { formatDocumentNumberPreview, resolvePublicSiteUrl } from "@/lib/cms/resolve-settings";
import type {
  SiteBankSettings,
  SiteBrandingSettings,
  SiteBusinessSettings,
  SiteContactSettings,
  SiteEmailCustomAddresses,
  SiteEmailSettings,
  SiteInvoiceSettings,
  SiteLegalSettings,
  SiteSeoSettings,
  SiteSettingsBundle,
} from "@/lib/cms/types";
import type { SystemStatusItem, SystemStatusLevel } from "@/lib/admin/system-status";

interface EmailStatusResponse {
  resendConfigured: boolean;
  domain: { status: string; domain: string | null; message: string };
  resolved: { from: string; replyTo: string; usesTestDomain: boolean; domainStatus: string };
}

interface SystemStatusResponse {
  items: SystemStatusItem[];
  summary: { ok: number; warn: number; error: number };
}

const VALID_TABS = new Set<string>(CONTROL_CENTER_TABS.map((t) => t.id));

const DOMAIN_STATUS_LABELS: Record<string, string> = {
  test: "Resend-Testdomain",
  verified: "Domain verifiziert",
  pending: "Verifizierung ausstehend",
  failed: "Verifizierung fehlgeschlagen",
  not_configured: "Nicht konfiguriert",
};

const CUSTOM_ADDRESS_LABELS: { key: keyof SiteEmailCustomAddresses; label: string }[] = [
  { key: "info", label: "info@" },
  { key: "kontakt", label: "kontakt@" },
  { key: "rechnung", label: "rechnung@" },
  { key: "angebote", label: "angebote@" },
];

const SYSTEM_LEVEL_VARIANT: Record<SystemStatusLevel, "success" | "warning" | "danger"> = {
  ok: "success",
  warn: "warning",
  error: "danger",
};

const SYSTEM_LEVEL_LABEL: Record<SystemStatusLevel, string> = {
  ok: "OK",
  warn: "Hinweis",
  error: "Fehler",
};

function tabHref(id: ControlCenterTab): string {
  return id === "business" ? "/admin/einstellungen" : `/admin/einstellungen?tab=${id}`;
}

function StickySaveBar({ label, onSave }: { label: string; onSave: () => void }) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border bg-bg-card p-4">
      <AdminButton variant="primary" icon={<Save className="h-4 w-4" />} onClick={onSave}>
        {label}
      </AdminButton>
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <p className="mb-3 mt-6 border-t border-border pt-6 text-sm font-semibold text-text-primary">{children}</p>;
}

export function SettingsView() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "business";
  const tab: ControlCenterTab = VALID_TABS.has(rawTab) ? (rawTab as ControlCenterTab) : "business";

  const [business, setBusiness] = useState<SiteBusinessSettings | null>(null);
  const [branding, setBranding] = useState<SiteBrandingSettings | null>(null);
  const [contact, setContact] = useState<SiteContactSettings | null>(null);
  const [email, setEmail] = useState<SiteEmailSettings | null>(null);
  const [invoice, setInvoice] = useState<SiteInvoiceSettings | null>(null);
  const [bank, setBank] = useState<SiteBankSettings | null>(null);
  const [seo, setSeo] = useState<SiteSeoSettings | null>(null);
  const [legal, setLegal] = useState<SiteLegalSettings | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatusResponse | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");
  const { toast, withLoading } = useAdminUi();

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    if (res.ok) {
      const settings = data.settings as SiteSettingsBundle;
      setBusiness(settings.business);
      setBranding(settings.branding);
      setContact(settings.contact);
      setEmail(settings.email);
      setInvoice(settings.invoice);
      setBank(settings.bank);
      setSeo(settings.seo);
      setLegal(settings.legal);
    }
  }, []);

  const loadEmailStatus = useCallback(async () => {
    const res = await fetch("/api/admin/email/status");
    const data = await res.json();
    if (res.ok) setEmailStatus(data);
  }, []);

  const loadSystemStatus = useCallback(async () => {
    setSystemError(null);
    try {
      const res = await fetch("/api/admin/settings/system-status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Status konnte nicht geladen werden");
      setSystemStatus(data);
    } catch (err) {
      setSystemError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }, []);

  useEffect(() => {
    void loadSettings();
    void loadEmailStatus();
  }, [loadSettings, loadEmailStatus]);

  useEffect(() => {
    if (tab === "system") void loadSystemStatus();
  }, [tab, loadSystemStatus]);

  const saveSection = async <S extends keyof SiteSettingsBundle>(
    section: S,
    value: SiteSettingsBundle[S],
    successMessage?: string,
  ) => {
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, value }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast(successMessage ?? data.message ?? "Gespeichert");
        if (section === "email") await loadEmailStatus();
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

  const setBrandingField = <K extends keyof SiteBrandingSettings>(key: K, value: SiteBrandingSettings[K]) => {
    if (!branding) return;
    setBranding({ ...branding, [key]: value });
  };

  const setContactField = <K extends keyof SiteContactSettings>(key: K, value: SiteContactSettings[K]) => {
    if (!contact) return;
    setContact({ ...contact, [key]: value });
  };

  const setEmailField = <K extends keyof SiteEmailSettings>(key: K, value: SiteEmailSettings[K]) => {
    if (!email) return;
    setEmail({ ...email, [key]: value });
  };

  const setCustomAddress = (key: keyof SiteEmailCustomAddresses, value: string) => {
    if (!email) return;
    setEmail({
      ...email,
      customAddresses: { ...email.customAddresses, [key]: value },
    });
  };

  const setInvoiceField = <K extends keyof SiteInvoiceSettings>(key: K, value: SiteInvoiceSettings[K]) => {
    if (!invoice) return;
    setInvoice({ ...invoice, [key]: value });
  };

  const setBankField = <K extends keyof SiteBankSettings>(key: K, value: SiteBankSettings[K]) => {
    if (!bank) return;
    setBank({ ...bank, [key]: value });
  };

  const setSeoField = <K extends keyof SiteSeoSettings>(key: K, value: SiteSeoSettings[K]) => {
    if (!seo) return;
    setSeo({ ...seo, [key]: value });
  };

  const setLegalField = <K extends keyof SiteLegalSettings>(key: K, value: SiteLegalSettings[K]) => {
    if (!legal) return;
    setLegal({ ...legal, [key]: value });
  };

  const usesTestDomain = emailStatus?.resolved.usesTestDomain ?? true;

  const sitemapUrl = useMemo(() => {
    if (!seo || !business) return "";
    const base = resolvePublicSiteUrl({ seo, business });
    return seo.sitemapEnabled ? `${base}/sitemap.xml` : "";
  }, [seo, business]);

  const quoteNumberPreview = invoice
    ? formatDocumentNumberPreview(invoice.quotePrefix, invoice.yearInNumber, invoice.quoteStartNumber)
    : "";
  const invoiceNumberPreview = invoice
    ? formatDocumentNumberPreview(invoice.invoicePrefix, invoice.yearInNumber, invoice.invoiceStartNumber)
    : "";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Einstellungen"
        description="Zentrale Steuerung für Website, E-Mail, CRM und Rechtliches."
      />

      <nav className="flex flex-wrap gap-2 border-b border-border pb-4" aria-label="Einstellungen">
        {CONTROL_CENTER_TABS.map((item) => (
          <Link
            key={item.id}
            href={tabHref(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === item.id ? "bg-primary text-white" : "border border-border bg-bg-card text-text-secondary"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {tab === "business" && business ? (
        <AdminCard title="Unternehmensdaten">
          <p className="mb-4 text-sm text-text-muted">
            Diese Daten werden in PDFs, E-Mails und Admin-Anzeigen verwendet.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Firmenname" required className="md:col-span-2">
              <input className="admin-input" value={business.companyName} onChange={(e) => setBusinessField("companyName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Kurzname" hint="Kurzform für interne Anzeigen">
              <input className="admin-input" value={business.shortName} onChange={(e) => setBusinessField("shortName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Slogan">
              <input className="admin-input" value={business.slogan} onChange={(e) => setBusinessField("slogan", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Geschäftsführer/in" hint="Für Impressum und Rechnungen">
              <input className="admin-input" value={business.managingDirector} onChange={(e) => setBusinessField("managingDirector", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Straße" className="md:col-span-2">
              <input className="admin-input" value={business.street} onChange={(e) => setBusinessField("street", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="PLZ">
              <input className="admin-input" value={business.zip} onChange={(e) => setBusinessField("zip", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Ort">
              <input className="admin-input" value={business.city} onChange={(e) => setBusinessField("city", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Bundesland">
              <input className="admin-input" value={business.state} onChange={(e) => setBusinessField("state", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Land">
              <input className="admin-input" value={business.country} onChange={(e) => setBusinessField("country", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Telefon">
              <input className="admin-input" value={business.phone} onChange={(e) => setBusinessField("phone", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="E-Mail" required>
              <input className="admin-input" type="email" value={business.email} onChange={(e) => setBusinessField("email", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Website" hint="Öffentliche Domain — beeinflusst Links in E-Mails und PDFs" className="md:col-span-2">
              <input className="admin-input" value={business.website} onChange={(e) => setBusinessField("website", e.target.value)} placeholder="https://ihre-domain.de" />
            </AdminFormField>
            <AdminFormField label="Beschreibung" hint="Kurzbeschreibung für SEO-Fallback" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={business.description} onChange={(e) => setBusinessField("description", e.target.value)} />
            </AdminFormField>
          </div>
          <StickySaveBar label="Unternehmensdaten speichern" onSave={() => void saveSection("business", business)} />
        </AdminCard>
      ) : null}

      {tab === "branding" && branding ? (
        <AdminCard title="Logo & Branding">
          <p className="mb-4 text-sm text-text-muted">
            Bildmarke: <code className="rounded bg-bg-secondary px-1.5 py-0.5 text-xs">/assets/Logo.png</code> — Textmarke „Panda-Bande / Kinderevents“. Tab-Icon = dasselbe Logo verkleinert.
          </p>
          <div className="mb-6 flex flex-wrap items-center gap-6 rounded-xl border border-border bg-bg-secondary/40 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={branding.logoUrl || "/assets/Logo.png"} alt="Logo Vorschau" className="h-16 w-auto max-w-[10rem] object-contain object-left" />
            <div>
              <p className="font-bold tracking-widest">{branding.logoTextPrimary}</p>
              <p className="text-sm tracking-widest text-text-muted">{branding.logoTextSecondary}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={branding.faviconUrl || "/favicon.png?v=5"} alt="Tab-Icon Vorschau" className="h-12 w-12 rounded-lg border border-border object-contain bg-black" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Hauptlogo (Bildmarke)" className="md:col-span-2">
              <input className="admin-input" value={branding.logoUrl} onChange={(e) => setBrandingField("logoUrl", e.target.value)} placeholder="/assets/Logo.png" />
            </AdminFormField>
            <AdminFormField label="Markenname">
              <input className="admin-input" value={branding.brandName} onChange={(e) => setBrandingField("brandName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Unterzeile">
              <input className="admin-input" value={branding.tagline} onChange={(e) => setBrandingField("tagline", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Text Zeile 1 (Header)">
              <input className="admin-input" value={branding.logoTextPrimary} onChange={(e) => setBrandingField("logoTextPrimary", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Text Zeile 2 (Header)">
              <input className="admin-input" value={branding.logoTextSecondary} onChange={(e) => setBrandingField("logoTextSecondary", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Slogan" className="md:col-span-2">
              <input className="admin-input" value={branding.slogan} onChange={(e) => setBrandingField("slogan", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Primärfarbe">
              <input className="admin-input" type="color" value={branding.primaryColor} onChange={(e) => setBrandingField("primaryColor", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Akzentfarbe">
              <input className="admin-input" type="color" value={branding.accentColor} onChange={(e) => setBrandingField("accentColor", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Helles Logo" hint="Footer">
              <input className="admin-input" value={branding.logoLightUrl} onChange={(e) => setBrandingField("logoLightUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Dunkles Logo">
              <input className="admin-input" value={branding.logoDarkUrl} onChange={(e) => setBrandingField("logoDarkUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="PDF-Logo">
              <input className="admin-input" value={branding.pdfLogoUrl} onChange={(e) => setBrandingField("pdfLogoUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="E-Mail-Logo">
              <input className="admin-input" value={branding.emailLogoUrl} onChange={(e) => setBrandingField("emailLogoUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Login-Logo">
              <input className="admin-input" value={branding.loginLogoUrl} onChange={(e) => setBrandingField("loginLogoUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="OpenGraph Bild">
              <input className="admin-input" value={branding.ogImageUrl} onChange={(e) => setBrandingField("ogImageUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Favicon">
              <input className="admin-input" value={branding.faviconUrl} onChange={(e) => setBrandingField("faviconUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Apple Touch Icon">
              <input className="admin-input" value={branding.appleTouchIconUrl} onChange={(e) => setBrandingField("appleTouchIconUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="PWA Icon 192">
              <input className="admin-input" value={branding.pwaIcon192Url} onChange={(e) => setBrandingField("pwaIcon192Url", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="PWA Icon 512">
              <input className="admin-input" value={branding.pwaIcon512Url} onChange={(e) => setBrandingField("pwaIcon512Url", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Alt-Text" className="md:col-span-2">
              <input className="admin-input" value={branding.logoAlt} onChange={(e) => setBrandingField("logoAlt", e.target.value)} />
            </AdminFormField>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={branding.showTextMark !== false}
                onChange={(e) => setBrandingField("showTextMark", e.target.checked)}
              />
              Textmarke neben Logo anzeigen (Panda-Bande / Kinderevents)
            </label>
          </div>
          <StickySaveBar label="Branding speichern" onSave={() => void saveSection("branding", branding)} />
        </AdminCard>
      ) : null}

      {tab === "contact" && contact ? (
        <AdminCard title="Kontakt & Social Media">
          <p className="mb-4 text-sm text-text-muted">Kontaktdaten und Social-Media-Links für die öffentliche Website.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Telefon" required>
              <input className="admin-input" value={contact.phone} onChange={(e) => setContactField("phone", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Mobil">
              <input className="admin-input" value={contact.mobile} onChange={(e) => setContactField("mobile", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="E-Mail" required>
              <input className="admin-input" type="email" value={contact.email} onChange={(e) => setContactField("email", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Kontakt-E-Mail" hint="Alternative Empfängeradresse für Formulare">
              <input className="admin-input" type="email" value={contact.contactEmail} onChange={(e) => setContactField("contactEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="WhatsApp" required hint="Vollständige WhatsApp-URL">
              <input className="admin-input" value={contact.whatsapp} onChange={(e) => setContactField("whatsapp", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="WhatsApp-Label">
              <input className="admin-input" value={contact.whatsappLabel} onChange={(e) => setContactField("whatsappLabel", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Instagram" required hint="Profil-URL">
              <input className="admin-input" value={contact.instagram} onChange={(e) => setContactField("instagram", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Instagram-Handle" required hint="z. B. @panda.bande">
              <input className="admin-input" value={contact.instagramHandle} onChange={(e) => setContactField("instagramHandle", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Facebook">
              <input className="admin-input" value={contact.facebook} onChange={(e) => setContactField("facebook", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="TikTok">
              <input className="admin-input" value={contact.tiktok} onChange={(e) => setContactField("tiktok", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Standort" required hint="Angezeigter Standorttext" className="md:col-span-2">
              <input className="admin-input" value={contact.location} onChange={(e) => setContactField("location", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Google Maps URL" hint="Link zur Kartenansicht" className="md:col-span-2">
              <input className="admin-input" value={contact.mapsUrl} onChange={(e) => setContactField("mapsUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Antwortzeit" hint="z. B. Antwort innerhalb von 24 Stunden">
              <input className="admin-input" value={contact.responseTime} onChange={(e) => setContactField("responseTime", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Öffnungszeiten">
              <input className="admin-input" value={contact.openingHours} onChange={(e) => setContactField("openingHours", e.target.value)} />
            </AdminFormField>
          </div>
          <StickySaveBar label="Kontaktdaten speichern" onSave={() => void saveSection("contact", contact)} />
        </AdminCard>
      ) : null}

      {tab === "email" && email ? (
        <AdminCard title="E-Mail & Versand">
          {usesTestDomain ? (
            <div className="mb-4 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>Resend-Testdomain aktiv — noch nicht produktionsreif.</strong> E-Mails werden über{" "}
              <code className="rounded bg-white/60 px-1">onboarding@resend.dev</code> versendet. Empfänger sind auf
              verifizierte Adressen beschränkt. Nach Domain-Verifizierung in Resend wird automatisch die konfigurierte
              Absenderadresse verwendet.
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

          <SectionHeading>Allgemein</SectionHeading>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Firmenname (E-Mail)" hint="Wird in E-Mail-Templates verwendet">
              <input className="admin-input" value={email.companyName} onChange={(e) => setEmailField("companyName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Absendername" required hint="Wird im From-Feld angezeigt">
              <input className="admin-input" value={email.senderName} onChange={(e) => setEmailField("senderName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Absender-E-Mail" required hint="z. B. info@panda-bande-events.de">
              <input className="admin-input" type="email" value={email.senderEmail} onChange={(e) => setEmailField("senderEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Reply-To-Adresse" required>
              <input className="admin-input" type="email" value={email.replyTo} onChange={(e) => setEmailField("replyTo", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Kopie-an-Adresse" hint="Allgemeine Kopie bei CRM-Versand">
              <input className="admin-input" type="email" value={email.copyToEmail} onChange={(e) => setEmailField("copyToEmail", e.target.value)} />
            </AdminFormField>
          </div>

          <p className="mb-2 mt-4 text-sm font-medium text-text-primary">Gewünschte E-Mail-Adressen</p>
          <p className="mb-4 text-xs text-text-muted">
            Mailboxen müssen beim Domain-/Mailanbieter eingerichtet werden. Das Dashboard kann die Adresse verwenden,
            sobald Domain und Resend verifiziert sind.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {CUSTOM_ADDRESS_LABELS.map(({ key, label }) => (
              <AdminFormField key={key} label={label}>
                <input
                  className="admin-input"
                  placeholder={`${label}ihre-domain.de`}
                  value={email.customAddresses?.[key] ?? ""}
                  onChange={(e) => setCustomAddress(key, e.target.value)}
                />
              </AdminFormField>
            ))}
          </div>

          <SectionHeading>Kontaktformular</SectionHeading>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Kontaktformular-Empfänger" hint="Neue Anfragen von der Website" className="md:col-span-2">
              <input className="admin-input" type="email" value={email.inquiryRecipient} onChange={(e) => setEmailField("inquiryRecipient", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Kontaktformular-Kopie an">
              <input className="admin-input" type="email" value={email.inquiryCopyTo} onChange={(e) => setEmailField("inquiryCopyTo", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Admin-Benachrichtigung">
              <input className="admin-input" type="email" value={email.adminNotificationEmail} onChange={(e) => setEmailField("adminNotificationEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Auto-Antwort aktiv" className="md:col-span-2">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={email.inquiryAutoReplyEnabled} onChange={(e) => setEmailField("inquiryAutoReplyEnabled", e.target.checked)} />
                <span>Automatische Bestätigung an Anfragende senden</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Auto-Antwort Betreff" className="md:col-span-2">
              <input className="admin-input" value={email.inquiryAutoReplySubject} onChange={(e) => setEmailField("inquiryAutoReplySubject", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Auto-Antwort Text" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={email.inquiryAutoReplyText} onChange={(e) => setEmailField("inquiryAutoReplyText", e.target.value)} />
            </AdminFormField>
          </div>

          <SectionHeading>Angebote</SectionHeading>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Angebots-Kopie an">
              <input className="admin-input" type="email" value={email.quoteCopyTo} onChange={(e) => setEmailField("quoteCopyTo", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Angebots-Absender" hint="Leer = Standard-Absender">
              <input className="admin-input" type="email" value={email.quoteSenderEmail} onChange={(e) => setEmailField("quoteSenderEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Angebots Reply-To">
              <input className="admin-input" type="email" value={email.quoteReplyTo} onChange={(e) => setEmailField("quoteReplyTo", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Angebots-Betreff-Vorlage" hint="Platzhalter: {number}, {company}">
              <input className="admin-input" value={email.quoteSubjectTemplate} onChange={(e) => setEmailField("quoteSubjectTemplate", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Angebots-E-Mail-Text" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={email.quoteEmailBody} onChange={(e) => setEmailField("quoteEmailBody", e.target.value)} />
            </AdminFormField>
          </div>

          <SectionHeading>Rechnungen</SectionHeading>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Rechnungs-Kopie an">
              <input className="admin-input" type="email" value={email.invoiceCopyTo} onChange={(e) => setEmailField("invoiceCopyTo", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Rechnungs-Absender" hint="Leer = Standard-Absender">
              <input className="admin-input" type="email" value={email.invoiceSenderEmail} onChange={(e) => setEmailField("invoiceSenderEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Rechnungs Reply-To">
              <input className="admin-input" type="email" value={email.invoiceReplyTo} onChange={(e) => setEmailField("invoiceReplyTo", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Rechnungs-Betreff-Vorlage" hint="Platzhalter: {number}, {company}">
              <input className="admin-input" value={email.invoiceSubjectTemplate} onChange={(e) => setEmailField("invoiceSubjectTemplate", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Rechnungs-E-Mail-Text" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={email.invoiceEmailBody} onChange={(e) => setEmailField("invoiceEmailBody", e.target.value)} />
            </AdminFormField>
          </div>

          <SectionHeading>Security</SectionHeading>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Passwort-Reset Absender">
              <input className="admin-input" type="email" value={email.passwordResetSenderEmail} onChange={(e) => setEmailField("passwordResetSenderEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Sicherheits-Benachrichtigung Absender">
              <input className="admin-input" type="email" value={email.securityNotificationSender} onChange={(e) => setEmailField("securityNotificationSender", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Login-Alert Empfänger">
              <input className="admin-input" type="email" value={email.loginAlertRecipient} onChange={(e) => setEmailField("loginAlertRecipient", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Bewerbungs-E-Mail">
              <input className="admin-input" type="email" value={email.applicationEmail} onChange={(e) => setEmailField("applicationEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Bewerbungs-Kopie an" className="md:col-span-2">
              <input className="admin-input" type="email" value={email.applicationCopyTo} onChange={(e) => setEmailField("applicationCopyTo", e.target.value)} />
            </AdminFormField>
          </div>

          <p className="mt-4 text-xs text-text-muted">
            Anleitung: <code className="rounded bg-bg-secondary px-1">docs/EMAIL_DOMAIN_SETUP.md</code>
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

          <StickySaveBar label="E-Mail-Einstellungen speichern" onSave={() => void saveSection("email", email)} />
        </AdminCard>
      ) : null}

      {tab === "invoice" && invoice ? (
        <AdminCard title="Rechnungen & Angebote">
          <div className="mb-4 rounded-xl border border-border bg-bg-secondary/50 p-4 text-sm">
            <p className="font-semibold text-text-primary">Nummern-Vorschau</p>
            <p className="mt-1 text-text-secondary">
              Nächstes Angebot: <strong>{quoteNumberPreview}</strong>
            </p>
            <p className="text-text-secondary">
              Nächste Rechnung: <strong>{invoiceNumberPreview}</strong>
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Angebots-Präfix" required>
              <input className="admin-input" value={invoice.quotePrefix} onChange={(e) => setInvoiceField("quotePrefix", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Rechnungs-Präfix" required>
              <input className="admin-input" value={invoice.invoicePrefix} onChange={(e) => setInvoiceField("invoicePrefix", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Angebots-Startnummer">
              <input className="admin-input" type="number" min={1} value={invoice.quoteStartNumber} onChange={(e) => setInvoiceField("quoteStartNumber", Number(e.target.value) || 1)} />
            </AdminFormField>
            <AdminFormField label="Rechnungs-Startnummer">
              <input className="admin-input" type="number" min={1} value={invoice.invoiceStartNumber} onChange={(e) => setInvoiceField("invoiceStartNumber", Number(e.target.value) || 1)} />
            </AdminFormField>
            <AdminFormField label="Jahr in Nummer" className="md:col-span-2">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={invoice.yearInNumber} onChange={(e) => setInvoiceField("yearInNumber", e.target.checked)} />
                <span>Jahr in Dokumentnummer einfügen (z. B. ANG-2026-0001)</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Angebotsdatum heute vorausfüllen">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={invoice.defaultQuoteDateToday} onChange={(e) => setInvoiceField("defaultQuoteDateToday", e.target.checked)} />
                <span>Beim Erstellen automatisch heutiges Datum setzen</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Rechnungsdatum heute vorausfüllen">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={invoice.defaultInvoiceDateToday} onChange={(e) => setInvoiceField("defaultInvoiceDateToday", e.target.checked)} />
                <span>Beim Erstellen automatisch heutiges Datum setzen</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Standard Fälligkeit (Tage)">
              <input className="admin-input" type="number" min={1} value={invoice.defaultDueDays} onChange={(e) => setInvoiceField("defaultDueDays", Number(e.target.value) || 14)} />
            </AdminFormField>
            <AdminFormField label="Standard Zahlungsziel (Tage)">
              <input className="admin-input" type="number" min={1} value={invoice.defaultPaymentDays} onChange={(e) => setInvoiceField("defaultPaymentDays", Number(e.target.value) || 14)} />
            </AdminFormField>
            <AdminFormField label="Leistungsdatum anzeigen">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={invoice.showServiceDate} onChange={(e) => setInvoiceField("showServiceDate", e.target.checked)} />
                <span>Leistungsdatum auf Dokumenten anzeigen</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Eventdatum anzeigen">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={invoice.showEventDate} onChange={(e) => setInvoiceField("showEventDate", e.target.checked)} />
                <span>Eventdatum auf Dokumenten anzeigen</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Standard Steuersatz (%)" hint="0 bei Kleinunternehmerregelung">
              <input className="admin-input" type="number" min={0} max={100} value={invoice.defaultTaxRate} onChange={(e) => setInvoiceField("defaultTaxRate", Number(e.target.value) || 0)} />
            </AdminFormField>
            <AdminFormField label="Kleinunternehmerregelung">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={invoice.smallBusinessRule} onChange={(e) => setInvoiceField("smallBusinessRule", e.target.checked)} />
                <span>§ 19 UStG — keine Umsatzsteuer ausweisen</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Steuerhinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={invoice.taxNoticeText} onChange={(e) => setInvoiceField("taxNoticeText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Rabattfeld aktiv" className="md:col-span-2">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={invoice.discountFieldEnabled} onChange={(e) => setInvoiceField("discountFieldEnabled", e.target.checked)} />
                <span>Rabattfeld in Angeboten und Rechnungen anzeigen</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Angebots-Einleitungstext" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={invoice.quoteIntroText} onChange={(e) => setInvoiceField("quoteIntroText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Angebots-Schlusstext" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={invoice.quoteClosingText} onChange={(e) => setInvoiceField("quoteClosingText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Rechnungs-Einleitungstext" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={invoice.invoiceIntroText} onChange={(e) => setInvoiceField("invoiceIntroText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Rechnungs-Schlusstext" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={invoice.invoiceClosingText} onChange={(e) => setInvoiceField("invoiceClosingText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Zahlungshinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-20" value={invoice.paymentInfoText} onChange={(e) => setInvoiceField("paymentInfoText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Verwendungszweck-Hinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={invoice.paymentReferenceText} onChange={(e) => setInvoiceField("paymentReferenceText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="PDF-Fußzeile" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={invoice.pdfFooterText} onChange={(e) => setInvoiceField("pdfFooterText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Rechtlicher Hinweis auf Dokumenten" hint="Bitte juristisch prüfen" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={invoice.legalNoticeText} onChange={(e) => setInvoiceField("legalNoticeText", e.target.value)} />
            </AdminFormField>
          </div>
          <StickySaveBar label="Rechnungseinstellungen speichern" onSave={() => void saveSection("invoice", invoice)} />
        </AdminCard>
      ) : null}

      {tab === "bank" && bank ? (
        <AdminCard title="Bank & Steuerdaten">
          <p className="mb-4 text-sm text-text-muted">Bankverbindung und Steuerangaben für Rechnungen und PDFs.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Bankname" className="md:col-span-2">
              <input className="admin-input" value={bank.bankName} onChange={(e) => setBankField("bankName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Kontoinhaber/in">
              <input className="admin-input" value={bank.accountHolder} onChange={(e) => setBankField("accountHolder", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="IBAN">
              <input className="admin-input" value={bank.iban} onChange={(e) => setBankField("iban", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="BIC">
              <input className="admin-input" value={bank.bic} onChange={(e) => setBankField("bic", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Steuernummer">
              <input className="admin-input" value={bank.taxNumber} onChange={(e) => setBankField("taxNumber", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="USt-ID" hint="optional">
              <input className="admin-input" value={bank.vatId} onChange={(e) => setBankField("vatId", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Kleinunternehmerregelung" className="md:col-span-2">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={bank.smallBusinessRule} onChange={(e) => setBankField("smallBusinessRule", e.target.checked)} />
                <span>§ 19 UStG — keine Umsatzsteuer ausweisen</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Kleinunternehmer-Hinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={bank.smallBusinessNotice} onChange={(e) => setBankField("smallBusinessNotice", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Zahlungsbedingungen" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={bank.paymentTerms} onChange={(e) => setBankField("paymentTerms", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Mahnhinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={bank.dunningNotice} onChange={(e) => setBankField("dunningNotice", e.target.value)} />
            </AdminFormField>
          </div>
          <StickySaveBar label="Bankdaten speichern" onSave={() => void saveSection("bank", bank)} />
        </AdminCard>
      ) : null}

      {tab === "seo" && seo && business ? (
        <AdminCard title="Domain & SEO">
          <div className="mb-4 rounded-xl border border-border bg-bg-secondary/50 p-4 text-sm">
            <p className="font-semibold text-text-primary">Sitemap-URL</p>
            {seo.sitemapEnabled && sitemapUrl ? (
              <p className="mt-1 text-text-secondary">
                <a href={sitemapUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  {sitemapUrl}
                </a>
              </p>
            ) : (
              <p className="mt-1 text-text-muted">Sitemap deaktiviert oder Domain nicht konfiguriert.</p>
            )}
            <p className="mt-2 text-text-muted">
              Aufgelöste Basis-URL: <strong>{resolvePublicSiteUrl({ seo, business })}</strong>
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Primäre Domain" hint="z. B. panda-bande-events.de">
              <input className="admin-input" value={seo.primaryDomain} onChange={(e) => setSeoField("primaryDomain", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="WWW-Domain" hint="Optional, z. B. www.panda-bande-events.de">
              <input className="admin-input" value={seo.wwwDomain} onChange={(e) => setSeoField("wwwDomain", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Canonical Base URL" hint="Vollständige URL mit https://" className="md:col-span-2">
              <input className="admin-input" value={seo.canonicalBaseUrl} onChange={(e) => setSeoField("canonicalBaseUrl", e.target.value)} placeholder="https://ihre-domain.de" />
            </AdminFormField>
            <AdminFormField label="Meta-Titel" required>
              <input className="admin-input" value={seo.metaTitle} onChange={(e) => setSeoField("metaTitle", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Meta-Beschreibung" required>
              <textarea className="admin-input min-h-16" value={seo.metaDescription} onChange={(e) => setSeoField("metaDescription", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="OG-Bild URL" hint="Social-Media-Vorschaubild">
              <input className="admin-input" value={seo.ogImageUrl} onChange={(e) => setSeoField("ogImageUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Social Preview Text">
              <input className="admin-input" value={seo.socialPreviewText} onChange={(e) => setSeoField("socialPreviewText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Google Site Verification">
              <input className="admin-input" value={seo.googleSiteVerification} onChange={(e) => setSeoField("googleSiteVerification", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Google Analytics ID" hint="z. B. G-XXXXXXXXXX">
              <input className="admin-input" value={seo.googleAnalyticsId} onChange={(e) => setSeoField("googleAnalyticsId", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Microsoft Clarity ID">
              <input className="admin-input" value={seo.microsoftClarityId} onChange={(e) => setSeoField("microsoftClarityId", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Suchmaschinen-Indexierung">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={seo.robotsIndex} onChange={(e) => setSeoField("robotsIndex", e.target.checked)} />
                <span>Website von Suchmaschinen indexieren lassen</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Sitemap aktiv">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={seo.sitemapEnabled} onChange={(e) => setSeoField("sitemapEnabled", e.target.checked)} />
                <span>Sitemap unter /sitemap.xml bereitstellen</span>
              </label>
            </AdminFormField>
          </div>
          <StickySaveBar label="SEO-Einstellungen speichern" onSave={() => void saveSection("seo", seo)} />
        </AdminCard>
      ) : null}

      {tab === "legal" && legal ? (
        <AdminCard title="Rechtliches">
          <div className="mb-6 rounded-xl border-2 border-amber-400/60 bg-amber-50 px-4 py-4 text-sm text-amber-950">
            <p className="font-bold">⚠ Platzhalter-Hinweis</p>
            <p className="mt-2">{legal.placeholderNotice || "Bitte juristisch prüfen — Platzhaltertext."}</p>
            <p className="mt-2 text-xs text-amber-800">
              Ersetzen Sie alle rechtlichen Texte durch geprüfte Inhalte, bevor die Website öffentlich genutzt wird.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Impressum — Verantwortliche/r" hint="Name der verantwortlichen Person" className="md:col-span-2">
              <input className="admin-input" value={legal.impressumResponsible} onChange={(e) => setLegalField("impressumResponsible", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Impressum — Haftungsausschluss" className="md:col-span-2">
              <textarea className="admin-input min-h-24" value={legal.impressumDisclaimer} onChange={(e) => setLegalField("impressumDisclaimer", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Datenschutz — Kontakt-E-Mail">
              <input className="admin-input" type="email" value={legal.privacyContactEmail} onChange={(e) => setLegalField("privacyContactEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Datenschutz — Zusatztext" className="md:col-span-2">
              <textarea className="admin-input min-h-24" value={legal.privacyCustomText} onChange={(e) => setLegalField("privacyCustomText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="AGB — Titel">
              <input className="admin-input" value={legal.agbTitle} onChange={(e) => setLegalField("agbTitle", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="AGB — Inhalt" className="md:col-span-2">
              <textarea className="admin-input min-h-32" value={legal.agbContent} onChange={(e) => setLegalField("agbContent", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Cookie-Hinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={legal.cookieNoticeText} onChange={(e) => setLegalField("cookieNoticeText", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Anfrage — Datenschutzhinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={legal.inquiryPrivacyHint} onChange={(e) => setLegalField("inquiryPrivacyHint", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Bewertung — Datenschutzhinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={legal.reviewPrivacyHint} onChange={(e) => setLegalField("reviewPrivacyHint", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Buchung — Datenschutzhinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={legal.bookingPrivacyHint} onChange={(e) => setLegalField("bookingPrivacyHint", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Rechnung — Rechtlicher Hinweis" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={legal.invoiceLegalNotice} onChange={(e) => setLegalField("invoiceLegalNotice", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Platzhalter-Hinweis (Admin)" hint="Wird oben prominent angezeigt" className="md:col-span-2">
              <textarea className="admin-input min-h-16" value={legal.placeholderNotice} onChange={(e) => setLegalField("placeholderNotice", e.target.value)} />
            </AdminFormField>
          </div>
          <StickySaveBar label="Rechtliche Texte speichern" onSave={() => void saveSection("legal", legal)} />
        </AdminCard>
      ) : null}

      {tab === "system" ? (
        <AdminCard title="Systemstatus">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-text-muted">Read-only Übersicht über Konfiguration und Systemzustand.</p>
            <AdminButton variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadSystemStatus()}>
              Aktualisieren
            </AdminButton>
          </div>

          {systemError ? <p className="mb-4 text-sm font-medium text-accent-heart">{systemError}</p> : null}

          {systemStatus ? (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                <AdminStatusBadge label={`${systemStatus.summary.ok} OK`} variant="success" />
                <AdminStatusBadge label={`${systemStatus.summary.warn} Hinweise`} variant="warning" />
                <AdminStatusBadge label={`${systemStatus.summary.error} Fehler`} variant="danger" />
              </div>
              <ul className="space-y-3">
                {systemStatus.items.map((item) => (
                  <li key={item.id} className="rounded-xl border border-border bg-bg-secondary/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <AdminStatusBadge label={SYSTEM_LEVEL_LABEL[item.level]} variant={SYSTEM_LEVEL_VARIANT[item.level]} />
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{item.message}</p>
                    {item.action ? <p className="mt-1 text-xs text-text-muted">{item.action}</p> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : !systemError ? (
            <p className="text-sm text-text-muted">Status wird geladen…</p>
          ) : null}

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-sm text-text-secondary">
              Admin-Benutzer und 2FA verwaltest du unter{" "}
              <Link href="/admin/sicherheit/benutzer" className="text-primary underline">
                Sicherheit → Benutzer & Rollen
              </Link>
              . Legacy-Zugang per <code className="rounded bg-bg-secondary px-1">ADMIN_PASSWORD</code>, solange kein
              Benutzer existiert.
            </p>
          </div>
        </AdminCard>
      ) : null}
    </div>
  );
}
