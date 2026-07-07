# E-Mail Branding Fix — Final Report

Datum: 2026-07-07  
Branch: `cursor/email-branding-fix-e022`

## Zusammenfassung

E-Mail-Layout und Vorlagen wurden auf helles Panda-Bande-Branding umgestellt. Logo-URL fixiert, Dark-Mode entfernt, Platzhalter-Daten bereinigt, CMS-Steuerung erweitert.

---

## 1. Logo Fix

**Ursache:** Relative Pfade und kleingeschriebenes `logo.png` funktionieren in E-Mail-Clients nicht zuverlässig.

**Lösung:**
- Standard-Logo: `https://pb-kinderevents.de/assets/Logo.png` (großes **L**)
- `getDefaultEmailLogoUrl()` und `buildEmailLogoHeaderHtml()` mit `width="180"`
- Text-Fallback „Panda-Bande Kinderevents“ wenn Bild-URL fehlt
- Pfad-Normalisierung: `logo.png` → `/assets/Logo.png`

**Dateien:** `lib/email/resolve-image-url.ts`, `lib/email/brand-tokens.ts`, `lib/email/branding.ts`

---

## 2. Helles Website-Design

**Ursache:** `@media (prefers-color-scheme: dark)` erzwang dunkle Mails in vielen Clients.

**Lösung:**
- Dark-Mode-CSS entfernt, `color-scheme: light only`
- Farbpalette: Page `#F8F6F1`, Card `#FFFFFF`, Primary `#4F5638`, Text `#2E2E2A`, Muted `#6F6F66`, Border `#E6E1D8`, Accent `#F1EEE7`
- Zentrierte Card max-width 600px, weiche Schatten, Rundungen 20px
- Tabellen-Layout für Gmail/Outlook-Kompatibilität

**Dateien:** `lib/email/html.ts`, `lib/email/brand-tokens.ts`

---

## 3. Template-Struktur

Einheitlicher Rahmen über `wrapEmailHtml()` / `wrapBrandedEmailHtml()`:
Logo → Headline/Body → Info-Box/CTA → Footer mit Signatur

**Dateien:** `lib/email/wrap-branded.ts`, `lib/email/builders.ts`, `lib/email/signature.ts`

---

## 4. Platzhalter entfernt

| Entfernt | Ersetzt durch |
|----------|---------------|
| Lisa Muster | Leerer Default; CMS `email.signature.contactPerson` |
| Musterstraße | Leer; nur echte CMS/Business-Adresse |
| +49 170 0000000 | Leer in `site.ts`; Signatur nur bei echten Kontaktdaten |
| Hardcoded „Gründerin“-Texte | Neutrale CMS-Texte |

**Dateien:** `src/config/site.ts`, `lib/cms/defaults.ts`, `lib/cms/normalize-settings.ts`

---

## 5–8. Mail-Typen verbessert

| Mail | Verbesserung |
|------|--------------|
| Kundenbestätigung | Premium-Copy, Info-Box (✓), CTA „Zur Website“ |
| Admin Anfrage | Headline „Neue Anfrage eingegangen“, strukturierte Tabelle, CTA Admin |
| Admin Bewertung | „Neue Bewertung wartet auf Prüfung“, Sterne, Zitat-Block |
| Angebot/Rechnung | Helles Branding, Betrags-Box, `buildBrandedEmail()` |
| Testmail | Vollständiges Branding-Layout, Logo-URL sichtbar |

**Dateien:** `lib/email/builders.ts`, `lib/email/templates-db.ts`, `lib/email.ts`

---

## CMS-Steuerung

### Bereits / neu steuerbar (Einstellungen → E-Mail)

| Bereich | Felder |
|---------|--------|
| Allgemein | Absender, Reply-To, Empfänger, Vorlagentexte |
| Branding | Logo, Hintergrund, Kartenfarbe, Primär/Akzent/Button/Text/Footer |
| Signatur | Name, Telefon, Social, Links, Footer-Text |
| Vorlagen | `email_templates` in Supabase + Admin → E-Mails → Vorlagen |

### Auflösungsreihenfolge

1. Aktive DB-Vorlage (`email_templates`)
2. CMS-Textfelder (`site_settings.email`)
3. Code-Fallback (`builders.ts`)

### Platzhalter

`{{name}}`, `{{customer_name}}`, `{{email}}`, `{{phone}}`, `{{eventType}}` / `{{event_type}}`, `{{message}}`, `{{rating}}`, `{{adminUrl}}`, `{{websiteUrl}}` / `{{company_website}}` u. a. — siehe `lib/email/variables.ts`

---

## Geänderte Dateien

- `lib/email/brand-tokens.ts` (neu)
- `lib/email/html.ts`
- `lib/email/resolve-image-url.ts`
- `lib/email/branding.ts`
- `lib/email/builders.ts`
- `lib/email/signature.ts`
- `lib/email/resolve-content.ts`
- `lib/email/templates-db.ts`
- `lib/email.ts`
- `lib/cms/types.ts`
- `lib/cms/defaults.ts`
- `lib/cms/normalize-settings.ts`
- `src/config/site.ts`
- `components/admin/email/EmailBrandingPanel.tsx`

---

## Tests

```
npm run typecheck ✓
npm run lint      ✓ (nur bestehende Warnings)
npm run build     ✓
```

### Manuelle Prüfung

1. Admin → Einstellungen → E-Mail → Testmail senden
2. Kontaktformular absenden → Kunden- + Admin-Mail prüfen
3. Bewertung einreichen → Admin-Mail prüfen
4. Angebot/Rechnung versenden
5. Logo sichtbar unter `https://pb-kinderevents.de/assets/Logo.png`
6. Keine Lisa Muster / Musterstraße in Signatur (wenn CMS leer)
7. Mobile Lesbarkeit in Gmail/Apple Mail

### Testmail senden

Admin → Einstellungen → E-Mail → Tab **Allgemein** → Test-E-Mail-Adresse eingeben → **Test senden**

---

## Fallbacks

| Wert | Fallback |
|------|----------|
| Logo | `https://pb-kinderevents.de/assets/Logo.png` |
| Farben | `EMAIL_BRAND` in `brand-tokens.ts` |
| Signatur-Felder | Leer ausblenden (keine Demo-Daten) |
| Firmenname | CMS `email.companyName` → `business.companyName` |
