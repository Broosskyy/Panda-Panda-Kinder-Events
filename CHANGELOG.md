# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [0.2.0] — 2026-07-02

### Sprint 1 Polish + Sprint 2 Start

#### Sprint 1 Polish
- **Zentrale Config** unter `src/config/site.ts` mit klar markierten Platzhaltern
- **Originales Logo** aus `public/assets/logo.png` (kein nachgebautes SVG mehr)
- **Instagram-Link** korrigiert auf offizielles Profil
- **Mobile Optimierung:** größere Buttons (min. 48px), bessere Abstände, volle Breite CTAs auf Smartphone
- Platzhalterseiten Impressum, Datenschutz, AGB bestätigt

#### Formular (echte Anfragen)
- API Route `POST /api/inquiry` mit Zod-Validierung
- Speicherung in Supabase (`booking_requests`)
- E-Mail-Benachrichtigung via Resend an `manuel.bauch0705@gmail.com`
- Success- und Fehler-Feedback im UI
- `.env.example` mit allen benötigten Variablen

#### Sprint 2 — Bewertungen
- **Fake-Bewertungen entfernt** aus öffentlicher Anzeige
- Demo-Daten nur in Config (`showDemoReviews: false`)
- **Bewertungsformular:** Name, Event-Art, Sterne 1–5, Text
- Neue Bewertungen mit `approved=false` in Supabase
- Öffentliche Sektion zeigt nur freigegebene Bewertungen
- Leerer Zustand: „Noch keine öffentlichen Bewertungen vorhanden."

#### Admin (`/admin`)
- Geschützt via `ADMIN_PASSWORD` (Cookie-Session)
- Buchungsanfragen anzeigen und Status ändern
- Bewertungen anzeigen, freigeben oder ablehnen

#### Supabase
- Schema in `supabase/schema.sql`
- Tabellen: `booking_requests`, `reviews`
- Client in `lib/supabase/admin.ts`

#### Bekannte offene Punkte
- `public/assets/logo.png` muss mit dem originalen Logo befüllt werden
- Supabase-Schema muss im SQL Editor ausgeführt werden
- `.env.local` / Vercel ENV-Variablen müssen gesetzt werden
- Resend: Absender-Domain für Production verifizieren

---

## [0.1.0] — 2026-07-02

### Sprint 1 — MVP Landing Page

#### Hinzugefügt
- **Next.js 15** App Router mit TypeScript und Tailwind CSS 4
- **Single-Page Landing Page** mit allen Mockup-Sektionen
- **Anfrageformular** mit Zod-Validierung (lokal)
- **Platzhalterseiten:** `/impressum`, `/datenschutz`, `/agb`
- **SEO:** Meta-Tags, Open Graph, JSON-LD
- **Design-System** aus Dokumentation

#### Bewusst nicht enthalten
- E-Mail-Versand, Datenbank, Admin (→ Sprint 2)
