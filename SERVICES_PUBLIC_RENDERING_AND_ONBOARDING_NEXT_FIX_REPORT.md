# Services Public Rendering + Onboarding Next Fix — Report

**Datum:** 2026-07-08  
**Branch:** `cursor/services-public-onboarding-next-fix-dab0`

---

## 1. Leistungen: Admin → öffentliche Website

### Ursache

CMS-Leistungen mit Titel **„Neue Leistung“** (und ggf. Beschreibung „Beschreibung“) wurden in `queryCmsServices()` durch `isValidCmsService()` herausgefiltert — die Funktion behandelte diese Texte als Platzhalter (`lib/cms/content-quality.ts`).

**Folge:**
- Admin zeigte die Leistung (Status „Sichtbar“)
- Öffentliche Abfrage lieferte `[]`
- `Services.tsx` renderte `null` → **kein `#leistungen`-Anker** auf der Startseite
- Hamburger-Menü „Leistungen“ schloss zwar, scrollte aber ins Leere

### Fix

| Änderung | Datei |
|----------|-------|
| Öffentlich nur noch `visible: true` + nicht-leerer Titel/Beschreibung (`hasMinimumServiceContent`) | `lib/cms/content-quality.ts`, `lib/cms/data.ts` |
| Platzhalter-Filter (`isValidCmsService`) nicht mehr auf öffentliche CMS-Daten anwenden | `lib/cms/data.ts` |
| `#leistungen` immer rendern (Scroll-Ziel), auch wenn Modul aktiv aber Liste kurz leer | `components/sections/Services.tsx` |
| `scroll-mt-24` für Header-Offset | `components/sections/Services.tsx` |

**Bestehend (unverändert, weiterhin korrekt):**
- `noStore()` + `revalidatePublicCms()` nach Admin-Mutationen
- Kein statischer Fallback auf der Startseite
- `visible: true` Filter in Supabase-Query

### Akzeptanz-Status

| Kriterium | Status |
|-----------|--------|
| Admin-Leistung „Sichtbar“ erscheint öffentlich | ✅ Code-Fix (Placeholder-Filter entfernt) |
| Startseite zeigt Leistungssektion | ✅ |
| `#leistungen` existiert für Scroll | ✅ |
| Neue Leistung nach Reload sichtbar | ✅ (Revalidate + noStore) |
| Live-Test mit Supabase-Produktion | ⚠️ Nicht in Agent-VM verifiziert |

---

## 2. Öffentliches Hamburger-Menü

### Fix

| Änderung | Datei |
|----------|-------|
| Mobile Nav: Menü schließen → Scroll auf Startseite / Navigation von Unterseiten | `components/layout/Header.tsx` |
| `#anfrage` → `#kontakt` Mapping | `lib/public-href.ts` |
| Einheitliche Section-IDs: `#leistungen`, `#galerie`, `#bewertungen`, `#ueber-uns`, `#faq`, `#kontakt` | bereits in `lib/navigation.ts` + Sektionen |

**„Unverbindlich anfragen“** nutzt `handleMobileContactCta` → `#kontakt` (Anfrageformular in `Contact.tsx`).

### Akzeptanz-Status

| Test | Status |
|------|--------|
| Leistungen → Menü zu + Scroll zu `#leistungen` | ✅ Code |
| Anfragen → Menü zu + `#kontakt` | ✅ Code |
| Von Unterseiten (`/aktuelles`) → `/#leistungen` | ✅ Code |

---

## 3. Onboarding: Weiter-Button

### Ursache (vermutet)

Schritt 1 zeigte **Zurück (disabled)** und **Weiter** in einem 50/50-Grid — auf schmalen Viewports wirkte „Weiter“ oft unsichtbar oder wie fehlend. Footer war auf Desktop nicht sticky.

### Fix

| Änderung | Datei |
|----------|-------|
| Schritt 1: **Zurück ausgeblendet**, **Weiter volle Breite** | `AdminOnboardingWizard.tsx` |
| Footer sticky (alle Viewports) | `globals.css` |
| Grid-Modifier `--single` für Primary-Actions | `globals.css` |
| Chevron-Icon von Weiter entfernt (klarere Beschriftung) | `AdminOnboardingWizard.tsx` |

**Unverändert funktional:** X, Überspringen, Nicht erneut anzeigen, Fertig auf Schritt 9, Session-Dismiss.

### Akzeptanz-Status (390px)

| Element | Status |
|---------|--------|
| Weiter sichtbar Schritt 1 | ✅ Code |
| Weiter funktioniert | ✅ Code |
| Überspringen / Nicht erneut anzeigen | ✅ Code |
| Browser-Test Mobile | ⚠️ Nicht in Agent-VM |

---

## Geänderte Dateien

- `lib/cms/content-quality.ts`
- `lib/cms/data.ts`
- `lib/public-href.ts`
- `components/layout/Header.tsx`
- `components/sections/Services.tsx`
- `components/admin/AdminOnboardingWizard.tsx`
- `src/app/globals.css`
- `scripts/services-public-onboarding-next-fix-test.mjs` (neu)

---

## Tests

```text
node scripts/services-public-onboarding-next-fix-test.mjs  → 8/8
node scripts/services-onboarding-fix-test.mjs              → 16/16
npm run typecheck                                          → OK
npm run lint                                               → OK
npm run build                                              → OK
npm run test                                               → nicht vorhanden
```

---

## Offen / Nicht als erledigt markieren ohne Live-Test

- Leistungen auf **pb-kinderevents.de** mit echter Supabase-DB prüfen
- Mobile Onboarding auf 390px im Browser prüfen
- Hamburger-Scroll auf echtem Gerät prüfen
