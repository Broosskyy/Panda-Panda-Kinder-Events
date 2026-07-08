# Website Mobile Spacing Optimization Report

**Branch:** `cursor/website-mobile-spacing-e022`  
**Date:** 2026-07-08  
**Goal:** ~20–30 % less vertical scroll on mobile without feeling cramped.

---

## Summary

Mobile vertical rhythm was tightened across all public homepage sections. Spacing reductions use mobile-first defaults with unchanged `sm:` / `md:` / `lg:` breakpoints so tablet and desktop layouts stay the same.

---

## Changes by Area

### Global spacing (`src/app/globals.css`)

| Token / rule | Before (mobile) | After (mobile) | Reduction |
|---|---|---|---|
| `--section-header-gap` | 2.5rem | 1.75rem | ~30 % |
| `.section-padding` | 2.75rem | 2rem | ~27 % |
| `.section-padding-lg` | 3rem | 2.25rem | ~25 % |
| `.section-heading-row` margin | 1.75rem | 1.25rem | ~29 % |
| `.section-content-gap` | 2.5rem | 1.75rem | ~30 % |
| Hero top padding | +1.25rem | +0.5rem | tighter above fold |

New chrome variables link sticky CTA and WhatsApp positioning:

- `--sticky-cta-bar-height: 4.25rem`
- `--floating-contact-size: 3.5rem`
- `--floating-contact-gap: 0.75rem`
- `--chrome-bottom-mobile` — calculated from the above (replaces fixed `7.75rem`)

### Hero

- Grid gap `gap-10` → `gap-7` on mobile
- Rating pill, tagline, subtitle, CTA group, and trust chips use tighter `mt` / `pt` values
- Hero section top padding reduced on mobile

### Leistungen (Services)

- Image → title → description → button grouped closer via responsive Tailwind classes
- Mobile CSS hooks: `.service-card-image`, `.service-card-desc`, `.service-card-cta`

### So funktioniert's (Process)

- Step list gap `gap-10` → `gap-5` (mobile), `gap-8` from `sm`
- Step row gap `gap-5` → `gap-3` on mobile
- Icon row margin and internal gaps reduced
- Grid gap `gap-12` → `gap-8` on mobile
- Mobile CSS tightens number / icon / title / description grouping in `#ablauf`

### Galerie

- Filter row `mb-8` → `mb-3` on mobile (`sm:mb-6`, `md:mb-8`)
- Filter chips `gap-2` → `gap-1.5` on mobile with improved row wrapping
- CSS pulls filters closer to section heading (`margin-top: -0.5rem`)

### Bewertungen (Testimonials)

- Rating summary `mb-8` → `mb-5` on mobile

### FAQ

- Item padding `py-5` → `py-4` on mobile
- Answer panel top padding reduced

### Kontakt, Über uns, USPs, Stats, Footer

- Grid gaps and section padding reduced on mobile
- Footer uses `.footer-inner`, `.footer-grid`, `.footer-copyright` for mobile-specific density

### Sticky CTA + WhatsApp

**Problem:** WhatsApp FAB used a fixed `bottom: 9.5rem`, independent of whether the sticky CTA bar was visible — risk of overlap or excessive gap.

**Solution:**

1. CSS variables define CTA bar height and FAB offset
2. New hook `lib/hooks/useFloatingContactAboveCta.ts` detects when `.sticky-cta-bar` is in the DOM
3. Class `floating-contact-stack--above-cta` positions WhatsApp directly above the CTA bar
4. When CTA is hidden (top of page or near forms), WhatsApp sits lower at `1.25rem`
5. Cookie banner bottom offset aligned to CTA height

---

## Files Changed

| File | Change |
|---|---|
| `src/app/globals.css` | Mobile spacing tokens, section density, chrome positioning |
| `components/sections/Hero.tsx` | Tighter mobile gaps |
| `components/sections/Services.tsx` | Card internal spacing |
| `components/sections/Process.tsx` | Step timeline compaction |
| `components/sections/Gallery.tsx` | Filter / heading proximity |
| `components/sections/Testimonials.tsx` | Rating summary margin |
| `components/sections/Faq.tsx` | Accordion item padding |
| `components/sections/Contact.tsx` | Grid gap |
| `components/sections/About.tsx` | Grid gap |
| `components/sections/Usps.tsx` | Grid / icon spacing |
| `components/sections/PublicStats.tsx` | Section padding |
| `components/layout/Footer.tsx` | Footer density classes |
| `components/layout/FloatingContactButtons.tsx` | Dynamic above-CTA class |
| `lib/hooks/useFloatingContactAboveCta.ts` | **New** — CTA presence detection |
| `scripts/website-mobile-spacing-test.mjs` | **New** — static spacing checks |

---

## Verification

```bash
node scripts/website-mobile-spacing-test.mjs   # 15 passed
npm run lint                                    # ✓
npm run typecheck                               # ✓
npm run build                                   # ✓
```

### Responsive breakpoints to manually verify

| Width | Checks |
|---|---|
| 360px | No horizontal scroll, CTA + WhatsApp don't overlap |
| 390px | Gallery filters wrap cleanly |
| 430px | Service cards readable, process steps compact |
| 768px+ | Desktop/tablet spacing unchanged |

---

## Design Notes

- Premium typography and card styling preserved
- No new UI features — spacing and chrome positioning only
- Desktop (`≥768px`) breakpoints intentionally unchanged
- Form sections still hide floating chrome via existing `useHideNearFormSections` hook
