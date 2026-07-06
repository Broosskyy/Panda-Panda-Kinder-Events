"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Mail, Save, Send } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { EMAIL_VARIABLE_HINTS } from "@/lib/email/variables";
import type { EmailLogRecord, EmailTemplateRecord } from "@/lib/cms/types";

type Tab = "compose" | "templates" | "log";

export function EmailsView() {
  const { toast, withLoading } = useAdminUi();
  const [tab, setTab] = useState<Tab>("compose");
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([]);
  const [logs, setLogs] = useState<EmailLogRecord[]>([]);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p>Guten Tag {{customer_name}},</p><p>{{message}}</p>");
  const [templateSlug, setTemplateSlug] = useState("general-message");
  const [copyTo, setCopyTo] = useState("");
  const [preview, setPreview] = useState(false);

  const load = useCallback(async () => {
    const [tRes, lRes] = await Promise.all([
      fetch("/api/admin/email/templates"),
      fetch("/api/admin/email/logs"),
    ]);
    const tData = await tRes.json();
    const lData = await lRes.json();
    if (tRes.ok) setTemplates(tData.templates ?? []);
    if (lRes.ok) setLogs(lData.logs ?? []);
  }, []);

  useEffect(() => {
    void withLoading(load());
  }, [load, withLoading]);

  const applyTemplate = (slug: string) => {
    const t = templates.find((x) => x.slug === slug);
    if (!t) return;
    setTemplateSlug(slug);
    setSubject(t.subject);
    setBodyHtml(t.body_html);
  };

  const sendEmail = async (test = false) => {
    if (!to.trim()) return toast("Bitte Empfänger eingeben.", "error");
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/email/compose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: to.trim(),
            subject,
            bodyHtml,
            templateSlug,
            copyTo: copyTo.trim() || undefined,
            area: test ? "test" : "general",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Versand fehlgeschlagen");
        toast(data.message ?? "E-Mail gesendet");
        await load();
      })(),
    );
  };

  const saveTemplate = async () => {
    const t = templates.find((x) => x.slug === templateSlug);
    if (!t) return;
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/email/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: t.slug,
            name: t.name,
            subject,
            body_html: bodyHtml,
            area: t.area,
            is_active: t.is_active,
            is_default: t.is_default,
            variables: t.variables,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast(data.message ?? "Vorlage gespeichert");
        await load();
      })(),
    );
  };

  return (
    <>
      <AdminPageHeader
        title="E-Mails"
        description="E-Mails verfassen, Vorlagen bearbeiten und Versand protokollieren."
      />

      <nav className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["compose", "Verfassen"],
            ["templates", "Vorlagen"],
            ["log", "Protokoll"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === id ? "bg-primary text-white" : "border border-border bg-bg-card text-text-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "compose" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminCard title="Neue E-Mail">
            <div className="grid gap-4">
              <AdminFormField label="Vorlage">
                <select
                  className="admin-input"
                  value={templateSlug}
                  onChange={(e) => applyTemplate(e.target.value)}
                >
                  {templates.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </AdminFormField>
              <AdminFormField label="Empfänger" required>
                <input className="admin-input" type="email" value={to} onChange={(e) => setTo(e.target.value)} />
              </AdminFormField>
              <AdminFormField label="Kopie an (optional)">
                <input className="admin-input" type="email" value={copyTo} onChange={(e) => setCopyTo(e.target.value)} />
              </AdminFormField>
              <AdminFormField label="Betreff">
                <input className="admin-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </AdminFormField>
              <AdminFormField label="Nachricht (HTML)">
                <textarea
                  className="admin-input min-h-40 font-mono text-sm"
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                />
              </AdminFormField>
              <p className="text-xs text-text-muted">
                Variablen: {EMAIL_VARIABLE_HINTS.map((v) => `{{${v}}}`).join(", ")}
              </p>
              <div className="flex flex-wrap gap-2">
                <AdminButton variant="primary" icon={<Send className="h-4 w-4" />} onClick={() => void sendEmail()}>
                  Senden
                </AdminButton>
                <AdminButton variant="secondary" icon={<Mail className="h-4 w-4" />} onClick={() => void sendEmail(true)}>
                  Test senden
                </AdminButton>
                <AdminButton variant="ghost" icon={<Eye className="h-4 w-4" />} onClick={() => setPreview((p) => !p)}>
                  Vorschau
                </AdminButton>
              </div>
            </div>
          </AdminCard>

          <AdminCard title={preview ? "Vorschau" : "Hinweise"}>
            {preview ? (
              <div
                className="prose prose-sm max-w-none rounded-xl border border-border bg-bg-secondary p-4"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>Logo und Firmenname kommen aus Einstellungen → Branding.</li>
                <li>Absender und Reply-To unter Einstellungen → E-Mail.</li>
                <li>Bei nicht verifizierter Resend-Domain wird die Testdomain verwendet.</li>
              </ul>
            )}
          </AdminCard>
        </div>
      ) : null}

      {tab === "templates" ? (
        <AdminCard title="E-Mail-Vorlagen">
          <div className="space-y-4">
            {templates.map((t) => (
              <div key={t.slug} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">
                      {t.slug} · {t.area} {t.is_default ? "· Standard" : ""}
                    </p>
                  </div>
                  <AdminButton variant="secondary" onClick={() => { applyTemplate(t.slug); setTab("compose"); }}>
                    Bearbeiten
                  </AdminButton>
                </div>
                <p className="mt-2 text-sm text-text-secondary">Betreff: {t.subject}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <AdminButton variant="primary" icon={<Save className="h-4 w-4" />} onClick={() => void saveTemplate()}>
              Aktuelle Vorlage speichern
            </AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {tab === "log" ? (
        <AdminCard title="Gesendete E-Mails">
          {logs.length === 0 ? (
            <p className="text-sm text-text-muted">Noch keine Einträge.</p>
          ) : (
            <ul className="divide-y divide-border">
              {logs.map((log) => (
                <li key={log.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-text-primary">{log.subject}</span>
                    <span className={log.status === "sent" ? "text-primary" : "text-accent-heart"}>{log.status}</span>
                  </div>
                  <p className="text-text-muted">{log.recipient}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(log.created_at).toLocaleString("de-DE")}
                    {log.template_slug ? ` · ${log.template_slug}` : ""}
                  </p>
                  {log.error_message ? <p className="text-xs text-accent-heart">{log.error_message}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      ) : null}
    </>
  );
}
