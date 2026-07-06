"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { AdminButton } from "@/components/admin/ui";
import { useAdminUi } from "@/components/admin/AdminUiProvider";

export function SessionsView() {
  const [sessions, setSessions] = useState<Array<Record<string, unknown>>>([]);
  const [legacy, setLegacy] = useState(false);
  const { toast } = useAdminUi();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/security/sessions");
    const data = await res.json();
    if (res.ok) {
      setSessions(data.sessions ?? []);
      setLegacy(Boolean(data.legacy));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sessionAction = async (action: string) => {
    const res = await fetch("/api/admin/security/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      toast("Aktion ausgeführt");
      await load();
    } else {
      const data = await res.json();
      toast(data.error ?? "Fehler", "error");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Aktive Sitzungen" description="Geräte, die aktuell angemeldet sind." />
      <SecuritySubNav />
      {legacy ? (
        <AdminCard><p className="text-sm text-text-muted">Sitzungsverwaltung ist im Multi-User-Modus verfügbar.</p></AdminCard>
      ) : (
        <AdminCard>
          <div className="mb-4 flex flex-wrap gap-2">
            <AdminButton variant="secondary" onClick={() => void sessionAction("revoke_others")}>Andere Geräte abmelden</AdminButton>
            <AdminButton variant="danger" onClick={() => void sessionAction("revoke_all")}>Alle Geräte abmelden</AdminButton>
          </div>
          <ul className="space-y-2 text-sm">
            {sessions.map((s) => (
              <li key={String(s.id)} className="flex justify-between rounded-lg border border-border px-3 py-2">
                <span>{String(s.deviceLabel)} {s.isCurrent ? "(dieses Gerät)" : ""}</span>
                <span className="text-text-muted">{new Date(String(s.lastActiveAt)).toLocaleString("de-DE")}</span>
              </li>
            ))}
          </ul>
        </AdminCard>
      )}
    </div>
  );
}
