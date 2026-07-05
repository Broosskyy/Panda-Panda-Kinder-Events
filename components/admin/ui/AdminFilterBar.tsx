import type { ReactNode } from "react";

interface AdminFilterBarProps {
  children: ReactNode;
  className?: string;
}

export function AdminFilterBar({ children, className = "" }: AdminFilterBarProps) {
  return <div className={`admin-filter-bar ${className}`}>{children}</div>;
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
