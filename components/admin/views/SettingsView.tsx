"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RefreshCw, Smartphone, Sparkles } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminLoadingCard } from "@/components/admin/ui";
import { AdminStickySave } from "@/components/admin/ui/AdminStickySave";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { CONTROL_CENTER_TABS, type ControlCenterTab } from "@/lib/cms/settings-compat";
import { BRAND, withIconVersion } from "@/lib/brand";
import { formatDocumentNumberPreview, resolvePublicSiteUrl } from "@/lib/cms/resolve-settings";
import type {
  SiteBankSettings,
  SiteBrandingSettings,
  SiteBusinessSettings,
  SiteContactSettings,
  SiteEmailSettings,
  SiteInvoiceSettings,
  SiteLegalSettings,
  SiteModulesSettings,
  SiteSeoSettings,
  SiteSettingsBundle,
} from "@/lib/cms/types";
import type { SystemStatusItem, SystemStatusLevel } from "@/lib/admin/system-status";
import { EmailSettingsShell, parseEmailSubTab } from "@/components/admin/email/EmailSettingsShell";
import { DomainVerificationBanner } from "@/components/admin/email/DomainVerificationBanner";
import { SystemSettingsShell, parseSystemSubTab } from "@/components/admin/settings/SystemSettingsShell";
import { ModulesSettingsPanel } from "@/components/admin/settings/ModulesSettingsPanel";
import { useAdminOnboarding } from "@/components/admin/AdminOnboardingProvider";
import { useAdminPwa } from "@/components/admin/AdminPwaProvider";
import type { DomainVerificationDisplay } from "@/lib/email/resend-domain-check";

interface EmailStatusResponse {
  resendConfigured: boolean;
  domain: { status: string; domain: string | null; message: string };
  domainLive?: {
    state: DomainVerificationDisplay;
    message: string;
    label: string;
  };
  sendingSetup?: {
    canSend: boolean;
    blockReason?: string;
    sending: Array<{ id: string; label: string; level: string; message: string }>;
    receiving: Array<{ id: string; label: string; level: string; message: string }>;
  };
  resolved: {
    from: string;
    replyTo: string;
    usesTestDomain: boolean;
    domainStatus: string;
    domainVerification?: DomainVerificationDisplay;
  };
  hasSuccessfulTest?: boolean;
}

interface SystemStatusResponse {
  items: SystemStatusItem[];
  summary: { ok: number; warn: number; error: number };
  overall?: SystemStatusLevel;
}

const VALID_TABS = new Set<string>(CONTROL_CENTER_TABS.map((t) => t.id));

function tabHref(id: ControlCenterTab): string {
  return id === "business" ? "/admin/einstellungen" : `/admin/einstellungen?tab=${id}`;
}

export function SettingsView() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "business";
  const tab: ControlCenterTab = VALID_TABS.has(rawTab) ? (rawTab as ControlCenterTab) : "business";
  const emailTab = parseEmailSubTab(searchParams.get("emailTab"));
  const systemTab = parseSystemSubTab(searchParams.get("systemTab"));

  const [business, setBusiness] = useState<SiteBusinessSettings | null>(null);
  const [branding, setBranding] = useState<SiteBrandingSettings | null>(null);
  const [contact, setContact] = useState<SiteContactSettings | null>(null);
  const [email, setEmail] = useState<SiteEmailSettings | null>(null);
  const [invoice, setInvoice] = useState<SiteInvoiceSettings | null>(null);
  const [bank, setBank] = useState<SiteBankSettings | null>(null);
  const [seo, setSeo] = useState<SiteSeoSettings | null>(null);
  const [legal, setLegal] = useState<SiteLegalSettings | null>(null);
  const [modules, setModules] = useState<SiteModulesSettings | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatusResponse | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [testTo, setTestTo] = useState("");
  const { withLoading, saved, testEmailSent, error: showError } = useAdminMessages();
  const { openWizard } = useAdminOnboarding();
  const { showInstallHelp, isInstalled: pwaInstalled } = useAdminPwa();
  const settingsPage = adminPageHeaderProps("einstellungen");

  const applySettingsBundle = useCallback((settings: SiteSettingsBundle) => {
    setBusiness(settings.business);
    setBranding(settings.branding);
    setContact(settings.contact);
    setEmail(settings.email);
    setInvoice(settings.invoice);
    setBank(settings.bank);
    setSeo(settings.seo);
    setLegal(settings.legal);
    setModules(settings.modules ?? DEFAULT_SITE_SETTINGS.modules);
  }, []);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((data) => {
        setIsSuperAdmin(Boolean(data.isSuperAdmin));
      })
      .catch(() => undefined);
  }, []);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const res = await fetch("/api/admin/settings");
      const data = (await res.json().catch(() => ({}))) as {
        settings?: SiteSettingsBundle;
        error?: string;
      };

      if (res.ok && data.settings) {
        applySettingsBundle(data.settings);
        return;
      }

      const message = data.error ?? "Einstellungen konnten nicht geladen werden.";
      setSettingsError(message);
      applySettingsBundle(DEFAULT_SITE_SETTINGS);
      showError(
        "Einstellungen konnten nicht geladen werden.",
        message,
        "Standardwerte werden angezeigt — Sie können diese bearbeiten und speichern.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Netzwerkfehler beim Laden.";
      setSettingsError(message);
      applySettingsBundle(DEFAULT_SITE_SETTINGS);
      showError(
        "Einstellungen konnten nicht geladen werden.",
        message,
        "Standardwerte werden angezeigt — Sie können diese bearbeiten und speichern.",
      );
    } finally {
      setSettingsLoading(false);
    }
  }, [applySettingsBundle, showError]);

  const loadEmailStatus = useCallback(async () => {
    const res = await fetch("/api/admin/email/status", { cache: "no-store" });
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
        saved();
        if (section === "email") await loadEmailStatus();
      })(),
    );
  };

  const sendTest = async () => {
    if (!testTo.trim()) return showError("Test-E-Mail konnte nicht gesendet werden.", "Bitte Empfänger-Adresse eingeben.");
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/email/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: testTo.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Versand fehlgeschlagen");
        testEmailSent();
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

  const domainVerification: DomainVerificationDisplay =
    emailStatus?.domainLive?.state ?? emailStatus?.resolved.domainVerification ?? "unknown";

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
        title={settingsPage.title}
        description={settingsPage.description}
        whereVisible={settingsPage.whereVisible}
        helpItems={settingsPage.helpItems}
      />

      <AdminCard title="Profil & Hilfe" compact>
        <p className="mb-3 text-sm text-text-muted">
          Tutorial und App-Installation findest du hier jederzeit wieder.
        </p>
        <div className="flex flex-wrap gap-2">
          <AdminButton variant="secondary" icon={<Sparkles className="h-4 w-4" />} onClick={() => void openWizard()}>
            Tutorial erneut starten
          </AdminButton>
          {!pwaInstalled ? (
            <AdminButton variant="secondary" icon={<Smartphone className="h-4 w-4" />} onClick={showInstallHelp}>
              Admin-App installieren
            </AdminButton>
          ) : null}
        </div>
      </AdminCard>

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

      {settingsLoading ? <AdminLoadingCard message="Einstellungen werden geladen…" /> : null}
      {settingsError ? (
        <AdminCard>
          <p className="text-sm text-text-muted">
            Hinweis: {settingsError} Es werden Standardwerte angezeigt — Sie können diese direkt bearbeiten und
            speichern.
          </p>
        </AdminCard>
      ) : null}

      {!settingsLoading && tab === "business" && business ? (
        <AdminCard title="Unternehmensdaten">
          <p className="mb-4 text-sm text-text-muted">
            Diese Daten erscheinen auf Rechnungen, Angeboten (PDF), E-Mails und im Impressum.
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
          <AdminStickySave label={`${ADMIN_BTN.save} — Unternehmensdaten`} onSave={() => void saveSection("business", business)} />
        </AdminCard>
      ) : null}

      {!settingsLoading && tab === "branding" && branding ? (
        <AdminCard title="Branding">
          <p className="mb-4 text-sm text-text-muted">
            Verwalte Logo, Markenname, Farben und Favicons. Änderungen wirken auf Website, CMS, PDFs und E-Mails.
          </p>
          <div className="mb-6 flex flex-wrap items-center gap-6 rounded-xl border border-border bg-bg-secondary/40 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={branding.logoUrl || "/assets/Logo.png"} alt="Logo Vorschau" className="h-16 w-auto max-w-[10rem] object-contain object-left" />
            <div>
              <p className="font-bold tracking-widest">{branding.logoTextPrimary}</p>
              <p className="text-sm tracking-widest text-text-muted">{branding.logoTextSecondary}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={branding.faviconUrl || withIconVersion(BRAND.assets.faviconPng)} alt="Tab-Icon Vorschau" className="h-12 w-12 rounded-lg border border-border object-contain bg-[#f4f1ea]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField
              label="Hauptlogo"
              tooltip="logo"
              hint="Erscheint auf Website, Login, CMS, PDFs, E-Mails und als App-Icon."
              className="md:col-span-2"
            >
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
            <AdminFormField label="Favicon" tooltip="favicon" hint="Kleines Symbol im Browser-Tab.">
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
          <AdminStickySave label={`${ADMIN_BTN.save} — Branding`} onSave={() => void saveSection("branding", branding)} />
        </AdminCard>
      ) : null}

      {!settingsLoading && tab === "contact" && contact ? (
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
          <AdminStickySave label={`${ADMIN_BTN.save} — Kontakt`} onSave={() => void saveSection("contact", contact)} />
        </AdminCard>
      ) : null}

      {!settingsLoading && tab === "email" && email ? (
        <AdminCard title="E-Mail">
          <EmailSettingsShell
            email={email}
            emailTab={emailTab}
            testTo={testTo}
            resendConfigured={Boolean(emailStatus?.resendConfigured)}
            domainVerification={domainVerification}
            hasSuccessfulTest={Boolean(emailStatus?.hasSuccessfulTest)}
            emailStatusBanner={
              emailTab === "general" ? (
                <>
                  <DomainVerificationBanner
                    className="mb-4"
                    state={domainVerification}
                    message={emailStatus?.domainLive?.message}
                    hasSuccessfulTest={Boolean(emailStatus?.hasSuccessfulTest)}
                  />
                  {!emailStatus?.resendConfigured ? (
                    <p className="mb-4 text-sm text-accent-heart">
                      <strong>E-Mail-Dienst nicht verbunden</strong> — automatischer Versand ist deaktiviert.
                    </p>
                  ) : null}
                </>
              ) : undefined
            }
            onEmailField={setEmailField}
            onTestToChange={setTestTo}
            onSendTest={() => void sendTest()}
            onSave={() => void saveSection("email", email)}
          />
        </AdminCard>
      ) : null}

      {!settingsLoading && tab === "invoice" && invoice ? (
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
          <AdminStickySave label={`${ADMIN_BTN.save} — Rechnungen`} onSave={() => void saveSection("invoice", invoice)} />
        </AdminCard>
      ) : null}

      {!settingsLoading && tab === "bank" && bank ? (
        <AdminCard title="Bank & Steuerdaten">
          <p className="mb-4 text-sm text-text-muted">Bankverbindung und Steuerangaben für Rechnungen und PDFs.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Bankname" className="md:col-span-2">
              <input className="admin-input" value={bank.bankName} onChange={(e) => setBankField("bankName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Kontoinhaber/in">
              <input className="admin-input" value={bank.accountHolder} onChange={(e) => setBankField("accountHolder", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="IBAN" tooltip="iban" hint="Erscheint auf Rechnungs-PDFs.">
              <input className="admin-input" value={bank.iban} onChange={(e) => setBankField("iban", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="BIC" tooltip="bic" optional>
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
          <AdminStickySave label={`${ADMIN_BTN.save} — Bank`} onSave={() => void saveSection("bank", bank)} />
        </AdminCard>
      ) : null}

      {!settingsLoading && tab === "seo" && seo && business ? (
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
            <AdminFormField label="Primäre Domain" hint="z. B. pb-kinderevents.de">
              <input className="admin-input" value={seo.primaryDomain} onChange={(e) => setSeoField("primaryDomain", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="WWW-Domain" hint="Optional, z. B. www.pb-kinderevents.de">
              <input className="admin-input" value={seo.wwwDomain} onChange={(e) => setSeoField("wwwDomain", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Canonical Base URL" tooltip="canonical" hint="Vollständige URL mit https://" className="md:col-span-2">
              <input className="admin-input" value={seo.canonicalBaseUrl} onChange={(e) => setSeoField("canonicalBaseUrl", e.target.value)} placeholder="https://ihre-domain.de" />
            </AdminFormField>
            <AdminFormField label="Meta-Titel" required>
              <input className="admin-input" value={seo.metaTitle} onChange={(e) => setSeoField("metaTitle", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Meta-Beschreibung" tooltip="metaDescription" required hint="Ca. 150 Zeichen — erscheint in Google-Suchergebnissen.">
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
            <AdminFormField label="Google Analytics ID" tooltip="analytics" hint="z. B. G-XXXXXXXXXX" optional>
              <input className="admin-input" value={seo.googleAnalyticsId} onChange={(e) => setSeoField("googleAnalyticsId", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Microsoft Clarity ID">
              <input className="admin-input" value={seo.microsoftClarityId} onChange={(e) => setSeoField("microsoftClarityId", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Suchmaschinen-Indexierung" tooltip="robots">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={seo.robotsIndex} onChange={(e) => setSeoField("robotsIndex", e.target.checked)} />
                <span>Website von Suchmaschinen indexieren lassen</span>
              </label>
            </AdminFormField>
            <AdminFormField label="Sitemap aktiv" tooltip="sitemap">
              <label className="admin-checkbox-row">
                <input type="checkbox" checked={seo.sitemapEnabled} onChange={(e) => setSeoField("sitemapEnabled", e.target.checked)} />
                <span>Sitemap unter /sitemap.xml bereitstellen</span>
              </label>
            </AdminFormField>
          </div>
          <AdminStickySave label={`${ADMIN_BTN.save} — SEO`} onSave={() => void saveSection("seo", seo)} />
        </AdminCard>
      ) : null}

      {!settingsLoading && tab === "legal" && legal ? (
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
          <AdminStickySave label={`${ADMIN_BTN.save} — Rechtliches`} onSave={() => void saveSection("legal", legal)} />
        </AdminCard>
      ) : null}

      {!settingsLoading && tab === "modules" && modules ? (
        <ModulesSettingsPanel initial={modules} isSuperAdmin={isSuperAdmin} />
      ) : null}

      {!settingsLoading && tab === "system" ? (
        <AdminCard title="Systemstatus">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-text-muted">Übersicht über Konfiguration, Systemzustand und Datensicherung.</p>
            {systemTab === "health" ? (
              <AdminButton variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadSystemStatus()}>
                Aktualisieren
              </AdminButton>
            ) : null}
          </div>

          <SystemSettingsShell
            systemTab={systemTab}
            systemStatus={systemStatus}
            systemError={systemError}
          />
        </AdminCard>
      ) : null}
    </div>
  );
}
