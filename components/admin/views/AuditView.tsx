"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";

export function AuditView() {
  const page = adminPageHeaderProps("audit");
  const [audit, setAudit] = useState<Array<Record<string, unknown>>>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/security/audit");
    const data = await res.json();
    if (res.ok) setAudit(data.logs ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page} />
      <SecuritySubNav />
      <AdminCard>
        <ul className="space-y-2 text-sm">
          {audit.length === 0 ? (
            <li className="text-text-muted">Noch keine Einträge.</li>
          ) : (
            audit.map((log) => (
              <li key={String(log.id)} className="rounded-lg border border-border px-3 py-2">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{String(log.action)} · {String(log.area)}</span>
                  <span className="text-text-muted">{new Date(String(log.created_at)).toLocaleString("de-DE")}</span>
                </div>
                <p className="text-text-muted">
                  {String(log.user_display_name)} ({String(log.role_slug ?? "—")})
                  {log.success === false ? " — Fehler" : ""}
                </p>
              </li>
            ))
          )}
        </ul>
      </AdminCard>
    </div>
  );
}
