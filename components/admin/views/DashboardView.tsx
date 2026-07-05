"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  Image,
  Inbox,
  Newspaper,
  Star,
  Users,
} from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import type { AdminAnalyticsDashboard } from "@/lib/analytics/types";

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
  const content = (
    <AdminCard className={`h-full ${href ? "transition-shadow hover:shadow-md" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <Icon className="h-7 w-7 shrink-0 text-primary/70" aria-hidden />
        <span className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">{value}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-text-secondary">{label}</p>
    </AdminCard>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function MiniBarChart({
  title,
  data,
  dataKey,
}: {
  title: string;
  data: { date: string; views: number; visitors: number }[];
  dataKey: "views" | "visitors";
}) {
  const max = Math.max(...data.map((d) => d[dataKey]), 1);

  return (
    <AdminCard title={title}>
      {data.length === 0 ? (
        <p className="text-sm text-text-muted">Noch keine Daten vorhanden.</p>
      ) : (
        <div className="flex h-36 items-end gap-1.5 sm:gap-2">
          {data.map((row) => {
            const height = Math.max(8, Math.round((row[dataKey] / max) * 100));
            const label = new Date(row.date).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
            });
            return (
              <div key={row.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-text-muted">{row[dataKey]}</span>
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all"
                  style={{ height: `${height}%` }}
                  title={`${label}: ${row[dataKey]}`}
                />
                <span className="text-[10px] text-text-muted">{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}

export function DashboardView() {
  const [stats, setStats] = useState<AdminAnalyticsDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Laden fehlgeschlagen"));
  }, []);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Kennzahlen, Besucherstatistik und CMS-Überblick."
      />

      {error ? (
        <p className="rounded-xl border border-accent-heart/30 bg-accent-heart/10 px-4 py-3 text-sm text-accent-heart">
          {error}
        </p>
      ) : null}

      {stats && !stats.trackingEnabled ? (
        <p className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm text-text-secondary">
          <strong>Statistik noch nicht eingerichtet.</strong> Supabase ist nicht konfiguriert — Besucherstatistiken sind
          erst nach Konfiguration und Migration verfügbar.
        </p>
      ) : null}

      {stats?.trackingEnabled && stats.trackingTableReady === false ? (
        <p className="rounded-xl border border-accent-heart/30 bg-accent-heart/10 px-4 py-3 text-sm text-accent-heart">
          <strong>Statistik noch nicht eingerichtet.</strong> Die Tabelle <code className="font-mono">page_views</code>{" "}
          fehlt. Bitte Migration <code className="font-mono">20260703_page_views_analytics.sql</code> in Supabase
          ausführen.
        </p>
      ) : null}

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-text-primary">
          <Users className="h-5 w-5 text-primary" aria-hidden />
          Besucher
        </h2>
        {stats?.trackingEnabled && stats.trackingTableReady === false ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
            Statistik noch nicht eingerichtet — Migration ausführen, um Besucherzahlen zu sehen.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Gesamtbesucher" value={stats?.visitors.total ?? "—"} icon={Users} />
            <StatCard label="Besucher heute" value={stats?.visitors.today ?? "—"} icon={Users} />
            <StatCard label="Letzte 7 Tage" value={stats?.visitors.last7Days ?? "—"} icon={Users} />
            <StatCard label="Letzte 30 Tage" value={stats?.visitors.last30Days ?? "—"} icon={Users} />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-text-primary">
          <Eye className="h-5 w-5 text-primary" aria-hidden />
          Seitenaufrufe
        </h2>
        {stats?.trackingEnabled && stats.trackingTableReady === false ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
            Statistik noch nicht eingerichtet — Migration ausführen, um Seitenaufrufe zu sehen.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Seitenaufrufe gesamt" value={stats?.pageViews.total ?? "—"} icon={Eye} />
            <StatCard label="Aufrufe heute" value={stats?.pageViews.today ?? "—"} icon={Eye} />
            <StatCard label="Aufrufe 7 Tage" value={stats?.pageViews.last7Days ?? "—"} icon={Eye} />
            <StatCard label="Aufrufe 30 Tage" value={stats?.pageViews.last30Days ?? "—"} icon={Eye} />
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <MiniBarChart title="Besucher — letzte 7 Tage" data={stats?.chart7Days ?? []} dataKey="visitors" />
        <MiniBarChart title="Seitenaufrufe — letzte 7 Tage" data={stats?.chart7Days ?? []} dataKey="views" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <MiniBarChart title="Besucher — letzte 30 Tage" data={stats?.chart30Days ?? []} dataKey="visitors" />
        <MiniBarChart title="Seitenaufrufe — letzte 30 Tage" data={stats?.chart30Days ?? []} dataKey="views" />
      </section>

      <section>
        <AdminCard title="Meistbesuchte Seiten">
          {!stats?.topPages.length ? (
            <p className="text-sm text-text-muted">Noch keine Seitenaufrufe erfasst.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-2 pr-4 font-medium">Seite</th>
                    <th className="pb-2 font-medium text-right">Aufrufe</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topPages.map((page) => (
                    <tr key={page.path} className="border-b border-border/50">
                      <td className="py-2.5 pr-4 font-mono text-text-primary">{page.path}</td>
                      <td className="py-2.5 text-right font-semibold text-text-primary">{page.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-text-primary">
          <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
          CMS Kennzahlen
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard label="Anfragen gesamt" value={stats?.bookings.total ?? "—"} href="/admin/anfragen" icon={Inbox} />
          <StatCard label="Neue Anfragen" value={stats?.bookings.new ?? "—"} href="/admin/anfragen" icon={Inbox} />
          <StatCard label="Bestätigte Anfragen" value={stats?.bookings.confirmed ?? "—"} href="/admin/anfragen" icon={Inbox} />
          <StatCard label="Bewertungen gesamt" value={stats?.reviews.total ?? "—"} href="/admin/bewertungen" icon={Star} />
          <StatCard label="Offene Bewertungen" value={stats?.reviews.pending ?? "—"} href="/admin/bewertungen" icon={Star} />
          <StatCard label="Freigegebene Bewertungen" value={stats?.reviews.approved ?? "—"} href="/admin/bewertungen" icon={Star} />
          <StatCard label="Galerie-Bilder gesamt" value={stats?.galleryCount ?? "—"} href="/admin/galerie" icon={Image} />
          <StatCard label="Beiträge gesamt" value={stats?.postsCount ?? "—"} href="/admin/beitraege" icon={Newspaper} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/inhalte", label: "Startseiten-Inhalte bearbeiten" },
          { href: "/admin/galerie", label: "Galerie pflegen" },
          { href: "/admin/beitraege", label: "Beitrag erstellen" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-4 text-sm font-medium text-primary hover:bg-primary/10"
          >
            → {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
