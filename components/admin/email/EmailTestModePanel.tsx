"use client";

import { Send } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { AdminStickySave } from "@/components/admin/ui/AdminStickySave";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { AdminCard } from "@/components/admin/AdminSidebar";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import type { EmailTestModePrefix, SiteEmailSettings } from "@/lib/cms/types";

interface Props {
  email: SiteEmailSettings;
  testTo: string;
  resendConfigured: boolean;
  onEmailField: <K extends keyof SiteEmailSettings>(key: K, value: SiteEmailSettings[K]) => void;
  onTestToChange: (value: string) => void;
  onSendTest: () => void;
  onSave: () => void;
}

const PREFIX_OPTIONS: EmailTestModePrefix[] = ["TEST", "STAGING", "DEV"];

export function EmailTestModePanel({
  email,
  testTo,
  resendConfigured,
  onEmailField,
  onTestToChange,
  onSendTest,
  onSave,
}: Props) {
  const mode = email.testMode;
  const setMode = <K extends keyof typeof mode>(key: K, value: (typeof mode)[K]) => {
    onEmailField("testMode", { ...mode, [key]: value });
  };

  return (
    <AdminCard title="Testmodus">
      <p className="mb-4 text-sm text-text-muted">
        Wenn aktiv, gehen <strong>alle</strong> E-Mails nur an die Testadresse. Der Versandprozess bleibt identisch —
        nur die Zieladresse wird ersetzt. Ideal für Staging und Abnahme.
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <label className={`cursor-pointer rounded-xl border p-4 ${!mode.enabled ? "border-primary bg-primary/5" : "border-border"}`}>
          <input type="radio" className="mr-2" checked={!mode.enabled} onChange={() => setMode("enabled", false)} />
          <span className="font-medium">Inaktiv</span>
          <p className="mt-1 text-sm text-text-muted">Echte Kunden erhalten E-Mails.</p>
        </label>
        <label className={`cursor-pointer rounded-xl border p-4 ${mode.enabled ? "border-amber-500 bg-amber-50" : "border-border"}`}>
          <input type="radio" className="mr-2" checked={mode.enabled} onChange={() => setMode("enabled", true)} />
          <span className="font-medium">Aktiv</span>
          <p className="mt-1 text-sm text-text-muted">Nur Testadresse — keine echten Kunden.</p>
        </label>
      </div>

      {mode.enabled ? (
        <div className="mb-6 rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>⚠ Testmodus aktiv</strong> — Es werden keine echten Kunden angeschrieben. Alle E-Mails gehen an die
          Testadresse unten.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AdminFormField label="Testadresse" hint="Alle E-Mails landen hier, wenn Testmodus aktiv ist.">
          <input className="admin-input" type="email" value={mode.testAddress} onChange={(e) => setMode("testAddress", e.target.value)} placeholder="test@beispiel.de" />
        </AdminFormField>
        <AdminFormField label="Betreff-Präfix">
          <select className="admin-input" value={mode.subjectPrefix} onChange={(e) => setMode("subjectPrefix", e.target.value as EmailTestModePrefix)}>
            {PREFIX_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </AdminFormField>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-bg-secondary/50 p-4">
        <p className="mb-3 text-sm font-semibold">Test-E-Mail senden</p>
        <div className="flex flex-wrap gap-2">
          <input className="admin-input min-w-[16rem] flex-1" type="email" value={testTo} onChange={(e) => onTestToChange(e.target.value)} placeholder="Empfänger für Probelauf" />
          <AdminButton variant="secondary" icon={<Send className="h-4 w-4" />} onClick={onSendTest} disabled={!resendConfigured}>
            Test-E-Mail senden
          </AdminButton>
        </div>
      </div>

      <AdminStickySave label={`${ADMIN_BTN.save} — Testmodus`} onSave={onSave} />
    </AdminCard>
  );
}
