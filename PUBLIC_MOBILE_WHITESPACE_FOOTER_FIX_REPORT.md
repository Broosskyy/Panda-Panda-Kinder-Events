# Public Mobile Whitespace + Footer Fix Report

**Branch:** `cursor/public-mobile-whitespace-footer-e022`  
**Scope:** Public website only — layout, spacing, mobile CSS. No admin, DB, content, or feature changes.

## Problem

On mobile viewports, the public website had excessive vertical whitespace:

- Large gaps between the review form and “Über die Panda-Bande”
- Large gaps between contact cards and the footer
- Long sections (Über uns, Team, Aktuelles, FAQ, Galerie, Leistungen) felt overly tall
- Footer appeared as a separate oversized section and caused unnecessary scrolling
- Hamburger menu icon was clipped / not fully visible at 360–430px widths

## Goals

- ~30–50% less scroll length on mobile while keeping a calm, premium feel
- Compact footer without removing content
- Hamburger button fully visible with 48×48px touch target
- Sticky CTA must not force artificial extra bottom padding

---

## Changes

### 1. Mobile section spacing (`src/app/globals.css`)

| Area | Before (mobile) | After (mobile) |
|------|-----------------|----------------|
| Base `.section-padding` | `0.75rem` | `0.5rem` top/bottom |
| `--section-header-gap` | larger | `0.625rem` |
| All public sections (`#bewertungen`, `#ueber-uns`, `#aktuelles`, `#faq`, `#kontakt`, `#ablauf`, `#galerie`, `#leistungen`, `#warum-panda-bande`) | varied | unified `0.5rem` padding |

**Targeted gap fixes:**

- `#bewertungen` — `padding-bottom: 0.375rem`; review summary/form margins tightened
- `#ueber-uns` — `padding-top: 0.375rem` (closes gap after reviews); grid/copy/team margins reduced
- `#kontakt` — `padding-bottom: 0.375rem`; contact grid and form padding reduced
- `#aktuelles`, `#faq` — card and FAQ item padding tightened

Desktop breakpoints (`sm` / `md` / `lg`) unchanged.

### 2. Footer compaction

**`components/layout/Footer.tsx`**

- Mobile container: `py-3` (was larger on all breakpoints)
- Grid gap: `gap-4` on mobile (`sm:gap-14` preserved for tablet+)
- Nav/contact text: `text-sm` on mobile
- Semantic classes for CSS targeting: `footer-brand-mark`, `footer-tagline`, `footer-nav`, etc.

**`src/app/globals.css` (mobile `@media max-width: 767px`)**

- Footer inner padding: `0.875rem` top / `0.5rem` bottom
- Grid gap: `0.875rem`
- Logo scale: `transform: scale(0.88)` on `.footer-brand-mark`
- Tagline: `1rem` font-size, reduced margins
- Copyright/social: smaller text and tighter spacing
- Sticky CTA clearance: `padding-bottom: calc(0.75rem + var(--chrome-bottom-mobile) + safe-area)` — only as much as needed

### 3. Card / content spacing

**`components/sections/About.tsx`**

- Mobile grid gap: `gap-4` (was `gap-8`+)
- Mission/values grid: `mt-5 gap-2.5` on mobile

**`components/sections/Contact.tsx`**

- Tighter mobile gaps for contact cards and form layout

**CSS overrides** for review form shell, team list, swipe cards, FAQ items, contact cards — all with compact mobile margins/padding.

### 4. Hamburger button fix (Bug)

**Root cause:** `overflow-x: clip` on `html`/`body` combined with insufficient safe-area padding caused the right-edge hamburger to be clipped on narrow screens.

**Fix in `components/layout/Header.tsx`:**

- Button: `h-12 w-12 min-h-12 min-w-12` (48×48px touch target)
- `overflow-visible` on header bar and actions
- Logo max-width: `8.25rem` on mobile to fit logo + CTA + hamburger at 360px

**Fix in `src/app/globals.css`:**

```css
.site-header {
  overflow: visible;
  padding-right: max(0.75rem, env(safe-area-inset-right, 0px));
  padding-left: max(0.75rem, env(safe-area-inset-left, 0px));
}
.site-header-menu-btn {
  min-width: 3rem;
  min-height: 3rem;
  overflow: visible;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

- No negative margins or transforms on the button
- Icon centered via flexbox; SVG fixed at `1.25rem`

### 5. Sticky CTA padding

- `.form-chrome-safe`: `padding-bottom: calc(0.5rem + var(--chrome-bottom-mobile) + safe-area)` — reduced from heavier values
- `#bewertung-form`, `#kontakt .form-luxury`: `scroll-margin-bottom` set to chrome height + `0.5rem` only
- Footer bottom padding accounts for sticky CTA without doubling space

---

## Files changed

| File | Change |
|------|--------|
| `src/app/globals.css` | Mobile section/footer/header/hamburger/CTA spacing |
| `components/layout/Header.tsx` | 48px hamburger, logo width, overflow visible |
| `components/layout/Footer.tsx` | Compact mobile layout + semantic classes |
| `components/sections/About.tsx` | Tighter mobile grid gaps |
| `components/sections/Contact.tsx` | Tighter mobile card/form gaps |
| `scripts/website-mobile-whitespace-footer-test.mjs` | Static smoke tests (new) |
| `package.json` | `test:website-mobile-whitespace-footer` script |

**Not touched:** Admin routes, API, database, CMS content.

---

## Testing

### Automated

```bash
npm run test:website-mobile-whitespace-footer   # 12/12 passed
npm run lint                                    # ✓
npm run typecheck                               # ✓
npm run build                                   # ✓
```

### Manual checklist (360px / 390px / 430px)

- [ ] Header: logo, hidden desktop CTA, hamburger fully visible — icon centered in circle
- [ ] Bewertungen → Über uns: no large dead zone
- [ ] Long sections scroll compactly (Team, FAQ, Galerie, Leistungen, Aktuelles)
- [ ] Kontakt cards → Footer: minimal gap
- [ ] Footer: shorter height, smaller logo, readable nav
- [ ] Sticky “Unverbindlich anfragen” does not cover form fields; no excess bottom whitespace
- [ ] Desktop (≥1024px): spacing unchanged / not degraded

---

## Summary

Mobile public pages are significantly more compact through consistent `0.5rem` section padding, targeted inter-section gap reductions, a slimmer footer, and corrected header safe-area handling. The hamburger menu is now a proper 48×48px touch target, fully visible at 360–430px widths, with the icon centered and no clipping from overflow rules.
