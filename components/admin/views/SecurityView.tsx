"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield, Monitor, History, ScrollText } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import type { LoginPolicy, PasswordPolicy, RateLimitPolicy } from "@/lib/auth/types";

type Tab = "settings" | "sessions" | "history" | "audit" | "2fa";

export function SecurityView() {
  const [tab, setTab] = useState<Tab>("settings");
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy | null>(null);
  const [loginPolicy, setLoginPolicy] = useState<LoginPolicy | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitPolicy | null>(null);
  const [sessions, setSessions] = useState<Array<Record<string, unknown>>>([]);
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [audit, setAudit] = useState<Array<Record<string, unknown>>>([]);
  const [totp, setTotp] = useState<{ enabled: boolean; backupCodesRemaining: number; legacy?: boolean } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const { toast, withLoading } = useAdminUi();

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/admin/security/settings");
    const data = await res.json();
    if (res.ok) {
      setPasswordPolicy(data.passwordPolicy);
      setLoginPolicy(data.loginPolicy);
      setRateLimit(data.rateLimit);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    const res = await fetch("/api/admin/security/sessions");
    const data = await res.json();
    if (res.ok) setSessions(data.sessions ?? []);
  }, []);

  const loadHistory = useCallback(async () => {
    const res = await fetch("/api/admin/security/login-history");
    const data = await res.json();
    if (res.ok) setHistory(data.history ?? []);
  }, []);

  const loadAudit = useCallback(async () => {
    const res = await fetch("/api/admin/security/audit");
    const data = await res.json();
    if (res.ok) setAudit(data.logs ?? []);
  }, []);

  const load2fa = useCallback(async () => {
    const res = await fetch("/api/admin/security/2fa");
    const data = await res.json();
    if (res.ok) setTotp(data);
  }, []);

  useEffect(() => {
    void loadSettings();
    void load2fa();
  }, [loadSettings, load2fa]);

  useEffect(() => {
    if (tab === "sessions") void loadSessions();
    if (tab === "history") void loadHistory();
    if (tab === "audit") void loadAudit();
  }, [tab, loadSessions, loadHistory, loadAudit]);

  const saveSettings = async () => {
    if (!passwordPolicy || !loginPolicy || !rateLimit) return;
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/security/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passwordPolicy, loginPolicy, rateLimit }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast(data.message ?? "Gespeichert");
      })(),
    );
  };

  const setup2fa = async () => {
    const res = await fetch("/api/admin/security/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup" }),
    });
    const data = await res.json();
    if (res.ok) setQrDataUrl(data.qrDataUrl);
    else toast(data.error ?? "Fehler", "error");
  };

  const verify2fa = async () => {
    const res = await fetch("/api/admin/security/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", code: totpCode }),
    });
    const data = await res.json();
    if (res.ok) {
      setBackupCodes(data.backupCodes ?? []);
      setQrDataUrl("");
      await load2fa();
      toast("2FA aktiviert");
    } else toast(data.error ?? "Fehler", "error");
  };

  const sessionAction = async (action: string, sessionId?: string) => {
    const res = await fetch("/api/admin/security/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, sessionId }),
    });
    if (res.ok) {
      toast("Aktion ausgeführt");
      await loadSessions();
    } else {
      const data = await res.json();
      toast(data.error ?? "Fehler", "error");
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof Shield }[] = [
    { id: "settings", label: "Einstellungen", icon: Shield },
    { id: "2fa", label: "2FA", icon: Shield },
    { id: "sessions", label: "Sitzungen", icon: Monitor },
    { id: "history", label: "Login-Historie", icon: History },
    { id: "audit", label: "Aktivitätsprotokoll", icon: ScrollText },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Sicherheit" description="Passwortregeln, 2FA, Sitzungen und Audit-Logs." />

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${tab === id ? "bg-primary text-white" : "border border-border bg-bg-card"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "settings" && passwordPolicy && loginPolicy && rateLimit ? (
        <AdminCard title="Sicherheitseinstellungen">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Min. Passwortlänge">
              <input className="admin-input" type="number" value={passwordPolicy.minLength} onChange={(e) => setPasswordPolicy({ ...passwordPolicy, minLength: Number(e.target.value) })} />
            </AdminFormField>
            <AdminFormField label="Max. Login-Versuche">
              <input className="admin-input" type="number" value={loginPolicy.maxAttempts} onChange={(e) => setLoginPolicy({ ...loginPolicy, maxAttempts: Number(e.target.value) })} />
            </AdminFormField>
            <AdminFormField label="Sperrzeit (Min.)">
              <input className="admin-input" type="number" value={loginPolicy.lockoutMinutes} onChange={(e) => setLoginPolicy({ ...loginPolicy, lockoutMinutes: Number(e.target.value) })} />
            </AdminFormField>
            <AdminFormField label="Session (Std.)">
              <input className="admin-input" type="number" value={loginPolicy.sessionHours} onChange={(e) => setLoginPolicy({ ...loginPolicy, sessionHours: Number(e.target.value) })} />
            </AdminFormField>
            <AdminFormField label="Rate Limit / IP">
              <input className="admin-input" type="number" value={rateLimit.loginPerIp} onChange={(e) => setRateLimit({ ...rateLimit, loginPerIp: Number(e.target.value) })} />
            </AdminFormField>
          </div>
          <div className="mt-6">
            <AdminButton variant="primary" onClick={() => void saveSettings()}>Speichern</AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {tab === "2fa" ? (
        <AdminCard title="Zwei-Faktor-Authentifizierung">
          {totp?.legacy ? (
            <p className="text-sm text-text-muted">2FA ist erst nach Anlegen des ersten Benutzers verfügbar.</p>
          ) : totp?.enabled ? (
            <p className="text-sm text-text-secondary">
              2FA ist aktiv. Verbleibende Backup-Codes: {totp.backupCodesRemaining}
            </p>
          ) : (
            <div className="space-y-4">
              <AdminButton variant="primary" onClick={() => void setup2fa()}>2FA einrichten</AdminButton>
              {qrDataUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="2FA QR Code" className="mx-auto h-48 w-48" />
                  <AdminFormField label="Code bestätigen">
                    <input className="admin-input" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
                  </AdminFormField>
                  <AdminButton variant="primary" onClick={() => void verify2fa()}>Aktivieren</AdminButton>
                </>
              ) : null}
            </div>
          )}
          {backupCodes.length > 0 ? (
            <div className="mt-4 rounded-xl border border-border bg-bg-secondary p-4">
              <p className="text-sm font-medium">Backup-Codes (einmalig anzeigen):</p>
              <ul className="mt-2 grid grid-cols-2 gap-1 font-mono text-sm">
                {backupCodes.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          ) : null}
        </AdminCard>
      ) : null}

      {tab === "sessions" ? (
        <AdminCard title="Aktive Sitzungen">
          <div className="mb-4 flex flex-wrap gap-2">
            <AdminButton variant="secondary" onClick={() => void sessionAction("revoke_others")}>Andere Geräte abmelden</AdminButton>
            <AdminButton variant="danger" onClick={() => void sessionAction("revoke_all")}>Alle abmelden</AdminButton>
          </div>
          <ul className="space-y-2 text-sm">
            {sessions.map((s) => (
              <li key={String(s.id)} className="flex justify-between rounded-lg border border-border px-3 py-2">
                <span>{String(s.deviceLabel)} {s.isCurrent ? "(aktuell)" : ""}</span>
                <span className="text-text-muted">{new Date(String(s.lastActiveAt)).toLocaleString("de-DE")}</span>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}

      {tab === "history" ? (
        <AdminCard title="Login-Historie">
          <ul className="space-y-2 text-sm">
            {history.map((h) => (
              <li key={String(h.id)} className="flex justify-between rounded-lg border border-border px-3 py-2">
                <span>{String(h.browser_label)} · {String(h.os_label)} · {h.success ? "OK" : "Fehlgeschlagen"}</span>
                <span className="text-text-muted">{new Date(String(h.created_at)).toLocaleString("de-DE")}</span>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}

      {tab === "audit" ? (
        <AdminCard title="Aktivitätsprotokoll">
          <ul className="space-y-2 text-sm">
            {audit.map((log) => (
              <li key={String(log.id)} className="rounded-lg border border-border px-3 py-2">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{String(log.action)} · {String(log.area)}</span>
                  <span className="text-text-muted">{new Date(String(log.created_at)).toLocaleString("de-DE")}</span>
                </div>
                <p className="text-text-muted">{String(log.user_display_name)} ({String(log.role_slug ?? "—")})</p>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}
    </div>
  );
}
