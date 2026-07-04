"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import type { SiteSettingsBundle } from "@/lib/cms/types";
import { CMS_SAVE_SUCCESS_MESSAGE } from "@/lib/cms/messages";

export function ContentView() {
  const { toast, withLoading } = useAdminUi();
  const [settings, setSettings] = useState<SiteSettingsBundle | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (!res.ok) throw new Error("Laden fehlgeschlagen");
    const data = await res.json();
    setSettings(data.settings);
  }, []);

  useEffect(() => {
    void withLoading(load());
  }, [load, withLoading]);

  const saveSection = async (section: keyof SiteSettingsBundle, value?: SiteSettingsBundle[keyof SiteSettingsBundle]) => {
    const payload = value ?? settings?.[section];
    if (!payload) return;

    try {
      await withLoading(
        (async () => {
          const res = await fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section, value: payload }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
          toast(data.message ?? CMS_SAVE_SUCCESS_MESSAGE);
        })(),
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Speichern fehlgeschlagen", "error");
    }
  };

  const uploadAboutImage = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "site-assets");
      fd.append("folder", "about");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload fehlgeschlagen");

      const newAbout = settings ? { ...settings.about, imageUrl: data.path } : null;
      if (!newAbout) return;

      await saveSection("about", newAbout);
      await load();
      toast("Bild hochgeladen und gespeichert.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload fehlgeschlagen";
      toast(message, "error");
      console.error("uploadAboutImage:", err);
    }
  };

  const updateFounderName = (newName: string) => {
    setSettings((s) => {
      if (!s) return s;
      const oldName = s.about.founderName;
      let introText = s.about.introText;
      if (oldName && introText.includes(oldName)) {
        introText = introText.split(oldName).join(newName);
      }
      return { ...s, about: { ...s.about, founderName: newName, introText } };
    });
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Website-Inhalte" description="Hero, Kontakt, Über uns und Footer bearbeiten." />

      <AdminCard title="Hero">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="admin-input md:col-span-2" placeholder="Tagline" value={settings.hero.tagline} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, tagline: e.target.value } })} />
          <input className="admin-input md:col-span-2" placeholder="Headline" value={settings.hero.headline} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, headline: e.target.value } })} />
          <textarea className="admin-input md:col-span-2" placeholder="Subtitle" value={settings.hero.subtitle} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, subtitle: e.target.value } })} />
          <input className="admin-input" placeholder="CTA 1 Text" value={settings.hero.ctaPrimary} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaPrimary: e.target.value } })} />
          <input className="admin-input" placeholder="CTA 2 Text" value={settings.hero.ctaSecondary} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaSecondary: e.target.value } })} />
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("hero")}>
          <Save className="h-4 w-4" /> Hero speichern
        </button>
      </AdminCard>

      <AdminCard title="Kontakt">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="admin-input" placeholder="Telefon" value={settings.contact.phone} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })} />
          <input className="admin-input" placeholder="WhatsApp (Nummer)" value={settings.contact.whatsapp} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, whatsapp: e.target.value } })} />
          <input className="admin-input" placeholder="E-Mail" value={settings.contact.email} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })} />
          <input className="admin-input" placeholder="Instagram URL" value={settings.contact.instagram} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, instagram: e.target.value } })} />
          <input className="admin-input" placeholder="Instagram Handle" value={settings.contact.instagramHandle} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, instagramHandle: e.target.value } })} />
          <input className="admin-input" placeholder="Einsatzgebiet" value={settings.contact.location} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, location: e.target.value } })} />
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("contact")}>
          <Save className="h-4 w-4" /> Kontakt speichern
        </button>
      </AdminCard>

      <AdminCard title="Über uns">
        <div className="grid gap-3">
          <input className="admin-input" placeholder="Name" value={settings.about.founderName} onChange={(e) => updateFounderName(e.target.value)} />
          <input className="admin-input" placeholder="Intro" value={settings.about.introText} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, introText: e.target.value } })} />
          <textarea className="admin-input min-h-24" placeholder="Absatz 1" value={settings.about.paragraph1} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, paragraph1: e.target.value } })} />
          <textarea className="admin-input min-h-24" placeholder="Absatz 2" value={settings.about.paragraph2} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, paragraph2: e.target.value } })} />
          <input className="admin-input" placeholder="Mission" value={settings.about.missionText} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, missionText: e.target.value } })} />
          <input className="admin-input" placeholder="Werte" value={settings.about.valuesText} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, valuesText: e.target.value } })} />
          <label className="admin-btn-secondary inline-block w-fit cursor-pointer">
            Bild hochladen
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && void uploadAboutImage(e.target.files[0])} />
          </label>
          {settings.about.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.about.imageUrl} alt="" className="h-40 w-40 rounded-2xl object-cover" />
          ) : null}
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("about")}>
          <Save className="h-4 w-4" /> Über uns speichern
        </button>
      </AdminCard>

      <AdminCard title="Footer">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="admin-input md:col-span-2" placeholder="Tagline" value={settings.footer.tagline} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, tagline: e.target.value } })} />
          <input className="admin-input md:col-span-2" placeholder="Copyright Name" value={settings.footer.copyrightName} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyrightName: e.target.value } })} />
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("footer")}>
          <Save className="h-4 w-4" /> Footer speichern
        </button>
      </AdminCard>
    </div>
  );
}
