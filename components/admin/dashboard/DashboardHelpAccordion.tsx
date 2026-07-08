"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { RoleHelpItem } from "@/lib/admin/role-help";

export function DashboardHelpAccordion({
  items,
  footer,
}: {
  items: RoleHelpItem[];
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  if (items.length === 0 && !footer) return null;

  return (
    <section className="dash-v2-accordion">
      <button
        type="button"
        className="dash-v2-accordion-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>Hilfe & Einführung</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open ? (
        <div className="dash-v2-accordion-panel">
          {items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.title}>
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{item.body}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {footer ? <div className={items.length > 0 ? "mt-3 border-t border-border pt-3" : ""}>{footer}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
