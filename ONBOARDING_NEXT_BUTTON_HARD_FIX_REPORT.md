# Onboarding Weiter Button — Hard Fix Report

**Datum:** 2026-07-09  
**Branch:** `cursor/onboarding-weiter-hard-fix-dab0`

---

## Problem

Onboarding Schritt 1 von 9 zeigte:
- Zurück (disabled)
- Überspringen
- Nicht erneut anzeigen  
**aber keinen sichtbaren „Weiter“-Button.**

---

## Root Cause

Zwei zusammenhängende Ursachen:

### 1. Unsichtbarer Primary-Button (Hauptursache)

`AdminOnboardingWizard` rendert per `createPortal(..., document.body)` **außerhalb** von `.admin-shell`.

Admin-Design-Tokens (`--admin-accent`, `--admin-border`, …) sind nur auf `.admin-shell` definiert. Der Weiter-Button nutzte:

```css
background: var(--admin-accent); /* undefiniert außerhalb .admin-shell */
color: #fff;
```

Ergebnis: **weißer Text auf weißem Panel** → Button war im DOM, aber unsichtbar.

Zurück/Überspringen/Nicht erneut nutzten teils globale Tokens (`--color-text-muted`) und blieben sichtbar.

### 2. Layout-Risiko

Weiter teilte eine Zeile mit Zurück (2-Spalten-Grid). Selbst nach Token-Fix bleibt das riskant auf 390px — Weiter kann visuell verdrängt werden.

---

## Fix

### Footer-Layout (Mobile, exakt wie gefordert)

| Zeile | Inhalt |
|-------|--------|
| 1 | **[Weiter]** / Schritt 9 **[Fertig]** — volle Breite, Primary |
| 2 | **[Zurück]** · **[Überspringen]** |
| 3 | **[Nicht erneut anzeigen]** |

Schritt 1: Zurück disabled, **Weiter bleibt eigene Zeile oben**.

### CSS

- `.admin-onboarding-v2-root` definiert Admin-Tokens für Portal-Kontext
- `.admin-onboarding-v2-btn-next` nutzt `var(--color-primary)` (global verfügbar)
- `.admin-onboarding-v2-btn-next-full` = `width: 100%`

### Geänderte Dateien

- `components/admin/AdminOnboardingWizard.tsx`
- `src/app/globals.css`
- `scripts/onboarding-next-button-hard-fix-test.mjs` (neu)

**Nicht geändert:** Leistungen, PWA, andere Bereiche

---

## Tests

```text
node scripts/onboarding-next-button-hard-fix-test.mjs
npm run typecheck
npm run lint
npm run build
```

---

## Akzeptanz

| Kriterium | Code | Live-Screenshot |
|-----------|------|-----------------|
| Grüner Weiter-Button Schritt 1 sichtbar | ✅ | ⏳ Nutzer prüfen nach Deploy |
| Weiter klickbar → Schritt 2 | ✅ | ⏳ Nutzer prüfen |
| Layout 3 Zeilen auf 390px | ✅ | ⏳ Nutzer prüfen |

**Nicht als erledigt markieren, bis Schritt-1-Screenshot den grünen Weiter-Button zeigt.**
