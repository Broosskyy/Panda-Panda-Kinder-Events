# Admin Onboarding V2 – Clean Tutorial Modal Fix Report

**Branch:** `cursor/admin-onboarding-v2-fix-e022`  
**Date:** 2026-07-08

## Problem

The onboarding modal was visible but felt buggy: translucent overlap, poor text contrast, bottom nav bleeding through, and unclear button placement.

## Solution

Complete V2 redesign as a portal-based, full-screen tutorial overlay with solid card, dark backdrop, and hidden chrome.

---

## 1. Clear visual hierarchy

- **Backdrop:** `rgba(26, 27, 23, 0.72)` + 8px blur — background blocked, not readable through
- **Panel:** Solid `#f4f1ea` (Panda-Bande warm tone), white footer bar
- **Text:** Primary title `#2c2c2c`, body `#5a5a52` — high contrast
- **z-index 200** — above bottom nav (70) and modals (85)

## 2. Modal structure (mobile-first)

```
┌─────────────────────────┐
│ [icon] Schritt X von Y  │  ✕
│━━━━━━━━━━━━━━━━━━━━━━━━│ progress
│ Titel                   │
│ Kurztext (2–3 Sätze)    │
│ • Stichpunkt            │  ← scrollable
│ • Stichpunkt            │
├─────────────────────────┤
│ [Zurück]    [Weiter]    │  ← always visible
│ Überspringen · Nicht…   │
└─────────────────────────┘
```

- Max width: **90vw**, max **24–26rem**
- Max height: **88dvh** with scrollable body
- Footer fixed at bottom of card with safe-area padding

## 3. Background blocked

- `createPortal(..., document.body)` — no parent opacity issues
- `html[data-admin-onboarding="open"]` hides bottom nav, FAB, mobile header
- `body { overflow: hidden }` while open
- Backdrop is non-interactive for content behind (full inset overlay)

## 4. Actions

| Control | Behavior |
|---------|----------|
| **Weiter / Fertig** | Next step / complete + save |
| **Zurück** | Previous step |
| **Überspringen** | Jump to last step (then Fertig) |
| **Nicht erneut anzeigen** | Save `onboarding_completed_at` + close |
| **✕** | Same as „Nicht erneut anzeigen“ |

Persistence unchanged: per-user via API + `admin_security_settings` fallback.

## 5. Role-specific content

Steps include `iconKey`, short `body`, and max 2 `bullets` per step:

- **Super Admin:** 9 steps incl. Benutzer, Sicherheit/Audit
- **Admin:** 7 Betriebs-Schritte
- **Mitarbeiter:** 5 Aufgaben-Schritte
- **Nur Lesen:** 4 Ansicht-Schritte

## 6. Files changed

| File | Change |
|------|--------|
| `AdminOnboardingWizard.tsx` | Portal, V2 layout, icons, bullets |
| `AdminOnboardingProvider.tsx` | skipToEnd vs dismissPermanent |
| `lib/admin/onboarding.ts` | bullets + iconKey per step |
| `globals.css` | V2 styles, hide nav during tutorial |

## 7. Tests

```bash
npm run test:admin-onboarding-v2   # 11 checks
npm run lint && npm run typecheck && npm run build
```

All passed.

## Manual check (360 / 390 / 430px)

- [ ] Tutorial readable on all widths
- [ ] Bottom nav not visible during tutorial
- [ ] Überspringen → last step → Fertig
- [ ] Nicht erneut anzeigen → no re-show on reload
- [ ] Einstellungen → Tutorial erneut starten
