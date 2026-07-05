# RC1 Blocker Report — Public UI + Full CMS Control

**Version:** 0.9.0-rc.3  
**Branch:** `cursor/rc1-blocker-fix-e022`  
**Datum:** 2026-07-05  
**Production:** https://panda-bande-events.de

---

## Zusammenfassung

Alle sieben RC1-Blocker wurden im Code adressiert. `npm run build` und `npm run lint` bestanden. Automatisierte Live-Tests aus der Cloud-Umgebung schlagen fehl (`fetch failed` / DNS) — **Production-Verifikation muss lokal oder nach Deploy manuell erfolgen.**

**RC1 Status: Code bereit — Live-Sign-off ausstehend**

---

## Blocker-Checkliste

| # | Blocker | Code-Fix | Live-Test |
|---|---------|----------|-----------|
| 1 | Header/Hero Mobile Bug | ✔ | ⏳ Ausstehend |
| 2 | Mobile CTA Button | ✔ | ⏳ Ausstehend |
| 3 | Leistungen kaputt (Platzhalter) | ✔ | ⏳ Ausstehend |
| 4 | Full CMS Control | ✔ | ⏳ Ausstehend |
| 5 | CMS-Fallback-Regel | ✔ | — |
| 6 | Statistik-Hinweis | ✔ | ⏳ Ausstehend |
| 7 | Live Tests Production | — | ✖ Nicht aus Cloud möglich |

---

## 1. Header/Hero Mobile Bug

**Problem:** Hero-Tagline wurde vom sticky Header abgeschnitten; Anker-Links verdeckten Section-Titel.

**Fix:**
- `globals.css`: `--header-height` (4rem mobile / 5.5rem desktop), `--header-offset` inkl. Safe-Area
- Globales `scroll-margin-top` auf alle `[id]`-Elemente
- Hero: `padding-top: calc(var(--header-offset) + 1.25rem)` statt feste `pt-[max(...)]`-Klassen

**Dateien:** `src/app/globals.css`, `components/sections/Hero.tsx`

**Manuell prüfen:** 360 / 390 / 430 px Portrait + Landscape — Tagline sichtbar, „Unsere Leistungen“ nicht unter Header.

---

## 2. Mobile CTA Button

**Problem:** „Jetzt anfragen“ im Header zu groß/gequetscht auf Mobile.

**Fix:**
- Unter `md` (< 768px): Button im Header ausgeblendet
- `md`–`lg`: kompakt „Anfragen", `whitespace-nowrap`, kleineres Padding/Icon
- `lg+`: voller Text aus CMS (`navigation.ctaLabel`)

**Dateien:** `components/layout/Header.tsx`

---

## 3. Leistungen kaputt

**Problem:** CMS-Platzhalter „Neue Leistung / Beschreibung…" erschien öffentlich.

**Fix:**
- `lib/cms/content-quality.ts`: `isPlaceholderContent()`, `isValidCmsService()`
- `fetchCmsServices()`: filtert Platzhalter; bei leeren/ungültigen CMS-Daten → `staticServices`
- Admin: neue Leistungen starten mit `visible: false`

**Dateien:** `lib/cms/content-quality.ts`, `lib/cms/data.ts`, `components/admin/views/ServicesView.tsx`

---

## 4. Full CMS Control

**Neu im Admin (`/admin/inhalte`):**

| Inhalt | CMS-Key |
|--------|---------|
| Logo / Branding | `branding` |
| Navigation + CTA-Labels | `navigation` |
| Hero (inkl. Bild, Badge-Zitat) | `hero` |
| Trust Badges | `trustBadges` |
| USP-Karten | `usps` |
| Buchungsablauf | `process` |
| Sektions-Überschriften | `sections` |
| Kontakt / WhatsApp / Social | `contact` |
| Über uns | `about` |
| Footer | `footer` |

**Weiterhin über eigene Admin-Views:** Leistungen, Galerie, FAQ, Bewertungen, Beiträge.

**Dateien:** `lib/cms/types.ts`, `lib/cms/defaults.ts`, `lib/cms/data.ts`, `lib/cms/validate-settings.ts`, `components/admin/views/ContentView.tsx`, alle Section-Komponenten, `src/app/page.tsx`

---

## 5. CMS-Fallback-Regel

- CMS-Daten haben Vorrang (merge mit Defaults für Abwärtskompatibilität)
- Defaults nur wenn CMS-Key fehlt, leer oder Validierung fehlschlägt
- Platzhalter-Muster („Neue Leistung", „Beschreibung…", „Hey Lol", etc.) werden öffentlich gefiltert

---

## 6. Statistik

**Problem:** Dashboard zeigte dauerhaft 0 ohne Hinweis bei fehlender Migration.

**Fix:**
- Prominenter Banner: „Statistik noch nicht eingerichtet"
- Besucher-/Aufrufe-Karten ersetzt durch Hinweis wenn `trackingTableReady === false`
- Migration: `supabase/migrations/20260703_page_views_analytics.sql`

**Dateien:** `components/admin/views/DashboardView.tsx`

---

## 7. Live Tests

```bash
npm run live:verify   # 0/4 aus Cloud — fetch failed (DNS/Netzwerk)
npm run build         # ✔ bestanden
npm run lint          # ✔ bestanden
```

### Manuelle Production-Checkliste (nach Deploy)

- [ ] Hero-Tagline nicht abgeschnitten (Mobile Portrait 360/390/430)
- [ ] Header verdeckt keine Section-Titel bei Anker-Navigation
- [ ] Header-CTA kompakt / ausgeblendet auf kleinen Screens
- [ ] Keine Platzhalter-Leistungen öffentlich sichtbar
- [ ] Admin-Änderungen erscheinen nach Reload öffentlich
- [ ] Alle Startseiteninhalte im Admin bearbeitbar
- [ ] Dashboard zeigt Statistik-Hinweis oder echte Zahlen
- [ ] Landscape + Desktop geprüft

---

## Geänderte Dateien (Auswahl)

```
lib/cms/content-quality.ts          (neu)
lib/cms/types.ts                    (erweitert)
lib/cms/defaults.ts                 (erweitert)
lib/cms/data.ts                     (Placeholder-Filter, neue Settings)
lib/cms/validate-settings.ts        (neue Sektionen)
lib/cms/icons.ts                    (erweiterte Icon-Map)
src/app/globals.css                 (Header-Offset, Scroll-Margin)
components/layout/Header.tsx        (CTA, Navigation CMS)
components/ui/Logo.tsx              (Branding CMS)
components/sections/*.tsx           (CMS-Props)
components/admin/views/ContentView.tsx  (Full CMS Admin)
components/admin/views/DashboardView.tsx
components/admin/views/ServicesView.tsx
src/app/page.tsx
CHANGELOG.md
package.json                        (0.9.0-rc.3)
```

---

## Nächste Schritte

1. PR mergen und auf Production deployen
2. Manuelle Live-Checkliste oben abarbeiten
3. Bei bestandenen Live-Tests: RC1 freigeben
