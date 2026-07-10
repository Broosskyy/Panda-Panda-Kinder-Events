"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminHelpBlock } from "@/components/admin/ui/AdminHelpBlock";
import { AdminButton } from "@/components/admin/ui";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { ADMIN_HOME_PATH } from "@/lib/admin/routes";
import { FIRST_STEPS_DONT_DELETE, type FirstStepsResponse } from "@/lib/admin/first-steps";

export function ErsteSchritteView() {
  const { status, identity } = useAdminSession();
  const [progress, setProgress] = useState<FirstStepsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const identityReady = status === "ready" && Boolean(identity?.displayName);
  const welcomeName = identity?.displayName ?? "";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/admin/first-steps");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Fortschritt konnte nicht geladen werden.");
        if (!cancelled) setProgress(data as FirstStepsResponse);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Fortschritt konnte nicht geladen werden.");
          setProgress(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const progressLabel = useMemo(() => {
    if (!progress) return "";
    return `${progress.completedCount} von ${progress.totalCount} erledigt`;
  }, [progress]);

  return (
    <div className="space-y-8">
      {!identityReady ? (
        <div className="admin-page-header-block space-y-4 animate-pulse" aria-busy="true" aria-label="Profil wird geladen">
          <div className="h-8 w-48 rounded-lg bg-border" />
          <div className="h-4 w-full max-w-xl rounded bg-border" />
        </div>
      ) : (
        <AdminPageHeader
          title="Erste Schritte"
          description={`Willkommen, ${welcomeName}! Deine dauerhafte Checkliste — Schritt für Schritt, ohne technisches Vorwissen.`}
          whereVisible="Nur hier im Admin — Besucher sehen diese Seite nicht. Startet nie automatisch."
        />
      )}

      {loading ? (
        <p className="text-sm text-text-muted">Fortschritt wird geladen…</p>
      ) : loadError ? (
        <AdminCard>
          <p className="text-sm text-accent-heart">{loadError}</p>
        </AdminCard>
      ) : progress ? (
        <AdminCard title="Dein Fortschritt">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-text-primary">{progressLabel}</span>
              <span className="text-text-muted">{progress.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        </AdminCard>
      ) : null}

      <details className="admin-help-collapsible">
        <summary className="admin-page-help-toggle cursor-pointer list-none">
          <BookOpen className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>So funktioniert der Admin — Tipp anzeigen</span>
        </summary>
        <AdminHelpBlock title="Kurz erklärt" variant="tip" className="mt-2">
          <p className="text-sm leading-relaxed">
            Diese Checkliste bleibt dauerhaft verfügbar. Das interaktive Tutorial beim ersten Login findest du unter
            Einstellungen → Hilfe → Tutorial erneut starten.
          </p>
        </AdminHelpBlock>
      </details>

      <section>
        <h2 className="admin-dashboard-section-title mb-4">Deine wichtigsten Aufgaben</h2>
        {!loading && progress && progress.steps.length === 0 ? (
          <p className="text-sm text-text-muted">
            Für deine Rolle sind hier keine Bearbeitungsaufgaben hinterlegt — nutze die Navigation für die Ansicht.
          </p>
        ) : (
          <div className="space-y-3">
            {(progress?.steps ?? []).map((step) => {
              const Icon = step.icon;
              const DoneIcon = step.completed ? CheckCircle2 : Circle;
              return (
                <div
                  key={step.id}
                  className={`admin-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${step.completed ? "border-primary/20 bg-primary/5" : ""}`}
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-text-primary">{step.title}</h3>
                        <DoneIcon
                          className={`h-4 w-4 shrink-0 ${step.completed ? "text-primary" : "text-text-muted"}`}
                          aria-hidden
                        />
                        {step.completed ? (
                          <span className="text-xs font-medium text-primary">Erledigt</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">{step.body}</p>
                    </div>
                  </div>
                  <AdminButton variant={step.completed ? "secondary" : "primary"} href={step.href} className="min-h-11 shrink-0">
                    {step.completed ? "Öffnen" : "Jetzt starten"}
                  </AdminButton>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="admin-dashboard-section-title mb-4">Bitte nicht löschen</h2>
        <AdminCard>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
            {FIRST_STEPS_DONT_DELETE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </AdminCard>
      </section>

      <Link
        href={ADMIN_HOME_PATH}
        className="admin-card inline-flex items-center gap-3 border-primary/20 bg-primary/5 transition-colors hover:border-primary/40"
      >
        <BookOpen className="h-5 w-5 text-primary" aria-hidden />
        <span className="font-medium text-text-primary">Zurück zur Übersicht</span>
      </Link>
    </div>
  );
}
