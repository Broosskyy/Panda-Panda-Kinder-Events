"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Mail, RotateCcw } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import type { EmailLogRecord } from "@/lib/cms/types";

const STATUS_LABELS: Record<string, string> = {
  sent: "Gesendet",
  failed: "Fehlgeschlagen",
};

type FilterDays = "1" | "7" | "30" | "all";

interface Props {
  customerId: string;
}

export function CustomerCommunicationTimeline({ customerId }: Props) {
  const [communications, setCommunications] = useState<EmailLogRecord[]>([]);
  const [filter, setFilter] = useState<FilterDays>("all");
  const [preview, setPreview] = useState<EmailLogRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const q = filter === "all" ? "" : `?days=${filter}`;
    const res = await fetch(`/api/admin/customers/${customerId}/communications${q}`);
    const data = await res.json();
    if (res.ok) setCommunications(data.communications ?? []);
    setLoading(false);
  }, [customerId, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const resend = async (log: EmailLogRecord) => {
    const res = await fetch(`/api/admin/email/logs/${log.id}/resend`, { method: "POST" });
    const data = await res.json();
    if (res.ok) await load();
    else alert(data.error ?? "Erneut senden fehlgeschlagen.");
  };

  return (
    <div className="mt-6 border-t border-border pt-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-primary">Kommunikation</h3>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["1", "Heute"],
              ["7", "7 Tage"],
              ["30", "30 Tage"],
              ["all", "Alle"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filter === value ? "bg-primary text-white" : "bg-bg-secondary text-text-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Kommunikation wird geladen…</p>
      ) : communications.length === 0 ? (
        <p className="text-sm text-text-muted">Noch keine E-Mails mit diesem Kunden protokolliert.</p>
      ) : (
        <ul className="relative space-y-0 border-l-2 border-primary/20 pl-4">
          {communications.map((log) => (
            <li key={log.id} className="relative pb-6 last:pb-0">
              <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-bg-card" />
              <div className="rounded-xl border border-border bg-bg-card p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-text-primary">{log.subject}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(log.created_at).toLocaleString("de-DE")}
                      {log.template_slug ? ` · ${log.template_slug}` : ""}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${log.status === "sent" ? "text-primary" : "text-accent-heart"}`}>
                    {STATUS_LABELS[log.status] ?? log.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  An: {log.original_recipient || log.recipient}
                  {log.sender_from ? ` · Von: ${log.sender_from}` : ""}
                </p>
                {log.body_preview ? <p className="mt-1 line-clamp-2 text-xs text-text-muted">{log.body_preview}</p> : null}
                {log.error_message ? <p className="mt-1 text-xs text-accent-heart">{log.error_message}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminButton variant="ghost" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => setPreview(log)}>
                    Vorschau
                  </AdminButton>
                  {log.status === "failed" || log.template_slug ? (
                    <AdminButton variant="ghost" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => void resend(log)}>
                      Erneut senden
                    </AdminButton>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPreview(null)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-xl bg-bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-text-primary">{preview.subject}</h4>
            </div>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-text-muted">Empfänger</dt><dd>{preview.original_recipient || preview.recipient}</dd></div>
              <div><dt className="text-text-muted">Absender</dt><dd>{preview.sender_from || "—"}</dd></div>
              <div><dt className="text-text-muted">Status</dt><dd>{STATUS_LABELS[preview.status]}</dd></div>
              <div><dt className="text-text-muted">Datum</dt><dd>{new Date(preview.created_at).toLocaleString("de-DE")}</dd></div>
            </dl>
            {preview.body_preview ? (
              <p className="mt-4 rounded-lg bg-bg-secondary p-3 text-sm text-text-secondary">{preview.body_preview}</p>
            ) : null}
            <AdminButton className="mt-4" variant="secondary" onClick={() => setPreview(null)}>
              Schließen
            </AdminButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
