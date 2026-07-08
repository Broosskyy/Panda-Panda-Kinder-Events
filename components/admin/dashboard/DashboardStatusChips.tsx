"use client";

import Link from "next/link";
import type { DashboardSemanticTone, DashboardStatusChip } from "@/lib/admin/dashboard-v2/types";

const TONE_CLASS: Record<DashboardSemanticTone, string> = {
  success: "dash-v2-chip-success",
  warning: "dash-v2-chip-warning",
  danger: "dash-v2-chip-danger",
  info: "dash-v2-chip-info",
  muted: "dash-v2-chip-muted",
};

const TONE_DOT: Record<DashboardSemanticTone, string> = {
  success: "🟢",
  warning: "🟡",
  danger: "🔴",
  info: "🔵",
  muted: "⚪",
};

function Chip({ chip }: { chip: DashboardStatusChip }) {
  const className = `dash-v2-chip ${TONE_CLASS[chip.tone]}`;
  const content = (
    <>
      <span aria-hidden>{TONE_DOT[chip.tone]}</span>
      <span>{chip.label}</span>
    </>
  );
  return chip.href ? (
    <Link href={chip.href} className={className}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}

export function DashboardStatusChips({ chips }: { chips: DashboardStatusChip[] }) {
  if (chips.length === 0) return null;
  return (
    <section className="dash-v2-chips" aria-label="Status">
      {chips.map((chip) => (
        <Chip key={chip.id} chip={chip} />
      ))}
    </section>
  );
}
