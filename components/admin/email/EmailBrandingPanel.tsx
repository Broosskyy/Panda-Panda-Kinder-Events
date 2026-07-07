"use client";

import { useMemo } from "react";
import { AdminStickySave } from "@/components/admin/ui/AdminStickySave";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { AdminCard } from "@/components/admin/AdminSidebar";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import type { SiteEmailSettings } from "@/lib/cms/types";

import type { DomainVerificationDisplay } from "@/lib/email/resend-domain-check";
import { DOMAIN_MANUAL_CONFIRM_MESSAGE } from "@/lib/email/domain-status-copy";

interface Props {
  email: SiteEmailSettings;
  domainVerification: DomainVerificationDisplay;
  hasSuccessfulTest?: boolean;
  onEmailField: <K extends keyof SiteEmailSettings>(key: K, value: SiteEmailSettings[K]) => void;
  onSave: () => void;
}

export function EmailBrandingPanel({ email, domainVerification, hasSuccessfulTest = false, onEmailField, onSave }: Props) {
  const brand = email.branding;
  const setBrand = (key: keyof typeof brand, value: string | boolean) => {
    onEmailField("branding", { ...brand, [key]: value });
  };

  const previewHtml = useMemo(
    () => `
      <div style="font-family:${brand.fontFamily};max-width:360px;margin:0 auto;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(46,46,42,.08);border:1px solid #E6E1D8;">
        <div style="padding:20px;text-align:center;background:linear-gradient(180deg, ${brand.accentColor || brand.footerColor} 0%, ${brand.cardColor || "#fff"} 100%);">
          <div style="height:36px;margin-bottom:12px;color:${brand.primaryColor};font-weight:700;">Logo</div>
          <strong style="color:${brand.textColor};">${brand.companyName}</strong>
        </div>
        <div style="padding:20px;color:${brand.textColor};background:${brand.cardColor || "#fff"};">
          <p style="margin:0 0 16px;">Beispieltext einer Kunden-E-Mail.</p>
          <a href="#" style="display:inline-block;padding:12px 24px;background:${brand.buttonColor};color:${brand.buttonTextColor || "#fff"};text-decoration:none;border-radius:999px;font-weight:600;">Button</a>
        </div>
        <div style="padding:16px;background:${brand.footerColor};font-size:12px;color:${brand.textMutedColor || "#6F6F66"};">Footer · ${brand.senderName}</div>
      </div>`,
    [brand],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard title="E-Mail-Branding">
        <p className="mb-4 text-sm text-text-muted">
          Logo, Farben und Schrift gelten für alle E-Mail-Vorlagen — Panda-Bande heute, jede White-Label-Firma später.
        </p>
        {domainVerification === "verified" ? null : domainVerification === "unknown" && hasSuccessfulTest ? (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900">
            🟢 {DOMAIN_MANUAL_CONFIRM_MESSAGE}
          </p>
        ) : domainVerification === "unknown" ? (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            🟡 Domain-Status konnte live nicht geprüft werden — Branding wirkt trotzdem in allen E-Mails.
          </p>
        ) : (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">
            🔴 Domain noch nicht in Resend verifiziert — Branding wirkt trotzdem in allen E-Mails.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Logo-URL" className="md:col-span-2" hint="Für E-Mails: https://pb-kinderevents.de/assets/Logo.png">
            <input className="admin-input" value={brand.logoUrl} onChange={(e) => setBrand("logoUrl", e.target.value)} placeholder="https://pb-kinderevents.de/assets/Logo.png" />
          </AdminFormField>
          <AdminFormField label="Headerbild-URL" className="md:col-span-2">
            <input className="admin-input" value={brand.headerImageUrl} onChange={(e) => setBrand("headerImageUrl", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Seiten-Hintergrund">
            <input className="admin-input" type="color" value={brand.backgroundColor || "#F8F6F1"} onChange={(e) => setBrand("backgroundColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Kartenfarbe">
            <input className="admin-input" type="color" value={brand.cardColor || "#FFFFFF"} onChange={(e) => setBrand("cardColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Primärfarbe">
            <input className="admin-input" type="color" value={brand.primaryColor} onChange={(e) => setBrand("primaryColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Akzentfarbe">
            <input className="admin-input" type="color" value={brand.accentColor || brand.footerColor} onChange={(e) => setBrand("accentColor", e.target.value)} />
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
          <AdminFormField label="Gedämpfte Textfarbe">
            <input className="admin-input" type="color" value={brand.textMutedColor || "#6F6F66"} onChange={(e) => setBrand("textMutedColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Footerfarbe">
            <input className="admin-input" type="color" value={brand.footerColor} onChange={(e) => setBrand("footerColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Schriftart" className="md:col-span-2">
            <input className="admin-input" value={brand.fontFamily} onChange={(e) => setBrand("fontFamily", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Unternehmensname">
            <input className="admin-input" value={brand.companyName} onChange={(e) => setBrand("companyName", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Absendername">
            <input className="admin-input" value={brand.senderName} onChange={(e) => setBrand("senderName", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Reply-To" className="md:col-span-2">
            <input className="admin-input" type="email" value={brand.replyTo} onChange={(e) => setBrand("replyTo", e.target.value)} />
          </AdminFormField>
          <label className="admin-checkbox-row md:col-span-2">
            <input type="checkbox" checked={brand.showSocialIcons} onChange={(e) => setBrand("showSocialIcons", e.target.checked)} />
            <span>Social Icons in E-Mails anzeigen</span>
          </label>
        </div>
        <AdminStickySave label={`${ADMIN_BTN.save} — Branding`} onSave={onSave} />
      </AdminCard>

      <AdminCard title="Live-Vorschau">
        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </AdminCard>
    </div>
  );
}
