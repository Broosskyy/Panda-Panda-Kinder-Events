"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { EMAIL_VARIABLE_HINTS } from "@/lib/email/variables";

export function EmailVariableHelp({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMAIL_VARIABLE_HINTS;
    return EMAIL_VARIABLE_HINTS.filter(
      (item) => item.key.toLowerCase().includes(q) || item.label.toLowerCase().includes(q),
    );
  }, [query]);

  if (compact) {
    return (
      <p className="text-xs text-text-muted">
        Platzhalter wie <code className="rounded bg-bg-secondary px-1">{`{{customer_name}}`}</code> werden automatisch
        ersetzt.
      </p>
    );
  }

  return (
    <div className="admin-email-variable-help">
      <button
        type="button"
        className="admin-page-help-toggle w-full justify-between"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>Platzhalter-Hilfe</span>
        <ChevronDown className={`admin-page-help-chevron ${open ? "admin-page-help-chevron-open" : ""}`} aria-hidden />
      </button>
      {open ? (
        <div className="admin-email-variable-help-panel">
          <p className="text-xs text-text-muted">
            Platzhalter werden automatisch ersetzt. Fehlende Werte bleiben leer.
          </p>
          <label className="admin-email-variable-search">
            <Search className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
            <input
              type="search"
              className="admin-input admin-input-compact"
              placeholder="Platzhalter suchen…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <ul className="admin-email-variable-list">
            {filtered.map((item) => (
              <li key={item.key}>
                <code>{`{{${item.key}}}`}</code>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
          {filtered.length === 0 ? (
            <p className="text-xs text-text-muted">Keine Platzhalter gefunden.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
