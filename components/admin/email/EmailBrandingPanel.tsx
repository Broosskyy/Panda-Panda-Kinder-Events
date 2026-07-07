"use client";

import { useMemo } from "react";
import { AdminStickySave } from "@/components/admin/ui/AdminStickySave";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { AdminCard } from "@/components/admin/AdminSidebar";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import type { SiteEmailSettings } from "@/lib/cms/types";

interface Props {
  email: SiteEmailSettings;
  usesTestDomain: boolean;
  onEmailField: <K extends keyof SiteEmailSettings>(key: K, value: SiteEmailSettings[K]) => void;
  onSave: () => void;
}

export function EmailBrandingPanel({ email, usesTestDomain, onEmailField, onSave }: Props) {
  const brand = email.branding;
  const setBrand = (key: keyof typeof brand, value: string | boolean) => {
    onEmailField("branding", { ...brand, [key]: value });
  };

  const previewHtml = useMemo(
    () => `
      <div style="font-family:${brand.fontFamily};max-width:360px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
        <div style="padding:20px;text-align:center;background:linear-gradient(180deg, ${brand.secondaryColor}22, #fff);">
          <div style="height:40px;background:${brand.primaryColor};opacity:.15;border-radius:8px;margin-bottom:12px;"></div>
          <strong style="color:${brand.textColor};">${brand.companyName}</strong>
        </div>
        <div style="padding:20px;color:${brand.textColor};background:#fff;">
          <p style="margin:0 0 16px;">Beispieltext einer Kunden-E-Mail.</p>
          <a href="#" style="display:inline-block;padding:12px 20px;background:${brand.buttonColor};color:#fff;text-decoration:none;border-radius:999px;font-weight:600;">Button</a>
        </div>
        <div style="padding:16px;background:${brand.footerColor};font-size:12px;color:#666;">Footer · ${brand.senderName}</div>
      </div>`,
    [brand],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard title="E-Mail-Branding">
        <p className="mb-4 text-sm text-text-muted">
          Logo, Farben und Schrift gelten für alle E-Mail-Vorlagen — Panda-Bande heute, jede White-Label-Firma später.
        </p>
        {usesTestDomain ? (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Momentan wird die Resend-Testdomain für den Versand genutzt. Branding wirkt trotzdem in allen E-Mails.
          </p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Logo-URL" className="md:col-span-2">
            <input className="admin-input" value={brand.logoUrl} onChange={(e) => setBrand("logoUrl", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Headerbild-URL" className="md:col-span-2">
            <input className="admin-input" value={brand.headerImageUrl} onChange={(e) => setBrand("headerImageUrl", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Primärfarbe">
            <input className="admin-input" type="color" value={brand.primaryColor} onChange={(e) => setBrand("primaryColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Sekundärfarbe">
            <input className="admin-input" type="color" value={brand.secondaryColor} onChange={(e) => setBrand("secondaryColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Buttonfarbe">
            <input className="admin-input" type="color" value={brand.buttonColor} onChange={(e) => setBrand("buttonColor", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Textfarbe">
            <input className="admin-input" type="color" value={brand.textColor} onChange={(e) => setBrand("textColor", e.target.value)} />
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
