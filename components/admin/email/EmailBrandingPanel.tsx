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
  { value: "light", label: "Hell", hint: "Standard — helles E-Mail-Design" },
  { value: "dark", label: "Dunkel", hint: "Vorbereitung für dunkles Design" },
  { value: "auto", label: "Automatisch", hint: "Passt sich dem Gerät des Empfängers an (Vorbereitung)" },
];

export function EmailBrandingPanel({ email, domainVerification, hasSuccessfulTest = false, onEmailField, onSave }: Props) {
  const brand = email.branding;
  const setBrand = (key: keyof typeof brand, value: string | boolean) => {
    onEmailField("branding", { ...brand, [key]: value });
  };

  const previewLayout = useMemo(
    () => ({
      headline: `Nachricht von ${brand.companyName || "Ihr Unternehmen"}`,
      intro: "So sehen Ihre Kunden-E-Mails aus.",
      body: "Alle Farben, das Logo und die Schrift kommen aus diesen Einstellungen — automatisch in jeder Vorlage.",
      ctaText: "Beispiel-Button",
      ctaUrl: brand.website || "#",
      footerEnabled: true,
    }),
    [brand.companyName, brand.website],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard title="E-Mail-Branding">
        <p className="mb-4 text-sm text-text-muted">
          Logo, Farben und Schrift gelten für alle E-Mail-Vorlagen. Jeder Mandant kann hier sein eigenes Erscheinungsbild pflegen.
        </p>
        {domainVerification === "verified" ? null : domainVerification === "unknown" && hasSuccessfulTest ? (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900">
            🟢 {DOMAIN_MANUAL_CONFIRM_MESSAGE}
          </p>
        ) : domainVerification === "unknown" ? (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            🟡 Der Domainstatus konnte nicht automatisch geprüft werden — Branding wirkt trotzdem in allen E-Mails.
          </p>
        ) : (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            🟡 Versand-Domain noch nicht bestätigt — Branding wirkt trotzdem in allen E-Mails.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Logo-URL" className="md:col-span-2" hint="Öffentliche HTTPS-Adresse Ihres Logos. Wenn leer, wird ein Standard-Logo verwendet.">
            <input className="admin-input" value={brand.logoUrl} onChange={(e) => setBrand("logoUrl", e.target.value)} placeholder="https://ihre-domain.de/assets/Logo.png" />
          </AdminFormField>
          <AdminFormField label="Favicon-URL" className="md:col-span-2" hint="Optional — kleines Symbol für zukünftige E-Mail-Clients.">
            <input className="admin-input" value={brand.faviconUrl} onChange={(e) => setBrand("faviconUrl", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Headerbild-URL" className="md:col-span-2" hint="Optional — breites Bild über dem Logo.">
            <input className="admin-input" value={brand.headerImageUrl} onChange={(e) => setBrand("headerImageUrl", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Seiten-Hintergrund" hint="Farbe außerhalb der E-Mail-Karte.">
            <input className="admin-input" type="color" value={brand.backgroundColor || "#F8F6F1"} onChange={(e) => setBrand("backgroundColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Kartenfarbe" hint="Hintergrund des E-Mail-Inhalts.">
            <input className="admin-input" type="color" value={brand.cardColor || "#FFFFFF"} onChange={(e) => setBrand("cardColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Primärfarbe" hint="Überschriften und Akzente.">
            <input className="admin-input" type="color" value={brand.primaryColor} onChange={(e) => setBrand("primaryColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Sekundärfarbe" hint="Zusätzliche Akzentfarbe.">
            <input className="admin-input" type="color" value={brand.secondaryColor || brand.primaryColor} onChange={(e) => setBrand("secondaryColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Buttonfarbe">
            <input className="admin-input" type="color" value={brand.buttonColor} onChange={(e) => setBrand("buttonColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Buttontextfarbe">
            <input className="admin-input" type="color" value={brand.buttonTextColor || "#FFFFFF"} onChange={(e) => setBrand("buttonTextColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Textfarbe">
            <input className="admin-input" type="color" value={brand.textColor} onChange={(e) => setBrand("textColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Gedämpfte Textfarbe" hint="Für Hinweise und Fußzeilen.">
            <input className="admin-input" type="color" value={brand.textMutedColor || "#6F6F66"} onChange={(e) => setBrand("textMutedColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Rahmenfarbe">
            <input className="admin-input" type="color" value={brand.borderColor || "#E6E1D8"} onChange={(e) => setBrand("borderColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Linkfarbe">
            <input className="admin-input" type="color" value={brand.linkColor || brand.primaryColor} onChange={(e) => setBrand("linkColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Footerfarbe">
            <input className="admin-input" type="color" value={brand.footerColor} onChange={(e) => setBrand("footerColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Schriftart" className="md:col-span-2" hint="z. B. Helvetica, Arial, sans-serif">
            <input className="admin-input" value={brand.fontFamily} onChange={(e) => setBrand("fontFamily", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="E-Mail-Design" className="md:col-span-2" hint="Standard: Hell. Dunkel und Automatisch sind vorbereitet.">
            <select
              className="admin-input"
              value={brand.theme || "light"}
              onChange={(e) => setBrand("theme", e.target.value as EmailThemeMode)}
            >
              {THEME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.hint}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label="Unternehmensname">
            <input className="admin-input" value={brand.companyName} onChange={(e) => setBrand("companyName", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Absendername" hint="Name, den Empfänger sehen.">
            <input className="admin-input" value={brand.senderName} onChange={(e) => setBrand("senderName", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Antwort-Adresse (Reply-To)" className="md:col-span-2" hint="Wohin Antworten Ihrer Kunden gehen.">
            <input className="admin-input" type="email" value={brand.replyTo} onChange={(e) => setBrand("replyTo", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Website" className="md:col-span-2">
            <input className="admin-input" value={brand.website} onChange={(e) => setBrand("website", e.target.value)} placeholder="https://ihre-domain.de" />
          </AdminFormField>
          <label className="admin-checkbox-row md:col-span-2">
            <input type="checkbox" checked={brand.showSocialIcons} onChange={(e) => setBrand("showSocialIcons", e.target.checked)} />
            <span>Social-Media-Links in E-Mails anzeigen</span>
          </label>
        </div>
        <AdminStickySave label={`${ADMIN_BTN.save} — Branding`} onSave={onSave} />
      </AdminCard>

      <AdminCard title="Live-Vorschau">
        <p className="mb-4 text-sm text-text-muted">Vorschau mit Ihren aktuellen Branding-Einstellungen — Desktop, Tablet, Mobil und Dunkelmodus.</p>
        <EmailPreviewFrame layout={previewLayout} />
      </AdminCard>
    </div>
  );
}
