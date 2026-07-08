"use client";

import type { AdminIdentity } from "@/components/admin/AdminIdentityPanel";
import type { DashboardSessionMeta } from "@/lib/admin/dashboard-v2/types";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function formatLoginTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const time = date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Heute • ${time} Uhr`;
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) + ` • ${time} Uhr`;
}

function minutesSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

function formatMinutes(mins: number | null): string | null {
  if (mins === null) return null;
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `${mins} Minuten`;
  const hours = Math.floor(mins / 60);
  return `${hours} Std.`;
}

export function DashboardHeroSkeleton() {
  return (
    <section className="dash-v2-hero dash-v2-hero-skeleton" aria-busy="true" aria-label="Profil wird geladen">
      <div className="dash-v2-hero-avatar skeleton-block" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton-block h-7 w-56 max-w-full rounded-lg" />
        <div className="skeleton-block h-4 w-28 rounded" />
        <div className="skeleton-block h-3 w-40 rounded" />
      </div>
    </section>
  );
}

export function DashboardHero({
  identity,
  sessionMeta,
}: {
  identity: AdminIdentity;
  sessionMeta: DashboardSessionMeta;
}) {
  const greeting = greetingForHour(new Date().getHours());
  const lastLogin = formatLoginTime(sessionMeta.lastLoginAt);
  const signedInFor = formatMinutes(minutesSince(sessionMeta.sessionStartedAt));
  const lastActivity = formatMinutes(minutesSince(sessionMeta.lastActivityAt));

  return (
    <section className="dash-v2-hero" aria-label="Willkommen">
      <div className="dash-v2-hero-avatar" aria-hidden>
        {initials(identity.displayName)}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="dash-v2-hero-title">
          {greeting}, {identity.displayName} <span aria-hidden>👋</span>
        </h1>
        <p className="dash-v2-hero-role">{identity.roleLabel}</p>
        <dl className="dash-v2-hero-meta">
          {lastLogin ? (
            <div>
              <dt>Letzter Login</dt>
              <dd>{lastLogin}</dd>
            </div>
          ) : null}
          {signedInFor ? (
            <div>
              <dt>Heute angemeldet seit</dt>
              <dd>{signedInFor}</dd>
            </div>
          ) : null}
          {lastActivity ? (
            <div>
              <dt>Letzte Aktivität</dt>
              <dd>vor {lastActivity}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
