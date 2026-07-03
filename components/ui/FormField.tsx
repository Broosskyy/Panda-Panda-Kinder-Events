import { type ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  required,
  error,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`floating-field ${className}`}>
      {children}
      <label htmlFor={id} className="floating-label">
        {label}
        {required && (
          <>
            <span className="text-accent-heart" aria-hidden>
              {" "}
              *
            </span>
            <span className="sr-only"> (Pflichtfeld)</span>
          </>
        )}
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-accent-heart">
          {error}
        </p>
      )}
    </div>
  );
}
