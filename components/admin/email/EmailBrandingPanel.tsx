"use client";

import { useMemo } from "react";
import { AdminStickySave } from "@/components/admin/ui/AdminStickySave";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { AdminCard } from "@/components/admin/AdminSidebar";
import { EmailPreviewFrame } from "@/components/admin/email/EmailPreviewFrame";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import type { EmailThemeMode, SiteEmailSettings } from "@/lib/cms/types";

import type { DomainVerificationDisplay } from "@/lib/email/resend-domain-check";
import { DOMAIN_MANUAL_CONFIRM_MESSAGE } from "@/lib/email/domain-status-copy";

interface Props {
  email: SiteEmailSettings;
  domainVerification: DomainVerificationDisplay;
  hasSuccessfulTest?: boolean;
  onEmailField: <K extends keyof SiteEmailSettings>(key: K, value: SiteEmailSettings[K]) => void;
  onSave: () => void;
}

const THEME_OPTIONS: { value: EmailThemeMode; label: string; hint: string }[] = [
  { value: "light", label: "Hell", hint: "Helles E-Mail-Design" },
  { value: "dark", label: "Dunkel", hint: "Dunkles E-Mail-Design" },
  { value: "auto", label: "Automatisch", hint: "Passt sich dem Gerät des Empfängers an" },
];

export function EmailBrandingPanel({ email, domainVerification, hasSuccessfulTest = false, onEmailField, onSave }: Props) {
  const brand = email.branding;
  const setBrand = (key: keyof typeof brand, value: string | boolean | number) => {
    onEmailField("branding", { ...brand, [key]: value });
  };

  const previewLayout = useMemo(
    () => ({
      headline: `Nachricht von ${brand.companyName || "Ihr Unternehmen"}`,
      intro: "So sehen Ihre Kunden-E-Mails aus.",
      body: "Alle Farben, das Logo und die Schrift kommen aus diesen Einstellungen — automatisch in jeder Vorlage.",
      ctaText: "Beispiel-Button",
      ctaUrl: brand.defaultCtaUrl || brand.website || "#",
      footerEnabled: true,
      showLogo: brand.showLogo !== false,
      showBrandName: brand.showBrandName !== false,
      showSlogan: brand.showSlogan !== false,
    }),
    [brand],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <AdminCard title="E-Mail-Branding — Allgemein">
          <p className="mb-4 text-sm text-text-muted">
            Logo, Farben und Schrift gelten für alle E-Mail-Vorlagen. Nichts ist im Code fest verdrahtet.
          </p>
          {domainVerification === "verified" ? null : domainVerification === "unknown" && hasSuccessfulTest ? (
            <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900">
              🟢 {DOMAIN_MANUAL_CONFIRM_MESSAGE}
            </p>
          ) : domainVerification === "unknown" ? (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              🟡 Domainstatus nicht automatisch prüfbar — Branding wirkt trotzdem in allen E-Mails.
            </p>
          ) : (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              🟡 Versand-Domain noch nicht bestätigt — Branding wirkt trotzdem in allen E-Mails.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Firmenname" className="md:col-span-2">
              <input className="admin-input" value={brand.companyName} onChange={(e) => setBrand("companyName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Absendername">
              <input className="admin-input" value={brand.senderName} onChange={(e) => setBrand("senderName", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Reply-To">
              <input className="admin-input" type="email" value={brand.replyTo} onChange={(e) => setBrand("replyTo", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Admin-E-Mail">
              <input className="admin-input" type="email" value={brand.adminEmail} onChange={(e) => setBrand("adminEmail", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Website">
              <input className="admin-input" value={brand.website} onChange={(e) => setBrand("website", e.target.value)} placeholder="https://www.pb-kinderevents.de" />
            </AdminFormField>
            <AdminFormField label="Standard-CTA-URL" className="md:col-span-2">
              <input className="admin-input" value={brand.defaultCtaUrl} onChange={(e) => setBrand("defaultCtaUrl", e.target.value)} placeholder="https://www.pb-kinderevents.de" />
            </AdminFormField>
            <AdminFormField label="Abschlusssatz" className="md:col-span-2">
              <input className="admin-input" value={brand.closingLine} onChange={(e) => setBrand("closingLine", e.target.value)} placeholder="Mit freundlichen Grüßen" />
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard title="Logo & Header">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Logo-URL" className="md:col-span-2" hint="Absolute HTTPS-URL — z. B. https://www.pb-kinderevents.de/assets/Logo.png">
              <input className="admin-input" value={brand.logoUrl} onChange={(e) => setBrand("logoUrl", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Logo-Breite (px)">
              <input className="admin-input" type="number" min={80} max={280} value={brand.logoWidth ?? 140} onChange={(e) => setBrand("logoWidth", Number(e.target.value))} />
            </AdminFormField>
            <AdminFormField label="Logo-Höhe (px)" hint="0 = automatisch">
              <input className="admin-input" type="number" min={0} max={120} value={brand.logoHeight ?? 0} onChange={(e) => setBrand("logoHeight", Number(e.target.value))} />
            </AdminFormField>
            <AdminFormField label="Abstand oben (px)">
              <input className="admin-input" type="number" min={0} max={80} value={brand.logoPaddingTop ?? 32} onChange={(e) => setBrand("logoPaddingTop", Number(e.target.value))} />
            </AdminFormField>
            <AdminFormField label="Abstand unten (px)">
              <input className="admin-input" type="number" min={0} max={80} value={brand.logoPaddingBottom ?? 16} onChange={(e) => setBrand("logoPaddingBottom", Number(e.target.value))} />
            </AdminFormField>
            <AdminFormField label="Markenname unter Logo" className="md:col-span-2">
              <input className="admin-input" value={brand.brandDisplayName} onChange={(e) => setBrand("brandDisplayName", e.target.value)} placeholder="Panda-Bande Kinderevents" />
            </AdminFormField>
            <AdminFormField label="Slogan" className="md:col-span-2">
              <input className="admin-input" value={brand.slogan} onChange={(e) => setBrand("slogan", e.target.value)} placeholder="Mit Herz für eure Kleinen." />
            </AdminFormField>
            <label className="admin-checkbox-row">
              <input type="checkbox" checked={brand.showLogo !== false} onChange={(e) => setBrand("showLogo", e.target.checked)} />
              <span>Logo anzeigen</span>
            </label>
            <label className="admin-checkbox-row">
              <input type="checkbox" checked={brand.showBrandName !== false} onChange={(e) => setBrand("showBrandName", e.target.checked)} />
              <span>Markenname anzeigen</span>
            </label>
            <label className="admin-checkbox-row md:col-span-2">
              <input type="checkbox" checked={brand.showSlogan !== false} onChange={(e) => setBrand("showSlogan", e.target.checked)} />
              <span>Slogan anzeigen</span>
            </label>
            <AdminFormField label="Headerbild-URL" className="md:col-span-2" hint="Optional — breites Bild über dem Logo">
              <input className="admin-input" value={brand.headerImageUrl} onChange={(e) => setBrand("headerImageUrl", e.target.value)} />
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard title="Farben — Hell">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Seiten-Hintergrund"><input className="admin-input" type="color" value={brand.backgroundColor || "#F7F3EA"} onChange={(e) => setBrand("backgroundColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Kartenfarbe"><input className="admin-input" type="color" value={brand.cardColor || "#FFFFFF"} onChange={(e) => setBrand("cardColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Primärfarbe"><input className="admin-input" type="color" value={brand.primaryColor} onChange={(e) => setBrand("primaryColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Sekundärfarbe"><input className="admin-input" type="color" value={brand.secondaryColor || brand.primaryColor} onChange={(e) => setBrand("secondaryColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Textfarbe"><input className="admin-input" type="color" value={brand.textColor} onChange={(e) => setBrand("textColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Gedämpfte Textfarbe"><input className="admin-input" type="color" value={brand.textMutedColor || "#6B6B6B"} onChange={(e) => setBrand("textMutedColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Rahmenfarbe"><input className="admin-input" type="color" value={brand.borderColor || "#E8E2D6"} onChange={(e) => setBrand("borderColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Akzentfarbe"><input className="admin-input" type="color" value={brand.accentColor} onChange={(e) => setBrand("accentColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Buttonfarbe"><input className="admin-input" type="color" value={brand.buttonColor} onChange={(e) => setBrand("buttonColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Buttontextfarbe"><input className="admin-input" type="color" value={brand.buttonTextColor || "#FFFFFF"} onChange={(e) => setBrand("buttonTextColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Linkfarbe"><input className="admin-input" type="color" value={brand.linkColor || brand.primaryColor} onChange={(e) => setBrand("linkColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Karten-Radius (px)"><input className="admin-input" type="number" min={0} max={32} value={brand.cardRadius ?? 16} onChange={(e) => setBrand("cardRadius", Number(e.target.value))} /></AdminFormField>
            <label className="admin-checkbox-row md:col-span-2">
              <input type="checkbox" checked={brand.shadowEnabled !== false} onChange={(e) => setBrand("shadowEnabled", e.target.checked)} />
              <span>Schatten auf E-Mail-Karte</span>
            </label>
            <AdminFormField label="Schriftart" className="md:col-span-2">
              <input className="admin-input" value={brand.fontFamily} onChange={(e) => setBrand("fontFamily", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="E-Mail-Theme" className="md:col-span-2">
              <select className="admin-input" value={brand.theme || "light"} onChange={(e) => setBrand("theme", e.target.value as EmailThemeMode)}>
                {THEME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label} — {opt.hint}</option>
                ))}
              </select>
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard title="Farben — Dunkel">
          <p className="mb-4 text-sm text-text-muted">Wird bei Theme Dunkel oder Automatisch (dunkles Gerät) verwendet.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Hintergrund"><input className="admin-input" type="color" value={brand.darkBackgroundColor || "#1a1a18"} onChange={(e) => setBrand("darkBackgroundColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Karte"><input className="admin-input" type="color" value={brand.darkCardColor || "#2a2a26"} onChange={(e) => setBrand("darkCardColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Primär"><input className="admin-input" type="color" value={brand.darkPrimaryColor || "#8a9a5a"} onChange={(e) => setBrand("darkPrimaryColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Text"><input className="admin-input" type="color" value={brand.darkTextColor || "#f4f1ea"} onChange={(e) => setBrand("darkTextColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Gedämpft"><input className="admin-input" type="color" value={brand.darkTextMutedColor || "#b8b5ad"} onChange={(e) => setBrand("darkTextMutedColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Rahmen"><input className="admin-input" type="color" value={brand.darkBorderColor || "#3d3d38"} onChange={(e) => setBrand("darkBorderColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Button"><input className="admin-input" type="color" value={brand.darkButtonColor || "#8a9a5a"} onChange={(e) => setBrand("darkButtonColor", e.target.value)} /></AdminFormField>
            <AdminFormField label="Buttontext"><input className="admin-input" type="color" value={brand.darkButtonTextColor || "#ffffff"} onChange={(e) => setBrand("darkButtonTextColor", e.target.value)} /></AdminFormField>
          </div>
          <AdminStickySave label={`${ADMIN_BTN.save} — Branding`} onSave={onSave} />
        </AdminCard>
      </div>

      <AdminCard title="Live-Vorschau">
        <p className="mb-4 text-sm text-text-muted">Desktop, Tablet, Mobil, Hell, Dunkel und HTML-Quellcode.</p>
        <EmailPreviewFrame layout={previewLayout} />
      </AdminCard>
    </div>
  );
}
