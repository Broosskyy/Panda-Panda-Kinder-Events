# V1 System & Go-Live Foundation Report — Panda-Bande

**Datum:** 10. Juli 2026  
**Branch:** `cursor/v1-final-release-prep-ca08`  
**Ziel:** Technische V1-Grundlage für Domain-, Hosting-, Mail- und Google-Wechsel ohne Codeänderungen.

---

## Zusammenfassung

| Bereich | Status |
|---------|--------|
| 1. Zentrale Systemkonfiguration | ✅ `lib/system-config.ts` |
| 2. Domainwechsel vorbereitet | ✅ Keine festen URLs im App-Code |
| 3. Mail zentralisiert | ✅ Resend + CMS + ENV |
| 4. Google vorbereitet | ✅ Architektur, nicht aktiviert |
| 5. SEO zentralisiert | ✅ CMS + `resolve-settings` |
| 6. Branding zentralisiert | ✅ `BRAND` + CMS |
| 7. Systemstatus (Super Admin) | ✅ Erweitert + geschützt |
| 8. Code-Qualität | ✅ Hardcodes bereinigt |
| 9. Release Check | ✅ lint, typecheck, build |

---

## 1. Zentralisierte Konfigurationen

### Primäre Quelle: `lib/system-config.ts`

| Kategorie | Inhalt |
|-----------|--------|
| **Unternehmen** | Name, Kurzname, Slogan, Beschreibung, Absendername |
| **Domain** | Fallback-Host + WWW-Host (nur Entwicklung) |
| **E-Mail** | Standard-Adresse, Support, Rechnung |
| **Kontakt** | Standort, Instagram |
| **Assets** | Logo-, OG-, Favicon-Pfade |
| **Push** | Icon-Pfad, Anfragen-URL, VAPID-Subject-Fallback |
| **URLs** | `resolveSiteUrlFromEnv()`, `resolveEmailAssetBaseUrl()`, `buildAbsoluteUrl()` |
| **Google** | `resolveGoogleIntegrations()` — CMS + ENV, fehlende IDs = kein Fehler |
| **Mail-ENV** | `resolveMailEnvConfig()` — Resend, Notification, Asset-Base |

### Abgeleitete Module

| Modul | Rolle |
|-------|-------|
| `lib/site-url.ts` | Öffentliche URL-Auflösung |
| `lib/email/constants.ts` | E-Mail-Fallback-Konstanten |
| `lib/email/asset-url.ts` | E-Mail-Bild-Basis-URLs |
| `lib/cms/resolve-settings.ts` | SEO-Meta, Canonical, Google-IDs |
| `lib/admin/push/config.ts` | VAPID-Subject, Push-Pfade |
| `src/config/site.ts` | Statische Website-Fallbacks |
| `lib/admin/build-info.ts` | App-Version und Build-Label (Systemstatus) |

### CMS (Admin → Einstellungen) — Laufzeit-Konfiguration

| Bereich | Felder |
|---------|--------|
| Unternehmensdaten | Firmenname, Kurzname, Slogan, Kontakt, Website |
| Branding | Logos, Farben, Favicons, PWA-Icons, OG-Bild |
| E-Mail | Absender, Reply-To, Empfänger, Vorlagen |
| Domain & SEO | Domain, Canonical, Meta, OG, robots, Sitemap |
| Google (vorbereitet) | GA4, GTM, GSC-Verifizierung, Clarity, Maps, reCAPTCHA |
| Rechtliches | Impressum, Datenschutz, AGB, Cookie-Hinweis |
| Kontakt | mapsUrl, Social Links |

---

## 2. Entfernte Hardcodes

| Datei | Änderung |
|-------|----------|
| `lib/site-url.ts` | Nutzt `resolveSiteUrlFromEnv()` |
| `lib/email/asset-url.ts` | Dynamische Hosts aus ENV + Defaults |
| `lib/email/aliases-db.ts` | `extractDomainFromEmail()` statt fester Domain |
| `lib/admin/push/config.ts` | `resolveVapidSubject()` |
| `components/admin/views/SettingsView.tsx` | Generische Domain-Platzhalter |
| `lib/email/resolve-image-url.ts` | Kommentar ohne feste Domain |

**Einzige verbleibende Domain-Fallbacks:** `lib/system-config.ts` → `SYSTEM_DEFAULTS` (bewusst für lokale Entwicklung ohne ENV).

**Nicht geändert (Dokumentation/Scripts):** Historische `*_REPORT.md`, Test-Skripte, `PUSH_SETUP.md` — keine Laufzeit-Auswirkung.

---

## 3. Vorbereitung für Domainwechsel

Wechsel auf `panda-band.de` (oder andere Domain) ohne Code-Suche:

1. `NEXT_PUBLIC_SITE_URL=https://panda-band.de` in Vercel/.env setzen
2. CMS → Domain & SEO → Primäre Domain / Canonical Base URL anpassen
3. `EMAIL_ASSET_BASE_URL` optional auf WWW-Variante setzen
4. Neu deployen

Alle URL-Erzeugung läuft über:

- `resolveSiteUrlFromEnv()` / `getSiteUrl()`
- `resolvePublicSiteUrl()` (CMS)
- `buildAbsoluteUrl()` / `buildAdminInviteUrl()`
- `canonicalizeProductionUrl()` für E-Mail-Assets

`collectKnownHosts()` erkennt automatisch neue Hosts aus ENV.

---

## 4. Vorbereitung für Hostingwechsel

| Aspekt | Vorbereitung |
|--------|--------------|
| **Domain** | ENV + CMS, kein Host-Hardcode |
| **SSL** | Systemstatus zeigt HTTPS-Status der konfigurierten URL |
| **Build/Version** | `lib/admin/build-info.ts` — Version aus `package.json`, Build aus Vercel-SHA |
| **Supabase** | Unabhängig vom Frontend-Hosting |
| **Storage** | Supabase Storage, Status im Systemstatus |
| **Resend/SMTP** | `RESEND_API_KEY` — Wechsel nur ENV + CMS-Absender |

---

## 5. Vorbereitung für Google

Architektur in `lib/system-config.ts` → `resolveGoogleIntegrations()`:

| Dienst | CMS-Feld | ENV-Fallback | Verhalten ohne ID |
|--------|----------|--------------|-------------------|
| Google Analytics 4 | `googleAnalyticsId` | `NEXT_PUBLIC_GA_ID` | Kein Script |
| Google Tag Manager | `googleTagManagerId` | `NEXT_PUBLIC_GTM_ID` | Kein Script |
| Search Console | `googleSiteVerification` | `GOOGLE_SITE_VERIFICATION` | Kein Meta-Tag |
| Microsoft Clarity | `microsoftClarityId` | `NEXT_PUBLIC_CLARITY_ID` | Kein Script |
| Google Maps API | `googleMapsApiKey` | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Keine Karte |
| reCAPTCHA | `googleRecaptchaSiteKey` | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Kein Widget |

Server-seitig: `resolveRecaptchaSecret()` für `RECAPTCHA_SECRET_KEY`.

Rendering: `components/analytics/AnalyticsScripts.tsx` — nur bei vorhandenen IDs.

**Fehlende IDs verursachen niemals Fehler** — alle Resolver geben `undefined` zurück, UI/Scripts rendern nichts.

---

## 6. Vorbereitung für SMTP / Mail

| Aspekt | Quelle |
|--------|--------|
| Absender-Name | CMS → `system-config` Fallback |
| Absender-E-Mail | CMS → `DEFAULT_COMPANY_EMAIL` |
| Reply-To | CMS E-Mail-Einstellungen |
| Resend API | `RESEND_API_KEY` (ENV) |
| E-Mail-Bilder | `EMAIL_ASSET_BASE_URL` → `resolveEmailAssetBaseUrl()` |
| Benachrichtigungen | `INQUIRY_NOTIFICATION_EMAIL` |

Bestehende Mailfunktionen (Versand, Templates, Logs) wurden **nicht** verändert — nur Konfigurationsquellen zentralisiert.

---

## 7. Systemstatus (Super Admin)

**Sichtbarkeit:** Nur für Super Admin (`roleSlug === "administrator"`)

- Tab „Systemstatus“ in Einstellungen nur für Super Admin
- API `GET /api/admin/settings/system-status` via `requireSuperAdmin()`

**Angezeigte Bereiche:**

| ID | Label | Inhalt |
|----|-------|--------|
| `supabase` | Supabase | Datenbank-Verbindung |
| `storage` | Storage | Supabase Storage |
| `smtp` | SMTP / Versand | Resend-API-Status |
| `push` | Push | VAPID-Konfiguration |
| `domain` | Domain | Aktive Website-URL |
| `ssl` | SSL / HTTPS | HTTPS-Status |
| `google` | Google & Tracking | GA4, GTM, GSC, Clarity, Maps, reCAPTCHA |
| `version` | Version | App-Version aus `package.json` |
| `build` | Build | Git-SHA / Deployment-ID |
| + weitere | E-Mail, Rechnung, Backup, Migrationen | Bestehende Detailprüfungen |

Keine Konfiguration wird erzwungen — nur Status-Anzeige mit Ampel (OK / Hinweis / Kritisch).

---

## 8. SEO & Branding

### SEO (zentral über CMS + Resolver)

- Meta Title / Description
- OpenGraph (Titel, Beschreibung, Bild)
- Canonical URL
- robots / Sitemap
- Schema.org (über bestehende SEO-Pipeline)
- Google-IDs (siehe Abschnitt 5)

### Branding (zentral)

- `lib/brand.ts` — Master-Assets, Farben, Icon-Versionierung
- CMS Branding-Tab — Logos, Favicons, PWA-Icons, OG-Bild
- `prebuild` → `generate:brand-assets` für Manifest/Favicons

---

## 9. Bewusst NICHT umgesetzt

| Punkt | Begründung |
|-------|------------|
| Neue CRM-Funktionen | V1-Release-Scope ausgeschlossen |
| White-Label | Nicht in V1 |
| Unnötige UI-Umbauten | Nur Systemstatus-Erweiterung |
| Google-Dienste aktivieren | Nur Architektur — IDs fehlen bewusst |
| SMTP-Provider-Wechsel (weg von Resend) | Nur Vorbereitung; Resend bleibt aktiv |
| Automatische SSL-Prüfung per HTTP | Nur HTTPS-URL-Analyse (kein Zertifikats-Scan) |
| Domain in Docs/Scripts bereinigen | Keine Laufzeit-Auswirkung |
| Vollständige `lib/brand.ts`-Migration in system-config | BRAND bleibt Asset-Quelle, system-config referenziert |

---

## 10. Release Check

```bash
npm run lint      # ✅
npm run typecheck # ✅
npm run build     # ✅
```

---

## Domainwechsel-Checkliste (Go-Live)

1. `NEXT_PUBLIC_SITE_URL` setzen
2. CMS → Domain & SEO aktualisieren
3. `EMAIL_ASSET_BASE_URL` setzen (WWW-Variante empfohlen)
4. Resend-Domain verifizieren + Absender in CMS
5. Optional: Google-IDs in CMS oder ENV
6. Optional: VAPID-Keys für Push
7. Deploy → Systemstatus als Super Admin prüfen
