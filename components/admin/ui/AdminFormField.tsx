import type { ReactNode } from "react";
import { AdminTooltip } from "./AdminTooltip";
import type { AdminGlossaryKey } from "@/lib/admin/glossary";

interface AdminFormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  tooltip?: AdminGlossaryKey;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function AdminFormField({
  label,
  htmlFor,
  hint,
  tooltip,
  error,
  required,
  optional,
  children,
  className = "",
}: AdminFormFieldProps) {
  return (
    <div className={`admin-form-field ${className}`}>
      <label htmlFor={htmlFor} className="admin-form-label">
        <span className="inline-flex items-center gap-1.5">
          {label}
          {tooltip ? <AdminTooltip term={tooltip} label={`Erklärung: ${label}`} /> : null}
        </span>
        {required ? <span className="admin-form-required" aria-hidden> *</span> : null}
        {optional && !required ? (
          <span className="admin-form-optional"> (optional)</span>
        ) : null}
      </label>
      {children}
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      {hint && !error ? <p className="admin-form-hint">{hint}</p> : null}
    </div>
  );
}
