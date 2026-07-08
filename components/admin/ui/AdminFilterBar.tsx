"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { AdminButton } from "./AdminButton";

interface AdminFilterBarProps {
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  activeCount?: number;
  onReset?: () => void;
}

export function AdminFilterBar({
  children,
  className = "",
  collapsible = false,
  defaultOpen = false,
  activeCount = 0,
  onReset,
}: AdminFilterBarProps) {
  const [open, setOpen] = useState(defaultOpen || !collapsible);

  if (!collapsible) {
    return <div className={`admin-filter-bar ${className}`}>{children}</div>;
  }

  return (
    <div className={`admin-filter-panel ${className}`}>
      <div className="admin-filter-panel-head">
        <button
          type="button"
          className="admin-filter-panel-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          <span>Filter</span>
          {activeCount > 0 ? <span className="admin-filter-active-badge">{activeCount}</span> : null}
          <ChevronDown className={`admin-page-help-chevron ${open ? "admin-page-help-chevron-open" : ""}`} aria-hidden />
        </button>
        {onReset && activeCount > 0 ? (
          <AdminButton variant="ghost" icon={<X className="h-4 w-4" />} onClick={onReset}>
            Zurücksetzen
          </AdminButton>
        ) : null}
      </div>
      {open ? <div className="admin-filter-bar">{children}</div> : null}
    </div>
  );
}

interface AdminFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}

export function AdminFilterSelect({ value, onChange, options, label }: AdminFilterSelectProps) {
  return (
    <label className="admin-filter-select-wrap">
      {label ? <span className="sr-only">{label}</span> : null}
      <select className="admin-input admin-filter-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
