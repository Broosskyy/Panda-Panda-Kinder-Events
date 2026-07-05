"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { SERVICE_ICON_KEYS } from "@/lib/cms/icons";
import type { SiteSectionHeading, SiteSettingsBundle } from "@/lib/cms/types";
import { CMS_SAVE_SUCCESS_MESSAGE } from "@/lib/cms/messages";

const SECTION_LABELS: Record<keyof SiteSettingsBundle["sections"], string> = {
  usps: "USP-Bereich",
  services: "Leistungen",
  process: "Buchungsablauf",
  gallery: "Galerie",
  testimonials: "Bewertungen",
  about: "Über uns",
  news: "Aktuelles",
  faq: "FAQ",
  contact: "Kontakt",
};

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

  const saveSection = async (
    section: keyof SiteSettingsBundle,
    value?: SiteSettingsBundle[keyof SiteSettingsBundle],
  ) => {
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

  const uploadImage = async (file: File, folder: string, onPath: (path: string) => void) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "site-assets");
    fd.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload fehlgeschlagen");
    onPath(data.path);
    toast("Bild hochgeladen.");
  };

  const updateSectionHeading = (
    key: keyof SiteSettingsBundle["sections"],
    field: keyof SiteSectionHeading,
    value: string,
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      sections: {
        ...settings.sections,
        [key]: { ...settings.sections[key], [field]: value },
      },
    });
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Website-Inhalte"
        description="Alle sichtbaren Startseiten-Inhalte bearbeiten — Navigation, Hero, Sektionen und Footer."
      />

      <AdminCard title="Logo & Branding">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="admin-input md:col-span-2"
            placeholder="Logo-URL (oder Pfad nach Upload)"
            value={settings.branding.logoUrl}
            onChange={(e) =>
              setSettings({ ...settings, branding: { ...settings.branding, logoUrl: e.target.value } })
            }
          />
          <input
            className="admin-input"
            placeholder="Logo Alt-Text"
            value={settings.branding.logoAlt}
            onChange={(e) =>
              setSettings({ ...settings, branding: { ...settings.branding, logoAlt: e.target.value } })
            }
          />
          <label className="admin-btn-secondary inline-flex w-fit cursor-pointer items-center self-end">
            Logo hochladen
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !settings) return;
                void uploadImage(file, "branding", (path) =>
                  setSettings({ ...settings, branding: { ...settings.branding, logoUrl: path } }),
                ).catch((err) => toast(err instanceof Error ? err.message : "Upload fehlgeschlagen", "error"));
              }}
            />
          </label>
          <input
            className="admin-input"
            placeholder="Fallback Text Zeile 1"
            value={settings.branding.logoTextPrimary}
            onChange={(e) =>
              setSettings({ ...settings, branding: { ...settings.branding, logoTextPrimary: e.target.value } })
            }
          />
          <input
            className="admin-input"
            placeholder="Fallback Text Zeile 2"
            value={settings.branding.logoTextSecondary}
            onChange={(e) =>
              setSettings({ ...settings, branding: { ...settings.branding, logoTextSecondary: e.target.value } })
            }
          />
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("branding")}>
          <Save className="h-4 w-4" /> Branding speichern
        </button>
      </AdminCard>

      <AdminCard title="Navigation">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="admin-input"
            placeholder="Header CTA (Desktop)"
            value={settings.navigation.ctaLabel}
            onChange={(e) =>
              setSettings({ ...settings, navigation: { ...settings.navigation, ctaLabel: e.target.value } })
            }
          />
          <input
            className="admin-input"
            placeholder="Header CTA (Tablet, kurz)"
            value={settings.navigation.ctaLabelShort}
            onChange={(e) =>
              setSettings({ ...settings, navigation: { ...settings.navigation, ctaLabelShort: e.target.value } })
            }
          />
        </div>
        <div className="mt-4 space-y-3">
          {settings.navigation.items.map((item, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              <input
                className="admin-input min-w-[8rem] flex-1"
                placeholder="Label"
                value={item.label}
                onChange={(e) => {
                  const items = [...settings.navigation.items];
                  items[index] = { ...items[index], label: e.target.value };
                  setSettings({ ...settings, navigation: { ...settings.navigation, items } });
                }}
              />
              <input
                className="admin-input min-w-[8rem] flex-1"
                placeholder="Link (#anker)"
                value={item.href}
                onChange={(e) => {
                  const items = [...settings.navigation.items];
                  items[index] = { ...items[index], href: e.target.value };
                  setSettings({ ...settings, navigation: { ...settings.navigation, items } });
                }}
              />
              <button
                type="button"
                className="admin-btn-danger"
                onClick={() => {
                  const items = settings.navigation.items.filter((_, i) => i !== index);
                  setSettings({ ...settings, navigation: { ...settings.navigation, items } });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() =>
              setSettings({
                ...settings,
                navigation: {
                  ...settings.navigation,
                  items: [...settings.navigation.items, { label: "Neuer Link", href: "#" }],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Navigationspunkt
          </button>
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("navigation")}>
          <Save className="h-4 w-4" /> Navigation speichern
        </button>
      </AdminCard>

      <AdminCard title="Hero">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="admin-input md:col-span-2" placeholder="Tagline" value={settings.hero.tagline} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, tagline: e.target.value } })} />
          <input className="admin-input md:col-span-2" placeholder="Headline" value={settings.hero.headline} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, headline: e.target.value } })} />
          <textarea className="admin-input md:col-span-2" placeholder="Subtitle" value={settings.hero.subtitle} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, subtitle: e.target.value } })} />
          <input className="admin-input" placeholder="CTA 1 Text" value={settings.hero.ctaPrimary} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaPrimary: e.target.value } })} />
          <input className="admin-input" placeholder="CTA 2 Text" value={settings.hero.ctaSecondary} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaSecondary: e.target.value } })} />
          <input className="admin-input md:col-span-2" placeholder="Hero-Bild URL" value={settings.hero.imageUrl} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, imageUrl: e.target.value } })} />
          <input className="admin-input md:col-span-2" placeholder="Badge-Zitat" value={settings.hero.badgeQuote} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, badgeQuote: e.target.value } })} />
          <label className="admin-btn-secondary inline-flex w-fit cursor-pointer items-center">
            Hero-Bild hochladen
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void uploadImage(file, "hero", (path) =>
                  setSettings((s) => (s ? { ...s, hero: { ...s.hero, imageUrl: path } } : s)),
                ).catch((err) => toast(err instanceof Error ? err.message : "Upload fehlgeschlagen", "error"));
              }}
            />
          </label>
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("hero")}>
          <Save className="h-4 w-4" /> Hero speichern
        </button>
      </AdminCard>

      <AdminCard title="Trust Badges">
        <div className="space-y-3">
          {settings.trustBadges.items.map((badge, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              <select
                className="admin-input w-36"
                value={badge.iconKey}
                onChange={(e) => {
                  const items = [...settings.trustBadges.items];
                  items[index] = { ...items[index], iconKey: e.target.value };
                  setSettings({ ...settings, trustBadges: { items } });
                }}
              >
                {SERVICE_ICON_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              <input
                className="admin-input min-w-[10rem] flex-1"
                value={badge.text}
                onChange={(e) => {
                  const items = [...settings.trustBadges.items];
                  items[index] = { ...items[index], text: e.target.value };
                  setSettings({ ...settings, trustBadges: { items } });
                }}
              />
              <button
                type="button"
                className="admin-btn-danger"
                onClick={() => {
                  const items = settings.trustBadges.items.filter((_, i) => i !== index);
                  setSettings({ ...settings, trustBadges: { items } });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() =>
              setSettings({
                ...settings,
                trustBadges: {
                  items: [...settings.trustBadges.items, { iconKey: "Star", text: "Neues Badge" }],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Badge hinzufügen
          </button>
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("trustBadges")}>
          <Save className="h-4 w-4" /> Trust Badges speichern
        </button>
      </AdminCard>

      <AdminCard title="USP-Karten">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="admin-input" placeholder="Titel" value={settings.usps.title} onChange={(e) => setSettings({ ...settings, usps: { ...settings.usps, title: e.target.value } })} />
          <input className="admin-input" placeholder="Untertitel" value={settings.usps.subtitle} onChange={(e) => setSettings({ ...settings, usps: { ...settings.usps, subtitle: e.target.value } })} />
        </div>
        <div className="mt-4 space-y-4">
          {settings.usps.items.map((usp, index) => (
            <div key={index} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap gap-2">
                <select
                  className="admin-input w-36"
                  value={usp.iconKey}
                  onChange={(e) => {
                    const items = [...settings.usps.items];
                    items[index] = { ...items[index], iconKey: e.target.value };
                    setSettings({ ...settings, usps: { ...settings.usps, items } });
                  }}
                >
                  {SERVICE_ICON_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
                <input
                  className="admin-input min-w-[10rem] flex-1"
                  placeholder="Titel"
                  value={usp.title}
                  onChange={(e) => {
                    const items = [...settings.usps.items];
                    items[index] = { ...items[index], title: e.target.value };
                    setSettings({ ...settings, usps: { ...settings.usps, items } });
                  }}
                />
                <button
                  type="button"
                  className="admin-btn-danger"
                  onClick={() => {
                    const items = settings.usps.items.filter((_, i) => i !== index);
                    setSettings({ ...settings, usps: { ...settings.usps, items } });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                className="admin-input mt-2 min-h-20 w-full"
                placeholder="Beschreibung"
                value={usp.description}
                onChange={(e) => {
                  const items = [...settings.usps.items];
                  items[index] = { ...items[index], description: e.target.value };
                  setSettings({ ...settings, usps: { ...settings.usps, items } });
                }}
              />
            </div>
          ))}
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() =>
              setSettings({
                ...settings,
                usps: {
                  ...settings.usps,
                  items: [
                    ...settings.usps.items,
                    { iconKey: "Star", title: "Neuer USP", description: "Beschreibung" },
                  ],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> USP hinzufügen
          </button>
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("usps")}>
          <Save className="h-4 w-4" /> USPs speichern
        </button>
      </AdminCard>

      <AdminCard title="Buchungsablauf">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="admin-input" placeholder="Titel" value={settings.process.title} onChange={(e) => setSettings({ ...settings, process: { ...settings.process, title: e.target.value } })} />
          <input className="admin-input" placeholder="Untertitel" value={settings.process.subtitle} onChange={(e) => setSettings({ ...settings, process: { ...settings.process, subtitle: e.target.value } })} />
          <input className="admin-input md:col-span-2" placeholder="Sprechblase" value={settings.process.speechBubble} onChange={(e) => setSettings({ ...settings, process: { ...settings.process, speechBubble: e.target.value } })} />
        </div>
        <div className="mt-4 space-y-4">
          {settings.process.steps.map((step, index) => (
            <div key={index} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap gap-2">
                <input
                  className="admin-input w-16"
                  type="number"
                  min={1}
                  value={step.number}
                  onChange={(e) => {
                    const steps = [...settings.process.steps];
                    steps[index] = { ...steps[index], number: Number(e.target.value) };
                    setSettings({ ...settings, process: { ...settings.process, steps } });
                  }}
                />
                <select
                  className="admin-input w-36"
                  value={step.iconKey}
                  onChange={(e) => {
                    const steps = [...settings.process.steps];
                    steps[index] = { ...steps[index], iconKey: e.target.value };
                    setSettings({ ...settings, process: { ...settings.process, steps } });
                  }}
                >
                  {SERVICE_ICON_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
                <input
                  className="admin-input min-w-[10rem] flex-1"
                  placeholder="Schritt-Titel"
                  value={step.title}
                  onChange={(e) => {
                    const steps = [...settings.process.steps];
                    steps[index] = { ...steps[index], title: e.target.value };
                    setSettings({ ...settings, process: { ...settings.process, steps } });
                  }}
                />
                <button
                  type="button"
                  className="admin-btn-danger"
                  onClick={() => {
                    const steps = settings.process.steps.filter((_, i) => i !== index);
                    setSettings({ ...settings, process: { ...settings.process, steps } });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                className="admin-input mt-2 min-h-20 w-full"
                placeholder="Beschreibung"
                value={step.description}
                onChange={(e) => {
                  const steps = [...settings.process.steps];
                  steps[index] = { ...steps[index], description: e.target.value };
                  setSettings({ ...settings, process: { ...settings.process, steps } });
                }}
              />
            </div>
          ))}
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() =>
              setSettings({
                ...settings,
                process: {
                  ...settings.process,
                  steps: [
                    ...settings.process.steps,
                    {
                      number: settings.process.steps.length + 1,
                      iconKey: "Star",
                      title: "Neuer Schritt",
                      description: "Beschreibung",
                    },
                  ],
                },
              })
            }
          >
            <Plus className="h-4 w-4" /> Schritt hinzufügen
          </button>
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("process")}>
          <Save className="h-4 w-4" /> Buchungsablauf speichern
        </button>
      </AdminCard>

      <AdminCard title="Sektions-Überschriften">
        <div className="space-y-4">
          {(Object.keys(SECTION_LABELS) as (keyof SiteSettingsBundle["sections"])[]).map((key) => (
            <div key={key} className="rounded-xl border border-border p-3">
              <p className="mb-2 text-sm font-semibold text-text-primary">{SECTION_LABELS[key]}</p>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  className="admin-input"
                  placeholder="Titel"
                  value={settings.sections[key].title}
                  onChange={(e) => updateSectionHeading(key, "title", e.target.value)}
                />
                <input
                  className="admin-input"
                  placeholder="Untertitel"
                  value={settings.sections[key].subtitle}
                  onChange={(e) => updateSectionHeading(key, "subtitle", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("sections")}>
          <Save className="h-4 w-4" /> Überschriften speichern
        </button>
      </AdminCard>

      <AdminCard title="Kontakt & Social">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="admin-input" placeholder="Telefon" value={settings.contact.phone} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })} />
          <input className="admin-input" placeholder="WhatsApp (Nummer)" value={settings.contact.whatsapp} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, whatsapp: e.target.value } })} />
          <input className="admin-input" placeholder="E-Mail" value={settings.contact.email} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })} />
          <input className="admin-input" placeholder="Instagram URL" value={settings.contact.instagram} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, instagram: e.target.value } })} />
          <input className="admin-input" placeholder="Instagram Handle" value={settings.contact.instagramHandle} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, instagramHandle: e.target.value } })} />
          <input className="admin-input" placeholder="Einsatzgebiet" value={settings.contact.location} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, location: e.target.value } })} />
        </div>
        <p className="mt-3 text-xs text-text-muted">
          WhatsApp-Button und Social-Links im Footer nutzen diese Kontaktdaten.
        </p>
        <button type="button" className="admin-btn-primary mt-4" onClick={() => void saveSection("contact")}>
          <Save className="h-4 w-4" /> Kontakt speichern
        </button>
      </AdminCard>

      <AdminCard title="Über uns">
        <div className="grid gap-3">
          <input
            className="admin-input"
            placeholder="Name"
            value={settings.about.founderName}
            onChange={(e) => setSettings({ ...settings, about: { ...settings.about, founderName: e.target.value } })}
          />
          <input className="admin-input" placeholder="Intro" value={settings.about.introText} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, introText: e.target.value } })} />
          <textarea className="admin-input min-h-24" placeholder="Absatz 1" value={settings.about.paragraph1} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, paragraph1: e.target.value } })} />
          <textarea className="admin-input min-h-24" placeholder="Absatz 2" value={settings.about.paragraph2} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, paragraph2: e.target.value } })} />
          <input className="admin-input" placeholder="Mission" value={settings.about.missionText} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, missionText: e.target.value } })} />
          <input className="admin-input" placeholder="Werte" value={settings.about.valuesText} onChange={(e) => setSettings({ ...settings, about: { ...settings.about, valuesText: e.target.value } })} />
          <label className="admin-btn-secondary inline-block w-fit cursor-pointer">
            Bild hochladen
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !settings) return;
                void uploadImage(file, "about", async (path) => {
                  const newAbout = { ...settings.about, imageUrl: path };
                  setSettings({ ...settings, about: newAbout });
                  await saveSection("about", newAbout);
                  await load();
                }).catch((err) => toast(err instanceof Error ? err.message : "Upload fehlgeschlagen", "error"));
              }}
            />
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
