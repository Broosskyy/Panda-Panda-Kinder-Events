"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminNotificationCounts, AdminNotificationItem, AdminNotificationPeriodCounts } from "./notifications";

const STORAGE_KEY = "panda-admin-notifications-read";
const POLL_MS = 30_000;

interface ReadState {
  ids: string[];
}

function loadReadState(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as ReadState;
    return new Set(parsed.ids ?? []);
  } catch {
    return new Set();
  }
}

function saveReadState(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: [...ids] }));
}

const EMPTY_COUNTS: AdminNotificationCounts = {
  bookings: 0,
  reviews: 0,
  customers: 0,
  emails: 0,
  total: 0,
};

const EMPTY_PERIOD: AdminNotificationPeriodCounts = {
  bookingsToday: 0,
  bookingsWeek: 0,
  bookingsTotal: 0,
  reviewsToday: 0,
  reviewsWeek: 0,
  reviewsPending: 0,
  reviewsTotal: 0,
  customersLeads: 0,
  emailsFailed: 0,
};

export function useAdminNotifications() {
  const [counts, setCounts] = useState<AdminNotificationCounts>(EMPTY_COUNTS);
  const [period, setPeriod] = useState<AdminNotificationPeriodCounts>(EMPTY_PERIOD);
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadState());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (!res.ok) return;
      setCounts(data.counts ?? EMPTY_COUNTS);
      setPeriod(data.period ?? EMPTY_PERIOD);
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const unreadItems = useMemo(
    () => items.filter((item) => !readIds.has(item.id)),
    [items, readIds],
  );

  const badgeCounts = useMemo(() => {
    const byType = { bookings: 0, reviews: 0, customers: 0, emails: 0 };
    for (const item of unreadItems) {
      if (item.type === "booking") byType.bookings += 1;
      if (item.type === "review") byType.reviews += 1;
      if (item.type === "customer") byType.customers += 1;
      if (item.type === "email") byType.emails += 1;
    }
    return {
      ...byType,
      total: byType.bookings + byType.reviews + byType.customers + byType.emails,
    };
  }, [unreadItems]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadState(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const item of items) next.add(item.id);
      saveReadState(next);
      return next;
    });
  }, [items]);

  const markTypeRead = useCallback(
    (type: AdminNotificationItem["type"]) => {
      setReadIds((prev) => {
        const next = new Set(prev);
        for (const item of items) {
          if (item.type === type) next.add(item.id);
        }
        saveReadState(next);
        return next;
      });
    },
    [items],
  );

  return {
    counts,
    period,
    items,
    unreadItems,
    badgeCounts,
    loading,
    refresh,
    markRead,
    markAllRead,
    markTypeRead,
  };
}
