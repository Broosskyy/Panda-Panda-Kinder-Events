"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { AdminLoadingCard } from "@/components/admin/ui";

interface SecurityWarning {
  id: string;
  tone: "warning" | "danger" | "info";
  label: string;
  href?: string;
}

interface SessionRow {
  id: string;
  deviceLabel: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

export function SecurityCenterView() {
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<SecurityWarning[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [recentLogins, setRecentLogins] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/security/center");
    const data = await res.json();
    if (res.ok) {
      setWarnings(data.warnings ?? []);
      setSessions((data.sessions ?? []).slice(0, 5));
      setTotpEnabled(Boolean(data.totpEnabled));
      setRecentLogins((data.history ?? []).filter((h: { success: boolean }) => h.success).length);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6 dash-v2-security">
      <AdminPageHeader
        title="Sicherheitscenter"
        description="Sessions, Logins, 2FA und Warnungen auf einen Blick."
      />
      <SecuritySubNav />

      {loading ? (
        <AdminLoadingCard message="Sicherheitscenter wird geladen…" />
      ) : (
        <>
          <section className="dash-v2-chips" aria-label="Sicherheitsstatus">
            <span className={`dash-v2-chip ${totpEnabled ? "dash-v2-chip-success" : "dash-v2-chip-warning"}`}>
              {totpEnabled ? "2FA aktiv" : "2FA aus"}
            </span>
            <span className="dash-v2-chip dash-v2-chip-info">{sessions.length} aktive Sessions</span>
            <span className="dash-v2-chip dash-v2-chip-muted">{recentLogins} erfolgreiche Logins</span>
          </section>

          {warnings.length > 0 ? (
            <AdminCard title="Sicherheitswarnungen">
              <ul className="space-y-2 text-sm">
                {warnings.map((w) => (
                  <li key={w.id}>
                    {w.href ? (
                      <Link href={w.href} className={`dash-v2-chip dash-v2-chip-${w.tone}`}>
                        {w.label}
                      </Link>
                    ) : (
                      <span className={`dash-v2-chip dash-v2-chip-${w.tone}`}>{w.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </AdminCard>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <AdminCard title="Aktive Sessions">
              <ul className="space-y-2 text-sm">
                {sessions.length === 0 ? (
                  <li className="text-text-muted">Keine aktiven Sitzungen.</li>
                ) : (
                  sessions.map((s) => (
                    <li key={s.id} className="flex justify-between gap-3 rounded-lg border border-border px-3 py-2">
                      <span>
                        {s.deviceLabel || "Gerät"}
                        {s.isCurrent ? " · dieses Gerät" : ""}
                      </span>
                      <span className="text-text-muted">{new Date(s.lastActiveAt).toLocaleString("de-DE")}</span>
                    </li>
                  ))
                )}
              </ul>
              <Link href="/admin/sicherheit/sitzungen" className="dash-v2-link-muted mt-3 inline-block">
                Alle Sessions verwalten
              </Link>
            </AdminCard>

            <AdminCard title="Schnellzugriff">
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/admin/sicherheit/login-historie" className="dash-v2-quick-item">
                  Login-Historie
                </Link>
                <Link href="/admin/sicherheit/audit" className="dash-v2-quick-item">
                  Aktivitätsprotokoll
                </Link>
                <Link href="/admin/sicherheit/2fa" className="dash-v2-quick-item">
                  2FA
                </Link>
                <Link href="/admin/sicherheit/benutzer" className="dash-v2-quick-item">
                  Benutzer & Rollen
                </Link>
              </div>
            </AdminCard>
          </div>
        </>
      )}
    </div>
  );
}
