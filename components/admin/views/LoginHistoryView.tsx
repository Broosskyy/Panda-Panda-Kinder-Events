"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { AdminLoadingCard } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";

export function LoginHistoryView() {
  const page = adminPageHeaderProps("loginHistorie");
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { error: showError } = useAdminMessages();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const res = await fetch("/api/admin/security/login-history");
    const data = await res.json();
    if (res.ok) {
      setHistory(data.history ?? []);
    } else {
      const message = data.error ?? "Login-Historie konnte nicht geladen werden.";
      setLoadError(message);
      showError("Login-Historie konnte nicht geladen werden.", message, "Bitte Seite neu laden.");
    }
    setLoading(false);
  }, [showError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page} />
      <SecuritySubNav />
      {loading ? (
        <AdminLoadingCard message="Login-Historie wird geladen…" />
      ) : loadError ? (
        <AdminCard>
          <p className="text-sm text-text-muted">{loadError}</p>
        </AdminCard>
      ) : (
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
      )}
    </div>
  );
}
