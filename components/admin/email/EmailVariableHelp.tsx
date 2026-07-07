"use client";

import { EMAIL_VARIABLE_HINTS } from "@/lib/email/variables";

export function EmailVariableHelp({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-text-muted">
        Du kannst Platzhalter wie <code className="rounded bg-bg-secondary px-1">{`{{customer_name}}`}</code> verwenden.
        Sie werden automatisch ersetzt. Fehlende Werte bleiben leer.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-secondary/50 p-4 text-sm">
      <p className="font-medium text-text-primary">Platzhalter-Hilfe</p>
      <p className="mt-1 text-text-muted">
        Du kannst diese Platzhalter verwenden. Sie werden automatisch ersetzt. Fehlende Werte bleiben leer.
      </p>
      <ul className="mt-3 grid gap-1 sm:grid-cols-2">
        {EMAIL_VARIABLE_HINTS.map((item) => (
          <li key={item.key} className="text-text-secondary">
            <code className="rounded bg-bg-card px-1 text-xs">{`{{${item.key}}}`}</code>
            <span className="text-text-muted"> = {item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
