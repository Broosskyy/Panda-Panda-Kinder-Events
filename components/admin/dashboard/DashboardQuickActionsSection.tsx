"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { resolveAdminIcon } from "@/lib/admin/icons";
import type { DashboardQuickActionItem } from "@/lib/admin/dashboard-v2/types";

export function DashboardQuickActionsSection({
  actions,
  customize,
  onMove,
  onTogglePin,
}: {
  actions: (DashboardQuickActionItem & { pinned?: boolean })[];
  customize: boolean;
  onMove: (id: string, direction: -1 | 1) => void;
  onTogglePin: (id: string) => void;
}) {
  if (actions.length === 0) return null;

  return (
    <section className="dash-v2-section">
      <div className="dash-v2-section-head">
        <h2 className="dash-v2-section-title">Schnellaktionen</h2>
        <Link href="/admin/module" className="dash-v2-link-muted">
          Alle Module
        </Link>
      </div>
      <div className="dash-v2-quick-grid">
        {actions.map((action, index) => {
          const Icon = resolveAdminIcon(action.iconKey);
          return (
            <div key={action.id} className="dash-v2-quick-item-wrap">
              {customize ? (
                <div className="dash-v2-card-controls dash-v2-card-controls-inline">
                  <button type="button" className="dash-v2-icon-btn" onClick={() => onTogglePin(action.id)} aria-label="Favorit">
                    <Star className={`h-3.5 w-3.5 ${action.pinned ? "fill-primary text-primary" : ""}`} />
                  </button>
                  <button type="button" className="dash-v2-icon-btn" disabled={index === 0} onClick={() => onMove(action.id, -1)} aria-label="Nach links">
                    <ChevronUp className="h-3.5 w-3.5 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    className="dash-v2-icon-btn"
                    disabled={index === actions.length - 1}
                    onClick={() => onMove(action.id, 1)}
                    aria-label="Nach rechts"
                  >
                    <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                  </button>
                </div>
              ) : null}
              <Link href={action.href} className="dash-v2-quick-item">
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{action.label}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
