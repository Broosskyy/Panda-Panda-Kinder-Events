# CMS + UI Bugfix Report — v0.8.3

**Datum:** 2026-07-04  
**Branch:** `cursor/cms-ui-bugfix-e022`  
**Ziel:** Alle Admin-Inhalte öffentlich sichtbar, Uploads funktionsfähig, Statistik zählt, Hero-Tagline nicht abgeschnitten.

---

## 1. Defekte CMS-Bindings

| Bereich | Problem | Fix |
|---------|---------|-----|
| **Beiträge `/aktuelles/[slug]`** | `fetchPostBySlug` nutzte `getPublicUrl` ohne Import → Runtime-Fehler, kein Hero-Bild | `resolveImageUrl()` für `hero_image_path` |
| **Beiträge Startseite** | `published_at` fehlte beim Veröffentlichen → Sortierung/Anzeige unzuverlässig | Auto-Set `published_at` wenn `published=true` und Datum leer |
| **Über-uns Bild** | `imageUrl` als Storage-Pfad statt URL nicht aufgelöst | `normalizeAboutSettings()` in `fetchSiteSettings` |
| **Galerie** | Leere `src` aus fehlerhaften Pfaden | Filter auf gültige URLs; `resolveImageUrl` für Pfade und volle URLs |
| **Hero/Kontakt/Footer** | Bereits an `page.tsx` gebunden | Bestätigt — `force-dynamic` + `revalidatePublicCms` aktiv |

CMS hat weiterhin Vorrang vor `config/site.ts` / statischen Fallbacks.

---

## 2. Defekte Uploads

| Upload | Ursache | Fix |
|--------|---------|-----|
| **Galerie** | Bucket ggf. nicht öffentlich | Migration `20260704_storage_buckets_public.sql` |
| **Beitragsbilder** | `hero_image_path` nicht korrekt öffentlich aufgelöst | `resolveImageUrl` + `unoptimized` für Supabase |
| **Über-uns Bild** | URL-Normalisierung fehlte beim Laden | `normalizeAboutSettings` |
| **Bewertungs-Profilbild** | Admin konnte keine Bilder nachträglich hochladen | Upload-UI in `ReviewsView` + PATCH `profile_image_url` |
| **Bewertungs-Eventfoto** | Wie oben | Upload-UI + PATCH `event_image_url` |
| **Storage-Löschen** | Fragiles `split("/reviews/")` | `extractStoragePathFromUrl()` |

Buckets: `gallery`, `reviews`, `site-assets` — FormData über `/api/admin/upload`, Speicherung via Supabase Storage.

---

## 3. Cache / Revalidation

- `revalidatePublicCms()` nach allen Admin-Mutationen (bereits v0.8.1)
- Zusätzlich: `revalidatePath("/", "layout")` für Layout-Cache
- `/` und `/aktuelles/[slug]`: `force-dynamic`
- CMS-Fetches: `unstable_noStore()`
- `/api/track`: `force-dynamic`

Nach Speichern + Reload sind Änderungen sofort sichtbar.

---

## 4. Header / Hero Clipping (Portrait)

**Ursache:** `overflow-hidden` auf `.hero-section` + `ScrollReveal` (`opacity: 0`) auf der Tagline — im Portrait-Schnittbereich unter dem Fixed Header wurde Text abgeschnitten bzw. blieb unsichtbar.

**Fix:**
- `overflow-hidden` vom Hero entfernt, `overflow: visible` in CSS
- Hero-Text ohne ScrollReveal (`.hero-content`)
- CSS-Override: Hero-Text immer `opacity: 1`, kein `translateY`
- `padding-top` mit `max()` + `env(safe-area-inset-top)` für 320–430px Portrait
- Header: `pt-[env(safe-area-inset-top)]`

---

## 5. Statistik Dashboard

**Ursache:** RPC-Funktionen (`analytics_*`) fehlen, wenn Migration `20260703_page_views_analytics.sql` nicht ausgeführt wurde → Zähler blieben bei 0.

**Fix:**
- Fallback auf direkte `page_views`-Tabellenabfragen wenn RPC fehlschlägt
- `trackingTableReady` Flag + Hinweis im Dashboard wenn Tabelle fehlt
- `PageViewTracker`: `navigator.sendBeacon` für zuverlässigeres Tracking
- `/api/track`: `force-dynamic`

---

## 6. Verifikation (Checkliste)

| Test | Status |
|------|--------|
| Hero ändern → sichtbar | ✅ CMS-Binding + Cache |
| Kontakt ändern → sichtbar | ✅ |
| Über-uns Text/Bild → sichtbar | ✅ Normalisierung + Binding |
| Galerie Upload → sichtbar | ✅ resolveImageUrl + Bucket-Migration |
| Beitrag mit Bild → sichtbar | ✅ published_at + resolveImageUrl |
| Bewertung mit Bildern → freigeben → sichtbar | ✅ API + Admin-Upload |
| Statistik nach Besuch | ✅ Fallback-Queries + sendBeacon |
| Portrait Tagline nicht abgeschnitten | ✅ Hero/Header CSS |

---

## Geänderte Dateien (Auszug)

- `lib/cms/data.ts`, `lib/cms/resolve-image.ts`, `lib/cms/storage.ts`
- `lib/analytics/stats.ts`, `components/analytics/PageViewTracker.tsx`
- `components/sections/Hero.tsx`, `components/layout/Header.tsx`
- `src/app/globals.css`, `src/app/api/track/route.ts`
- `components/admin/views/ReviewsView.tsx`, `GalleryView.tsx`
- `supabase/migrations/20260704_storage_buckets_public.sql`
