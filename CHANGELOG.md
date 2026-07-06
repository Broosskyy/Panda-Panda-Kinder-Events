# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [1.0.0-rc.2] — 2026-07-06 — Team / Users / 2FA Cleanup

### Klare Trennung
- **Team** (Website → Team): öffentliche Personen, kein Login, Sync zu `publicTeam`
- **Benutzer** (Sicherheit → Benutzer & Rollen): Admin-Accounts mit Rollen & 2FA
- Optionale Verknüpfung `admin_users.team_member_id`

### Navigation
- Team unter Website; Benutzer/2FA/Sitzungen/Historie/Audit unter Sicherheit
- Einstellungen mit Tabs: Unternehmensdaten, E-Mail, System
- `/admin/benutzer` → Redirect zu Sicherheit

### 2FA UX
- Eigene Seite `/admin/sicherheit/2fa` mit QR, Secret-Fallback, Backup-Codes kopieren/herunterladen
- Deaktivierung mit Passwortbestätigung
- Persönliche 2FA ohne `security:write`-Berechtigung

### Migration
- `20260713_team_users_cleanup.sql`

### Report
- `ADMIN_TEAM_USERS_2FA_CLEANUP_REPORT.md`

## [1.0.0-rc.1] — 2026-07-06 — Security & Administration Sprint v1.0

### Authentifizierung
- Multi-User Admin-System (`admin_users`) mit bcrypt-Passwort-Hash
- Login per Benutzername oder E-Mail, „Angemeldet bleiben“, Passwort-Reset per E-Mail
- 2FA (TOTP) mit QR-Code, Backup-Codes, „Gerät 30 Tage vertrauen“
- Legacy-Fallback: `ADMIN_PASSWORD` solange keine Benutzer existieren

### Rollen & Sicherheit
- 6 Rollen, 22 granulare Berechtigungen, serverseitige `requireAdmin(permission)`-Prüfung
- Sessions, Login-Historie, Audit-Log, Sicherheitseinstellungen
- Rate Limiting, Account Lockout, HttpOnly/Secure Cookies

### Team Bugfix
- `GET /api/admin/team` ohne 500 (Graceful Fallback)
- Vollständiges CRUD: Vorname, Nachname, Profil, Social Links, Archivieren

### Admin UI
- `/admin/benutzer`, `/admin/sicherheit`, erweitertes Team-Formular
- Dashboard: Aktive Benutzer, Logins, Systemstatus

### Migration
- `20260712_security_admin_v1.sql`

### Report
- `SECURITY_ADMIN_REPORT.md`

## [0.9.0-rc.13] — 2026-07-06 — Public Website Final Polish (RC5)

### Struktur & UX
- **Über die Panda-Bande:** About + Team + Mission + Werte in einer Sektion zusammengeführt
- Hero: Gründerin-Badge entfernt (keine Doppelung), Bewertungs-/Vertrauenszeile ergänzt
- **CTA bereinigt:** Section-CTAs nach jeder Sektion entfernt; nur Header, Sticky-Bar und WhatsApp-Float
- Telefon-Float entfernt (Telefon bleibt in Kontakt & Footer)
- Sticky CTA nutzt CMS-Navigationstext

### CMS
- Kontakt: Antwortzeit, Öffnungszeiten, Maps, Facebook
- Öffentliches Team im Admin (Inhalte)
- Leistungen: `price_from`, `highlights` (Migration `20260711_public_website_rc5.sql`)
- Trust-Badges Defaults für Hero-Vertrauen aktualisiert

### Polish
- Leistungskarten: einheitliche Bildhöhe, Fallback-Bild, optional Preis ab / Highlights
- FAQ: animiertes Accordion (CSS Grid)
- Footer: Cookie-Einstellungen, Über-uns-Link
- Galerie: Fallback-Bilder
- Mobile Safe-Area für Floats, Sticky CTA, Cookie-Banner

### Report
- `PUBLIC_WEBSITE_FINAL_REPORT.md`

## [0.9.0-rc.12] — 2026-07-06

### Emergency: Server/Client boundary crash (GET / 500)

- **Root cause:** `fetchCmsServices()` returned Lucide icon **components** in `Service.icon`; Server Component `page.tsx` passed them to Client Component `Services` → RSC serialization error (digest 1267400528).
- `Service` type now uses `iconKey: string`; icons resolved only inside Client Components via `resolveServiceIcon()`.
- Admin nav/quick-actions refactored to `iconKey` + `resolveAdminIcon()` (defensive pattern).
- CRM views: fixed `useEffect` dependency lint warnings.
- Report: `EMERGENCY_FIX_REPORT.md`

## [0.9.0-rc.11] — 2026-07-05

### Emergency: Production server crash fix

- **Root cause:** Homepage Team section crashed when `site_settings.sections.team` was missing in production DB (`heading.title` on `undefined`).
- `normalizeSiteSettings()` — safe deep-merge with defaults for all CMS fields.
- `resolveSectionHeading()` — all public section components hardened against explicit `undefined`.
- Public data layer: no uncaught Supabase throws on homepage fetches.
- Section validation: per-key heading merge instead of full-block failure.
- Migration: `20260710_production_crash_compat.sql`
- Report: `docs/05_ROADMAP/EMERGENCY_CRASH_REPORT.md`

## [0.9.0-rc.10] — 2026-07-05

### Public Website Final Sprint

- Conversion: Sticky CTA, Telefon/WhatsApp-Floats, vereinfachtes Anfrageformular, Section-CTAs
- Vertrauen: 6 USP-Karten, Team-Bereich (CMS), Ablauf aktualisiert
- Inhalte: Leistungs-Detail-Modal, Galerie-Filter, Beitrags-Karten
- SEO: sitemap.xml, robots.txt, Manifest, Open Graph, Twitter, Structured Data
- Bonus: Cookie-Banner, erweiterter Footer, Maps-Link
- Dokumentation: `docs/05_ROADMAP/PUBLIC_WEBSITE_FINAL_REPORT.md`

## [0.9.0-rc.9] — 2026-07-05

### Admin + CRM Final Control Sprint

- Sidebar/Drawer: scrollbar mit `100dvh`, Body-Lock ohne Scroll-Sprung, Safe-Area
- Mobile Bottom-Nav: 80px, größere Icons/Text, FAB-Clearance
- Angebote-Formular: gruppiert (Kunde, Daten, Positionen, Rabatt/Steuern, Hinweise), Rabatt/MwSt. editierbar
- PDF: professionelleres Layout, Kundenblock, größere Tabelle, Zahlungsinfo, Fußzeile
- Unternehmensdaten: Straße, PLZ, Ort + Standardtexte für PDFs
- E-Mail: Kopie-an, Angebots-/Rechnungs-Kopie, Kontaktformular-Empfänger, gewünschte Adressen
- Team: neuer Admin-Bereich mit Rollen (Admin, Bearbeiter, Nur Lesen) — Auth vorbereitet
- Dokumentation: `docs/EMAIL_DOMAIN_SETUP.md`, `docs/05_ROADMAP/ADMIN_CRM_EMAIL_FINAL_REPORT.md`

## [0.9.0-rc.8] — 2026-07-05

### E-Mail-System (Resend) — Produktionsreif

- Neuer CMS-Bereich **Einstellungen → E-Mail**: Firmenname, Absendername, Absender-E-Mail, Reply-To, Benachrichtigungs-E-Mail
- Flexibles Absender-System: automatisch `onboarding@resend.dev` ohne verifizierte Domain, sonst Firmenadresse
- Resend Domain Status im Admin mit Hinweis zur Testdomain
- Test-E-Mail senden aus dem Admin
- Keine hardcodierten Absenderadressen mehr im Anwendungscode
- API: `GET /api/admin/email/status`, `POST /api/admin/email/test`
- Dokumentation: `docs/EMAIL_SETUP.md` (Resend, DNS, Domainwechsel)

## [0.9.0-rc.7] — 2026-07-05

### CRM Final UX/UI Polish

- Mobile Bottom-Nav: native App-Feeling (76px, große Icons, aktiver Tab hervorgehoben)
- FAB höher positioniert, besserer Schatten und Animation
- Dashboard gruppiert: Schnellaktionen, Statistik, CRM, Website
- Angebote: klare Rabatt/MwSt.-Labels, Positionen-Editor mit Live-Summen
- PDF: professionelles Layout mit Unternehmensdaten, Bankverbindung, Status
- E-Mail: HTML-Template, Versand-Modal mit Checkboxen
- Einstellungen: Unternehmensdaten zentral (`business` in site_settings)
- Formulare vereinheitlicht mit `AdminFormField` und Pflichtfeld-Markierung
- Dokumentation: `docs/05_ROADMAP/CRM_FINAL_POLISH.md`

## [0.9.0-rc.6] — 2026-07-05

### Admin Dashboard Final Polish

- Navigation gruppiert: Dashboard, Analytics, CRM, Website, Kommunikation, Einstellungen
- Sidebar (Desktop), Drawer + Bottom-Nav (Mobile) — keine horizontale Tab-Leiste
- Dashboard: 10 Kennzahlen, 6 Schnellaktionen, klare Statistik-Hinweise
- Globale Schnellaktionen (FAB): Kunde, Angebot, Rechnung, Beitrag, Bild
- `AdminStatusBadge`, `AdminFormField`, einheitliche Listen-Karten
- Empty States: FAQ, Beiträge, Kunden, Galerie, Bewertungen
- Formular-/Karten-Vereinheitlichung in Beiträge, Galerie, Bewertungen, CRM
- Toasts über Mobile-Bottom-Nav positioniert
- Dokumentation: `docs/05_ROADMAP/ADMIN_DASHBOARD_FINAL_REPORT.md`

## [0.9.0-rc.5] — 2026-07-05

### Sprint 3 — Business CRM

- Schlankes CRM für kleine Unternehmen: Kunden, Angebote, Rechnungen
- Navigation: Kunden, Angebote, Rechnungen im Admin
- Kundenstamm mit Historie (Anfragen, Angebote, Rechnungen, Events)
- Anfragen: „Kunde erstellen" mit einem Klick aus Kontaktformular
- Angebote: Positionen, MwSt., Rabatt, PDF (Corporate Design), E-Mail-Versand
- Rechnungen: aus Angebot erzeugen, Nummernkreis (ANG-/RE-), PDF, Versand
- Status: Entwurf, Gesendet, Bestätigt, Bezahlt, Offen, Storniert
- Dashboard-KPIs: Kunden, offene Angebote/Rechnungen, Umsatz
- Migration `20260707_crm_business.sql`
- Tests: `npm run test:crm`, Build, Lint
- Dokumentation: `docs/05_ROADMAP/CRM_REPORT.md`

## [0.9.0-rc.4] — 2026-07-05

### Sprint 1 — Admin Dashboard UX 2.0

- Admin Navigation: linke Sidebar (Desktop), Drawer + Bottom Nav (Mobile)
- Dashboard: Willkommen, Schnellaktionen, Kennzahlen, Letzte Aktivitäten
- Shared UI: AdminButton, AdminEmptyState, AdminSearchInput, AdminFilterBar, AdminStickySave
- Admin Design System mit Dark-Mode-Architektur (`data-admin-theme`)
- Empty States für Anfragen, Leistungen, FAQ
- Dokumentation: `docs/05_ROADMAP/ADMIN_UX_REPORT.md`

### Sprint 2 — Analytics

- Migration `20260706_analytics_enhanced.sql` (Browser, OS, Referrer, Live Stats RPCs)
- Bot-Filter im Tracking, Referrer als Hostname (DSGVO)
- Analytics-Seite `/admin/analytics` mit Diagrammen, Live Counter, CSV Export
- Lazy Loading für Analytics View (Code Splitting)
- Dokumentation: `docs/05_ROADMAP/ANALYTICS_REPORT.md`

## [0.9.0-rc.3] — 2026-07-05

### RC1 Blocker Fix — Public UI + Full CMS Control

- **Header/Hero Mobile:** CSS-Variablen `--header-height` / `--header-offset`, globales `scroll-margin-top` auf `[id]`, Hero-Padding über Safe-Area — kein Clipping der Tagline mehr
- **Mobile CTA:** Header-Button ab `md` sichtbar, kompakt „Anfragen“ bis `lg`, `whitespace-nowrap`, unter `md` ausgeblendet (Menü-CTA bleibt)
- **Leistungen:** Platzhalter-Filter (`content-quality.ts`) — „Neue Leistung / Beschreibung…“ erscheint nicht öffentlich; Fallback auf Default-Leistungen; neue Admin-Leistungen starten als `visible: false`
- **Full CMS Control:** Navigation, Branding/Logo, Trust Badges, USPs, Buchungsablauf, Sektions-Überschriften, Hero-Bild & Badge-Zitat im Admin bearbeitbar
- **CMS-Fallback:** CMS-Daten haben Vorrang; Defaults nur bei leerem/ungültigem CMS; Platzhalter-Inhalte werden gefiltert
- **Statistik:** Dashboard zeigt „Statistik noch nicht eingerichtet“ statt stiller Nullen bei fehlender Migration
- Dokumentation: `docs/05_ROADMAP/RC1-Blocker-Report.md`

## [0.9.0-rc.2] — 2026-07-05

### RC2 Security & Privacy Sprint

- Admin: HMAC-signierte Sessions statt passwortableitbarem Cookie
- Admin Login: Rate Limit (5/15min), timing-safe Vergleich, sameSite=strict
- Security Headers: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy
- Spam-Schutz: Honeypot, Mindest-Submit-Zeit, Rate Limits auf öffentlichen APIs
- Uploads: Magic-Byte-Prüfung, MIME+Extension AND, Ordner-Allowlist, Pfad-Validierung
- Input Validation: Max-Längen, HTML-Stripping, Zod-Schemas für Admin-CRUD
- API Errors: generische Client-Meldungen, keine DB-Details öffentlich
- Datenschutz: technisch vorbereitete Abschnitte für alle Verarbeitungen
- RLS Migration: Analytics-RPCs für anon/public gesperrt
- Dokumentation: `SECURITY_PRIVACY_RC2.md`, `RC2_SECURITY_PRIVACY_REPORT.md`

## [0.9.0-rc.1] — 2026-07-05

### Release Candidate RC1 — Final Stabilization

- CMS-Settings: Validierung aller Pflichtfelder beim Speichern (`validate-settings.ts`)
- CMS-Settings: Unvollständige DB-Sektionen fallen auf vollständige Defaults (kein Partial-Mix)
- Leistungen/Galerie: Query-Retry, konsistente Fehlerbehandlung
- Statistik: `isPageViewsTableReady()` korrigiert, Berlin-Zeitzone-Fallback
- Tracking-API: `tableMissing`-Hinweis bei fehlender `page_views`-Migration
- Revalidation: alter Beitrags-Slug + Impressum/Datenschutz
- Hero/Header: Safe-Area-Padding, CTA ab `sm`, Logo im Menü ausgeblendet
- Button: kein erzwungenes `min-w` (Mobile nicht gequetscht)
- About/Hero: Bild-Fallback bei leerer CMS-URL
- Admin Reviews/Bookings: einheitlich `requireAdmin()`
- Beitragsseite: eindeutige React-Keys
- `docs/05_ROADMAP/RC1-Release-Report.md`

## [0.8.7] — 2026-07-05

### Stable Project Checkpoint

- Verifizierter stabiler Arbeitsstand nach Live-Cleanup-Sprint (PR #18 gemerged)
- `npm run lint` und `npm run build` bestanden
- Checkpoint-Dokumentation: `docs/05_ROADMAP/STABLE_CHECKPOINT.md`
- Nächster Sprint vorbereitet: Branch `feature/pixel-perfect-p1`

## [0.8.6] — 2026-07-05

### Live Website Cleanup — CMS-Konsistenz

- CMS-Sektionen ohne Merge mit `config/site.ts`: vorhandene CMS-Keys ersetzen Fallbacks vollständig
- Über-uns: fehlerhafte `founderName`-Injection in `introText` entfernt (Admin + Anzeige)
- Kontakt/Footer: Telefon, E-Mail, WhatsApp, Instagram, Einsatzgebiet ausschließlich aus CMS-Settings
- Footer-Tagline aus CMS in Kontakt, Über uns und Footer (keine hardcodierten Platzhalter)
- Hero-Badge und Footer-Logo: je ein DOM-Element mit responsive CSS
- Leistungen/Galerie: nur CMS wenn vorhanden, kein statischer Mix, leere Sektionen ausgeblendet
- Header: ein Logo-Element statt Mobile/Desktop-Duplikat
- Hero Portrait: mehr Safe-Area-Padding, Overflow-Fixes für Tagline
- Impressum/Datenschutz: Kontaktdaten aus CMS
- `live:verify` erweitert (Platzhalter-E-Mail, doppeltes Hero-Badge, Footer-Telefon)

## [0.8.5] — 2026-07-04

### Final Stabilization — Reviews & Über-uns

- Bewertungsbilder: einheitlich `profile_image_url` / `event_image_url` als Storage-Pfad in DB
- Öffentliche und Admin-Anzeige via `resolveImageUrl()` (kein `avatar_url`-Alias mehr)
- Über-uns: About-Bild speichert Pfad
- `scripts/live-verify.mjs` für Live-Smoke-Tests (`npm run live:verify`)

## [0.8.4] — 2026-07-04

### Critical Stabilization Sprint

Stabilisierung ohne neue Features — CMS-Binding, Doppel-DOM, Bewertungen, `/aktuelles`.

#### Bewertungen
- Server-seitiges Laden (`fetchApprovedReviews`) — kein hängender Loading-State
- Legacy `avatar_url` → `profile_image_url` Mapping
- Ein DOM-Loop für Mobile/Desktop Karussell

#### Doppelte HTML-Ausgabe behoben
- Usps, Services, Process, Gallery, News: ein Datenmodell, responsive CSS statt Mobile/Desktop-Doppelblöcke

#### Beiträge
- Neue Seite `/aktuelles` (Index aller veröffentlichten Beiträge)
- Revalidation für `/aktuelles` ergänzt

#### Admin UX
- Einheitlicher Toast: „Gespeichert und Website aktualisiert.“
- Upload-Feedback in Galerie

#### Dokumentation
- `docs/05_ROADMAP/Stabilization-Live-Test-Report.md`

## [0.8.3] — 2026-07-04

### Critical CMS + UI Bugfix Sprint

Vollständige Verbindung Admin → öffentliche Website, Upload-Fixes, Hero-Clipping, Statistik-Fallbacks.

#### CMS Binding
- `resolveImageUrl()` für Galerie, Beiträge und Über-uns-Bilder (Pfad oder volle URL)
- `fetchPostBySlug` repariert (fehlender Import / kaputtes Hero-Bild)
- `published_at` wird beim Veröffentlichen automatisch gesetzt
- Über-uns `imageUrl` wird beim Laden normalisiert

#### Uploads
- Öffentliche Storage-Buckets: Migration `20260704_storage_buckets_public.sql`
- Admin: Bewertungs-Profilbild und Eventfoto nachträglich hochladbar
- Robustes Storage-Pfad-Parsing via `extractStoragePathFromUrl()`
- `unoptimized` für alle Supabase-Bilder (News, Beitragsseite, Admin-Galerie)

#### Header / Hero
- Tagline im Portrait (320–430px) nicht mehr abgeschnitten
- Safe-Area-Padding, kein `overflow-hidden`, Hero-Text ohne ScrollReveal-Verstecken

#### Statistik
- Fallback-Queries wenn Analytics-RPCs fehlen
- `sendBeacon` im PageViewTracker
- Dashboard-Hinweis wenn `page_views`-Tabelle fehlt

#### Dokumentation
- `docs/05_ROADMAP/CMS-UI-Bugfix-Report.md`

## [0.8.2] — 2026-07-03

### Sprint B2 — Admin Statistik-Dashboard

- Erweitertes Admin-Dashboard mit Besucher- und Seitenaufruf-Kennzahlen
- Eigenes anonymes Tracking über Supabase (`page_views` Tabelle)
- Cookie-frei: Session-ID in `sessionStorage`, keine IP-Speicherung
- Diagramme für 7/30 Tage, Tabelle meistbesuchte Seiten
- CMS-Kennzahlen: Anfragen, Bewertungen, Galerie, Beiträge
- Vercel Analytics geprüft — nicht integriert (eigenes Tracking bevorzugt)
- `docs/05_ROADMAP/Statistik-Report.md`

## [0.8.1] — 2026-07-03

### CMS Bugfix — Admin speichert, Website übernimmt

Kritischer Bugfix: CMS-Inhalte aus dem Admin wurden nicht auf der öffentlichen Website angezeigt.

#### Cache & Revalidation
- Startseite und Beitragsseiten auf `force-dynamic` umgestellt
- `unstable_noStore()` für alle CMS-Fetches
- `revalidatePath("/")` nach jedem Admin-Speichern

#### Public Binding
- CMS-Daten haben Vorrang vor statischen Fallbacks
- Galerie/Services/FAQ: Fallback nur wenn CMS-Tabelle leer

#### Uploads
- Robustere Bildvalidierung (MIME + Dateiendung)
- Über-uns Bild: Upload speichert automatisch in `site_settings`
- Echte Fehlermeldungen im Admin-UI

#### Sonstiges
- CMS Debug-Panel unter Admin → Einstellungen
- Header/Logo-Abschneiden behoben
- `docs/05_ROADMAP/CMS-Bugfix-Report.md`

## [0.8.0] — 2026-07-03

### Sprint B — CMS / Admin Dashboard

Vollständiges Content-Management: Inhalte, Galerie, Bewertungen, Beiträge, FAQ und Leistungen über das Admin-Dashboard pflegbar.

#### Admin Dashboard
- Moderne Sidebar-Navigation mit 9 Bereichen
- Dashboard mit Statistiken und Schnellzugriffen
- Toast-Meldungen, Ladeindikatoren, Suche und Filter
- Mobile-taugliche Admin-Oberfläche

#### Website-Inhalte (site_settings)
- Hero, Kontakt, Über uns, Footer bearbeitbar
- Fallback auf statische Konfiguration wenn leer

#### CMS-Module
- **Galerie:** Upload, Ersetzen, Löschen, Sortieren, Kategorien (Supabase Storage `gallery`)
- **Bewertungen:** Profil-/Eventfotos, Admin-Antwort, Verifiziert-Badge, Freigabe/Ablehnung
- **Anfragen:** Status inkl. Abgesagt, interne Notizen
- **Leistungen & FAQ:** CRUD, Sortierung, Sichtbarkeit
- **Beiträge:** Kleines CMS mit Slug, Hero-Bild, Veröffentlichung
- **Aktuelles:** Neue Section auf der Startseite + Detailseiten `/aktuelles/[slug]`

#### Technik
- SQL-Migration `supabase/migrations/20260703_cms_v080.sql`
- Serverseitige Uploads (Buckets: `gallery`, `reviews`, `site-assets`)
- Admin-APIs unter `/api/admin/*`
- `CMS_ADMIN_GUIDE.md` für Nicht-Techniker
- `docs/05_ROADMAP/Sprint-Report-CMS-Admin.md` — Sprint-B Report

## [0.7.0] — 2026-07-03

### Sprint A — Final UI / Design Polish (V1.0 Candidate)

Premium-Agentur-Niveau für UI/UX — ausschließlich Design, keine Backend-Änderungen.

#### Design System
- `--ease-premium` Easing, einheitliche Micro-Interactions
- Premium Utilities: `icon-wrap`, `trust-chip`, `gallery-tile`, `step-circle`, `review-card`, `faq-item`, `social-pill`, `form-luxury`, `section-warm`
- Card-Hover: translate statt scale, `card-static` für statische Cards
- `lib/design.ts` mit `ICON_STROKE` Konstante

#### UI Polish
- **Hero:** Atmosphären-Gradient, Premium Trust-Chips, mehr Desktop-Whitespace
- **Header:** Eleganterer Scroll-Blur und Nav-Transitions
- **Buttons:** Apple-niveau Hover (translate, 500ms easing)
- **SectionHeading:** Gradient-Divider, harmonisierte Typo
- **Leistungen / USPs:** Icon-Container, ruhigeres Grid
- **Process:** Step-Circles mit Ring-Glow, dezente Timeline
- **Galerie:** Hover-Gradient-Overlay, Boutique-Transitions
- **Bewertungen:** Emotionale Cards, größere Sterne, Premium Empty State
- **About:** `about-image-frame`, wärmere Mission-Karten
- **FAQ:** Kreis-Toggle mit Primary Open-State
- **Kontakt:** Luxuriöser Formular-Rahmen
- **Footer:** Social-Pills, Gradient-Overlay, weniger Redundanz

#### Dokumentation
- `docs/05_ROADMAP/Design-Review-Report.md`

## [0.6.0] — 2026-07-03

### Responsive / Mobile Bugfix Sprint

Mobile-first Überarbeitung von Layout, Abständen und Typografie. Keine neuen Features, keine Änderungen an Supabase, Resend, Admin oder Formularlogik.

#### Global
- `overflow-x: clip` gegen horizontalen Scroll
- Kompaktere `section-padding` / `section-padding-lg` auf Mobile
- `.swipe-bleed` für Carousel-Bereiche ohne Viewport-Overflow
- Mobile Card-Radius 18px, reparierter `prefers-reduced-motion` Block

#### Header
- Niedrigere Mobile-Höhe (`h-16`), kompakteres Logo
- CTA im Header erst ab `md`
- Burger-Menü 48×48px Touchfläche

#### Hero
- Kompakteres Padding und Typografie
- Bild früher sichtbar, begrenzte Mobile-Höhe
- Lisa-Badge im normalen Flow auf Mobile (kein Overlap)
- Trust-Badges als 2×2 Chips

#### Sections
- SectionHeading, Cards, Buttons: Mobile-optimierte Größen
- Services, Galerie, Bewertungen: `swipe-bleed` statt negative Margins
- Process: kompaktere vertikale Timeline
- Footer, About, Contact, Usps: reduzierte Abstände

#### Dokumentation
- `docs/05_ROADMAP/Mobile-Bugfix-Report.md`
- `docs/05_ROADMAP/Quality-Gap-Review.md`
- `docs/05_ROADMAP/Sprint-Reports.md` — Direkt-Download-Übersicht aller Sprint-Berichte

## [0.5.0] — 2026-07-02

### Final Premium Design Sprint V3 (Pixel Perfect)

Visuelles Feintuning auf Boutique-Agentur-Niveau — ausschließlich Design/UI/UX. Keine neuen Features, keine Änderungen an Supabase, Resend, Admin oder Formularlogik.

#### Hero (Schwerpunkt)
- Größeres emotionales Bild mit Overflow-Effekt und Hero-Schatten
- „Hallo, ich bin Lisa!"-Badge schwebt über dem Bild
- Blumenornamente, mehr Weißraum, kürzerer Text
- Stärkere CTAs mit Premium-Schatten

#### Design System V3
- Erweiterte Schatten (`shadow-hero`, `shadow-float`)
- Card-Radius 24px, beige Service-Karten
- Warme Hintergrundtöne (`bg-warm`)
- Floating Labels im Kontaktformular (visuell)
- Footer mit Olive-Gradient

#### Sektionen
- **Header:** Höher, größeres Logo, elegantere Navigation
- **Leistungen:** Beige Premium-Karten, größere Icons
- **Warum Panda-Bande:** Größere Icons, emotionalere Karten
- **Über uns:** Boutique-Layout mit Panda-Akzent
- **Buchungsablauf:** Elegantere Timeline-Verbindungen
- **Galerie:** Instagram-Feeling, langsamer Hover-Zoom
- **Bewertungen:** Airbnb-Niveau, größere Sterne, Panda Empty State
- **FAQ:** Premium Accordion mit animiertem Icon
- **Kontakt:** Luxuriöses Formular mit Floating Labels
- **Footer:** Gradient, Panda-Illustration, größeres Logo

#### Panda-Elemente
- `PandaMascot` in Empty State, Success-Meldungen, Footer, About
- `FlowerOrnament` in Hero, About, Kontakt

#### Design-Philosophie
- Mockup als Stil- und Markenreferenz, nicht als starres Pixel-Template
- UX-Verbesserungen dort, wo das Mockup suboptimal ist (z. B. FAQ ohne schwere Karten, Hero-Badge mobil oben)

#### Mockup-Abgleich & UX-Optimierungen
- Hero Lisa-Badge: unten links (Desktop/Mockup), oben (Mobile/Lesbarkeit)
- USPs Desktop: leichte Icon-Zeile statt schwerer Karten
- Leistungen: weiße Karten mit feiner Linie (Mockup-Stil)
- FAQ: minimalistisches Accordion mit Trennlinien
- Bewertungen Desktop: Pfeil-Navigation bei mehr als 3 Einträgen
- Hintergrund `#faf9f6` (Mockup-Wärme)


## [0.4.0] — 2026-07-02

### Accessibility / Barrierefreiheit Sprint

Gezielter Barrierefreiheits-Check ohne neue Features. Ziel: bessere Nutzbarkeit auf Mobile und Desktop, Lighthouse Accessibility 95+.

#### Kontraste & Farben
- Dunklere Textfarben (`text-secondary`, `text-muted`, `text-placeholder`) für WCAG AA
- Footer-Kontraste verbessert (`white/80`, `white/90`)
- Gold-Akzent für Sterne dunkler (`#b8922e`)

#### Tastatur & Focus
- Globaler sichtbarer `:focus-visible` Outline
- Skip-Link „Zum Hauptinhalt springen"
- Escape schließt Burger-Menü und Lightbox
- Focus-Management beim Öffnen/Schließen von Menü und Lightbox

#### ARIA & Semantik
- FAQ: `aria-controls`, `aria-expanded`, `aria-labelledby`
- Swipe-Bereiche: `role="region"` mit beschreibenden Labels
- Formulare: `aria-invalid`, `aria-describedby`, `role="alert"`, `aria-live`
- Sterne: `role="img"` / `role="radiogroup"`
- `main id="main-content"` für Skip-Link

#### Touch & Typografie
- Mindest-Touchflächen 44–52px für Buttons, FAQ, Formulare
- Body 16px, Labels und Buttons in `text-base`
- Hero Trust-Badges mindestens `text-sm`

#### Motion
- `prefers-reduced-motion` — Animationen deaktiviert/reduziert
- ScrollReveal respektiert Systemeinstellung

#### Dokumentation
- `docs/05_ROADMAP/Sprint-Report-Accessibility.md`
- `docs/05_ROADMAP/Sprint-Report-Premium-UI-UX-V2.md`

---

## [0.3.0] — 2026-07-02

### Premium UI/UX Sprint V2

Visuelles und UX-Upgrade auf Premium-Niveau (Apple × Airbnb × Boutique). Keine neuen Features — alle bestehenden Funktionen (Supabase, Resend, Admin, Bewertungen, Kontaktformular) bleiben erhalten.

#### Design System
- Konsequente Farbpalette: Olive Green, Warm Beige, Soft Gold
- Einheitliche Premium-Karten (`.card-premium`) mit Radius, Schatten, Hover
- Verbesserte Typografie, Zeilenhöhen und Weißraum
- Dezente Scroll-Reveal-Animationen

#### Mobile First
- Leistungen: horizontaler Swipe-Slider mit größeren Icons und Texten
- Buchungsablauf: vertikale Timeline mit Verbindungslinie
- Galerie: Swipe-Galerie mit Lightbox
- Bewertungen: horizontaler Swipe mit großen Karten
- Größere Touch-Targets, Thumb-friendly Buttons, Safe-Area für WhatsApp-FAB

#### Sektionen
- **Header:** Größeres Logo, Sticky mit Blur, aktive Navigation, elegantes Burger-Menü
- **Hero:** Mockup-nah mit emotionalem Bild, Lisa-Karte, Trust-Badges
- **Warum Panda-Bande:** Vier Premium-USP-Karten
- **Leistungen:** Desktop 4×2 Grid, Mobile Swipe
- **Buchungsablauf:** Desktop 5-Schritte-Timeline, Mobile vertikal
- **Galerie:** Masonry Grid (Desktop), Lightbox, Lazy Loading
- **Bewertungen:** Airbnb-Qualität — Rating-Summary, verifizierte Buchung, Empty State
- **Über uns:** Persönliche Gründerin-Story mit emotionalem Bild
- **FAQ:** Weichere Accordion-Animation, größere Touchflächen
- **Kontakt:** 2-Spalten Desktop, größere Eingabefelder, klarere Success-Meldung
- **Footer:** Erweitert mit Kontakt, Social, Rechtlichem

#### Neue UI-Komponenten
- `Card`, `ScrollReveal`, `StarRating`, `Lightbox`
- `useActiveSection` Hook für aktive Navigation

---

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
