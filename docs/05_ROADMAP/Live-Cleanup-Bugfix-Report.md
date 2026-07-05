# Live Cleanup Bugfix Report — v0.8.6

**Datum:** 2026-07-05  
**Branch:** `cursor/live-cleanup-e022`  
**Ziel:** CMS-Konsistenz, keine Platzhalter-Mischung, Doppel-DOM entfernen

---

## Behobene Probleme

### 1. CMS/Fallback-Konsistenz
**Ursache:** `buildSettingsFromRows()` merged CMS-Werte mit `DEFAULT_SITE_SETTINGS` — fehlende CMS-Felder fielen auf `config/site.ts` zurück.  
**Fix:** `cmsSection()` — wenn CMS-Key existiert, wird der CMS-Wert unverändert verwendet.

### 2. Kontakt/Footer-Platzhalter
**Ursache:** Hardcodierte Taglines in `Contact.tsx` und `About.tsx`; Footer ohne Telefon; Impressum/Datenschutz nutzten `siteConfig.contact`.  
**Fix:** Einheitliche Quelle `fetchSiteSettings()`; `footer.tagline` als Prop; Telefon in Kontakt-Links und Footer.

### 3. Über-uns Textzusammensetzung
**Ursache:** `updateFounderName()` in `ContentView.tsx` ersetzte Namen mitten im `introText` per `split/join`.  
**Fix:** Funktion entfernt; `founderName` und `introText` werden unabhängig gespeichert.

### 4. Doppelte Inhalte
**Ursache:** Zwei `LisaBadge`-Wrapper (mobile/desktop) in `Hero.tsx`; zwei `Logo`-Instanzen in `Footer.tsx` und `Header.tsx`.  
**Fix:** Je ein DOM-Element mit responsive CSS-Klassen.

### 5. Leistungen & Galerie
**Ursache:** Komponenten fielen auf statische Defaults zurück; bei DB-Fehler leere Arrays.  
**Fix:** Fetch liefert CMS-only wenn Tabelle befüllt; Komponenten rendern `null` bei leerem Array (kein statischer Mix).

### 6. Hero Portrait-Clipping
**Ursache:** Zu wenig Top-Padding unter fixem Header.  
**Fix:** Erhöhtes `pt-[max(...)]` + `overflow: visible` auf Hero-Content.

### 7. Statistik
**Status:** Code-seitig unverändert (Tracking-Endpoint + RPC-Fallbacks vorhanden).  
**Hinweis:** Dashboard zeigt 0, wenn Migration `20260703_page_views_analytics.sql` in Supabase fehlt oder Env-Variablen auf Vercel nicht gesetzt sind.

---

## Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `lib/cms/data.ts` | CMS-only Sektionen, Service/Galerie-Filter |
| `components/admin/views/ContentView.tsx` | Keine Name-Injection |
| `components/sections/Hero.tsx` | Ein Badge, mehr Padding |
| `components/sections/Contact.tsx` | CMS footer.tagline, Telefon überall |
| `components/sections/About.tsx` | CMS footer.tagline |
| `components/sections/Services.tsx` | Kein Default-Fallback in UI |
| `components/sections/Gallery.tsx` | Kein Default-Fallback in UI |
| `components/layout/Footer.tsx` | Ein Logo, Telefon |
| `components/layout/Header.tsx` | Ein Logo |
| `src/app/page.tsx` | footer-Props |
| `src/app/impressum/page.tsx` | CMS-Kontakt |
| `src/app/datenschutz/page.tsx` | CMS-Kontakt |
| `scripts/live-verify.mjs` | Erweiterte Checks |

---

## Verifikation

```bash
npm run build
npm run lint
npm run live:verify
```

**Live-Checks (Production):**
- Hero korrekt (Tagline nicht abgeschnitten, ein Badge)
- Kontakt/Footer aus CMS (keine Platzhalter-E-Mail/Einsatzgebiet)
- Über-uns Text sauber
- Galerie/Leistungen nur CMS wenn vorhanden
- Statistik steigt nach Seitenaufrufen (nach Migration)

---

## Offene Punkte (Infrastruktur)

1. Supabase-Migration `20260703_page_views_analytics.sql` auf Production ausführen
2. Vercel Env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Bereits kaputte `introText`-Werte im CMS ggf. manuell im Admin korrigieren
