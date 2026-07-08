"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { AdminButton, AdminLoadingCard } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_CONFIRM, ADMIN_MSG, confirmDanger } from "@/lib/admin/messages";

interface SessionEntry {
  id: string;
  deviceLabel: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

export function SessionsView() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast, fromApi } = useAdminMessages();
  const page = adminPageHeaderProps("sitzungen");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const res = await fetch("/api/admin/security/sessions");
    const data = await res.json();
    if (res.ok) {
      setSessions(data.sessions ?? []);
    } else {
      setLoadError(data.error ?? "Sitzungen konnten nicht geladen werden.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sessionAction = async (action: string) => {
    if (action === "revoke_others" && !confirmDanger(ADMIN_CONFIRM.revokeAllSessions)) return;
    if (action === "revoke_all" && !confirmDanger(ADMIN_CONFIRM.revokeAllDevices)) return;
    const res = await fetch("/api/admin/security/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      toast(ADMIN_MSG.sessionRevoked);
      await load();
    } else {
      const data = await res.json();
      fromApi(data, "Aktion fehlgeschlagen.");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page} />
      <SecuritySubNav />
      {loading ? (
        <AdminLoadingCard message="Sitzungen werden geladen…" />
      ) : loadError ? (
        <AdminCard>
          <p className="text-sm text-text-muted">{loadError}</p>
        </AdminCard>
      ) : (
        <AdminCard>
          <div className="mb-4 flex flex-wrap gap-2">
            <AdminButton variant="secondary" onClick={() => void sessionAction("revoke_others")}>
              Andere Geräte abmelden
            </AdminButton>
            <AdminButton variant="danger" onClick={() => void sessionAction("revoke_all")}>
              Alle Geräte abmelden
            </AdminButton>
          </div>
          <ul className="space-y-2 text-sm">
            {sessions.length === 0 ? (
              <li className="text-text-muted">Keine aktiven Sitzungen gefunden.</li>
            ) : (
              sessions.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    {s.deviceLabel || "Unbekanntes Gerät"}
                    {s.isCurrent ? " (dieses Gerät)" : ""}
                  </span>
                  <span className="text-text-muted">
                    Zuletzt aktiv: {new Date(s.lastActiveAt).toLocaleString("de-DE")}
                  </span>
                </li>
              ))
            )}
          </ul>
        </AdminCard>
      )}
    </div>
  );
}
