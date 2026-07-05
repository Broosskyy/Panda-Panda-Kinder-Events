"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Image,
  Inbox,
  Newspaper,
  Plus,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import type { AdminActivityItem } from "@/lib/admin/activity";
import type { AdminAnalyticsDashboard } from "@/lib/analytics/types";

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const inner = (
    <div className={`admin-stat-card h-full ${href ? "admin-stat-card-link" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <span className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">{value}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-text-secondary">{label}</p>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

const QUICK_ACTIONS = [
  { href: "/admin/anfragen", label: "Neue Anfrage", icon: Inbox },
  { href: "/admin/bewertungen", label: "Neue Bewertung", icon: Star },
  { href: "/admin/beitraege", label: "Neuer Beitrag", icon: Newspaper },
  { href: "/admin/galerie", label: "Neue Galerie", icon: Image },
] as const;

const ACTIVITY_ICONS = {
  booking: Inbox,
  review: Star,
  post: Newspaper,
  gallery: Image,
} as const;

export function DashboardView() {
  const [stats, setStats] = useState<AdminAnalyticsDashboard | null>(null);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dashboard").then((r) => r.json()),
      fetch("/api/admin/activity").then((r) => r.json()),
    ])
      .then(([dashboardData, activityData]) => {
        if (dashboardData.error) throw new Error(dashboardData.error);
        setStats(dashboardData);
        setActivity(activityData.activity ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Laden fehlgeschlagen"));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  return (
    <div className="space-y-8">
      <AdminPageHeader title={`${greeting}!`} description="Willkommen im Panda-Bande CMS — hier ist dein Überblick." />

      {error ? (
        <p className="rounded-xl border border-accent-heart/30 bg-accent-heart/10 px-4 py-3 text-sm text-accent-heart">
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Schnellaktionen</h2>
        <div className="admin-quick-actions">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="admin-quick-action">
              <Icon className="h-5 w-5 text-primary" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Kennzahlen</h2>
        <div className="admin-stat-grid">
          <StatCard label="Neue Anfragen" value={stats?.bookings.new ?? "—"} href="/admin/anfragen" icon={Inbox} />
          <StatCard label="Offene Bewertungen" value={stats?.reviews.pending ?? "—"} href="/admin/bewertungen" icon={Star} />
          <StatCard
            label="Besucher heute"
            value={
              stats?.trackingEnabled && stats.trackingTableReady === false
                ? "—"
                : (stats?.visitors.today ?? "—")
            }
            href="/admin/analytics"
            icon={Users}
          />
          <StatCard label="Beiträge" value={stats?.postsCount ?? "—"} href="/admin/beitraege" icon={Newspaper} />
          <StatCard label="Galeriebilder" value={stats?.galleryCount ?? "—"} href="/admin/galerie" icon={Image} />
          <StatCard label="Leistungen" value={stats?.servicesCount ?? "—"} href="/admin/leistungen" icon={Sparkles} />
          <StatCard label="FAQ" value={stats?.faqsCount ?? "—"} href="/admin/faq" icon={HelpCircle} />
        </div>
      </section>

      {stats && !stats.trackingEnabled ? (
        <p className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm text-text-secondary">
          <strong>Statistik noch nicht eingerichtet.</strong> Supabase ist nicht konfiguriert.
        </p>
      ) : null}

      {stats?.trackingEnabled && stats.trackingTableReady === false ? (
        <p className="rounded-xl border border-accent-heart/30 bg-accent-heart/10 px-4 py-3 text-sm text-accent-heart">
          <strong>Statistik noch nicht eingerichtet.</strong> Migration{" "}
          <code className="font-mono">20260703_page_views_analytics.sql</code> in Supabase ausführen.
        </p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Letzte Aktivitäten">
          {activity.length === 0 ? (
            <div className="py-6 text-center text-sm text-text-muted">Noch keine Aktivitäten vorhanden.</div>
          ) : (
            <ul className="space-y-1">
              {activity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type];
                return (
                  <li key={item.id}>
                    <Link href={item.href} className="admin-activity-item">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                        <p className="text-xs text-text-muted">{item.subtitle}</p>
                      </div>
                      <span className="shrink-0 text-xs text-text-muted">{formatRelativeTime(item.createdAt)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="CMS Kurzlinks">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/admin/inhalte", label: "Startseiten-Inhalte" },
              { href: "/admin/analytics", label: "Analytics öffnen" },
              { href: "/admin/leistungen", label: "Leistungen pflegen" },
              { href: "/admin/einstellungen", label: "Einstellungen" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Plus className="h-4 w-4 text-primary" aria-hidden />
                {link.label}
              </Link>
            ))}
          </div>
        </AdminCard>
      </section>
    </div>
  );
}
