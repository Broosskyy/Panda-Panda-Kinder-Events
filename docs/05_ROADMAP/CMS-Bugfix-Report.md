# Bugfix Report — CMS Admin Speichern / Öffentliche Website

**Datum:** 2026-07-03  
**Branch:** `cursor/cms-bugfix-e022`  
**Version:** 0.8.1

---

## Problem

Admin speicherte Inhalte korrekt in Supabase, aber die öffentliche Website zeigte weiterhin statische/alte Werte. Uploads schienen teilweise zu funktionieren, wirkten aber auf der Website nicht.

---

## Ursachen

| Bereich | Ursache |
|---------|---------|
| **Startseite / Beiträge** | Next.js hat `/` beim Build **statisch** gecached (`○ Static`). CMS-Daten wurden nur einmal beim Build geladen. |
| **Revalidation** | Nach Admin-Speichern fehlte `revalidatePath("/")` vollständig. |
| **Galerie / Leistungen / FAQ** | Fallback auf statische Daten, sobald CMS-Tabelle leer **oder** nur unsichtbare Einträge — auch wenn CMS-Daten existierten. |
| **Über-uns Bild** | Upload setzte nur lokalen State; Speichern in `site_settings` war manuell nötig. |
| **Uploads** | Strikte MIME-Prüfung ohne Dateiendung-Fallback (mobile Browser). Fehler wurden im Admin nicht klar angezeigt. |
| **Bewertungsbilder** | Supabase-URLs in `next/image` ohne `unoptimized` / Remote-Pattern-Probleme. |
| **Header** | Logo-Höhe = Header-Höhe → Abschneiden oben/unten. |

---

## Fixes

### 1. Cache / Revalidation
- `export const dynamic = "force-dynamic"` auf `/` und `/aktuelles/[slug]`
- `unstable_noStore()` in allen CMS-Fetch-Funktionen
- `revalidatePublicCms()` nach jedem Admin-Speichern (Settings, Galerie, Beiträge, FAQ, Leistungen, Bewertungen)
- `/api/reviews` mit `Cache-Control: no-store`

### 2. Public CMS Binding
- `site_settings`: nur gespeicherte Sektionen aus CMS, Fallback pro Sektion nur wenn nicht in DB
- Galerie/Services/FAQ: Fallback auf statische Daten **nur** wenn CMS-Tabelle komplett leer ist
- Supabase-Bilder mit `unoptimized` für zuverlässige Anzeige

### 3. Uploads
- Validierung: MIME **oder** Dateiendung (jpg/png/webp)
- Leere Dateien abgelehnt
- Detaillierte Server-Fehlermeldungen
- Über-uns Bild: Upload + automatisches Speichern in `site_settings`
- Admin-Toasts mit echten Fehlermeldungen

### 4. Admin Debug
- `/api/admin/debug` — zeigt gespeicherte Sektionen, DB-Zähler, öffentliche Server-Vorschau
- Einstellungen-Seite mit Debug-Panel

### 5. Header
- Logo `max-h-*` statt fixer Höhe
- Header `min-h` + vertikales Padding → kein Abschneiden

---

## Manuelle Tests (Code-Verifikation)

| Test | Erwartung | Status |
|------|-----------|--------|
| A) Über-uns Text ändern | `site_settings.about` → About-Section | ✅ Binding korrekt |
| B) Kontakt Telefon | `site_settings.contact` → Contact + Footer | ✅ Binding korrekt |
| C) Über-uns Bild | Upload → auto-save → About + Hero Badge | ✅ Fix implementiert |
| D) Galerie | CMS-Bilder wenn Tabelle nicht leer | ✅ Fix implementiert |
| E) Beitrag veröffentlichen | Dynamische Startseite + `/aktuelles/[slug]` | ✅ Fix implementiert |
| F) Bewertung mit Bildern | FormData Upload + Anzeige nach Freigabe | ✅ Fix implementiert |
| Build & Lint | `npm run build`, `npm run lint` | ✅ |

> Live-Tests mit echter Supabase-Instanz nach Deploy empfohlen.

---

## Download

| Format | Link |
|--------|------|
| **PDF** | [CMS-Bugfix-Report.pdf](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/cursor/cms-bugfix-e022/public/downloads/sprint-reports/CMS-Bugfix-Report.pdf) |
| **Markdown** | [CMS-Bugfix-Report.md](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/cursor/cms-bugfix-e022/docs/05_ROADMAP/CMS-Bugfix-Report.md) |
