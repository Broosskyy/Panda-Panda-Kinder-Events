"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Send } from "lucide-react";
import { AdminButton, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { AdminCard } from "@/components/admin/AdminSidebar";
import type { SystemStatusItem, SystemStatusLevel } from "@/lib/admin/system-status";

const LEVEL_VARIANT: Record<SystemStatusLevel, "success" | "warning" | "danger"> = {
  ok: "success",
  warn: "warning",
  error: "danger",
};

const LEVEL_EMOJI: Record<SystemStatusLevel, string> = {
  ok: "🟢",
  warn: "🟡",
  error: "🔴",
};

const OVERALL_LABEL: Record<SystemStatusLevel, string> = {
  ok: "Alles OK",
  warn: "Warnung — bitte prüfen",
  error: "Fehler — bitte beheben",
};

interface Props {
  testTo: string;
  resendConfigured: boolean;
  onTestToChange: (value: string) => void;
  onSendTest: () => void;
}

export function EmailSystemStatusPanel({ testTo, resendConfigured, onTestToChange, onSendTest }: Props) {
  const [items, setItems] = useState<SystemStatusItem[]>([]);
  const [overall, setOverall] = useState<SystemStatusLevel>("warn");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/email/system-status");
    const data = await res.json();
    if (res.ok) {
      setItems(data.items ?? []);
      setOverall(data.overall ?? "warn");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminCard title="E-Mail Systemstatus">
      <p className="mb-4 text-sm text-text-muted">
        Ampelsystem für Laien: Grün = funktioniert, Gelb = prüfen, Rot = muss behoben werden.
      </p>

      <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
        overall === "ok" ? "border-primary/30 bg-primary/10" : overall === "error" ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"
      }`}>
        <strong>{LEVEL_EMOJI[overall]} {OVERALL_LABEL[overall]}</strong>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Status wird geladen…</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border bg-bg-card px-3 py-3">
              <div>
                <p className="font-medium text-text-primary">
                  {LEVEL_EMOJI[item.level]} {item.label}
                </p>
                <p className="text-sm text-text-muted">{item.message}</p>
                {item.action ? <p className="mt-1 text-xs text-text-secondary">{item.action}</p> : null}
              </div>
              <AdminStatusBadge
                label={item.level === "ok" ? "OK" : item.level === "warn" ? "Prüfen" : "Fehler"}
                variant={LEVEL_VARIANT[item.level]}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
        <AdminFormField label="Test-E-Mail an" className="min-w-[16rem] flex-1">
          <input className="admin-input" type="email" value={testTo} onChange={(e) => onTestToChange(e.target.value)} />
        </AdminFormField>
        <div className="flex items-end gap-2">
          <AdminButton variant="secondary" icon={<Send className="h-4 w-4" />} onClick={onSendTest} disabled={!resendConfigured}>
            Test-E-Mail senden
          </AdminButton>
          <AdminButton variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void load()}>
            Aktualisieren
          </AdminButton>
        </div>
      </div>
    </AdminCard>
  );
}
