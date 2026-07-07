"use client";

import { Send } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { AdminStickySave } from "@/components/admin/ui/AdminStickySave";
import { EmailVariableHelp } from "@/components/admin/email/EmailVariableHelp";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import type { SiteEmailSettings } from "@/lib/cms/types";

function SectionIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-border pt-6 first:mt-0 first:border-t-0 first:pt-0">
      <p className="mb-1 text-sm font-semibold text-text-primary">{title}</p>
      <p className="mb-4 text-sm text-text-muted">{children}</p>
    </div>
  );
}

interface EmailSettingsPanelProps {
  email: SiteEmailSettings;
  testTo: string;
  resendConfigured: boolean;
  onEmailField: <K extends keyof SiteEmailSettings>(key: K, value: SiteEmailSettings[K]) => void;
  onTestToChange: (value: string) => void;
  onSendTest: () => void;
  onSave: () => void;
}

export function EmailSettingsPanel({
  email,
  testTo,
  resendConfigured,
  onEmailField,
  onTestToChange,
  onSendTest,
  onSave,
}: EmailSettingsPanelProps) {
  return (
    <>
      <SectionIntro title="A) Allgemein">
        Hier legst du fest, von welcher Adresse Panda-Bande E-Mails verschickt und wohin Antworten gehen.
      </SectionIntro>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminFormField label="Absendername" required hint="Wird beim Empfänger als Absender angezeigt.">
          <input className="admin-input" value={email.senderName} onChange={(e) => onEmailField("senderName", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Absender-E-Mail" required hint="Muss in Resend für eure Domain freigeschaltet sein.">
          <input className="admin-input" type="email" value={email.senderEmail} onChange={(e) => onEmailField("senderEmail", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Antwortadresse (Reply-To)" required hint="Hier landen Antworten eurer Kunden.">
          <input className="admin-input" type="email" value={email.replyTo} onChange={(e) => onEmailField("replyTo", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Firmen-E-Mail" hint="Zentrale Adresse für Kopien und als Fallback.">
          <input className="admin-input" type="email" value={email.companyEmail} onChange={(e) => onEmailField("companyEmail", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Firmenname in E-Mails" hint="Erscheint im Kopf der E-Mail.">
          <input className="admin-input" value={email.companyName} onChange={(e) => onEmailField("companyName", e.target.value)} />
        </AdminFormField>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-bg-secondary/40 p-4">
        <p className="mb-3 text-sm font-semibold text-text-primary">Test-E-Mail senden</p>
        <p className="mb-3 text-sm text-text-muted">
          Prüfe, ob der Versand funktioniert. Du erhältst eine kurze Testnachricht mit Absender-Infos.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            className="admin-input min-w-[16rem] flex-1"
            type="email"
            placeholder="deine@adresse.de"
            value={testTo}
            onChange={(e) => onTestToChange(e.target.value)}
          />
          <AdminButton variant="secondary" icon={<Send className="h-4 w-4" />} onClick={onSendTest} disabled={!resendConfigured}>
            Test-E-Mail senden
          </AdminButton>
        </div>
      </div>

      <SectionIntro title="B) Kontaktformular">
        Steuert, was passiert, wenn jemand über die Website eine Anfrage sendet.
      </SectionIntro>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminFormField label="Empfänger-Adresse" hint="Diese Adresse erhält neue Anfragen von der Website." className="md:col-span-2">
          <input className="admin-input" type="email" value={email.inquiryRecipient} onChange={(e) => onEmailField("inquiryRecipient", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Kundenbestätigung" className="md:col-span-2">
          <label className="admin-checkbox-row">
            <input type="checkbox" checked={email.inquiryAutoReplyEnabled} onChange={(e) => onEmailField("inquiryAutoReplyEnabled", e.target.checked)} />
            <span>Kundenbestätigung automatisch senden</span>
          </label>
        </AdminFormField>
        <AdminFormField label="Betreff Kundenbestätigung" hint="Diese E-Mail erhält ein Kunde automatisch nach einer Anfrage." className="md:col-span-2">
          <input className="admin-input" value={email.inquiryAutoReplySubject} onChange={(e) => onEmailField("inquiryAutoReplySubject", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Text Kundenbestätigung" className="md:col-span-2">
          <textarea className="admin-input min-h-24" value={email.inquiryAutoReplyText} onChange={(e) => onEmailField("inquiryAutoReplyText", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Betreff Admin-Benachrichtigung" hint="Betreff der Nachricht an euch bei neuer Anfrage." className="md:col-span-2">
          <input className="admin-input" value={email.inquiryAdminSubject} onChange={(e) => onEmailField("inquiryAdminSubject", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Text Admin-Benachrichtigung" className="md:col-span-2">
          <textarea className="admin-input min-h-24" value={email.inquiryAdminText} onChange={(e) => onEmailField("inquiryAdminText", e.target.value)} />
        </AdminFormField>
      </div>

      <SectionIntro title="C) Bewertungen">
        E-Mails rund um Kundenbewertungen — Anfrage senden und Benachrichtigung bei neuer Bewertung.
      </SectionIntro>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminFormField label="Empfänger für neue Bewertungen" hint="Diese Adresse bekommt eine Nachricht, wenn eine neue Bewertung eingeht." className="md:col-span-2">
          <input className="admin-input" type="email" value={email.reviewRecipient} onChange={(e) => onEmailField("reviewRecipient", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Betreff Bewertungsanfrage" className="md:col-span-2">
          <input className="admin-input" value={email.reviewRequestSubject} onChange={(e) => onEmailField("reviewRequestSubject", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Text Bewertungsanfrage" hint="Wird versendet, wenn ihr im Admin eine Bewertungsanfrage an Kunden schickt." className="md:col-span-2">
          <textarea className="admin-input min-h-24" value={email.reviewRequestText} onChange={(e) => onEmailField("reviewRequestText", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Betreff neue Bewertung" className="md:col-span-2">
          <input className="admin-input" value={email.reviewAdminSubject} onChange={(e) => onEmailField("reviewAdminSubject", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Text neue Bewertung" className="md:col-span-2">
          <textarea className="admin-input min-h-24" value={email.reviewAdminText} onChange={(e) => onEmailField("reviewAdminText", e.target.value)} />
        </AdminFormField>
      </div>

      <SectionIntro title="D) Angebote & Rechnungen">
        Texte für den Versand von Angeboten und Rechnungen per E-Mail. PDFs werden automatisch angehängt.
      </SectionIntro>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminFormField label="Betreff Angebot" className="md:col-span-2">
          <input className="admin-input" value={email.quoteSubjectTemplate} onChange={(e) => onEmailField("quoteSubjectTemplate", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Text Angebot" className="md:col-span-2">
          <textarea className="admin-input min-h-24" value={email.quoteEmailBody} onChange={(e) => onEmailField("quoteEmailBody", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Betreff Rechnung" className="md:col-span-2">
          <input className="admin-input" value={email.invoiceSubjectTemplate} onChange={(e) => onEmailField("invoiceSubjectTemplate", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Text Rechnung" className="md:col-span-2">
          <textarea className="admin-input min-h-24" value={email.invoiceEmailBody} onChange={(e) => onEmailField("invoiceEmailBody", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Kopie an Firma" className="md:col-span-2">
          <label className="admin-checkbox-row">
            <input type="checkbox" checked={email.crmCopyToCompanyEnabled} onChange={(e) => onEmailField("crmCopyToCompanyEnabled", e.target.checked)} />
            <span>Beim Versand eine Kopie an die Firmen-E-Mail senden</span>
          </label>
        </AdminFormField>
        <AdminFormField label="Kopie-Angebot an" hint="Optional — überschreibt die Firmen-E-Mail für Angebote.">
          <input className="admin-input" type="email" value={email.quoteCopyTo} onChange={(e) => onEmailField("quoteCopyTo", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Kopie-Rechnung an" hint="Optional — überschreibt die Firmen-E-Mail für Rechnungen.">
          <input className="admin-input" type="email" value={email.invoiceCopyTo} onChange={(e) => onEmailField("invoiceCopyTo", e.target.value)} />
        </AdminFormField>
      </div>

      <SectionIntro title="E) Passwort & Sicherheit">
        E-Mails für Admin-Zugang und optionale Sicherheitshinweise.
      </SectionIntro>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminFormField label="Betreff Passwort vergessen" className="md:col-span-2">
          <input className="admin-input" value={email.passwordResetSubject} onChange={(e) => onEmailField("passwordResetSubject", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Text Passwort vergessen" className="md:col-span-2">
          <textarea className="admin-input min-h-24" value={email.passwordResetText} onChange={(e) => onEmailField("passwordResetText", e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Sicherheits-Hinweise" className="md:col-span-2">
          <label className="admin-checkbox-row">
            <input type="checkbox" checked={email.securityAlertsEnabled} onChange={(e) => onEmailField("securityAlertsEnabled", e.target.checked)} />
            <span>Sicherheits-Hinweise bei Admin-Anmeldungen senden</span>
          </label>
        </AdminFormField>
        <AdminFormField label="Login-Hinweis Empfänger" hint="Optional — wer Sicherheitsmeldungen erhält.">
          <input className="admin-input" type="email" value={email.loginAlertRecipient} onChange={(e) => onEmailField("loginAlertRecipient", e.target.value)} />
        </AdminFormField>
      </div>

      <div className="mt-6">
        <EmailVariableHelp />
      </div>

      <p className="mt-4 text-sm text-text-muted">
        Ausführliche Vorlagen mit Vorschau und Testversand findest du unter{" "}
        <strong>Kommunikation → E-Mail-Protokoll → Vorlagen</strong>.
      </p>

      <AdminStickySave label={`${ADMIN_BTN.save} — E-Mail`} onSave={onSave} />
    </>
  );
}
