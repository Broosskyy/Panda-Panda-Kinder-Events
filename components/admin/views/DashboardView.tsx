"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Image,
  Inbox,
  Newspaper,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminEmptyState } from "@/components/admin/ui";
import type { AdminActivityItem } from "@/lib/admin/activity";
import { DASHBOARD_QUICK_ACTIONS } from "@/lib/admin/quickActions";
import { resolveAdminIcon } from "@/lib/admin/icons";
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
  sublabel,
}: {
  label: string;
  value: number | string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  sublabel?: string;
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
      {sublabel ? <p className="mt-0.5 text-xs text-text-muted">{sublabel}</p> : null}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

const ACTIVITY_ICONS = {
  booking: Inbox,
  review: Star,
  post: Newspaper,
  gallery: Image,
} as const;

function analyticsUnavailable(stats: AdminAnalyticsDashboard | null): boolean {
  return Boolean(stats && (!stats.trackingEnabled || stats.trackingTableReady === false));
}

export function DashboardView() {
  const [stats, setStats] = useState<AdminAnalyticsDashboard | null>(null);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [emailUsesTestDomain, setEmailUsesTestDomain] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dashboard").then((r) => r.json()),
      fetch("/api/admin/activity").then((r) => r.json()),
      fetch("/api/admin/email/status").then((r) => r.json()),
    ])
      .then(([dashboardData, activityData, emailData]) => {
        if (dashboardData.error) throw new Error(dashboardData.error);
        setStats(dashboardData);
        setActivity(activityData.activity ?? []);
        if (emailData.resolved) {
          setEmailUsesTestDomain(Boolean(emailData.resolved.usesTestDomain));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Laden fehlgeschlagen"))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
  const statsMissing = analyticsUnavailable(stats);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`${greeting}!`}
        description="Willkommen im Panda-Bande Admin — hier verwaltest du Website, Anfragen und CRM an einem Ort."
      />

      {error ? (
        <p className="rounded-xl border border-accent-heart/30 bg-accent-heart/10 px-4 py-3 text-sm text-accent-heart">
          {error}
        </p>
      ) : null}

      {emailUsesTestDomain ? (
        <div className="rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>E-Mail: Resend-Testdomain aktiv.</strong> Versand läuft über{" "}
          <code className="rounded bg-white/60 px-1">onboarding@resend.dev</code> — für den Livegang Domain in Resend
          verifizieren und unter{" "}
          <Link href="/admin/einstellungen?tab=email" className="font-semibold underline">
            Einstellungen → E-Mail
          </Link>{" "}
          prüfen.
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-text-muted">Dashboard wird geladen…</p>
      ) : null}

      <section className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Schnellaktionen</h2>
        <div className="admin-quick-actions">
          {DASHBOARD_QUICK_ACTIONS.map(({ href, label, iconKey }) => {
            const Icon = resolveAdminIcon(iconKey);
            return (
            <Link key={href + label} href={href} className="admin-quick-action">
              <Icon className="h-5 w-5 text-primary" aria-hidden />
              {label}
            </Link>
            );
          })}
        </div>
      </section>

      <section className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Statistik</h2>
        <div className="admin-stat-grid">
          <StatCard
            label="Besucher gesamt"
            value={statsMissing ? "—" : (stats?.visitors.total ?? "—")}
            href="/admin/analytics"
            icon={Users}
            sublabel={statsMissing ? "Statistik nicht aktiv" : undefined}
          />
          <StatCard
            label="Besucher heute"
            value={statsMissing ? "—" : (stats?.visitors.today ?? "—")}
            href="/admin/analytics"
            icon={BarChart3}
          />
          <StatCard
            label="Letzte 7 Tage"
            value={statsMissing ? "—" : (stats?.visitors.last7Days ?? "—")}
            href="/admin/analytics"
            icon={BarChart3}
          />
        </div>
      </section>

      <section className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Sicherheit & System</h2>
        <div className="admin-stat-grid">
          <StatCard
            label="Aktive Benutzer"
            value={stats?.security?.activeUsers ?? "—"}
            href="/admin/sicherheit/benutzer"
            icon={Users}
          />
          <StatCard
            label="Letzte Logins"
            value={stats?.security?.recentLogins ?? "—"}
            href="/admin/sicherheit"
            icon={Shield}
          />
          <StatCard
            label="Systemstatus"
            value={
              stats?.security?.systemStatus === "legacy"
                ? "Legacy"
                : stats?.security?.systemStatus === "ok"
                  ? "OK"
                  : "—"
            }
            href="/admin/sicherheit"
            icon={Shield}
          />
        </div>
      </section>

      <section className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">CRM</h2>
        <div className="admin-stat-grid">
          <StatCard label="Kunden" value={stats?.crm.customersCount ?? "—"} href="/admin/kunden" icon={Users} />
          <StatCard label="Offene Angebote" value={stats?.crm.openQuotesCount ?? "—"} href="/admin/angebote" icon={FileText} />
          <StatCard label="Offene Rechnungen" value={stats?.crm.openInvoicesCount ?? "—"} href="/admin/rechnungen" icon={FileText} />
        </div>
      </section>

      <section className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Website</h2>
        <div className="admin-stat-grid">
          <StatCard label="Neue Anfragen" value={stats?.bookings.new ?? "—"} href="/admin/anfragen" icon={Inbox} />
          <StatCard label="Offene Bewertungen" value={stats?.reviews.pending ?? "—"} href="/admin/bewertungen" icon={Star} />
          <StatCard label="Beiträge" value={stats?.postsCount ?? "—"} href="/admin/beitraege" icon={Newspaper} />
          <StatCard label="Galerie-Bilder" value={stats?.galleryCount ?? "—"} href="/admin/galerie" icon={Image} />
        </div>
      </section>

      {stats && !stats.trackingEnabled ? (
        <p className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm text-text-secondary">
          <strong>Statistik noch nicht eingerichtet.</strong> Supabase ist nicht konfiguriert.
        </p>
      ) : null}

      {stats?.trackingEnabled && stats.trackingTableReady === false ? (
        <p className="rounded-xl border border-accent-heart/30 bg-accent-heart/10 px-4 py-3 text-sm text-accent-heart">
          <strong>Statistik noch nicht eingerichtet – page_views Migration ausführen.</strong>
        </p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Letzte Aktivitäten">
          {activity.length === 0 ? (
            <AdminEmptyState
              icon={Inbox}
              title="Noch keine Aktivitäten"
              description="Sobald Anfragen, Beiträge oder Galerie-Uploads eingehen, erscheinen sie hier."
            />
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

        <AdminCard title="Module">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/admin/kunden", label: "Kunden & CRM" },
              { href: "/admin/angebote", label: "Angebote" },
              { href: "/admin/inhalte", label: "Website-Inhalte" },
              { href: "/admin/analytics", label: "Analytics" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </AdminCard>
      </section>
    </div>
  );
}
