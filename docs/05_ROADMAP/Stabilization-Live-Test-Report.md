# Critical Stabilization Sprint — Live Test Report v0.8.4

**Datum:** 2026-07-04  
**Branch:** `cursor/stabilization-e022`  
**Production:** https://panda-bande-events.de  
**Ziel:** Stabilisierung ohne neue Features — alle Admin-Inhalte öffentlich, keine Doppel-DOM, keine hängenden Loader.

---

## Zusammenfassung

| Kategorie | Code-Fix | Lokal getestet | Live Vercel |
|-----------|----------|----------------|-------------|
| CMS Binding | ✔ | ✔ (ohne Supabase → Fallback) | ⏳ Nach Deploy + Admin-Test |
| Cache/Revalidation | ✔ | ✔ | ⏳ Nach Deploy |
| Uploads | ✔ | ✔ API-Struktur | ⏳ Braucht Supabase-Buckets |
| Galerie | ✔ | ✔ | ⏳ Nach Deploy |
| Beiträge | ✔ | ✔ `/aktuelles` neu | ⏳ Nach Deploy |
| Über uns / Kontakt | ✔ | ✔ | ⏳ Nach Deploy |
| Bewertungen | ✔ | ✔ kein Loading-Hänger | ⏳ Nach Deploy |
| Header/Hero | ✔ | ✔ CSS | ⏳ Portrait manuell prüfen |
| Doppelte HTML | ✔ | ✔ 1× `id` pro Sektion | ⏳ Nach Deploy |
| Statistik | ✔ | ✔ Fallback-Queries | ⏳ `page_views` Migration |
| Admin UX | ✔ | ✔ Toast-Text | ⏳ Nach Deploy |

**Hinweis Live-Tests:** Aus der Cloud-Agent-Umgebung war kein vollständiger GET auf die Production-Domain möglich (DNS-Timeouts). Lokale Smoke-Tests auf `localhost:3456` bestätigen Routing, APIs und HTML-Struktur. **CMS-Änderungen live können erst nach Merge + Vercel-Deploy + Supabase-Migrationen end-to-end verifiziert werden.**

---

## Detail-Report (13 Punkte)

### 1. CMS Binding
**Status: ✔ Code — ⏳ Live nach Deploy**

- Hero, Kontakt, Footer, Über uns, Leistungen, FAQ, Beiträge, Galerie, Bewertungen über Server-Fetches in `page.tsx`
- CMS hat Vorrang; `config/site.ts` nur als Fallback wenn CMS leer/nicht konfiguriert
- Bewertungen jetzt server-seitig via `fetchApprovedReviews()` (kein Client-Fetch mehr)

### 2. Cache / Revalidation
**Status: ✔**

- `force-dynamic` auf `/`, `/aktuelles`, `/aktuelles/[slug]`
- `unstable_noStore()` in allen CMS-Fetches
- `revalidatePublicCms()` nach jedem Admin-Save inkl. `/aktuelles` + Slug
- Production-Header (früher geprüft): `cache-control: private, no-cache, no-store`

### 3. Uploads
**Status: ✔ Code — ⏳ Live braucht Buckets**

- Buckets: `gallery`, `reviews`, `site-assets`
- FormData → `/api/admin/upload` → Supabase Storage
- Echte Fehlermeldungen in Admin-UI (toast error)
- Galerie: „Wird hochgeladen…“ Info-Toast
- Migration: `20260704_storage_buckets_public.sql`

### 4. Galerie
**Status: ✔**

- `gallery_images` mit `visible=true`, `sort_order`
- `resolveImageUrl()` für öffentliche URLs
- Fallback nur wenn CMS-Tabelle leer

### 5. Beiträge
**Status: ✔**

- `published=true` + auto `published_at`
- Startseite (`News`), neu: `/aktuelles` Index, `/aktuelles/[slug]`
- Hero-Bild via `resolveImageUrl`

### 6. Über uns
**Status: ✔**

- `site_settings.about` mit `normalizeAboutSettings()` für Bild-URL
- Name, Texte, Mission, Werte, Bild an `About` + `Hero` gebunden

### 7. Kontakt
**Status: ✔**

- Telefon, WhatsApp, E-Mail, Instagram, Einsatzgebiet an Contact, Footer, WhatsAppFab, JSON-LD

### 8. Bewertungen
**Status: ✔**

- Server-seitig geladen → **kein** dauerhaftes „Bewertungen werden geladen“
- `approved=true`, `profile_image_url` (+ Legacy `avatar_url` Alias), `event_image_url`, `verified`, `admin_reply`
- Empty State wenn keine freigegebenen Reviews
- Admin: Profil-/Eventfoto nachträglich hochladbar

### 9. Header / Hero
**Status: ✔ (Code)**

- Kein `overflow-hidden` auf Hero
- Safe-Area + Header-Padding
- Hero-Text ohne ScrollReveal-Verstecken
- Portrait 320–430px: manuell auf Gerät nach Deploy prüfen

### 10. Doppelte HTML-Ausgabe
**Status: ✔**

**Vorher:** Usps, Services, Process, Gallery, News hatten separate Mobile/Desktop-Blöcke (2× DOM).  
**Nachher:** Ein Datenmodell, ein Loop, responsive CSS (`swipe-track` → `md:grid`).

Lokal verifiziert:
- `id="leistungen"` → 1×
- `id="ablauf"` → 1×
- Keine `lg:hidden`-Doppelblöcke bei Leistungen

### 11. Statistik
**Status: ✔ Code — ⏳ Live braucht Migration**

- `POST /api/track` + `PageViewTracker` (sendBeacon)
- Dashboard: RPC mit Fallback auf direkte `page_views`-Queries
- Hinweis im Dashboard wenn Tabelle fehlt
- Lokal ohne Supabase: `{"ok":false}` (erwartet)

### 12. Admin UX
**Status: ✔**

- Toast nach Speichern: **„Gespeichert und Website aktualisiert.“**
- `withLoading` beendet Loader nach Promise
- Upload-Feedback (Galerie: Info-Toast)

### 13. Live-Tests (Checkliste)

| Test | Lokal | Live Vercel |
|------|-------|-------------|
| Hero ändern → sichtbar | — (kein Admin) | ⏳ Nach Deploy |
| Kontakt ändern → sichtbar | — | ⏳ Nach Deploy |
| Über uns Text → sichtbar | — | ⏳ Nach Deploy |
| Über uns Bild → sichtbar | — | ⏳ Nach Deploy |
| Galerie Bild → sichtbar | — | ⏳ Nach Deploy |
| Beitrag veröffentlichen | — | ⏳ Nach Deploy |
| Bewertung mit Bildern freigeben | — | ⏳ Nach Deploy |
| Telefon überall sichtbar | — | ⏳ Nach Deploy |
| Statistik steigt | ✖ (kein Supabase lokal) | ⏳ Migration + Besuche |
| Portrait Tagline sichtbar | ✔ CSS | ⏳ Gerätetest |

---

## Geänderte Dateien (Auszug)

- `lib/cms/reviews.ts` — Server-Fetch approved Reviews
- `components/sections/Testimonials.tsx` — Props statt Client-Loading
- `components/sections/Usps.tsx`, `Services.tsx`, `Process.tsx`, `Gallery.tsx`, `News.tsx` — Single-DOM
- `src/app/aktuelles/page.tsx` — Beitrags-Index
- `lib/cms/messages.ts` — Standard-Toast-Text
- `lib/cms/revalidate.ts` — `/aktuelles` Revalidation

---

## Deploy-Checkliste (vor Live-Abnahme)

1. PR mergen → Vercel Deploy abwarten
2. Supabase Migrationen ausführen:
   - `20260703_page_views_analytics.sql`
   - `20260704_storage_buckets_public.sql`
3. Admin-Login → jeden Punkt der Live-Checkliste durchspielen
4. Portrait (320–430px) Tagline visuell prüfen

---

## Build / Lint

```
npm run build  ✔
npm run lint   ✔
```
