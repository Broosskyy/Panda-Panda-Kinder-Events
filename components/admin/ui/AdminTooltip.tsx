"use client";

import { useState, useId, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { ADMIN_GLOSSARY, type AdminGlossaryKey } from "@/lib/admin/glossary";

interface AdminTooltipProps {
  term: AdminGlossaryKey | string;
  label?: string;
  className?: string;
}

export function AdminTooltip({ term, label = "Mehr erfahren", className = "" }: AdminTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const text = term in ADMIN_GLOSSARY ? ADMIN_GLOSSARY[term as AdminGlossaryKey] : term;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <span ref={ref} className={`relative inline-flex align-middle ${className}`}>
      <button
        type="button"
        className="admin-tooltip-trigger"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <HelpCircle className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="admin-tooltip-panel"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
