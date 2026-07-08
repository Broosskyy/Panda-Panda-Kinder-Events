"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { DashboardHero, DashboardHeroSkeleton } from "@/components/admin/dashboard/DashboardHero";
import { DashboardStatusChips } from "@/components/admin/dashboard/DashboardStatusChips";
import { DashboardHelpAccordion } from "@/components/admin/dashboard/DashboardHelpAccordion";
import { DashboardTodaySection } from "@/components/admin/dashboard/DashboardTodaySection";
import { DashboardQuickActionsSection } from "@/components/admin/dashboard/DashboardQuickActionsSection";
import { DashboardStatsGrid } from "@/components/admin/dashboard/DashboardStatsGrid";
import { DashboardActivitySection } from "@/components/admin/dashboard/DashboardActivitySection";
import { DASHBOARD_V2_QUICK_ACTIONS } from "@/lib/admin/dashboard-v2/constants";
import type {
  DashboardPreferences,
  DashboardQuickActionItem,
  DashboardV2Payload,
} from "@/lib/admin/dashboard-v2/types";
import { sortByPreference } from "@/lib/admin/dashboard-v2/sort";
import { filterQuickActions } from "@/lib/admin/quickActions";
import { hasPermission } from "@/lib/auth/permissions";
import type { AdminActivityItem } from "@/lib/admin/activity";

interface DashboardApiResponse {
  v2?: DashboardV2Payload;
  preferences?: DashboardPreferences;
  error?: string;
}

function moveId(ids: string[], id: string, direction: -1 | 1): string[] {
  const index = ids.indexOf(id);
  if (index < 0) return ids;
  const next = [...ids];
  const target = index + direction;
  if (target < 0 || target >= next.length) return ids;
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}

function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function DashboardViewV2() {
  const { status: sessionStatus, identity, permissions } = useAdminSession();
  const [payload, setPayload] = useState<DashboardV2Payload | null>(null);
  const [preferences, setPreferences] = useState<DashboardPreferences | null>(null);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customize, setCustomize] = useState(false);
  const [saving, setSaving] = useState(false);

  const identityReady = sessionStatus === "ready" && Boolean(identity?.displayName);

  useEffect(() => {
    if (!identityReady) return;
    Promise.all([
      fetch("/api/admin/dashboard").then((r) => r.json()),
      fetch("/api/admin/activity").then((r) => r.json()),
    ])
      .then(([dashboardData, activityData]: [DashboardApiResponse, { activity?: AdminActivityItem[] }]) => {
        if (dashboardData.error) throw new Error(dashboardData.error);
        if (!dashboardData.v2) throw new Error("Dashboard-Daten unvollständig.");
        setPayload(dashboardData.v2);
        setPreferences(dashboardData.preferences ?? null);
        setActivity(activityData.activity ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Laden fehlgeschlagen"))
      .finally(() => setLoading(false));
  }, [identityReady]);

  const savePreferences = useCallback(async (next: DashboardPreferences) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/dashboard/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
      setPreferences(data.preferences);
    } finally {
      setSaving(false);
    }
  }, []);

  const todayCards = useMemo(() => {
    if (!payload) return [];
    const prefs = preferences;
    const sorted = sortByPreference(
      payload.todayCards,
      prefs?.todayCardOrder ?? [],
      prefs?.pinnedTodayCards ?? [],
    );
    return sorted.map((card) => ({
      ...card,
      pinned: prefs?.pinnedTodayCards.includes(card.id) ?? false,
    }));
  }, [payload, preferences]);

  const quickActions = useMemo(() => {
    const allowed = filterQuickActions(DASHBOARD_V2_QUICK_ACTIONS, permissions) as DashboardQuickActionItem[];
    const prefs = preferences;
    const sorted = sortByPreference(allowed, prefs?.quickActionOrder ?? [], prefs?.pinnedQuickActions ?? []);
    return sorted.map((action) => ({
      ...action,
      pinned: prefs?.pinnedQuickActions.includes(action.id) ?? false,
    }));
  }, [permissions, preferences]);

  const filteredActivity = useMemo(() => {
    return activity.filter((item) => {
      if (item.type === "booking") return hasPermission(permissions, "inquiries:write");
      if (item.type === "review") return hasPermission(permissions, "reviews:write") || hasPermission(permissions, "website:read");
      if (item.type === "post") return hasPermission(permissions, "posts:write");
      if (item.type === "gallery") return hasPermission(permissions, "gallery:write");
      return true;
    });
  }, [activity, permissions]);

  const updatePrefs = (patch: Partial<DashboardPreferences>) => {
    if (!preferences) return;
    const next = { ...preferences, ...patch };
    setPreferences(next);
    void savePreferences(next);
  };

  const handleTodayMove = (id: string, direction: -1 | 1) => {
    const order = preferences?.todayCardOrder.length
      ? [...preferences.todayCardOrder]
      : todayCards.map((c) => c.id);
    const normalized = todayCards.map((c) => c.id).reduce<string[]>((acc, cardId) => {
      if (!acc.includes(cardId)) acc.push(cardId);
      return acc;
    }, order.filter((x) => todayCards.some((c) => c.id === x)));
    updatePrefs({ todayCardOrder: moveId(normalized, id, direction) });
  };

  const handleQuickMove = (id: string, direction: -1 | 1) => {
    const order = preferences?.quickActionOrder.length
      ? [...preferences.quickActionOrder]
      : quickActions.map((a) => a.id);
    const normalized = quickActions.map((a) => a.id).reduce<string[]>((acc, actionId) => {
      if (!acc.includes(actionId)) acc.push(actionId);
      return acc;
    }, order.filter((x) => quickActions.some((a) => a.id === x)));
    updatePrefs({ quickActionOrder: moveId(normalized, id, direction) });
  };

  if (!identityReady) {
    return (
      <div className="dash-v2">
        <DashboardHeroSkeleton />
      </div>
    );
  }

  return (
    <div className="dash-v2">
      {identity && payload ? (
        <DashboardHero identity={identity} sessionMeta={payload.sessionMeta} />
      ) : (
        <DashboardHeroSkeleton />
      )}

      {loading ? (
        <div className="dash-v2-loading" aria-busy="true">
          <div className="dash-v2-loading-bar skeleton-block" />
          <div className="dash-v2-loading-bar skeleton-block w-2/3" />
        </div>
      ) : null}

      {error ? (
        <p className="dash-v2-error">{error}</p>
      ) : null}

      {payload ? (
        <>
          <DashboardStatusChips chips={payload.statusChips} />

          <div className="dash-v2-toolbar">
            <button
              type="button"
              className="dash-v2-customize-btn"
              onClick={() => setCustomize((v) => !v)}
              aria-pressed={customize}
            >
              {customize ? "Fertig" : "Anpassen"}
            </button>
            {saving ? <span className="text-xs text-text-muted">Speichert…</span> : null}
          </div>

          <DashboardTodaySection
            cards={todayCards}
            customize={customize}
            onMove={handleTodayMove}
            onTogglePin={(id) =>
              updatePrefs({ pinnedTodayCards: toggleInList(preferences?.pinnedTodayCards ?? [], id) })
            }
          />

          <DashboardQuickActionsSection
            actions={quickActions}
            customize={customize}
            onMove={handleQuickMove}
            onTogglePin={(id) =>
              updatePrefs({ pinnedQuickActions: toggleInList(preferences?.pinnedQuickActions ?? [], id) })
            }
          />

          <DashboardHelpAccordion items={payload.roleHelp} />

          <div className="dash-v2-bottom-grid">
            <DashboardStatsGrid items={payload.stats} />
            <DashboardActivitySection
              activity={filteredActivity}
              showAllLink={hasPermission(permissions, "audit:read")}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
