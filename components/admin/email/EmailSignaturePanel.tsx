"use client";

import { useMemo } from "react";
import { AdminStickySave } from "@/components/admin/ui/AdminStickySave";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { AdminCard } from "@/components/admin/AdminSidebar";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import type { SiteEmailSettings } from "@/lib/cms/types";

interface Props {
  email: SiteEmailSettings;
  onEmailField: <K extends keyof SiteEmailSettings>(key: K, value: SiteEmailSettings[K]) => void;
  onSave: () => void;
}

export function EmailSignaturePanel({ email, onEmailField, onSave }: Props) {
  const sig = email.signature;
  const setSig = (key: keyof typeof sig, value: string | boolean) => {
    onEmailField("signature", { ...sig, [key]: value });
  };

  const previewHtml = useMemo(
    () => `
      <div style="font-family:Helvetica,Arial,sans-serif;padding:16px;background:#faf9f6;border-radius:12px;">
        ${sig.contactPerson ? `<p style="margin:0 0 4px;font-weight:600;">${sig.contactPerson}</p>` : ""}
        <p style="margin:0 0 8px;">${sig.companyName}</p>
        <p style="margin:0;font-size:13px;color:#666;">${[sig.phone, sig.mobile].filter(Boolean).join(" · ")}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#666;">${sig.address}</p>
        ${sig.footerText ? `<p style="margin:12px 0 0;font-size:12px;color:#888;">${sig.footerText}</p>` : ""}
        ${sig.freeText ? `<p style="margin:8px 0 0;font-size:12px;">${sig.freeText}</p>` : ""}
      </div>`,
    [sig],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard title="Signatur bearbeiten">
        <p className="mb-4 text-sm text-text-muted">
          Diese Signatur wird automatisch unter jeder ausgehenden E-Mail angezeigt. Änderungen wirken sofort beim
          nächsten Versand.
        </p>
        <div className="grid gap-4">
          <AdminFormField label="Firmenname">
            <input className="admin-input" value={sig.companyName} onChange={(e) => setSig("companyName", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Ansprechpartner">
            <input className="admin-input" value={sig.contactPerson} onChange={(e) => setSig("contactPerson", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Telefon">
            <input className="admin-input" value={sig.phone} onChange={(e) => setSig("phone", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Mobil">
            <input className="admin-input" value={sig.mobile} onChange={(e) => setSig("mobile", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Website">
            <input className="admin-input" value={sig.website} onChange={(e) => setSig("website", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Instagram">
            <input className="admin-input" value={sig.instagram} onChange={(e) => setSig("instagram", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Facebook">
            <input className="admin-input" value={sig.facebook} onChange={(e) => setSig("facebook", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="TikTok">
            <input className="admin-input" value={sig.tiktok} onChange={(e) => setSig("tiktok", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="WhatsApp">
            <input className="admin-input" value={sig.whatsapp} onChange={(e) => setSig("whatsapp", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Adresse" className="md:col-span-2">
            <input className="admin-input" value={sig.address} onChange={(e) => setSig("address", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Logo-URL">
            <input className="admin-input" value={sig.logoUrl} onChange={(e) => setSig("logoUrl", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Impressum-Link">
            <input className="admin-input" value={sig.impressumUrl} onChange={(e) => setSig("impressumUrl", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Datenschutz-Link">
            <input className="admin-input" value={sig.privacyUrl} onChange={(e) => setSig("privacyUrl", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Fußzeile">
            <input className="admin-input" value={sig.footerText} onChange={(e) => setSig("footerText", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Freitext">
            <textarea className="admin-input min-h-20" value={sig.freeText} onChange={(e) => setSig("freeText", e.target.value)} />
          </AdminFormField>
          <label className="admin-checkbox-row">
            <input type="checkbox" checked={sig.showSocialIcons} onChange={(e) => setSig("showSocialIcons", e.target.checked)} />
            <span>Social-Media-Links in der Signatur anzeigen</span>
          </label>
        </div>
        <AdminStickySave label={`${ADMIN_BTN.save} — Signatur`} onSave={onSave} />
      </AdminCard>

      <AdminCard title="Live-Vorschau">
        <div className="rounded-xl border border-border bg-bg-secondary p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </AdminCard>
    </div>
  );
}
