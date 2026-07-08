"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown, Lightbulb, AlertTriangle, Info } from "lucide-react";

type AdminHelpVariant = "info" | "tip" | "warning";

interface AdminHelpBlockProps {
  title?: string;
  children: ReactNode;
  variant?: AdminHelpVariant;
  className?: string;
}

const variantIcon: Record<AdminHelpVariant, typeof Info> = {
  info: Info,
  tip: Lightbulb,
  warning: AlertTriangle,
};

export function AdminHelpBlock({
  title,
  children,
  variant = "info",
  className = "",
}: AdminHelpBlockProps) {
  const Icon = variantIcon[variant];
  return (
    <div className={`admin-help-block admin-help-block-${variant} ${className}`}>
      <Icon className="admin-help-block-icon h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="admin-help-block-title">{title}</p> : null}
        <div className="admin-help-block-body">{children}</div>
      </div>
    </div>
  );
}

interface AdminPageHelpProps {
  items: string[];
  className?: string;
}

/** Einklappbare Kurzhilfe — eine Zeile sichtbar, Details per Klick */
export function AdminPageHelp({ items, className = "" }: AdminPageHelpProps) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  const summary = items[0]!;
  const bullets = items.slice(0, 3);

  return (
    <div className={`admin-page-help ${className}`}>
      <button
        type="button"
        className="admin-page-help-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Lightbulb className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="admin-page-help-summary">{open ? "Hilfe ausblenden" : summary}</span>
        <ChevronDown className={`admin-page-help-chevron ${open ? "admin-page-help-chevron-open" : ""}`} aria-hidden />
      </button>
      {open ? (
        <AdminHelpBlock title="Ausführliche Hilfe" variant="tip">
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm leading-relaxed">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </AdminHelpBlock>
      ) : null}
    </div>
  );
}
