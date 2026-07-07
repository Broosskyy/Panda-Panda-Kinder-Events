# Panda-Bande Zero Trust Release Audit — Final RC Check

**Datum:** 7. Juli 2026  
**Branch:** `cursor/zero-trust-release-audit-e022`  
**Version:** 1.0.5 (pre-1.0 RC)  
**Prüfmodus:** Zero Trust — nichts ohne Verifikation angenommen

---

## Executive Summary

Vollständige Code-Analyse, statische Prüfung, Build-Verifikation und gezielte Härtung vor Version 1.0. Keine neuen Features, keine Redesigns — nur Bugs, UX/UI, Mobile, Sicherheit und Release-Härtung.

**Build-Status:** `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ (0 Warnungen)

**Go-/No-Go:** **Releasefähig: JA** — unter der Bedingung, dass die neue RLS-Migration (`20260725_zero_trust_rls_hardening.sql`) vor dem Produktions-Deploy in Supabase ausgeführt wird und ein kurzer Live-Smoke-Test (Kontaktformular, Admin-Login, Test-E-Mail) durchgeführt wird.

---

## Bewertungen (1–10)

| Bereich | Note | Kurzbegründung |
|---------|------|----------------|
| Öffentliche Website | **8/10** | Solide CMS-Anbindung, Mobile-FAB/CTA-Konflikte behoben, JSON-LD abgesichert |
| Admin UX | **8/10** | CRM-Versand klarer (Kopie-only), Domain-Hinweise korrigiert, Modals über Bottom-Nav |
| Mobile | **8/10** | Sticky CTA, FAB, Cookie-Banner, Header-Logo und Subpage-Padding optimiert |
| CRM | **8/10** | Angebot/Rechnung Versand robuster, Kopie-Fehler nicht mehr still |
| CMS | **8/10** | Inhalte aus DB, keine offensichtlichen Platzhalter-Leaks im Code |
| E-Mail | **9/10** | Absender/Reply-To korrekt, Logo-URL absolut, Domain-Status-Text angepasst |
| PDFs | **8/10** | Bestehende Pipeline stabil; Live-PDF nicht ohne Credentials geprüft |
| Performance | **8/10** | Next/Image, Lazy Loading vorhanden; keine Regression eingeführt |
| Sicherheit | **7/10** | 2FA-Lücke geschlossen, RLS-Migration bereit; feingranulares RBAC offen |
| Releasefähigkeit | **8/10** | Build grün, kritische Blocker behoben, 1 Deploy-Schritt (RLS) offen |

---

## 1. Gefundene Bugs

| ID | Schwere | Bereich | Beschreibung |
|----|---------|---------|--------------|
| B-01 | **Kritisch** | Security | 2FA Schritt 2 prüfte `pendingToken`-Cookie nicht — Session-Hijack möglich |
| B-02 | **Hoch** | Security | RLS `USING (true)` auf sensiblen Admin-/E-Mail-Tabellen erlaubte direkten Client-Zugriff |
| B-03 | **Hoch** | E-Mail | Bewertungs-Link zeigte auf `/bewertung` statt `/bewertungen` |
| B-04 | **Mittel** | E-Mail | `inquiryCopyTo` wurde nicht über `normalizeProductionEmail()` normalisiert |
| B-05 | **Mittel** | E-Mail | Compose-API umging `sendEmailWithRetry` und Logging-Infrastruktur |
| B-06 | **Mittel** | CRM | Kopie-an-Firma bei Angebot/Rechnung schlug still fehl |
| B-07 | **Mittel** | CRM | Nur-Kopie-Versand (ohne Kunde) war im UI/API blockiert |
| B-08 | **Mittel** | Mobile | Sticky CTA + WhatsApp-FAB überlappten auf Desktop/Tablet |
| B-09 | **Mittel** | Mobile | Cookie-Banner und FAB konkurrierten auf kleinen Viewports |
| B-10 | **Mittel** | Admin | Sticky-Save-Bar und E-Mail-Vorschau-Modal unter Bottom-Navigation |
| B-11 | **Niedrig** | UI | WhatsApp-FAB renderte leer ohne konfigurierte Nummer |
| B-12 | **Niedrig** | SEO | JSON-LD ohne Escaping — theoretisches XSS via CMS-Strings |
| B-13 | **Niedrig** | Content | Domain-Hinweise in Admin zeigten veraltete `panda-bande-events.de` |
| B-14 | **Niedrig** | Mobile | Header-Logo auf 320px abgeschnitten |
| B-15 | **Niedrig** | UX | Subpages hatten übermäßiges Bottom-Padding (Sticky-CTA nur Homepage) |

---

## 2. Behobene Bugs

| ID | Fix |
|----|-----|
| B-01 | `src/app/api/admin/login/route.ts` — Cookie-Hash wird vor 2FA-Verifikation geprüft |
| B-02 | `supabase/migrations/20260725_zero_trust_rls_hardening.sql` — Deny-Policies für `anon`/`authenticated` |
| B-03 | `lib/email.ts` — Standard-Link `/bewertungen` |
| B-04 | `lib/email.ts` — `normalizeProductionEmail()` für Inquiry-Kopie |
| B-05 | `src/app/api/admin/email/compose/route.ts` — `sendEmailWithRetry` + Logging |
| B-06 | `lib/email.ts` — Kopie-Fehler wirft Exception statt still zu scheitern |
| B-07 | `CrmSendModal`, Quotes/Invoices-Views, Send-Routes — `sendToCustomer`-Flag |
| B-08 | `globals.css` — Sticky CTA ab 768px ausgeblendet |
| B-09 | `globals.css` — FAB/Cookie z-index und Position angepasst |
| B-10 | `globals.css` z-index 75; `CustomerCommunicationTimeline` nutzt `admin-modal-root` |
| B-11 | `FloatingContactButtons.tsx`, `WhatsAppFab.tsx` — `null` wenn keine Nummer |
| B-12 | `lib/json-ld.ts` + Seiten — `safeJsonLdStringify()` |
| B-13 | `SettingsView.tsx`, `live-verify.mjs`, `resolve-settings.ts` |
| B-14 | `Header.tsx` — Logo `min-w-0 max-w-[min(100%,12rem)]` |
| B-15 | `public-main-subpage` Klasse auf Bewertungen/Aktuelles |

---

## 3. UX-Verbesserungen

- **CRM-Versand:** Modal erlaubt jetzt „nur Kopie an Firma“ — klarer für interne Weiterleitung ohne Kundenmail.
- **Domain-Status:** Wenn Resend-API den Status nicht lesen kann, aber Testmails ankommen: *„Versand funktioniert. Domainstatus wurde manuell in Resend bestätigt.“*
- **2FA:** Verständliche Meldung bei abgelaufener Pending-Session.
- **Kommunikations-Timeline:** Vorschau-Modal über der Admin-Bottom-Nav bedienbar.
- **Einstellungen:** Domain-Platzhalter auf `pb-kinderevents.de` vereinheitlicht.

---

## 4. UI-Verbesserungen

- Einheitliche z-index-Hierarchie: Cookie (48) < FAB (48) < Sticky CTA < Admin-Modals (75+).
- Subpages ohne Sticky CTA: reduziertes Bottom-Padding — kein „leerer“ Bereich mehr.
- Admin E-Mail-Vorschau nutzt etabliertes `admin-modal-root`-Pattern.
- Keine leere WhatsApp-Schaltfläche mehr im FAB-Stack.

---

## 5. Mobile-Verbesserungen

| Viewport | Maßnahme |
|----------|----------|
| 320–430px | Logo skaliert, FAB höher positioniert, Cookie-Banner tiefer |
| 768px+ | Sticky CTA ausgeblendet — Desktop unverändert nutzbar |
| Admin Mobile | Sticky-Save und Modals über Bottom-Nav |

Getestet (Code/CSS): Breakpoints 320, 360, 390, 412, 430, 768, 1024, Desktop — horizontales Scrollen und FAB-Überlappungen adressiert.

---

## 6. Admin-Verbesserungen

- Angebots-/Rechnungsversand: `sendToCustomer` optional, API und UI synchron.
- E-Mail Compose: Retry, Fehler-Logging, kein direkter Resend-Bypass.
- Kunden-Kommunikation: Modal-Fix, Filter (Heute/7/30/Alle) unverändert funktional.
- Lint: `CustomersView` useEffect-Dependency, `crm/db.ts` void-Kontext.

---

## 7. E-Mail-Status

| Prüfpunkt | Status |
|-----------|--------|
| Absender `Panda-Bande <info@pb-kinderevents.de>` | ✅ via `lib/email/constants.ts` + `normalizeProductionEmail()` |
| Reply-To `info@pb-kinderevents.de` | ✅ |
| Logo absolute URL | ✅ `https://www.pb-kinderevents.de/assets/Logo.png` |
| Kein `onboarding@resend.dev` in Produktion | ✅ normalisiert/ersetzt |
| Veraltete `@panda-bande-events.de` | ✅ in `normalizeProductionEmail()` abgefangen |
| Kontaktformular / Bestätigung / Admin | ✅ Code-Pfad geprüft |
| Bewertungs-Mail Link | ✅ `/bewertungen` |
| Angebot/Rechnung + PDF-Anhang | ✅ `sendCrmDocumentEmail` |
| Test-Mail | ✅ vorhanden |
| E-Mail Logs | ✅ `logEmailSend` in Compose und CRM |
| Domain-API nicht prüfbar | ✅ Nutzerfreundlicher Text, kein Fehler-Status |

---

## 8. PDF-Status

| Prüfpunkt | Status |
|-----------|--------|
| Angebot PDF (`/api/admin/quotes/[id]/pdf`) | ✅ Route vorhanden, Build OK |
| Rechnung PDF (`/api/admin/invoices/[id]/pdf`) | ✅ Route vorhanden, Build OK |
| Ein-Tab-Verhalten | ✅ Bestehende Implementierung (keine Regression) |
| Logo nicht abgeschnitten | ✅ `LOGO_SIZE_PX.pdf` in Brand-System |
| DIN A4 Layout | ✅ Bestehende PDF-Engine |
| Live-PDF ohne Credentials | ⚠️ Nicht runtime-getestet — Code-Review OK |

---

## 9. Security-Status

| Prüfpunkt | Status |
|-----------|--------|
| Admin-Routen `requireAdmin()` | ✅ |
| 2FA Pending-Token-Bindung | ✅ **behoben** |
| RLS sensible Tabellen | ✅ Migration erstellt — **Deploy erforderlich** |
| JSON-LD XSS | ✅ `safeJsonLdStringify` |
| Secrets im Client | ✅ Keine API-Keys in Client-Bundles gefunden |
| Feingranulares RBAC auf APIs | ⚠️ Offen — nur `requireAdmin()`, keine Rollen-Checks pro Endpoint |
| Rate Limiting öffentliche Formulare | ✅ vorhanden (bestehend) |
| Upload-Typ-Prüfung | ✅ bestehend |

---

## 10. Performance-Status

- Next.js Image mit `priority` für Header-Logo.
- Keine neuen schweren Client Components eingeführt.
- Build-Bundle unverändert im erwarteten Bereich (~102 kB shared).
- Keine Performance-Verschlechterung durch Audit-Fixes.

---

## 11. SEO-Status

| Prüfpunkt | Status |
|-----------|--------|
| Title / Description | ✅ CMS-gesteuert via `resolveSeoMeta` |
| Canonical / OG | ✅ `resolvePublicSiteUrl` → `pb-kinderevents.de` |
| JSON-LD LocalBusiness | ✅ Homepage, sicher serialisiert |
| FAQ Schema | ✅ wo FAQ-Inhalte vorhanden |
| robots.txt / sitemap | ✅ Routes vorhanden |
| manifest / PWA Icons | ✅ `manifest.webmanifest`, apple-icon |
| Alt-Texte Logo | ✅ `resolveBrandAlt` |

---

## 12. Offene Restpunkte

1. **RLS-Migration deployen** — `20260725_zero_trust_rls_hardening.sql` in Supabase ausführen (Blocker für Prod, nicht für Code-Merge).
2. **Feingranulares RBAC** — Rollen existieren, werden aber auf den meisten Admin-APIs nicht pro Aktion geprüft.
3. **Live-End-to-End** — Kontaktformular, E-Mail-Zustellung, PDF-Download ohne Produktions-Credentials nicht automatisiert verifiziert.
4. **Dokumentation** — Ältere Docs (`EMAIL_SETUP.md`, Roadmap-Dateien) referenzieren noch `panda-bande-events.de` (nicht runtime-relevant).
5. **Middleware Server-Session** — Cookie-basiert; kein zusätzlicher Server-Side Session-Store.

---

## 13. Kritische Blocker

| Blocker | Status |
|---------|--------|
| 2FA Bypass | ✅ Behoben |
| Build/Lint/Typecheck | ✅ Grün |
| RLS offen für Anon | ⚠️ Migration bereit — **muss deployed werden** |

**Kein Code-Blocker mehr.** Einziger Deploy-Blocker: RLS-Migration auf Produktions-Supabase.

---

## 14. Nice-to-have nach Release

- Vollständiges RBAC pro Admin-Endpoint (Lesen vs. Schreiben vs. CRM vs. System).
- Automatisierte Playwright E2E-Suite für Kontakt, Bewertung, CRM-PDF.
- Dokumentations-Bereinigung alter Domain-Referenzen in `/docs`.
- E-Mail V2 Plattform (separater Branch/PR #72) nach 1.0 evaluieren.
- Lighthouse-Audit mit echten Produktionsdaten.

---

## 15. Go-/No-Go Empfehlung

### Releasefähig: **JA**

**Bedingungen vor Go-Live:**

1. `supabase db push` bzw. Migration `20260725_zero_trust_rls_hardening.sql` auf Produktion.
2. Kurzer Smoke-Test: Admin-Login (+ 2FA falls aktiv), Kontaktformular, Test-E-Mail, ein PDF öffnen.
3. Mobile Check auf einem echten Gerät (FAB + Kontaktformular unten).

**Was vor 1.0 noch erledigt werden müsste (bei NO):**

- Nur falls RLS-Migration **nicht** deployed wird → dann **NEIN**, da direkter Supabase-Client-Zugriff auf Admin-Tabellen möglich bleibt.

---

## Geänderte Dateien (Audit)

```
components/admin/crm/CrmSendModal.tsx
components/admin/email/CustomerCommunicationTimeline.tsx
components/admin/views/CustomersView.tsx
components/admin/views/InvoicesView.tsx
components/admin/views/QuotesView.tsx
components/admin/views/SettingsView.tsx
components/layout/FloatingContactButtons.tsx
components/layout/Header.tsx
components/layout/WhatsAppFab.tsx
lib/cms/resolve-settings.ts
lib/crm/db.ts
lib/email.ts
lib/email/domain-status-copy.ts
lib/json-ld.ts (neu)
scripts/generate-brand-assets.mjs
scripts/live-verify.mjs
src/app/aktuelles/[slug]/page.tsx
src/app/aktuelles/page.tsx
src/app/api/admin/email/compose/route.ts
src/app/api/admin/invoices/[id]/send/route.ts
src/app/api/admin/login/route.ts
src/app/api/admin/quotes/[id]/send/route.ts
src/app/bewertungen/page.tsx
src/app/globals.css
src/app/page.tsx
supabase/migrations/20260725_zero_trust_rls_hardening.sql (neu)
```

---

*Audit durchgeführt im Zero-Trust-Modus. Verifiziert: lint, typecheck, build — alle grün.*
