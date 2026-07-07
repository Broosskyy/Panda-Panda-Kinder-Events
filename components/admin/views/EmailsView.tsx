"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Mail, RotateCcw, Save } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { EmailVariableHelp } from "@/components/admin/email/EmailVariableHelp";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_MSG } from "@/lib/admin/messages";
import type { EmailLogRecord, EmailTemplateRecord } from "@/lib/cms/types";

type Tab = "templates" | "log";

const EMAIL_LOG_STATUS: Record<string, string> = {
  sent: "Gesendet",
  failed: "Fehlgeschlagen",
  queued: "Wartet",
  bounced: "Fehlgeschlagen",
};

const TEMPLATE_PURPOSES: Record<string, string> = {
  "inquiry-auto-reply": "Diese E-Mail erhält ein Kunde automatisch nach einer Anfrage.",
  "inquiry-admin": "Diese Nachricht erhält ihr, wenn eine neue Kontaktanfrage eingeht.",
  "review-request": "Wird versendet, wenn ihr im Admin eine Bewertungsanfrage an Kunden schickt.",
  "review-admin": "Diese Adresse bekommt eine Nachricht, wenn eine neue Bewertung eingeht.",
  "quote-send": "Text beim Versand eines Angebots per E-Mail (PDF wird angehängt).",
  "invoice-send": "Text beim Versand einer Rechnung per E-Mail (PDF wird angehängt).",
  "password-reset": "E-Mail für Admin-Benutzer, die ihr Passwort vergessen haben.",
  "general-message": "Allgemeine freie Nachricht an Kunden.",
  "security-login": "Optionaler Hinweis bei Admin-Anmeldungen.",
};

const CORE_TEMPLATES = [
  "inquiry-auto-reply",
  "inquiry-admin",
  "review-request",
  "review-admin",
  "quote-send",
  "invoice-send",
  "password-reset",
] as const;

export function EmailsView() {
  const { toast, withLoading, error: showError } = useAdminMessages();
  const page = adminPageHeaderProps("emails");
  const emptyLog = ADMIN_EMPTY_STATES.emailLogs;
  const [tab, setTab] = useState<Tab>("templates");
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([]);
  const [logs, setLogs] = useState<EmailLogRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("inquiry-auto-reply");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [testTo, setTestTo] = useState("");
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

  useEffect(() => {
    if (templates.length === 0) return;
    const t = templates.find((x) => x.slug === selectedSlug) ?? templates[0];
    if (!t) return;
    setSubject(t.subject);
    setBodyHtml(t.body_html);
    setIsActive(t.is_active);
  }, [templates, selectedSlug]);

  const selectTemplate = (slug: string) => {
    const t = templates.find((x) => x.slug === slug);
    if (!t) return;
    setSelectedSlug(slug);
    setSubject(t.subject);
    setBodyHtml(t.body_html);
    setIsActive(t.is_active);
    setPreview(false);
  };

  const saveTemplate = async () => {
    const t = templates.find((x) => x.slug === selectedSlug);
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
            is_active: isActive,
            is_default: t.is_default,
            variables: t.variables,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast(ADMIN_MSG.templateSaved);
        await load();
      })(),
    );
  };

  const resetTemplate = async () => {
    await withLoading(
      (async () => {
        const res = await fetch(`/api/admin/email/templates/${encodeURIComponent(selectedSlug)}/reset`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Zurücksetzen fehlgeschlagen");
        toast(data.message ?? "Vorlage zurückgesetzt.");
        await load();
      })(),
    );
  };

  const sendTest = async () => {
    if (!testTo.trim()) return showError("Bitte Empfänger eingeben.");
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/email/compose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: testTo.trim(),
            subject,
            bodyHtml,
            templateSlug: selectedSlug,
            area: "test",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? ADMIN_MSG.sendFailed);
        toast("Test-E-Mail wurde erfolgreich gesendet.");
        await load();
      })(),
    );
  };

  const coreTemplates = CORE_TEMPLATES.map((slug) => templates.find((t) => t.slug === slug)).filter(Boolean) as EmailTemplateRecord[];
  const otherTemplates = templates.filter((t) => !CORE_TEMPLATES.includes(t.slug as (typeof CORE_TEMPLATES)[number]));
  const selected = templates.find((t) => t.slug === selectedSlug) ?? templates[0];

  return (
    <>
      <AdminPageHeader {...page} />

      <nav className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["templates", "Vorlagen"],
            ["log", "E-Mail-Protokoll"],
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

      {tab === "templates" ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <AdminCard title="Vorlagen">
            <ul className="space-y-2">
              {coreTemplates.map((t) => (
                <li key={t.slug}>
                  <button
                    type="button"
                    onClick={() => selectTemplate(t.slug)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      selectedSlug === t.slug ? "bg-primary/10 font-semibold text-primary" : "text-text-secondary hover:bg-bg-secondary"
                    }`}
                  >
                    {t.name}
                    {!t.is_active ? <span className="ml-1 text-xs text-text-muted">(inaktiv)</span> : null}
                  </button>
                </li>
              ))}
              {otherTemplates.length > 0 ? (
                <>
                  <li className="pt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Weitere</li>
                  {otherTemplates.map((t) => (
                    <li key={t.slug}>
                      <button
                        type="button"
                        onClick={() => selectTemplate(t.slug)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                          selectedSlug === t.slug ? "bg-primary/10 font-semibold text-primary" : "text-text-secondary hover:bg-bg-secondary"
                        }`}
                      >
                        {t.name}
                      </button>
                    </li>
                  ))}
                </>
              ) : null}
            </ul>
          </AdminCard>

          <AdminCard title={selected?.name ?? "Vorlage bearbeiten"}>
            {selected ? (
              <div className="grid gap-4">
                <p className="text-sm text-text-muted">
                  {TEMPLATE_PURPOSES[selected.slug] ?? "E-Mail-Vorlage für automatischen oder manuellen Versand."}
                </p>
                <AdminFormField label="Aktiv">
                  <label className="admin-checkbox-row">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    <span>Vorlage ist aktiv (inaktive Vorlagen werden übersprungen — CMS-Texte greifen dann)</span>
                  </label>
                </AdminFormField>
                <AdminFormField label="Betreff">
                  <input className="admin-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </AdminFormField>
                <AdminFormField label="Nachrichtentext (HTML)">
                  <textarea
                    className="admin-input min-h-48 font-mono text-sm"
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                  />
                </AdminFormField>
                <EmailVariableHelp compact />
                <AdminFormField label="Testmail senden an">
                  <div className="flex flex-wrap gap-2">
                    <input className="admin-input min-w-[14rem] flex-1" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="deine@adresse.de" />
                    <AdminButton variant="secondary" icon={<Mail className="h-4 w-4" />} onClick={() => void sendTest()}>
                      Testmail senden
                    </AdminButton>
                  </div>
                </AdminFormField>
                <div className="flex flex-wrap gap-2">
                  <AdminButton variant="primary" icon={<Save className="h-4 w-4" />} onClick={() => void saveTemplate()}>
                    {ADMIN_BTN.save}
                  </AdminButton>
                  <AdminButton variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={() => void resetTemplate()}>
                    Auf Standard zurücksetzen
                  </AdminButton>
                  <AdminButton variant="ghost" icon={<Eye className="h-4 w-4" />} onClick={() => setPreview((p) => !p)}>
                    Vorschau {preview ? "ausblenden" : "anzeigen"}
                  </AdminButton>
                </div>
                {preview ? (
                  <div
                    className="prose prose-sm max-w-none rounded-xl border border-border bg-bg-secondary p-4"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  />
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Keine Vorlage ausgewählt.</p>
            )}
          </AdminCard>
        </div>
      ) : null}

      {tab === "log" ? (
        <AdminCard title="E-Mail-Protokoll">
          <p className="mb-4 text-sm text-text-muted">Alle gesendeten E-Mails werden hier protokolliert — mit Status und Fehlermeldung falls vorhanden.</p>
          {logs.length === 0 ? (
            <p className="text-sm text-text-muted">
              <span className="font-medium text-text-primary">{emptyLog.title}</span> {emptyLog.description}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {logs.map((log) => (
                <li key={log.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-text-primary">{log.subject}</span>
                    <span className={log.status === "sent" ? "text-primary" : "text-accent-heart"}>
                      {EMAIL_LOG_STATUS[log.status] ?? log.status}
                    </span>
                  </div>
                  <p className="text-text-muted">{log.recipient}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(log.created_at).toLocaleString("de-DE")}
                    {log.template_slug ? ` · ${log.template_slug}` : ""}
                    {log.area ? ` · ${log.area}` : ""}
                  </p>
                  {log.error_message ? <p className="text-xs text-accent-heart">Grund: {log.error_message}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      ) : null}
    </>
  );
}
