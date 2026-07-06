# Admin Control Center — Final Report

**Version:** 1.0.1  
**Datum:** 2026-07-06  
**Branch:** `cursor/admin-control-center-e022`

---

## Zusammenfassung

Das Admin Control Center zentralisiert alle geschäftsrelevanten Einstellungen in **8 übersichtlichen Bereichen**. Hardcodierte Firmen-, Kontakt-, E-Mail-, Rechnungs-, SEO- und Rechtstexte wurden durch CMS-Settings ersetzt — mit sicheren Fallbacks in `lib/cms/defaults.ts`.

---

## Entfernte / ersetzte Hardcodes

| Bereich | Vorher | Nachher |
|---------|--------|---------|
| Impressum | `siteConfig.legal` | `legal` + `business` Settings |
| Datenschutz | `siteConfig.legal` + feste Texte | `legal` Settings |
| AGB | `siteConfig.legal.company` | `legal.agbContent` |
| Cookie-Banner | Fester Text | `legal.cookieNoticeText` |
| Kontaktformular Datenschutz | Fester Text | `legal.inquiryPrivacyHint` |
| SEO Meta | Nur `siteConfig` | `seo` Settings + Env-Fallback |
| Sitemap/Robots | Nur Env-URL | `resolvePublicSiteUrl()` + SEO-Flags |
| PDF Texte | `business.default*` | `invoice` Settings |
| PDF Footer/Bank | `business.iban` | `bank` + `invoice` Settings |
| Dokumentnummern | Fest `ANG`/`RE` | `invoice` Prefix + Format |
| E-Mail Betreff/Body CRM | Hardcoded | `email.*Template` + Platzhalter |
| E-Mail Auto-Reply Anfrage | Nicht vorhanden | `email.inquiryAutoReply*` |

**Verbleibende sichere Fallbacks:** `src/config/site.ts`, `lib/cms/defaults.ts`, `NEXT_PUBLIC_SITE_URL`, Resend `onboarding@resend.dev`.

---

## Neu steuerbare Einstellungen

### 1. Unternehmensdaten (`business`)
Firmenname, Kurzname, Slogan, Logo, Favicon, Adresse, PLZ, Ort, Bundesland, Land, Geschäftsführung, Beschreibung, Website, E-Mail, Telefon

### 2. Kontakt & Social Media (`contact`)
Haupt-/Kontakt-E-Mail, Telefon, Mobil, WhatsApp, Instagram, Facebook, TikTok, Maps, Öffnungszeiten, Antwortzeit

### 3. E-Mail & Versand (`email`)
Absender, Reply-To, Kopien, Kontaktformular (Empfänger, Kopie, Auto-Reply), Angebots-/Rechnungs-Templates, Security-E-Mails

### 4. Rechnungen & Angebote (`invoice`)
Nummernkreise, Datumsdefaults, MwSt, PDF-Texte, Fußzeile, Rabattfeld

### 5. Bank & Steuerdaten (`bank`)
IBAN, BIC, Kontoinhaber, Steuernummer, USt-ID, Kleinunternehmer, Zahlungsbedingungen

### 6. Domain & SEO (`seo`)
Domain, Canonical, Meta Title/Description, OG Image, Analytics IDs, Robots, Sitemap

### 7. Rechtliches (`legal`)
Impressum, Datenschutz, AGB, Cookie-Hinweis, Formular-Datenschutz, Rechnungshinweis

### 8. Systemstatus (read-only API)
Supabase, Storage, Resend, Domain, Pflichtdaten — mit Handlungsanweisungen

---

## Betroffene Bereiche

- Website (Layout SEO, Cookie, Kontaktformular)
- Impressum / Datenschutz / AGB
- PDFs (Angebot, Rechnung)
- E-Mails (Anfrage, CRM, Auto-Reply)
- Admin Einstellungen (8 Tabs)
- Audit Logs bei Settings-Änderungen

---

## Tests

| Test | Ergebnis |
|------|----------|
| `npm run lint` | ✅ (0 errors) |
| `npm run typecheck` | ✅ |
| `npm run build` | ✅ |
| `npm run test:crm` | ✅ 6/6 |

Manuelle Tests (Admin): Settings speichern, Systemstatus, E-Mail-Vorschau — vor Livegang empfohlen.

---

## Offene TODOs

- [ ] Rechtstexte juristisch prüfen lassen (Platzhalter aktiv)
- [ ] Logo `public/assets/logo.png` hochladen
- [ ] OG-Bild als PNG 1200×630 optional

---

## Migration

`supabase/migrations/20260714_admin_control_center.sql` — dokumentiert neue JSON-Keys (`bank`, `invoice`, `seo`, `legal`). Keine Schema-Änderung nötig; Defaults werden im Code gemerged.
