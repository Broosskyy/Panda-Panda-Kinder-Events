# Release Blocker Fix Report

**Branch:** `cursor/release-blocker-fix-e022`  
**Datum:** 2026-07-06  
**Commit:** `fix(release): resolve pdf email mobile admin and public interaction blockers`

---

## 1. PDF-Erstellung

### Ursache
- Logo wurde per HTTP von `getSiteUrl()` geladen — auf Vercel oft fehlgeschlagen (kein zuverlässiger Self-Fetch).
- Bildtyp nur anhand der URL-Endung erkannt (`.png`/`.jpg`) — WebP/SVG oder Pfade ohne Endung führten zu `embedPng`/`embedJpg`-Fehlern.
- WinAnsi-Inkompatibilität: Umlaute, Em-Dash (`—`) und Sonderzeichen in Kundentexten konnten `drawText` zum Absturz bringen.
- Admin-PDF-Buttons nutzten `<a href>` — bei Fehlern wurde JSON im Browser angezeigt statt einer klaren Meldung.

### Fix
| Datei | Änderung |
|-------|----------|
| `lib/crm/load-logo.ts` | Logo zuerst aus `/public` lesen, dann HTTP; Magic-Byte-Erkennung |
| `lib/crm/pdf-text.ts` | `pdfSafeText()`, `pdfSafeDate()` für WinAnsi |
| `lib/crm/pdf.ts` | Sichere Texte, dynamische Logo-Größe, try/catch beim Embed |
| `lib/admin/open-pdf.ts` | Fetch → Blob → Tab; strukturierte Fehler |
| PDF-Routes | `{ error, detail, code }` + Server-Logging |
| `QuotesView` / `InvoicesView` | `openAdminPdf()` statt direktem Link |

---

## 2. Angebot-/Rechnung-Versand

### Ursache
- Generische Fehlermeldung „Versand fehlgeschlagen“ ohne Unterscheidung PDF/Domain/Empfänger.
- Keine Vorab-Prüfung der Resend-Domain vor Versand.

### Fix
| Datei | Änderung |
|-------|----------|
| `lib/crm/api-errors.ts` | `CrmApiError`, `classifySendError()`, `jsonApiError()` |
| Send-Routes | PDF-Fehler, Empfänger-Check, Sending-Setup-Check |
| `CrmSendModal` | Klare Fehlermeldung + einklappbare technische Details |
| `QuotesView` / `InvoicesView` | Fehler aus API mit `detail`/`code` anzeigen |

Mögliche Meldungen:
- „PDF konnte nicht erzeugt werden“
- „Absender-Domain ist noch nicht verifiziert“
- „Empfänger fehlt“
- „RESEND_API_KEY fehlt“

---

## 3. Resend / E-Mail-Status

### Ursache
- Systemstatus unterschied nicht zwischen Sending und Receiving.
- Receiving-MX konnte fälschlich als kritischer Fehler wirken.

### Fix
| Datei | Änderung |
|-------|----------|
| `lib/email/resend-status.ts` | `getResendSendingSetup()` mit DKIM, SPF TXT, Sending MX, From-Adresse |
| Receiving | Immer als **Optional / nicht aktiv** markiert — kein roter Blocker |
| `email/status` API | Liefert `sendingSetup` mit Sending/Receiving-Listen |
| `SettingsView` (E-Mail-Tab) | Getrennte Anzeige Versand vs. Empfang |
| `system-status.ts` | Resend-Items aus Sending-Setup |

---

## 4. Admin Mobile UX

### Fix
| Bereich | Änderung |
|---------|----------|
| `SettingsView` | `AdminStickySave` statt `sticky bottom-0 z-10` (war hinter Bottom Nav) |
| `globals.css` | `.admin-main` padding-bottom erhöht; `.admin-sticky-save` über Bottom Nav (z-60) |
| `AdminQuickActions` | FAB auf Formular-/Detail-Seiten ausgeblendet |
| `admin-modal-root` | Bereits mit Bottom-Nav-Abstand (unverändert bestätigt) |
| Mobile Bottom Nav | Reihenfolge: Dashboard → Galerie → Anfragen → Kunden → Mehr |

---

## 5. Galerie-Lightbox

### Fix
| Datei | Änderung |
|-------|----------|
| `components/ui/Lightbox.tsx` | Multi-Image, Swipe, Pfeile, ESC, Titel/Kategorie/Bewertung |
| `Gallery.tsx` | Klickbare Karten, Metadaten in Lightbox |
| `lib/cms/data.ts` | Galerie-Titel für Lightbox mitgeliefert |

---

## 6. Bewertungsbilder

### Fix
| Datei | Änderung |
|-------|----------|
| `Testimonials.tsx` | Eventfotos klickbar; Profilbild nur bei vorhandenem Bild |
| Lightbox | Zeigt Name, Sterne, Bewertungstext |

---

## 7. Header-Logo & Favicon

### Fix
| Datei | Änderung |
|-------|----------|
| `lib/brand.ts` | Header Mobile 42px, Desktop 56px |
| `Logo.tsx` | Größere Header-Klassen, lesbarer Text |
| Favicon/PWA | Unverändert von `main` (Logo.png via `generate:brand-assets`, v6) |

---

## 8. Footer / Sticky CTA / WhatsApp

### Fix
| Datei | Änderung |
|-------|----------|
| `globals.css` | Mehr `public-main` padding-bottom; WhatsApp über Sticky CTA |
| `StickyCtaBar.tsx` | Ausblenden bei `#kontakt` und `#bewertung-form` (IntersectionObserver) |
| Footer | Zusätzliches Mobile-Padding für klickbare Links |

---

## 9. Über uns / Team

### Fix
| Datei | Änderung |
|-------|----------|
| `About.tsx` | Klare Reihenfolge: Intro → Mission/Werte → Ansprechpartnerin → Team |
| `sync-public.ts` / `normalize-settings.ts` | Team-Bilder via `resolveImageUrl()` |
| Team-Karten | `aspect-[4/5]` + `object-cover` (bestehend, beibehalten) |

---

## 10. Analytics / Sitemap

### Status
- `fetchPublishedPosts` und `fetchPostBySlug` filtern bereits `published = true`.
- `sitemap.ts` nutzt nur veröffentlichte Beiträge.
- Keine Änderung nötig — Verhalten bestätigt.

---

## 11. Build & QA

```bash
npm run lint    # ✅ (nur bestehende Warnungen in scripts/)
npm run typecheck  # ✅
npm run build   # ✅
```

### Getestet (Code-Pfad / Build)
- [x] PDF-Routes Angebot + Rechnung
- [x] Send-Routes mit Fehlerklassifikation
- [x] Resend Status API
- [x] Admin Sticky Save / FAB / Bottom Nav
- [x] Lightbox Komponente (Galerie + Bewertungen)
- [x] Logo-Größen
- [x] CTA/Footer Padding
- [x] Team-Bild-URL-Auflösung
- [x] Sitemap published-Filter

### Manuelle Tests empfohlen (Staging/Produktion)
- [ ] Angebot PDF öffnen (mobil + desktop)
- [ ] Rechnung PDF öffnen (mobil + desktop)
- [ ] Angebot senden mit verifizierter Domain
- [ ] Galerie-Lightbox Swipe mobil
- [ ] Bewertungsbilder Lightbox
- [ ] Einstellungen speichern (Sticky Save sichtbar)
- [ ] Footer-Links nicht von CTA verdeckt

---

## 12. Offene Restpunkte

1. **Resend Produktion:** Domain muss in Resend weiterhin manuell verifiziert werden — Code blockiert Versand bis `canSend = true` (außer Testdomain).
2. **Logo.png Größe:** Master-Logo ist ~2 MB — für PDFs unkritisch (lokales Lesen), für Web ggf. später optimierte Variante.
3. **E2E-Tests:** Keine automatisierten Browser-Tests für PDF-Download mobil — manuelles QA auf Gerät empfohlen.
4. **Receiving:** Bewusst optional — kein Empfang über Resend MX erforderlich bei externem Mailhosting.

---

## Geänderte Dateien (Auszug)

**Neu:** `lib/crm/load-logo.ts`, `lib/crm/pdf-text.ts`, `lib/admin/open-pdf.ts`, `lib/crm/api-errors.ts`, `lib/email/resend-status.ts`

**Geändert:** `lib/crm/pdf.ts`, PDF/Send-Routes, `QuotesView`, `InvoicesView`, `CrmSendModal`, `SettingsView`, `Lightbox`, `Gallery`, `Testimonials`, `About`, `AdminQuickActions`, `StickyCtaBar`, `globals.css`, `Logo.tsx`, `brand.ts`, `nav.ts`, `system-status.ts`, `sync-public.ts`, `normalize-settings.ts`
