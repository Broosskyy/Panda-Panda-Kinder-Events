"use client";

import Link from "next/link";
import type { DashboardStatItem } from "@/lib/admin/dashboard-v2/types";

export function DashboardStatsGrid({ items }: { items: DashboardStatItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="dash-v2-section">
      <h2 className="dash-v2-section-title">Statistik</h2>
      <div className="dash-v2-stats-grid">
        {items.map((item) => {
          const inner = (
            <>
              <p className="dash-v2-stat-value">{item.value}</p>
              <p className="dash-v2-stat-label">{item.label}</p>
            </>
          );
          return item.href ? (
            <Link key={item.id} href={item.href} className="dash-v2-stat-card dash-v2-stat-link">
              {inner}
            </Link>
          ) : (
            <div key={item.id} className="dash-v2-stat-card">
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
