"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { AdminLoadingCard } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";

interface LoginHistoryEntry {
  id: string;
  identifier_attempt: string | null;
  success: boolean;
  device_label: string | null;
  os_label: string | null;
  browser_label: string | null;
  created_at: string;
  user_display_name?: string | null;
}

function formatUserLabel(entry: LoginHistoryEntry): string {
  if (entry.user_display_name?.trim()) return entry.user_display_name.trim();
  if (entry.identifier_attempt?.trim()) return entry.identifier_attempt.trim();
  return "Unbekannt";
}

function formatDeviceLabel(entry: LoginHistoryEntry): string {
  const parts = [entry.browser_label, entry.os_label, entry.device_label].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Gerät unbekannt";
}

export function LoginHistoryView() {
  const page = adminPageHeaderProps("loginHistorie");
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
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
                <li
                  key={h.id}
                  className="rounded-lg border border-border px-3 py-3 sm:flex sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-text-primary">{formatUserLabel(h)}</p>
                    <p className="text-text-muted">{formatDeviceLabel(h)}</p>
                    <p>
                      <span className={h.success ? "text-primary" : "text-accent-heart"}>
                        {h.success ? "Erfolgreich" : "Fehlgeschlagen"}
                      </span>
                    </p>
                  </div>
                  <p className="mt-2 shrink-0 text-text-muted sm:mt-0 sm:text-right">
                    {new Date(h.created_at).toLocaleString("de-DE")}
                  </p>
                </li>
              ))
            )}
          </ul>
        </AdminCard>
      )}
    </div>
  );
}
