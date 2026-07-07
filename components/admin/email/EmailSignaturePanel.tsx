"use client";

import { AdminStickySave } from "@/components/admin/ui/AdminStickySave";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { AdminCard } from "@/components/admin/AdminSidebar";
import { EmailPreviewFrame } from "@/components/admin/email/EmailPreviewFrame";
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

  const previewLayout = {
    headline: "",
    intro: "",
    body: sig.freeText || "Ihr Nachrichtentext erscheint hier.",
    footerEnabled: true,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard title="Signatur bearbeiten">
        <p className="mb-4 text-sm text-text-muted">
          Diese Signatur erscheint automatisch unter jeder ausgehenden E-Mail. Änderungen wirken beim nächsten Versand.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Name / Ansprechpartner">
            <input className="admin-input" value={sig.contactPerson} onChange={(e) => setSig("contactPerson", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Firmenname">
            <input className="admin-input" value={sig.companyName} onChange={(e) => setSig("companyName", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Telefon">
            <input className="admin-input" value={sig.phone} onChange={(e) => setSig("phone", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Mobil">
            <input className="admin-input" value={sig.mobile} onChange={(e) => setSig("mobile", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="WhatsApp">
            <input className="admin-input" value={sig.whatsapp} onChange={(e) => setSig("whatsapp", e.target.value)} placeholder="+49 …" />
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
          <AdminFormField label="YouTube">
            <input className="admin-input" value={sig.youtube} onChange={(e) => setSig("youtube", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Adresse" className="md:col-span-2">
            <input className="admin-input" value={sig.address} onChange={(e) => setSig("address", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Öffnungszeiten" className="md:col-span-2" hint="z. B. Mo–Fr 9–18 Uhr">
            <input className="admin-input" value={sig.openingHours} onChange={(e) => setSig("openingHours", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Impressum-Link">
            <input className="admin-input" value={sig.impressumUrl} onChange={(e) => setSig("impressumUrl", e.target.value)} placeholder="/impressum" />
          </AdminFormField>
          <AdminFormField label="Datenschutz-Link">
            <input className="admin-input" value={sig.privacyUrl} onChange={(e) => setSig("privacyUrl", e.target.value)} placeholder="/datenschutz" />
          </AdminFormField>
          <AdminFormField label="Abschlusssatz / Fußzeile" className="md:col-span-2" hint="Kurzer Satz unter der Signatur.">
            <input className="admin-input" value={sig.footerText} onChange={(e) => setSig("footerText", e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Freitext" className="md:col-span-2" hint="Optionaler Zusatztext in der Signatur.">
            <textarea className="admin-input min-h-20" value={sig.freeText} onChange={(e) => setSig("freeText", e.target.value)} />
          </AdminFormField>
          <label className="admin-checkbox-row md:col-span-2">
            <input type="checkbox" checked={sig.showSocialIcons} onChange={(e) => setSig("showSocialIcons", e.target.checked)} />
            <span>Social-Media-Links in der Signatur anzeigen</span>
          </label>
        </div>
        <AdminStickySave label={`${ADMIN_BTN.save} — Signatur`} onSave={onSave} />
      </AdminCard>

      <AdminCard title="Live-Vorschau">
        <p className="mb-4 text-sm text-text-muted">So erscheint Ihre Signatur in E-Mails — mit Branding und allen Ansichten.</p>
        <EmailPreviewFrame layout={previewLayout} />
      </AdminCard>
    </div>
  );
}
