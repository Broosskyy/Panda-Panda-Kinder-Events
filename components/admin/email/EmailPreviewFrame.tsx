"use client";

import { useCallback, useEffect, useState } from "react";
import { Code, Monitor, Moon, Smartphone, Sun, Tablet } from "lucide-react";

export type EmailPreviewMode = "desktop" | "tablet" | "mobile" | "dark" | "light";

import type { EmailTemplateLayout } from "@/lib/cms/types";

interface EmailPreviewFrameProps {
  slug?: string;
  subject?: string;
  bodyHtml?: string;
  layout?: EmailTemplateLayout | null;
  enabled?: boolean;
}

const MODE_CONFIG: { id: EmailPreviewMode; label: string; width: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "768px", icon: Tablet },
  { id: "mobile", label: "Mobil", width: "390px", icon: Smartphone },
  { id: "light", label: "Hell", width: "100%", icon: Sun },
  { id: "dark", label: "Dunkel", width: "100%", icon: Moon },
];

export function EmailPreviewFrame({ slug, subject, bodyHtml, layout, enabled = true }: EmailPreviewFrameProps) {
  const [mode, setMode] = useState<EmailPreviewMode>("desktop");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHtml, setShowHtml] = useState(false);

  const loadPreview = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/email/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, subject, bodyHtml, layout, previewMode: mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Vorschau fehlgeschlagen");
      setHtml(data.html ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vorschau fehlgeschlagen");
      setHtml("");
    } finally {
      setLoading(false);
    }
  }, [slug, subject, bodyHtml, layout, mode, enabled]);

  useEffect(() => {
    const timer = setTimeout(() => void loadPreview(), 400);
    return () => clearTimeout(timer);
  }, [loadPreview]);

  const width = MODE_CONFIG.find((m) => m.id === mode)?.width ?? "100%";
  const frameBg = mode === "dark" ? "#1a1a18" : "#f7f3ea";

  return (
    <div className="admin-email-preview-frame space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {MODE_CONFIG.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              mode === id ? "bg-primary text-white" : "border border-border bg-bg-card text-text-secondary"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowHtml((v) => !v)}
          className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            showHtml ? "bg-primary text-white" : "border border-border bg-bg-card text-text-secondary"
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          HTML
        </button>
      </div>

      {loading ? <p className="text-sm text-text-muted">Vorschau wird geladen…</p> : null}
      {error ? <p className="text-sm text-accent-heart">{error}</p> : null}

      {showHtml ? (
        <textarea
          className="admin-input min-h-[320px] w-full font-mono text-xs"
          readOnly
          value={html}
          aria-label="HTML-Quellcode der E-Mail-Vorschau"
        />
      ) : (
        <div
          className="mx-auto overflow-hidden rounded-xl border border-border"
          style={{ maxWidth: width, background: frameBg }}
        >
          {html ? (
            <iframe
              title="E-Mail-Vorschau"
              srcDoc={html}
              className="w-full border-0"
              style={{ minHeight: 520, background: frameBg }}
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="flex min-h-[200px] items-center justify-center p-6 text-sm text-text-muted">
              Vorschau erscheint hier
            </div>
          )}
        </div>
      )}
    </div>
  );
}
