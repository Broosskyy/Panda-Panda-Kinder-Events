import type { ReactNode } from "react";

interface AdminFormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function AdminFormField({ label, htmlFor, hint, error, required, children, className = "" }: AdminFormFieldProps) {
  return (
    <div className={`admin-form-field ${className}`}>
      <label htmlFor={htmlFor} className="admin-form-label">
        {label}
        {required ? <span className="admin-form-required" aria-hidden> *</span> : null}
      </label>
      {children}
      {error ? <p className="admin-form-error">{error}</p> : null}
      {hint && !error ? <p className="admin-form-hint">{hint}</p> : null}
    </div>
  );
}
