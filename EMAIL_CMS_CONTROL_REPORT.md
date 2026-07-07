# E-Mail CMS Control Report

Datum: 2026-07-07  
Branch: `cursor/email-branding-fix-e022`

## CMS-gesteuerte Mailwerte

### Einstellungen → E-Mail → Allgemein
- `senderName`, `senderEmail`, `replyTo`
- `inquiryRecipient`, `adminNotificationEmail`, `inquiryCopyTo`
- `inquiryAutoReplySubject/Text`, `inquiryAdminSubject/Text`
- `reviewRecipient`, `reviewRequestSubject/Text`, `reviewAdminSubject/Text`
- `quoteSubjectTemplate`, `quoteEmailBody`, `invoiceSubjectTemplate`, `invoiceEmailBody`
- `passwordResetSubject/Text`
- Testmodus: `testMode.enabled`, `testMode.testAddress`

### Einstellungen → E-Mail → Branding
- `logoUrl` (Standard: `/assets/Logo.png` → absolut `https://pb-kinderevents.de/assets/Logo.png`)
- `backgroundColor`, `cardColor`, `primaryColor`, `accentColor`
- `buttonColor`, `buttonTextColor`, `textColor`, `textMutedColor`, `footerColor`
- `fontFamily`, `companyName`, `senderName`, `replyTo`, `headerImageUrl`

### Einstellungen → E-Mail → Signatur
- `contactPerson`, `companyName`, `phone`, `mobile`
- `website`, `instagram`, `facebook`, `tiktok`, `whatsapp`
- `address`, `impressumUrl`, `privacyUrl`, `footerText`, `freeText`

### Kommunikation → E-Mail → Vorlagen
Supabase-Tabelle `email_templates`:

| Slug | Verwendung |
|------|------------|
| `inquiry-auto-reply` | Kundenbestätigung |
| `inquiry-admin` | Admin bei Anfrage |
| `review-request` | Bewertungsanfrage |
| `review-admin` | Admin bei Bewertung |
| `quote-send` | Angebot |
| `invoice-send` | Rechnung |
| `password-reset` | Passwort zurücksetzen |
| `general-message` | Freie Nachricht |
| `security-login` | (definiert, Versand optional) |

Pro Vorlage: `subject`, `body_html`, `body_text`, `is_active`, `variables`

---

## Fallbacks (keine Demo-Daten)

| Feld | Wenn leer |
|------|-----------|
| `contactPerson` | Nicht angezeigt |
| `address` | Nicht angezeigt |
| `phone` | Nicht angezeigt (kein 000000-Fallback) |
| Logo | `https://pb-kinderevents.de/assets/Logo.png` |
| Farben | `lib/email/brand-tokens.ts` |
| Vorlage inaktiv | CMS-Textfeld → Code-Builder |

---

## Platzhalter-System

Variablen werden in `lib/email/variables.ts` substituiert. Fehlende Werte → leerer String (nie `undefined`).

Häufige Variablen:
- `{{customer_name}}` / `{{name}}`
- `{{customer_email}}` / `{{email}}`
- `{{customer_phone}}` / `{{phone}}`
- `{{event_type}}` / `{{eventType}}`
- `{{event_date}}`, `{{message}}`, `{{rating}}`
- `{{quote_number}}`, `{{invoice_number}}`, `{{total_amount}}`
- `{{company_name}}`, `{{company_website}}`, `{{company_phone}}`
- `{{reset_link}}`, `{{review_link}}`

Admin-Hilfe: `components/admin/email/EmailVariableHelp.tsx`

---

## Live-Vorschau & Test

| Funktion | Ort |
|----------|-----|
| Branding-Vorschau | Einstellungen → E-Mail → Branding (rechte Spalte) |
| Signatur-Vorschau | Einstellungen → E-Mail → Signatur |
| Vorlagen-Editor | Kommunikation → E-Mails → Vorlagen |
| Testmail senden | Einstellungen → E-Mail → Allgemein |

API: `POST /api/admin/email/test` mit `{ "to": "..." }`

---

## Speicherung

- CMS-Einstellungen: Supabase `site_settings` Key `email`
- HTML-Vorlagen: Supabase `email_templates`
- Versandprotokoll: `email_logs`

---

## Qualitätssicherung

```
npm run lint ✓
npm run typecheck ✓
npm run build ✓
```
