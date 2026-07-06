"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { AdminButton } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_CONFIRM, ADMIN_MSG, confirmDanger } from "@/lib/admin/messages";

export function SessionsView() {
  const [sessions, setSessions] = useState<Array<Record<string, unknown>>>([]);
  const [legacy, setLegacy] = useState(false);
  const { toast, fromApi } = useAdminMessages();
  const page = adminPageHeaderProps("sitzungen");

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
    if (action === "revoke_others" && !confirmDanger(ADMIN_CONFIRM.revokeAllSessions)) return;
    if (action === "revoke_all" && !confirmDanger(ADMIN_CONFIRM.revokeAllSessions)) return;
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
