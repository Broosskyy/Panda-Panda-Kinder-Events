"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  FileText,
  Image,
  Inbox,
  Newspaper,
  Star,
  Users,
  Mail,
} from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminEmptyState } from "@/components/admin/ui";
import { AdminHelpBlock } from "@/components/admin/ui/AdminHelpBlock";
import { useAdminNotificationsContext } from "@/components/admin/AdminNotificationsProvider";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import type { AdminActivityItem } from "@/lib/admin/activity";
import { DASHBOARD_QUICK_ACTIONS, filterQuickActions } from "@/lib/admin/quickActions";
import { resolveAdminIcon } from "@/lib/admin/icons";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import type { DomainVerificationDisplay } from "@/lib/email/resend-domain-check";
import { DomainVerificationBanner } from "@/components/admin/email/DomainVerificationBanner";
import type { AdminAnalyticsDashboard } from "@/lib/analytics/types";
import type { DashboardTaskCard } from "@/lib/admin/dashboard-tasks";
import { filterDashboardModuleLinks } from "@/lib/admin/dashboard-tasks";
import type { RoleHelpItem } from "@/lib/admin/role-help";
import { hasPermission } from "@/lib/auth/permissions";

interface DashboardUser {
  displayName: string;
  roleSlug: string;
  roleLabel: string;
}

interface DashboardPayload extends AdminAnalyticsDashboard {
  user?: DashboardUser;
  roleHelp?: RoleHelpItem[];
  dashboardDescription?: string;
  tasks?: DashboardTaskCard[];
  emailTestMode?: { enabled: boolean; address: string } | null;
  security?: AdminAnalyticsDashboard["security"];
  error?: string;
}

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
  highlight,
}: {
  label: string;
  value: number | string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  sublabel?: string;
  highlight?: boolean;
}) {
  const inner = (
    <div className={`admin-stat-card h-full ${href ? "admin-stat-card-link" : ""} ${highlight ? "admin-stat-card-highlight" : ""}`}>
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

function greetingForHour(hour: number): string {
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

function tasksBySection(tasks: DashboardTaskCard[], section: DashboardTaskCard["section"]) {
  return tasks.filter((task) => task.section === section);
}

function DashboardHeaderSkeleton() {
  return (
    <div className="admin-page-header-block space-y-4 animate-pulse" aria-busy="true" aria-label="Profil wird geladen">
      <div className="space-y-3">
        <div className="h-8 w-64 max-w-full rounded-lg bg-border" />
        <div className="h-4 w-96 max-w-full rounded bg-border" />
      </div>
      <div className="h-4 w-28 rounded bg-border" />
    </div>
  );
}

export function DashboardView() {
  const { period, badgeCounts } = useAdminNotificationsContext();
  const { status: sessionStatus, identity, permissions: sessionPermissions } = useAdminSession();
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [domainVerification, setDomainVerification] = useState<DomainVerificationDisplay | null>(null);
  const [emailTestSucceeded, setEmailTestSucceeded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionPermissions.length > 0) {
      setPermissions(sessionPermissions);
    }
  }, [sessionPermissions]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dashboard").then((r) => r.json()),
      fetch("/api/admin/activity").then((r) => r.json()),
      fetch("/api/admin/email/status", { cache: "no-store" }).then((r) => r.json()).catch(() => ({})),
    ])
      .then(([dashboardData, activityData, emailData]) => {
        if (dashboardData.error) throw new Error(dashboardData.error);
        setPayload(dashboardData);
        setActivity(activityData.activity ?? []);
        if (emailData.domainLive?.state || emailData.resolved?.domainVerification) {
          setDomainVerification(emailData.domainLive?.state ?? emailData.resolved.domainVerification);
        }
        setEmailTestSucceeded(Boolean(emailData.hasSuccessfulTest));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Laden fehlgeschlagen"))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);
  const displayName = identity?.displayName ?? payload?.user?.displayName;
  const roleLabel = identity?.roleLabel ?? payload?.user?.roleLabel ?? "";
  const identityReady = sessionStatus === "ready" && Boolean(displayName);
  const stats = payload;
  const statsMissing = analyticsUnavailable(stats);
  const activityEmpty = ADMIN_EMPTY_STATES.activity;

  const todayTasks = useMemo(
    () => tasksBySection(payload?.tasks ?? [], "today"),
    [payload?.tasks],
  );
  const securityTasks = useMemo(
    () => tasksBySection(payload?.tasks ?? [], "security"),
    [payload?.tasks],
  );
  const crmTasks = useMemo(
    () => tasksBySection(payload?.tasks ?? [], "crm"),
    [payload?.tasks],
  );
  const statsTasks = useMemo(
    () => tasksBySection(payload?.tasks ?? [], "stats"),
    [payload?.tasks],
  );
  const quickActions = useMemo(
    () => filterQuickActions(DASHBOARD_QUICK_ACTIONS, permissions),
    [permissions],
  );
  const moduleLinks = useMemo(
    () => filterDashboardModuleLinks(permissions),
    [permissions],
  );
  const showErsteSchritte = hasPermission(permissions, "website:write") || hasPermission(permissions, "quotes:write");
  const showEmailTestBanner = payload?.emailTestMode?.enabled;
  const showDomainBanner = hasPermission(permissions, "settings:system") && domainVerification;

  const filteredActivity = useMemo(() => {
    return activity.filter((item) => {
      if (item.type === "booking") return hasPermission(permissions, "inquiries:write");
      if (item.type === "review") return hasPermission(permissions, "reviews:write") || hasPermission(permissions, "website:read");
      if (item.type === "post") return hasPermission(permissions, "posts:write");
      if (item.type === "gallery") return hasPermission(permissions, "gallery:write");
      return true;
    });
  }, [activity, permissions]);

  return (
    <div className="space-y-8">
      {!identityReady ? (
        <DashboardHeaderSkeleton />
      ) : (
        <AdminPageHeader
          title={`${greeting}, ${displayName}!`}
          description={payload?.dashboardDescription ?? "Hier siehst du auf einen Blick, was heute zu tun ist."}
          whereVisible="Nur hier im Admin — Besucher sehen das Dashboard nicht."
          helpItems={payload?.roleHelp?.map((item) => `${item.title}: ${item.body}`) ?? []}
        />
      )}

      {identityReady && roleLabel ? (
        <p className="text-sm font-medium text-text-secondary">
          Rolle: <span className="text-text-primary">{roleLabel}</span>
        </p>
      ) : null}

      {showErsteSchritte ? (
        <Link
          href="/admin/erste-schritte"
          className="admin-card flex items-center gap-4 border-primary/20 bg-primary/5 transition-colors hover:border-primary/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <BookOpen className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Erste Schritte — Anleitung für den Einstieg</p>
            <p className="text-sm text-text-secondary">Texte, Bilder, Anfragen, Angebote und Rechnungen Schritt für Schritt erklärt.</p>
          </div>
        </Link>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-accent-heart/30 bg-accent-heart/10 px-4 py-3 text-sm text-accent-heart">
          {error}
        </p>
      ) : null}

      {showEmailTestBanner ? (
        <div className="rounded-xl border border-amber-400/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>⚠ Testmodus aktiv</strong> — Es werden keine echten Kunden angeschrieben. Alle E-Mails gehen an{" "}
          <strong>{payload?.emailTestMode?.address || "die konfigurierte Testadresse"}</strong>.{" "}
          {hasPermission(permissions, "settings:system") ? (
            <Link href="/admin/einstellungen?tab=email&emailTab=testmode" className="font-semibold underline">
              Testmodus verwalten
            </Link>
          ) : null}
        </div>
      ) : null}

      {showDomainBanner ? (
        <DomainVerificationBanner
          className="mb-4"
          state={domainVerification}
          hasSuccessfulTest={emailTestSucceeded}
        />
      ) : null}

      {loading ? (
        <p className="text-sm text-text-muted">Übersicht wird geladen…</p>
      ) : null}

      {payload?.roleHelp && payload.roleHelp.length > 0 && identityReady ? (
        <section className="admin-dashboard-section">
          <h2 className="admin-dashboard-section-title">Hinweise für deine Rolle</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {payload.roleHelp.map((item) => (
              <AdminHelpBlock key={item.title} title={item.title} variant="tip">
                <p className="text-sm leading-relaxed">{item.body}</p>
              </AdminHelpBlock>
            ))}
          </div>
        </section>
      ) : null}

      <section className="admin-dashboard-section">
        <h2 className="admin-dashboard-section-title">Heute zu tun</h2>
        {todayTasks.length === 0 ? (
          <AdminEmptyState
            icon={Inbox}
            title="Alles erledigt."
            description="Keine offenen Aufgaben für deine Rolle — gut gemacht!"
          />
        ) : (
          <div className="admin-stat-grid">
            {todayTasks.map((task) => {
              const Icon = resolveAdminIcon(task.iconKey);
              return (
                <StatCard
                  key={task.id}
                  label={task.label}
                  value={task.value}
                  href={task.href}
                  icon={Icon}
                  sublabel={task.sublabel}
                  highlight={task.highlight}
                />
              );
            })}
          </div>
        )}
      </section>

      {quickActions.length > 0 ? (
        <section className="admin-dashboard-section">
          <h2 className="admin-dashboard-section-title">Schnellaktionen</h2>
          <div className="admin-quick-actions">
            {quickActions.map(({ href, label, iconKey }) => {
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
      ) : null}

      {(hasPermission(permissions, "inquiries:write") ||
        hasPermission(permissions, "reviews:write") ||
        hasPermission(permissions, "crm:read") ||
        hasPermission(permissions, "email:write")) && (
        <section className="admin-dashboard-section">
          <h2 className="admin-dashboard-section-title">Letzte Zahlen</h2>
          <div className="admin-stat-grid">
            {hasPermission(permissions, "inquiries:write") ? (
              <StatCard
                label="Neue Anfragen"
                value={period.bookingsToday}
                href="/admin/anfragen"
                icon={Inbox}
                sublabel={`Heute · ${period.bookingsWeek} diese Woche · ${period.bookingsTotal} gesamt`}
                highlight={badgeCounts.bookings > 0}
              />
            ) : null}
            {hasPermission(permissions, "reviews:write") ? (
              <StatCard
                label="Offene Bewertungen"
                value={period.reviewsPending}
                href="/admin/bewertungen"
                icon={Star}
                sublabel={`${period.reviewsToday} heute · ${period.reviewsWeek} diese Woche · ${period.reviewsTotal} gesamt`}
                highlight={badgeCounts.reviews > 0}
              />
            ) : null}
            {hasPermission(permissions, "crm:read") ? (
              <StatCard
                label="Interessenten"
                value={period.customersLeads}
                href="/admin/kunden"
                icon={Users}
                sublabel="Unbearbeitete Kontakte"
                highlight={badgeCounts.customers > 0}
              />
            ) : null}
            {hasPermission(permissions, "email:write") ? (
              <StatCard
                label="E-Mail-Fehler"
                value={period.emailsFailed}
                href="/admin/emails"
                icon={Mail}
                sublabel="Letzte 7 Tage"
                highlight={badgeCounts.emails > 0}
              />
            ) : null}
          </div>
        </section>
      )}

      {statsTasks.length > 0 ? (
        <section className="admin-dashboard-section">
          <h2 className="admin-dashboard-section-title">Statistik</h2>
          <div className="admin-stat-grid">
            {hasPermission(permissions, "analytics:read") ? (
              <>
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
              </>
            ) : null}
          </div>
        </section>
      ) : null}

      {securityTasks.length > 0 ? (
        <section className="admin-dashboard-section">
          <h2 className="admin-dashboard-section-title">Sicherheit & System</h2>
          <div className="admin-stat-grid">
            {securityTasks.map((task) => {
              const Icon = resolveAdminIcon(task.iconKey);
              return (
                <StatCard
                  key={task.id}
                  label={task.label}
                  value={task.value}
                  href={task.href}
                  icon={Icon}
                  sublabel={task.sublabel}
                  highlight={task.highlight}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {crmTasks.length > 0 ? (
        <section className="admin-dashboard-section">
          <h2 className="admin-dashboard-section-title">Kunden & Dokumente</h2>
          <div className="admin-stat-grid">
            {crmTasks.map((task) => {
              const Icon = resolveAdminIcon(task.iconKey);
              return (
                <StatCard
                  key={task.id}
                  label={task.label}
                  value={task.value}
                  href={task.href}
                  icon={Icon}
                  sublabel={task.sublabel}
                  highlight={task.highlight}
                />
              );
            })}
            {hasPermission(permissions, "quotes:write") ? (
              <StatCard
                label="Offene Angebote"
                value={stats?.crm.openQuotesCount ?? "—"}
                href="/admin/angebote"
                icon={FileText}
              />
            ) : null}
            {hasPermission(permissions, "invoices:write") ? (
              <StatCard
                label="Offene Rechnungen"
                value={stats?.crm.openInvoicesCount ?? "—"}
                href="/admin/rechnungen"
                icon={FileText}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {stats && !stats.trackingEnabled && hasPermission(permissions, "analytics:read") ? (
        <AdminHelpBlock title="Besucherstatistik" variant="info">
          Die Besucherzahlen sind noch nicht aktiv — das beeinträchtigt Website und Anfragen nicht.
        </AdminHelpBlock>
      ) : null}

      {stats?.trackingEnabled && stats.trackingTableReady === false && hasPermission(permissions, "analytics:read") ? (
        <AdminHelpBlock title="Besucherstatistik" variant="warning">
          Die Statistik wird gerade eingerichtet. Du kannst alle anderen Bereiche normal nutzen.
        </AdminHelpBlock>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Letzte Aktivitäten">
          {filteredActivity.length === 0 ? (
            <AdminEmptyState
              icon={Inbox}
              title={activityEmpty.title}
              description={activityEmpty.description}
            />
          ) : (
            <ul className="space-y-1">
              {filteredActivity.map((item) => {
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

        {moduleLinks.length > 0 ? (
          <AdminCard title="Module">
            <div className="grid gap-3 sm:grid-cols-2">
              {moduleLinks.map((link) => (
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
        ) : null}
      </section>
    </div>
  );
}
