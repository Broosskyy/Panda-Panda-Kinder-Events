# FINAL EMAIL CMS REPORT — Panda-Bande Kinderevents

**Datum:** 7. Juli 2026  
**Branch:** `cursor/email-cms-control-e022`  
**Ziel:** Produktionsreifes E-Mail-System — alle Texte und Einstellungen im Admin/CMS, ohne Code-Änderungen.

---

## 1. Fertige E-Mail-Funktionen

| Funktion | Status | CMS-gesteuert |
|----------|--------|---------------|
| Kontaktformular → Admin-Benachrichtigung | ✅ | Betreff + Text in Einstellungen → E-Mail (B) |
| Kontaktformular → Kundenbestätigung | ✅ | Aktiv/Inaktiv, Betreff, Text (B) + Vorlage |
| Neue Bewertung → Admin | ✅ | Empfänger, Betreff, Text (C) + Vorlage |
| Bewertungsanfrage senden (Admin) | ✅ | Formular in Bewertungen + Vorlage |
| Angebot per E-Mail | ✅ | Betreff, Text, Kopie an Firma (D) + Vorlage |
| Rechnung per E-Mail | ✅ | Betreff, Text, Kopie an Firma (D) + Vorlage |
| Passwort vergessen (Admin) | ✅ | Betreff, Text (E) + Vorlage |
| Test-E-Mail | ✅ | Einstellungen → E-Mail (A) |
| E-Mail-Protokoll | ✅ | Kommunikation → E-Mail-Protokoll |
| Systemstatus E-Mail | ✅ | Einstellungen → System |

**Verhalten bei Fehlern:** Anfragen/Bewertungen werden gespeichert, auch wenn E-Mail fehlschlägt. Fehler erscheinen im E-Mail-Protokoll mit verständlicher Meldung.

---

## 2. Admin-Bereich: Einstellungen → E-Mail

Strukturiert in fünf Bereiche mit laienverständlichen Erklärungen:

- **A) Allgemein** — Absendername, Absender-E-Mail, Antwortadresse, Firmen-E-Mail, Test-E-Mail
- **B) Kontaktformular** — Empfänger, Kundenbestätigung, Admin-Benachrichtigung
- **C) Bewertungen** — Empfänger, Bewertungsanfrage, neue Bewertung
- **D) Angebote & Rechnungen** — Betreff/Text, Kopie an Firma
- **E) Passwort & Sicherheit** — Passwort-Texte, Sicherheitshinweise

Komponente: `components/admin/email/EmailSettingsPanel.tsx`  
Platzhalter-Hilfe: `components/admin/email/EmailVariableHelp.tsx`

---

## 3. CMS-bearbeitbare Vorlagen

Unter **Kommunikation → E-Mail-Protokoll → Vorlagen**:

| Vorlage | Zweck |
|---------|-------|
| `inquiry-auto-reply` | Anfrage: Bestätigung an Kunde |
| `inquiry-admin` | Anfrage: Benachrichtigung an Admin |
| `review-request` | Bewertungsanfrage |
| `review-admin` | Neue Bewertung an Admin |
| `quote-send` | Angebot senden |
| `invoice-send` | Rechnung senden |
| `password-reset` | Passwort vergessen |

Jede Vorlage unterstützt: Bearbeiten, Vorschau, Testmail, Aktiv/Inaktiv, **Zurücksetzen auf Standard**.

Auflösungsreihenfolge: **DB-Vorlage (wenn aktiv) → CMS-Felder → Builder-Fallback** (`lib/email/resolve-content.ts`).

---

## 4. Variablen-Hilfe

Verständliche Platzhalter im Admin, z. B.:

- `{{customer_name}}` = Name des Kunden
- `{{event_date}}` = Datum der Veranstaltung
- `{{quote_number}}` = Angebotsnummer
- `{{review_link}}` = Link zur Bewertung

Fehlende Variablen werden leer gelassen — kein Crash.

---

## 5. Einheitliches E-Mail-Design

Alle E-Mails nutzen `wrapEmailHtml` mit Panda-Bande Logo, warmen Farben, Footer (Telefon, E-Mail, Website). Texte kommen aus CMS/Vorlagen.

---

## 6. Hardcodes bereinigt

| Vorher | Nachher |
|--------|---------|
| `hallo@panda-bande-events.de` in `site.ts` | `info@pb-kinderevents.de` via `DEFAULT_COMPANY_EMAIL` |
| Hardcodierte Betreffzeilen in `lib/email.ts` | CMS-Felder + Vorlagen |
| Inline HTML Passwort-Reset | CMS-Vorlage `password-reset` |
| CRM-E-Mail nur Builder | CMS + Vorlage `quote-send` / `invoice-send` |

**Erlaubter technischer Fallback:** `onboarding@resend.dev` nur ohne verifizierte Resend-Domain.  
**Produktions-Fallback:** `info@pb-kinderevents.de` (`lib/email/constants.ts`).

---

## 7. Systemstatus (Einstellungen → System)

Neue laienfreundliche Punkte:

- E-Mail-Versand bereit (grün/gelb/rot)
- Hauptadresse gesetzt
- Resend verbunden
- Test-E-Mail erfolgreich (aus Protokoll)
- Letzter Fehler (aus Protokoll)

---

## 8. Tests

| Test | Ergebnis |
|------|----------|
| `npm run test:email` | **29/29 bestanden** |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |
| `npm run build` | ✅ |

---

## 9. Offene Punkte für Livegang

1. Resend-Domain `pb-kinderevents.de` verifizieren.
2. Live-Test mit echtem `RESEND_API_KEY`.
3. Vorlagen bei Bedarf per „Auf Standard zurücksetzen“ initialisieren.
4. Login-Sicherheitshinweise: Toggle im CMS vorhanden; Versand bei Login optional nachrüstbar.
