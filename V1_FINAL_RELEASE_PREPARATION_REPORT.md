# V1 Final Release Preparation Report — Panda-Bande

**Datum:** 10. Juli 2026  
**Branch:** `cursor/v1-final-release-prep-ca08`  
**Ziel:** Zentrale Systemkonfiguration, Domain-/Hosting-Vorbereitung, keine neuen Features.

---

## Zusammenfassung

| Bereich | Status |
|---------|--------|
| 1. Zentrale Systemkonfiguration | ✅ `lib/system-config.ts` |
| 2. Admin vorbereitet | ✅ SEO-Tab erweitert |
| 3. Domainwechsel vorbereitet | ✅ Keine festen URLs im App-Code |
| 4. Google vorbereitet | ✅ CMS + ENV, nicht aktiviert |
| 5. SMTP / Mail zentralisiert | ✅ Resend + Fallbacks |
| 6. SEO zentralisiert | ✅ CMS + resolve-settings |
| 7. Branding zentralisiert | ✅ BRAND + CMS branding |
| 8. Push unverändert funktional | ✅ Nur Config-Quelle |
| 9. Bestehende Funktionen | ✅ Keine Logik geändert |
| 10. Code-Qualität | ✅ Doppelte Konstanten bereinigt |
| 11. Release Check | ✅ lint, typecheck, build |

---

## 1. Zentralisierte Werte

### Neue zentrale Quelle: `lib/system-config.ts`

| Kategorie | Inhalt |
|-----------|--------|
| **Unternehmen** | Name, Kurzname, Slogan, Beschreibung, Absendername |
| **Domain** | Fallback-Host + WWW-Host (nur Entwicklung) |
| **E-Mail** | Standard-Adresse, Support, Rechnung |
| **URLs** | `resolveSiteUrlFromEnv()`, `resolveEmailAssetBaseUrl()`, `buildAbsoluteUrl()` |
| **Push** | VAPID-Subject-Fallback, Icon-Pfad |
| **Google** | `resolveGoogleIntegrations()` — CMS + ENV |
| **Mail-ENV** | `resolveMailEnvConfig()` — Resend, Notification |

### Abgeleitete Module (importieren aus system-config)

| Modul | Rolle |
|-------|-------|
| `lib/site-url.ts` | Öffentliche URL-Auflösung |
| `lib/email/constants.ts` | E-Mail-Fallback-Konstanten |
| `lib/email/asset-url.ts` | E-Mail-Bild-Basis-URLs |
| `lib/admin/push/config.ts` | VAPID-Subject |
| `src/config/site.ts` | Statische Website-Fallbacks |
| `lib/cms/resolve-settings.ts` | SEO-Meta + Google-IDs |

### CMS (Admin → Einstellungen) — Laufzeit-Konfiguration

| Bereich | Felder |
|---------|--------|
| Unternehmensdaten | Firmenname, Kurzname, Slogan, Kontakt, Website |
| Branding | Logos, Farben, Favicons, PWA-Icons, OG-Bild |
| E-Mail | Absender, Reply-To, Empfänger, Vorlagen |
| Domain & SEO | Domain, Canonical, Meta, OG, robots, Sitemap |
| **Neu in SEO** | Google Tag Manager ID, Google Maps API Key, reCAPTCHA Site Key |
| Rechtliches | Impressum, Datenschutz, AGB, Cookie-Hinweis |
| Kontakt | mapsUrl (Google Maps Link), Social Links |

---

## 2. Entfernte Hardcodes (App-Code)

| Datei | Vorher | Nachher |
|-------|--------|---------|
| `lib/site-url.ts` | `DEFAULT_SITE_URL` fest | `resolveSiteUrlFromEnv()` |
| `lib/email/asset-url.ts` | `PRODUCTION_HOSTS` fest | `collectKnownHosts()` aus ENV + Defaults |
| `lib/email/aliases-db.ts` | `"pb-kinderevents.de"` Fallback | `extractDomainFromEmail()` |
| `lib/admin/push/config.ts` | `mailto:info@…` fest | `resolveVapidSubject()` |
| `lib/admin/email-system-status.ts` | Domain-Hinweis fest | `getDefaultCompanyDomain()` |
| `components/admin/views/SettingsView.tsx` | Domain-Beispiele fest | `ihre-domain.de` |
| `components/admin/email/EmailBrandingPanel.tsx` | URL-Platzhalter fest | generisch |

**Einzige verbleibende Domain-Fallbacks:** `lib/system-config.ts` → `SYSTEM_DEFAULTS.domain` (bewusst, für lokale Entwicklung ohne ENV).

---

## 3. Domainwechsel (z. B. → panda-band.de)

### Erforderliche Schritte (ohne Codeänderung)

1. **Vercel / `.env.local`:**
   - `NEXT_PUBLIC_SITE_URL=https://panda-band.de`
   - `EMAIL_ASSET_BASE_URL=https://www.panda-band.de`

2. **CMS → Einstellungen → Domain & SEO:**
   - Primäre Domain: `panda-band.de`
   - WWW-Domain: `www.panda-band.de`
   - Canonical Base URL: `https://www.panda-band.de`

3. **CMS → Einstellungen → E-Mail:**
   - Absender/Reply-To auf `@panda-band.de` setzen

4. **Resend:** Neue Domain verifizieren (DKIM/SPF)

5. **Neu deployen**

### Was automatisch mitzieht

- Sitemap (`/sitemap.xml`)
- robots.txt
- OpenGraph / Canonical
- Admin-Einladungslinks
- E-Mail-Logo-URLs (via `EMAIL_ASSET_BASE_URL`)
- PDF-Logo-Auflösung

---

## 4. Hostingwechsel

### Erforderlich

| Schritt | Details |
|---------|---------|
| ENV-Variablen | Alle aus `.env.example` übertragen |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, Keys unverändert |
| Resend | `RESEND_API_KEY` |
| VAPID | Push-Keys + `VAPID_SUBJECT=mailto:info@neue-domain.de` |
| Build | `npm run build` auf neuem Host |
| DNS | Auf neuen Server/Vercel-Projekt zeigen |

### Kein Code nötig

Die Anwendung hat keine hosting-spezifischen Hardcodes (außer Supabase/Resend als konfigurierbare Dienste).

---

## 5. Google Analytics / Search Console

### Vorbereitet, nicht aktiviert

| Dienst | CMS-Feld | ENV-Fallback | Verhalten wenn leer |
|--------|----------|--------------|---------------------|
| Google Analytics | `googleAnalyticsId` | `NEXT_PUBLIC_GA_ID` | Kein Script |
| Google Tag Manager | `googleTagManagerId` | `NEXT_PUBLIC_GTM_ID` | Kein Script |
| Search Console | `googleSiteVerification` | `GOOGLE_SITE_VERIFICATION` | Kein Meta-Tag |
| Microsoft Clarity | `microsoftClarityId` | `NEXT_PUBLIC_CLARITY_ID` | Kein Script |
| Google Maps | `googleMapsApiKey` | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Kontakt nutzt `mapsUrl` |
| reCAPTCHA | `googleRecaptchaSiteKey` | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Keine Validierung |

### Aktivierung später

1. IDs in CMS unter **Domain & SEO** eintragen (oder ENV setzen)
2. Bei GTM: GA-ID leer lassen (GTM übernimmt)
3. reCAPTCHA Secret nur serverseitig: `RECAPTCHA_SECRET_KEY`
4. Deploy — `AnalyticsScripts.tsx` rendert nur bei vorhandenen IDs

---

## 6. SMTP / Mail

### Zentralisierung

- **Versand:** Resend (`RESEND_API_KEY`) — unverändert
- **Absender/Empfänger:** CMS `email`-Sektion
- **Fallbacks:** `lib/system-config.ts` → `lib/email/constants.ts`
- **Bild-URLs:** `resolveEmailAssetBaseUrl()` — nie Vercel-Preview

### Mailserver-Wechsel später

1. Resend-Domain für neue Domain verifizieren **oder** SMTP-Adapter ergänzen (bewusst **nicht** in V1)
2. CMS-Absenderadressen anpassen
3. `EMAIL_ASSET_BASE_URL` setzen

---

## 7. Bewusst NICHT umgesetzt (nach V1)

| Punkt | Grund |
|-------|-------|
| White-Label / Multi-Tenant | Explizit ausgeschlossen |
| Vollständiger SMTP-Wechsel (nicht Resend) | Erfordert neuen Mail-Adapter |
| reCAPTCHA in Formularen aktivieren | Nur vorbereitet, keine Formular-Änderung |
| Google Maps Embed mit API Key | `mapsUrl` in Kontakt reicht für V1 |
| Eigenes Analytics-Dashboard | Bereits vorhanden, unverändert |
| Neue Admin-Menüs | Bestehende Einstellungen erweitert |
| CRM-Erweiterungen | Explizit ausgeschlossen |
| Architektur-Umbau | Explizit ausgeschlossen |

---

## 8. Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `lib/system-config.ts` | **Neu** — zentrale Konfiguration |
| `lib/site-url.ts` | Wrapper um system-config |
| `lib/email/constants.ts` | Ableitung aus system-config |
| `lib/email/asset-url.ts` | Dynamische Host-Erkennung |
| `lib/email/resolve-image-url.ts` | Kommentare + Alt-Text |
| `lib/admin/push/config.ts` | VAPID aus system-config |
| `lib/cms/types.ts` | SEO-Felder GTM, Maps, reCAPTCHA |
| `lib/cms/defaults.ts` | Neue SEO-Defaults |
| `lib/cms/resolve-settings.ts` | Google-Integration-Auflösung |
| `src/config/site.ts` | SYSTEM_DEFAULTS |
| `src/app/layout.tsx` | Erweiterte SEO-Fallbacks |
| `components/analytics/AnalyticsScripts.tsx` | GTM-Unterstützung |
| `components/admin/views/SettingsView.tsx` | Neue SEO-Felder |
| `components/admin/email/EmailBrandingPanel.tsx` | Generische Platzhalter |
| `.env.example` | Vollständige ENV-Dokumentation |

---

## 9. Release Check

```bash
npm run lint       # ✅ 0 errors
npm run typecheck  # ✅ passed
npm run build      # ✅ 94 routes
```

---

**Status: READY FOR V1 GO-LIVE PREPARATION**

Nächster Schritt für Produktion: ENV + CMS Domain/E-Mail setzen, Resend-Domain verifizieren, manuell testen.
