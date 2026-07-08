"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { UsersSecurityTabs } from "@/components/admin/UsersSecurityTabs";
import { AdminLoadingCard } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";

interface LoginHistoryEntry {
  id: string;
  identifier_attempt: string | null;
  success: boolean;
  device_label: string | null;
  os_label: string | null;
  browser_label: string | null;
  role_slug: string | null;
  role_label: string | null;
  ip_masked: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
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

function formatLocation(entry: LoginHistoryEntry): string {
  const parts = [entry.city, entry.region, entry.country_code].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export function LoginHistoryView({ embedded = false }: { embedded?: boolean }) {
  const page = adminPageHeaderProps("loginHistorie");
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [ip, setIp] = useState("");
  const [device, setDevice] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [successFilter, setSuccessFilter] = useState<"" | "true" | "false">("");
  const { error: showError } = useAdminMessages();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (userId.trim()) params.set("userId", userId.trim());
    if (ip.trim()) params.set("ip", ip.trim());
    if (device.trim()) params.set("device", device.trim());
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(`${to}T23:59:59`).toISOString());
    if (successFilter) params.set("success", successFilter);
    return params.toString();
  }, [device, from, ip, successFilter, to, userId]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const res = await fetch(`/api/admin/security/login-history?${queryString}`);
    const data = await res.json();
    if (res.ok) {
      setHistory(data.history ?? []);
    } else {
      const message = data.error ?? "Login-Historie konnte nicht geladen werden.";
      setLoadError(message);
      showError("Login-Historie konnte nicht geladen werden.", message, "Bitte Seite neu laden.");
    }
    setLoading(false);
  }, [queryString, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page} />
      {embedded ? <UsersSecurityTabs /> : <SecuritySubNav />}

      <AdminCard>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AdminFormField label="Benutzer-ID">
            <input className="admin-input w-full" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="UUID" />
          </AdminFormField>
          <AdminFormField label="IP (maskiert)">
            <input className="admin-input w-full" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="z. B. 192.168" />
          </AdminFormField>
          <AdminFormField label="Gerät">
            <input className="admin-input w-full" value={device} onChange={(e) => setDevice(e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Von">
            <input type="date" className="admin-input w-full" value={from} onChange={(e) => setFrom(e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Bis">
            <input type="date" className="admin-input w-full" value={to} onChange={(e) => setTo(e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Ergebnis">
            <select className="admin-input w-full" value={successFilter} onChange={(e) => setSuccessFilter(e.target.value as "" | "true" | "false")}>
              <option value="">Alle</option>
              <option value="true">Erfolgreich</option>
              <option value="false">Fehlgeschlagen</option>
            </select>
          </AdminFormField>
        </div>
      </AdminCard>

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
              <li className="text-text-muted">Keine Einträge für die Filter.</li>
            ) : (
              history.map((h) => (
                <li
                  key={h.id}
                  className="rounded-lg border border-border px-3 py-3 sm:grid sm:grid-cols-[1fr_auto] sm:gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-text-primary">{formatUserLabel(h)}</p>
                    <p className="text-text-muted">{h.role_label ?? h.role_slug ?? "—"}</p>
                    <p className="text-text-muted">{formatDeviceLabel(h)}</p>
                    <p className="text-text-muted">
                      IP {h.ip_masked ?? "—"} · {formatLocation(h)}
                    </p>
                    <p>
                      <span className={h.success ? "text-primary" : "text-accent-heart"}>
                        {h.success ? "Erfolgreich" : "Fehlgeschlagen"}
                      </span>
                    </p>
                  </div>
                  <p className="mt-2 text-text-muted sm:mt-0 sm:text-right">
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
