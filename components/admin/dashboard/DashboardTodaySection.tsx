"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/ui";
import { Inbox } from "lucide-react";
import type { DashboardSemanticTone, DashboardTodayCard } from "@/lib/admin/dashboard-v2/types";

const TONE_CLASS: Record<DashboardSemanticTone, string> = {
  success: "dash-v2-card-success",
  warning: "dash-v2-card-warning",
  danger: "dash-v2-card-danger",
  info: "dash-v2-card-info",
  muted: "dash-v2-card-muted",
};

export function DashboardTodaySection({
  cards,
  customize,
  onMove,
  onTogglePin,
}: {
  cards: DashboardTodayCard[];
  customize: boolean;
  onMove: (id: string, direction: -1 | 1) => void;
  onTogglePin: (id: string) => void;
}) {
  return (
    <section className="dash-v2-section">
      <div className="dash-v2-section-head">
        <h2 className="dash-v2-section-title">Heute wichtig</h2>
      </div>
      {cards.length === 0 ? (
        <AdminEmptyState icon={Inbox} title="Alles erledigt." description="Keine offenen Aufgaben für deine Rolle." />
      ) : (
        <div className="dash-v2-today-grid">
          {cards.map((card, index) => (
            <article key={card.id} className={`dash-v2-today-card ${TONE_CLASS[card.tone]}`}>
              {customize ? (
                <div className="dash-v2-card-controls">
                  <button type="button" className="dash-v2-icon-btn" onClick={() => onTogglePin(card.id)} aria-label="Favorit">
                    <Star className={`h-4 w-4 ${card.pinned ? "fill-primary text-primary" : ""}`} />
                  </button>
                  <button type="button" className="dash-v2-icon-btn" disabled={index === 0} onClick={() => onMove(card.id, -1)} aria-label="Nach oben">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="dash-v2-icon-btn"
                    disabled={index === cards.length - 1}
                    onClick={() => onMove(card.id, 1)}
                    aria-label="Nach unten"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
              <Link href={card.href} className="dash-v2-today-link">
                <p className="dash-v2-today-value">{card.value}</p>
                <p className="dash-v2-today-label">{card.label}</p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
