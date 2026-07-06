"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Download, Eye, Radio, Users } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton } from "@/components/admin/ui";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import type { DailyStat, FullAnalyticsDashboard } from "@/lib/analytics/types";

function MiniBarChart({
  title,
  data,
  dataKey,
  labelKey,
}: {
  title: string;
  data: { [key: string]: string | number }[];
  dataKey: string;
  labelKey: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[dataKey])), 1);

  return (
    <AdminCard title={title}>
      {data.length === 0 ? (
        <p className="text-sm text-text-muted">Noch keine Daten vorhanden.</p>
      ) : (
        <div className="flex h-40 items-end gap-1.5 sm:gap-2">
          {data.map((row, i) => {
            const value = Number(row[dataKey]);
            const height = Math.max(8, Math.round((value / max) * 100));
            const label = String(row[labelKey]);
            return (
              <div key={`${label}-${i}`} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-text-muted">{value}</span>
                <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${height}%` }} title={`${label}: ${value}`} />
                <span className="max-w-full truncate text-[10px] text-text-muted">{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}

const BreakdownTable = memo(function BreakdownTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; views: number; visitors: number }[];
}) {
  return (
    <AdminCard title={title}>
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">Noch keine Daten.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[240px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 text-right font-medium">Aufrufe</th>
                <th className="pb-2 text-right font-medium">Besucher</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-text-primary">{row.label}</td>
                  <td className="py-2 pr-4 text-right font-semibold">{row.views}</td>
                  <td className="py-2 text-right">{row.visitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
});

function StatPill({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="admin-stat-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div>
          <p className="font-heading text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-xs font-medium text-text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsView() {
  const page = adminPageHeaderProps("analytics");
  const [data, setData] = useState<FullAnalyticsDashboard | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Laden fehlgeschlagen"));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const hourlyChart = (data?.chartTodayHourly ?? []).map((row) => ({
    label: `${String(row.hour).padStart(2, "0")}:00`,
    views: row.views,
    visitors: row.visitors,
  }));

  const chart7 = data?.chart7Days ?? [];
  const chart30 = data?.chart30Days ?? [];

  return (
    <div className="space-y-8">
      <AdminPageHeader {...page}>
        <AdminButton variant="secondary" href="/api/admin/analytics/export" icon={<Download className="h-4 w-4" />}>
          CSV Export
        </AdminButton>
      </AdminPageHeader>

      {error ? (
        <p className="rounded-xl border border-accent-heart/30 bg-accent-heart/10 px-4 py-3 text-sm text-accent-heart">{error}</p>
      ) : null}

      {data && !data.trackingEnabled ? (
        <p className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm text-text-secondary">
          <strong>Statistik noch nicht eingerichtet.</strong> Supabase ist nicht konfiguriert.
        </p>
      ) : null}

      {data?.trackingEnabled && data.trackingTableReady === false ? (
        <p className="rounded-xl border border-accent-heart/30 bg-accent-heart/10 px-4 py-3 text-sm text-accent-heart">
          <strong>Statistik noch nicht eingerichtet.</strong> Migrationen{" "}
          <code className="font-mono">20260703_page_views_analytics.sql</code> und{" "}
          <code className="font-mono">20260706_analytics_enhanced.sql</code> ausführen.
        </p>
      ) : null}

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-text-primary">
          <Radio className="h-5 w-5 text-primary" aria-hidden />
          Live Counter
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatPill label="Aufrufe heute" value={data?.live.viewsToday ?? "—"} icon={Eye} />
          <StatPill label="Besucher heute" value={data?.live.visitorsToday ?? "—"} icon={Users} />
          <StatPill label="Aufrufe letzte Stunde" value={data?.live.viewsLastHour ?? "—"} icon={Eye} />
          <StatPill label="Besucher letzte Stunde" value={data?.live.visitorsLastHour ?? "—"} icon={Users} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Übersicht</h2>
        <div className="admin-stat-grid">
          <StatPill label="Besucher gesamt" value={data?.visitors.total ?? "—"} icon={Users} />
          <StatPill label="Besucher heute" value={data?.visitors.today ?? "—"} icon={Users} />
          <StatPill label="Besucher 7 Tage" value={data?.visitors.last7Days ?? "—"} icon={Users} />
          <StatPill label="Besucher 30 Tage" value={data?.visitors.last30Days ?? "—"} icon={Users} />
          <StatPill label="Aufrufe gesamt" value={data?.pageViews.total ?? "—"} icon={Eye} />
          <StatPill label="Aufrufe heute" value={data?.pageViews.today ?? "—"} icon={Eye} />
          <StatPill label="Aufrufe 7 Tage" value={data?.pageViews.last7Days ?? "—"} icon={Eye} />
          <StatPill label="Aufrufe 30 Tage" value={data?.pageViews.last30Days ?? "—"} icon={Eye} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <MiniBarChart
          title="Heute — stündlich (Aufrufe)"
          data={hourlyChart}
          dataKey="views"
          labelKey="label"
        />
        <MiniBarChart
          title="Heute — stündlich (Besucher)"
          data={hourlyChart}
          dataKey="visitors"
          labelKey="label"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <MiniBarChart
          title="Letzte 7 Tage"
          data={chart7.map((d: DailyStat) => ({ label: d.date.slice(5), views: d.views, visitors: d.visitors }))}
          dataKey="views"
          labelKey="label"
        />
        <MiniBarChart
          title="Letzte 30 Tage"
          data={chart30.map((d: DailyStat) => ({ label: d.date.slice(5), views: d.views, visitors: d.visitors }))}
          dataKey="views"
          labelKey="label"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AdminCard title="Beliebteste Seiten">
          {!data?.topPages.length ? (
            <p className="text-sm text-text-muted">Noch keine Seitenaufrufe.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-2 font-medium">Seite</th>
                    <th className="pb-2 text-right font-medium">Aufrufe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((page) => (
                    <tr key={page.path} className="border-b border-border/50">
                      <td className="py-2 font-mono text-text-primary">{page.path}</td>
                      <td className="py-2 text-right font-semibold">{page.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>

        <AdminCard title="Referrer">
          {!data?.referrers.length ? (
            <p className="text-sm text-text-muted">Noch keine Referrer-Daten.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-2 font-medium">Quelle</th>
                    <th className="pb-2 text-right font-medium">Aufrufe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrers.map((row) => (
                    <tr key={row.referrer} className="border-b border-border/50">
                      <td className="py-2 text-text-primary">{row.referrer}</td>
                      <td className="py-2 text-right font-semibold">{row.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <BreakdownTable title="Geräte" rows={data?.devices ?? []} />
        <BreakdownTable title="Browser" rows={data?.browsers ?? []} />
        <BreakdownTable title="Betriebssystem" rows={data?.operatingSystems ?? []} />
      </section>

      <p className="text-xs text-text-muted">
        Datenschutz: Keine IP-Adressen, keine Cookies. Nur anonyme Session-IDs in sessionStorage. Admin-Aufrufe und Bots
        werden nicht gezählt.
      </p>
    </div>
  );
}
