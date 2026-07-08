import type { RoleHelpItem } from "@/lib/admin/role-help";

export type DashboardSemanticTone = "success" | "warning" | "danger" | "info" | "muted";

export interface DashboardStatusChip {
  id: string;
  label: string;
  tone: DashboardSemanticTone;
  href?: string;
}

export interface DashboardTodayCard {
  id: string;
  label: string;
  value: number | string;
  href: string;
  tone: DashboardSemanticTone;
  pinned?: boolean;
}

export interface DashboardStatItem {
  id: string;
  label: string;
  value: number | string;
  href?: string;
}

export interface DashboardQuickActionItem {
  id: string;
  href: string;
  label: string;
  iconKey: string;
  permission: string;
}

export interface DashboardSessionMeta {
  lastLoginAt: string | null;
  sessionStartedAt: string | null;
  lastActivityAt: string | null;
}

export interface DashboardPreferences {
  todayCardOrder: string[];
  quickActionOrder: string[];
  pinnedTodayCards: string[];
  pinnedQuickActions: string[];
  hiddenWidgets: string[];
}

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  todayCardOrder: [],
  quickActionOrder: [],
  pinnedTodayCards: [],
  pinnedQuickActions: [],
  hiddenWidgets: [],
};

export interface DashboardV2Payload {
  sessionMeta: DashboardSessionMeta;
  statusChips: DashboardStatusChip[];
  todayCards: DashboardTodayCard[];
  stats: DashboardStatItem[];
  roleHelp: RoleHelpItem[];
  emailTestMode: { enabled: boolean; address: string } | null;
}
