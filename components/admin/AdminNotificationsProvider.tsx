"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAdminNotifications } from "@/lib/admin/use-admin-notifications";
import type { AdminNotificationCounts, AdminNotificationItem, AdminNotificationPeriodCounts } from "@/lib/admin/notifications";

interface AdminNotificationsContextValue {
  counts: AdminNotificationCounts;
  period: AdminNotificationPeriodCounts;
  items: AdminNotificationItem[];
  unreadItems: AdminNotificationItem[];
  badgeCounts: {
    bookings: number;
    reviews: number;
    customers: number;
    emails: number;
    total: number;
  };
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  markTypeRead: (type: AdminNotificationItem["type"]) => void;
}

const AdminNotificationsContext = createContext<AdminNotificationsContextValue | null>(null);

export function AdminNotificationsProvider({ children }: { children: ReactNode }) {
  const value = useAdminNotifications();
  return <AdminNotificationsContext.Provider value={value}>{children}</AdminNotificationsContext.Provider>;
}

export function useAdminNotificationsContext() {
  const ctx = useContext(AdminNotificationsContext);
  if (!ctx) {
    throw new Error("useAdminNotificationsContext must be used within AdminNotificationsProvider");
  }
  return ctx;
}
