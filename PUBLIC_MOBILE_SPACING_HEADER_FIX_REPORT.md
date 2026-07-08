# Public Mobile Spacing + Header Menu Fix Report

**Date:** 2026-07-08  
**Branch:** `cursor/public-mobile-spacing-header-fix-e022`

## Problem

1. Excessive vertical whitespace on the public homepage on mobile (360px / 390px / 430px).
2. Hamburger menu icon clipped at the top-right (~4/5 visible).
3. Header layout risks: logo overlap, horizontal overflow, sticky header covering content.

## Changes

### 1. Mobile spacing reduction

**Global CSS (`src/app/globals.css`)**
- Base mobile `.section-padding`: `1rem` top/bottom.
- Target sections (`#bewertungen`, `#ueber-uns`, `#aktuelles`, `#faq`, `#kontakt`): `0.75rem` top/bottom.
- `--section-header-gap`: `0.875rem` on mobile.
- `--header-height`: `3.5rem` on mobile.
- `.section-content-gap` margin-top: `0.75rem` on mobile.
- Consolidated duplicate mobile rules that previously re-expanded spacing (reviews, FAQ, contact, footer).
- Footer compact: `1.25rem` top / `1rem` bottom padding, `1.25rem` grid gap.

**Section components**
| Section | Mobile tightening |
|---------|-------------------|
| Bewertungen | Rating summary gap/margin, CTA link margin, empty-state button margin |
| Über uns / Team | Grid gap, mission cards, contact card, team block margin & list gap |
| Aktuelles | Card inner padding `p-4` |
| FAQ | Item padding `py-2.5` |
| Kontakt | Grid gap `gap-4` |
| Footer | Container `py-5` |

### 2. Hamburger menu fix

**Header (`components/layout/Header.tsx`)**
- Added `site-header` with `overflow-visible` on the fixed header.
- Wired CSS hooks: `site-header-logo`, `site-header-actions`, `site-header-menu-btn`.
- Hamburger: explicit `min-h-11 min-w-11` (44×44px), `p-0`, `overflow-visible`, centered SVG.
- Logo max-width reduced to `9.5rem` on small screens to prevent pushing the menu button off-screen.

**CSS**
- Safe-area padding on header container: `env(safe-area-inset-right/left)`.
- `.site-header-menu-btn`: fixed `2.75rem` box, centered icon, `overflow: visible`, no clipping.

### 3. Header integrity

- Logo flex-shrink + max-width prevents overlap with action buttons.
- CTA button hidden below `md` — does not compete with hamburger on mobile.
- `overflow-visible` on header bar and actions prevents `overflow-x: clip` on `html`/`body` from clipping the fixed menu button.
- Existing `--header-offset` + `[id] { scroll-margin-top }` preserved for sticky header anchor safety.

## Verification

```bash
npm run test:website-mobile-header   # 13/13 passed
npm run test:website-mobile-compact  # 13/13 passed
npm run test:website-mobile          # 15/15 passed
npm run lint                         # passed
npm run typecheck                    # passed
npm run build                        # passed
```

**Breakpoints covered:** 360px, 390px, 430px (via `@media (max-width: 767px)` rules).

## Files changed

- `src/app/globals.css`
- `components/layout/Header.tsx`
- `components/sections/Testimonials.tsx`
- `components/sections/About.tsx`
- `components/sections/News.tsx`
- `components/sections/Faq.tsx`
- `components/sections/Contact.tsx`
- `components/layout/Footer.tsx`
- `scripts/website-mobile-header-spacing-test.mjs` (new)
- `scripts/website-mobile-compactness-test.mjs`
- `scripts/website-mobile-spacing-test.mjs`
- `package.json`

## Manual QA checklist

- [ ] 360px: Hamburger fully visible, tappable, icon centered
- [ ] 390px / 430px: Same header behavior
- [ ] Scroll through Bewertungen → Footer: noticeably less empty space, content not cramped
- [ ] Tap anchor links (#kontakt, #faq): section titles not hidden under sticky header
- [ ] No horizontal scrollbar on homepage
