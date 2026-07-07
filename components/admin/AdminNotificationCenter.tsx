"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Inbox, Mail, Star, Users, X } from "lucide-react";
import { useAdminNotificationsContext } from "@/components/admin/AdminNotificationsProvider";
import type { AdminNotificationItem } from "@/lib/admin/notifications";

const TYPE_ICONS = {
  booking: Inbox,
  review: Star,
  customer: Users,
  email: Mail,
} as const;

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function NotificationRow({
  item,
  unread,
  onRead,
  onNavigate,
}: {
  item: AdminNotificationItem;
  unread: boolean;
  onRead: () => void;
  onNavigate: () => void;
}) {
  const Icon = TYPE_ICONS[item.type];
  return (
    <Link
      href={item.href}
      onClick={() => {
        onRead();
        onNavigate();
      }}
      className={`admin-notification-item ${unread ? "admin-notification-item-unread" : ""}`}
    >
      <div className="admin-notification-item-icon">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
        <p className="truncate text-xs text-text-muted">{item.subtitle}</p>
      </div>
      <span className="shrink-0 text-[0.6875rem] text-text-muted">{formatRelativeTime(item.createdAt)}</span>
    </Link>
  );
}

export function AdminNotificationCenter() {
  const { unreadItems, items, badgeCounts, markRead, markAllRead, loading } = useAdminNotificationsContext();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const totalBadge = badgeCounts.total;

  return (
    <div className="admin-notification-center" ref={panelRef}>
      <button
        type="button"
        className="admin-icon-btn admin-notification-bell"
        onClick={() => setOpen((v) => !v)}
        aria-label={totalBadge > 0 ? `${totalBadge} neue Benachrichtigungen` : "Benachrichtigungen"}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {totalBadge > 0 ? (
          <span className="admin-notification-bell-badge" aria-hidden>
            {totalBadge > 9 ? "9+" : totalBadge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="admin-notification-panel" role="dialog" aria-label="Benachrichtigungen">
          <div className="admin-notification-panel-header">
            <p className="font-heading text-sm font-bold text-text-primary">Benachrichtigungen</p>
            <div className="flex items-center gap-1">
              {unreadItems.length > 0 ? (
                <button type="button" className="admin-notification-mark-all" onClick={markAllRead}>
                  Alle gelesen
                </button>
              ) : null}
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <p className="px-4 py-6 text-sm text-text-muted">Wird geladen…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted">Keine neuen Vorgänge.</p>
          ) : (
            <ul className="admin-notification-list">
              {items.map((item) => (
                <li key={item.id}>
                  <NotificationRow
                    item={item}
                    unread={unreadItems.some((u) => u.id === item.id)}
                    onRead={() => markRead(item.id)}
                    onNavigate={() => setOpen(false)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function AdminNavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="admin-nav-badge">{count > 9 ? "9+" : count}</span>;
}
