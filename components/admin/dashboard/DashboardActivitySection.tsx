"use client";

import Link from "next/link";
import { Image, Inbox, Newspaper, Star } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/ui";
import type { AdminActivityItem } from "@/lib/admin/activity";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";

const ACTIVITY_ICONS = {
  booking: Inbox,
  review: Star,
  post: Newspaper,
  gallery: Image,
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

export function DashboardActivitySection({
  activity,
  showAllLink,
}: {
  activity: AdminActivityItem[];
  showAllLink: boolean;
}) {
  const items = activity.slice(0, 5);
  const empty = ADMIN_EMPTY_STATES.activity;

  return (
    <section className="dash-v2-section">
      <div className="dash-v2-section-head">
        <h2 className="dash-v2-section-title">Aktivitäten</h2>
        {showAllLink && activity.length > 0 ? (
          <Link href="/admin/sicherheit/audit" className="dash-v2-link-muted">
            Alle Aktivitäten anzeigen
          </Link>
        ) : null}
      </div>
      {items.length === 0 ? (
        <AdminEmptyState icon={Inbox} title={empty.title} description={empty.description} />
      ) : (
        <ul className="dash-v2-activity-list">
          {items.map((item) => {
            const Icon = ACTIVITY_ICONS[item.type];
            return (
              <li key={item.id}>
                <Link href={item.href} className="dash-v2-activity-item">
                  <div className="dash-v2-activity-icon">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                    <p className="truncate text-xs text-text-muted">{item.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-xs text-text-muted">{formatRelativeTime(item.createdAt)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
