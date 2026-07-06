# FINAL BRANDING + EMAIL CMS REPORT

**Version:** 1.0.4  
**Branch:** `cursor/branding-email-cms-e022`  
**Datum:** 6. Juli 2026

---

## Logo-Integration

| Bereich | Umsetzung |
|---------|-----------|
| Bildmarke | `/assets/logo.png` (Fallback aus CMS `logoUrl`) |
| Textmarke | **PANDA-BANDE** + **KINDEREVENTS** neben dem Bild |
| Header / Mobile / Menü | `Logo`-Komponente mit Bild + Text |
| Footer | Bild + Text, inverse Farben |
| Splash | Logo inkl. Textmarke |
| Admin Login / Sidebar | Logo + Text |
| 404 / Offline | Logo |
| PDF | Bildmarke 120× proportional |
| E-Mail HTML | Logo oben, Firmenname, CMS-Farben |
| PWA / Favicon | Generiert aus `/assets/logo.png` → `/branding/*` |

**Regeln:** `object-contain`, keine Verzerrung, Retina via Next/Image.

---

## CMS Branding Felder

**Admin → Einstellungen → Branding**

| Feld | Zweck |
|------|-------|
| logoUrl | Hauptlogo (Bildmarke) |
| logoLightUrl / logoDarkUrl | Varianten |
| logoTextPrimary / logoTextSecondary | PANDA-BANDE / KINDEREVENTS |
| brandName, tagline, slogan | Markentexte |
| primaryColor, accentColor | Theme |
| faviconUrl, appleTouchIconUrl | Browser / iOS |
| pwaIcon192Url, pwaIcon512Url | PWA |
| pdfLogoUrl, emailLogoUrl, loginLogoUrl | Kontext-spezifisch |
| ogImageUrl | Social Preview |
| showTextMark | Text neben Logo ein/aus |
| logoAlt | Barrierefreiheit |

Fallback: `/assets/logo.png` wenn CMS leer.

---

## Favicon / PWA Icons

Generierung: `npm run generate:brand-assets`

- `favicon.ico`, `favicon-16/32/48/64.png`
- `apple-touch-icon.png`
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
- `og-image.png`, `browserconfig.xml`
- Manifest `theme_color` + `background_color` aus `BRAND`

CMS-Override für Favicon/Apple/PWA möglich.

---

## E-Mail Vorlagen

**Tabelle:** `email_templates` (Migration `20260715_branding_email_cms.sql`)

Standard-Vorlagen:

- Allgemeine Nachricht
- Kontaktformular Auto-Reply
- Angebot senden
- Rechnung senden
- Passwort zurücksetzen
- Login/Security Hinweis

**Variablen:** `{{company_name}}`, `{{customer_name}}`, `{{quote_number}}`, `{{invoice_number}}`, `{{total_amount}}`, `{{due_date}}`, `{{iban}}`, `{{bic}}`, `{{message}}`, u.a.

Legacy `{name}` Syntax weiterhin unterstützt.

---

## Manuelle E-Mail Funktion

**Admin → Kommunikation → E-Mails**

| Tab | Funktion |
|-----|----------|
| Verfassen | Empfänger, Vorlage, Betreff, HTML, Senden, Test, Kopie |
| Vorlagen | Liste + Bearbeiten |
| Protokoll | Gesendete/fehlgeschlagene E-Mails |

API: `/api/admin/email/compose`, `/api/admin/email/templates`, `/api/admin/email/logs`

---

## E-Mail Logs

**Tabelle:** `email_logs`

- Empfänger, Betreff, Vorlage, Bereich, Status, Fehler
- Admin-ID, Zeitstempel
- Optional: Kunden-/Angebots-/Rechnungs-Referenz (Schema vorbereitet)

Logging bei: manueller Versand, CRM-Dokumenten, Inquiry Auto-Reply.

---

## Entfernte / reduzierte Hardcodes

- Logo-Pfad zentralisiert auf `/assets/logo.png`
- E-Mail HTML nutzt CMS-Branding-Farben und Logo-URL
- Textmarke nicht mehr nur im PNG, sondern als CMS-gesteuerter Text
- ContentView Branding-Formular → Verweis auf Einstellungen

**Verbleibende sichere Fallbacks:** `site.ts` Platzhalter-Kontaktdaten, `onboarding@resend.dev` bei Testdomain.

---

## Offene TODOs

1. **Logo-Datei:** Falls finales Panda-Icon (nur Bildmarke ohne Text) vorliegt → `public/assets/logo.png` ersetzen
2. **E-Mail Editor:** Rich-Text/WYSIWYG optional (aktuell HTML-Textarea)
3. **Vorlagen-UI:** Inline-Editor pro Vorlage ohne Tab-Wechsel
4. **Quote/Invoice Log:** UUID-Verknüpfung in `email_logs` bei CRM-Versand
5. **Theme CSS:** `primaryColor` aus CMS in `globals.css` als CSS-Variable (optional)

---

## Validierung

| Check | Status |
|-------|--------|
| `npm run lint` | ✅ |
| `npm run typecheck` | ✅ |
| `npm run build` | ✅ |

---

**Release-Status:** Branding + E-Mail CMS production ready.
