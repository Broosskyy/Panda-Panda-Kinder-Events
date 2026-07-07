# E-Mail-System Enterprise Report — Phase 2

**Datum:** 7. Juli 2026  
**Branch:** `cursor/email-branding-fix-e022`  
**Ziel:** White-Label-fähiges Enterprise-E-Mail-System (Panda-Bande = erster Mandant)

---

## Gesamtbewertung: **8 / 10**

Das System ist produktionsreif für einen ersten Mandanten und architektonisch auf Multi-Tenant vorbereitet. CMS-Steuerung, Design-System und Admin-UX sind auf Enterprise-Niveau. Offene Punkte betreffen vollständige Multi-Tenant-Isolation, Newsletter-Versand und SMTP-Provider-Abstraktion.

---

## ✔ Architektur

### Schichtenmodell

```
CMS (site_settings) ──► resolveEmailBranding() ──► resolveActiveDesignTokens()
         │                         │
         ▼                         ▼
email_templates (DB) ──► renderEmailFromTemplate() ──► composeTemplateBodyHtml()
         │                         │
         ▼                         ▼
wrapBrandedEmailHtml() ──► wrapEmailHtml() ──► Resend API
```

### Auflösungsreihenfolge (unverändert, bewährt)

1. **DB-Vorlage** (`email_templates`) mit strukturiertem `layout_json`
2. **CMS-Textfelder** (Legacy-Fallback in `site_settings.email`)
3. **Code-Builder** (`lib/email/builders.ts`) als letzter Fallback
4. **Generischer Fallback** ohne Mandanten-Hardcodes

### Neue Kernmodule

| Modul | Zweck |
|-------|-------|
| `lib/email/design-system.ts` | Zentrale Design-Tokens aus CMS-Branding |
| `lib/email/template-compose.ts` | Strukturierte Vorlagen → HTML |
| `lib/email/tenant.ts` | White-Label Tenant-Kontext (Vorbereitung) |
| `lib/email/brand-tokens.ts` | `SYSTEM_EMAIL_DEFAULTS` — mandantenagnostisch |

---

## ✔ White-Label Vorbereitung

| Anforderung | Status |
|-------------|--------|
| Eigenes Logo | ✔ CMS `email.branding.logoUrl` |
| Eigene Domain | ✔ `senderEmail` + Resend-Domain |
| Eigene Farben | ✔ 12 Branding-Farbfelder |
| Eigene Schriften | ✔ `fontFamily` |
| Eigene Signatur | ✔ Vollständiger Signatur-Manager |
| Eigene Footer | ✔ Signatur + Branding-Footerfarbe |
| Social Links | ✔ Instagram, Facebook, TikTok, YouTube, WhatsApp |
| Impressum/Datenschutz | ✔ Signatur-Links |
| Reply-To / Absender | ✔ Branding + E-Mail-Einstellungen |
| Eigene Templates | ✔ `email_templates` Tabelle |
| Eigene Variablen | ✔ Platzhalter-System mit Aliases |
| SMTP/API pro Mandant | ⚠ Vorbereitet (`tenant_id` auf Logs/Aliases, `EMAIL_TENANT_ID` env) |

**Keine Panda-Bande-Hardcodes** in E-Mail-Rendering-Pipeline. Fallback-Logo nutzt env-first URL (`NEXT_PUBLIC_SITE_URL/assets/Logo.png`), nicht fest codierte Domain im Render-Pfad.

---

## ✔ CMS Steuerung

### Admin → Einstellungen → E-Mail

| Bereich | Pfad | Bearbeitbar |
|---------|------|-------------|
| Branding | `EmailBrandingPanel` | Logo, Favicon, 12 Farben, Schrift, Theme, Firma, Absender, Reply-To, Website |
| Signatur | `EmailSignaturePanel` | Name, Firma, Kontakt, Social, Adresse, Öffnungszeiten, Rechtliches, Freitext |
| Vorlagen | `EmailsView` | Betreff, Headline, Intro, Body, Info-Box, CTA, Aktiv, Vorschau, Test, Reset |
| Systemstatus | E-Mail-Einstellungen | Laienfreundliche Statusmeldungen |

### Datenbank-Migration

`supabase/migrations/20260720_email_enterprise_layout.sql`:
- `email_templates.description`
- `email_templates.layout_json`

---

## ✔ Branding

- **Design-System:** Alle HTML-Ausgaben nutzen `resolveActiveDesignTokens(branding)`
- **Keine Farben im Template-Code:** `SYSTEM_EMAIL_DEFAULTS` nur als letzter Fallback
- **Themes vorbereitet:** `light` (Standard), `dark`, `auto` mit `prefers-color-scheme` CSS
- **Logo-Fallback-Kette:** CMS → `/assets/Logo.png` (HTTPS) → Firmenname als Text (kein broken image)

---

## ✔ Templates

### Vorlagen im CMS (keine Texte im Code für Versand)

| Slug | Bereich | Beschreibung |
|------|---------|--------------|
| `inquiry-auto-reply` | inquiry | Anfrage-Bestätigung |
| `inquiry-admin` | inquiry | Admin-Benachrichtigung |
| `review-request` | review | Bewertungsanfrage |
| `review-admin` | review | Neue Bewertung |
| `quote-send` | quote | Angebot |
| `invoice-send` | invoice | Rechnung |
| `password-reset` | password_reset | Passwort |
| `email-test` | general | Testmail |
| `newsletter-draft` | newsletter | Newsletter (inaktiv, Vorbereitung) |
| `security-login` | security | Login-Hinweis |

### Strukturiertes Layout (`layout_json`)

```json
{
  "headline": "...",
  "intro": "...",
  "body": "...",
  "infoBoxEnabled": true,
  "infoBoxItems": ["..."],
  "ctaText": "...",
  "ctaUrl": "{{website}}",
  "footerEnabled": true
}
```

HTML-Override weiterhin möglich (Experten-Modus), überschreibt strukturierte Felder.

---

## ✔ Variablen

### Unterstützte Platzhalter

`{{name}}`, `{{email}}`, `{{phone}}`, `{{eventType}}`, `{{eventDate}}`, `{{message}}`, `{{rating}}`, `{{reviewText}}`, `{{offerNumber}}`, `{{invoiceNumber}}`, `{{website}}`, `{{company}}`, `{{adminUrl}}`, `{{currentYear}}` — plus kanonische Aliase (`customer_name`, `quote_number`, etc.)

### Verhalten bei fehlenden Werten

- Kein Fehler
- Kein `undefined`
- Platzhalter werden still entfernt (`applyTemplateVariables`)
- Alias-Normalisierung via `normalizeEmailVariables()`

---

## ✔ UX

- **Laienfreundliche Labels** in allen Admin-Panels
- **Hilfetexte** bei Farbfeldern, Logo, Theme, CTA
- **Keine Entwicklerbegriffe** im Systemstatus (z. B. „Versand-Domain“ statt „DKIM Record“)
- **Live-Vorschau:** Desktop, Tablet, Mobil, Dunkelmodus via `EmailPreviewFrame` + `/api/admin/email/preview`
- **Testmail** direkt aus Vorlagen-Editor

### Systemstatus-Verbesserungen

Wenn Versand funktioniert, API-Status nicht abrufbar:
> „Versand funktioniert. Der Domainstatus konnte nicht automatisch geprüft werden.“

Keine irreführenden „Domain unbekannt / Nicht verifiziert“-Warnungen bei erfolgreichem Testversand.

---

## ✔ Performance

| Maßnahme | Umsetzung |
|----------|-----------|
| Keine doppelten DB-Abfragen | `Promise.all` in `renderEmailFromTemplate`, `wrapBrandedEmailHtml` |
| Kein mehrfaches Template-Render | Ein Render-Durchlauf pro Versand |
| Preview-Debounce | 400ms in `EmailPreviewFrame` |
| Tenant-Cache | `getEmailTenantContext()` cached |

---

## ✔ Sicherheit

- Admin-Auth auf allen E-Mail-API-Routen (`requireAdmin`)
- Preview-iframe mit `sandbox="allow-same-origin"`
- HTML-Escaping in Signatur und Template-Compose
- Kein Base64-Logo in E-Mails (nur HTTPS-URLs)
- Testmodus leitet alle Empfänger um

---

## ✔ Wartbarkeit

- Klare Modultrennung: branding → design-system → html → render
- `EMAIL_BRAND` als deprecated Alias — Migration zu `SYSTEM_EMAIL_DEFAULTS`
- Strukturierte Templates reduzieren HTML im Code
- Migration für `layout_json` dokumentiert

---

## ✔ Erweiterbarkeit

| Feature | Vorbereitung |
|---------|--------------|
| Multi-Tenant | `tenant.ts`, `tenant_id` auf Logs |
| Dark Theme | `theme: dark` in Branding |
| Auto Theme | CSS `prefers-color-scheme` |
| Newsletter | `newsletter-draft` Template, Area `newsletter` |
| SMTP-Wechsel | Resend abstrahiert in `lib/email/sender.ts` |
| Provider pro Mandant | Env `EMAIL_TENANT_ID` + zukünftige `tenant_settings` Tabelle |

---

## Technische Schulden

| Priorität | Thema | Beschreibung |
|-----------|-------|--------------|
| Mittel | Multi-Tenant DB | `site_settings` noch single-tenant; `tenant_settings` Tabelle fehlt |
| Mittel | Legacy CMS-Felder | `inquiryAutoReplyText` etc. parallel zu DB-Templates |
| Niedrig | `builders.ts` | Fallback-Builder nutzen noch `SYSTEM_EMAIL_DEFAULTS` statt live Branding |
| Niedrig | Newsletter-Versand | Nur Template-Vorbereitung, kein Kampagnen-System |
| Niedrig | Signatur-Vorschau | Preview zeigt Layout, nicht isolierte Signatur-HTML |

---

## Empfehlungen (Phase 3)

1. **`tenant_settings` Tabelle** — Branding/Templates pro `tenant_id` isolieren
2. **Legacy CMS-Textfelder deprecaten** — Nur noch DB-Templates als Quelle
3. **Builder-Refactor** — `buildInquiryAdminEmail` etc. auf `renderEmailFromTemplate` umstellen
4. **E-Mail-Client-Tests** — Litmus/Email on Acid für Gmail, Outlook, Apple Mail
5. **Webhook-Tracking** — Öffnungsraten via Resend Webhooks (`opened_at` bereits in Schema)
6. **Provider-Abstraktion** — `EmailProvider` Interface für Resend/SMTP/SendGrid

---

## Verifikation

```bash
npm run lint      # ✔ (2 pre-existing warnings, unrelated)
npm run typecheck # ✔
npm run build     # ✔
```

### Getestete E-Mail-Typen (Code-Pfad)

- Anfrage (Auto-Reply + Admin)
- Bewertung (Request + Admin)
- Angebot / Rechnung
- Passwort-Reset
- Testmail
- Newsletter (Template, inaktiv)
- Security-Login

### Client-Kompatibilität (architektonisch)

- Responsive CSS (`@media max-width: 600px`)
- Table-basiertes Layout (Outlook-safe)
- Absolute Logo-URLs (Gmail/Apple Mail)
- `color-scheme` Meta für Dark-Mode-Vorbereitung

---

## Fazit

Phase 2 transformiert das E-Mail-System von einer mandantenspezifischen Lösung zu einer **White-Label-Plattform-Architektur**. Panda-Bande ist die erste Konfiguration — nicht die Code-Basis. Mit CMS-gesteuertem Branding, strukturierten Templates, zentralem Design-System und laienfreundlichem Admin ist das Fundament für hunderte Mandanten gelegt.

**Bewertung: 8/10** — Enterprise-ready für Single-Tenant-Produktion; Multi-Tenant-Isolation und Newsletter-Kampagnen sind die nächsten Schritte für 9–10/10.
