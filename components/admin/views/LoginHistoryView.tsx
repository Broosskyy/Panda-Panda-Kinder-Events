"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";

export function LoginHistoryView() {
  const page = adminPageHeaderProps("loginHistorie");
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/security/login-history");
    const data = await res.json();
    if (res.ok) setHistory(data.history ?? []);
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
          {history.length === 0 ? (
            <li className="text-text-muted">Noch keine Einträge.</li>
          ) : (
            history.map((h) => (
              <li key={String(h.id)} className="flex justify-between rounded-lg border border-border px-3 py-2">
                <span>
                  {String(h.browser_label)} · {String(h.os_label)} ·{" "}
                  <span className={h.success ? "text-primary" : "text-accent-heart"}>
                    {h.success ? "Erfolgreich" : "Fehlgeschlagen"}
                  </span>
                </span>
                <span className="text-text-muted">{new Date(String(h.created_at)).toLocaleString("de-DE")}</span>
              </li>
            ))
          )}
        </ul>
      </AdminCard>
    </div>
  );
}
