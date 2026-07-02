# Techstack — Panda-Bande Kinderevents

## Übersicht

Dieses Dokument beschreibt die geplante technische Architektur für die Panda-Bande Kinderevents Plattform. Die Auswahl orientiert sich an modernen Best Practices, schneller Performance, einfacher Wartbarkeit und guter Entwicklererfahrung.

> **Hinweis:** Es wurde noch kein Code geschrieben. Dieser Techstack dient als Entscheidungsgrundlage für die Umsetzung.

---

## Architektur-Prinzipien

1. **Jamstack-first** — statische Generierung wo möglich, dynamische Funktionen nur wo nötig
2. **Mobile-first** — Entwicklung und Design beginnen beim Smartphone
3. **Wartbarkeit** — klare Ordnerstruktur, typisierte Sprachen, dokumentierte Konventionen
4. **Performance** — Core Web Vitals als messbares Ziel
5. **Datenschutz** — DSGVO-Konformität von Anfang an mitdenken

---

## Frontend

| Technologie | Version (Ziel) | Begründung |
|-------------|----------------|------------|
| **Next.js** | 15.x | React-Framework mit SSR/SSG, Routing, API Routes |
| **React** | 19.x | Komponentenbasierte UI-Entwicklung |
| **TypeScript** | 5.x | Typsicherheit, bessere IDE-Unterstützung, weniger Laufzeitfehler |
| **Tailwind CSS** | 4.x | Utility-first CSS, schnelles Styling, konsistentes Design |
| **Framer Motion** | 11.x | Dezente Animationen für verspielte UI-Elemente |

### UI-Komponenten
- Eigene Komponentenbibliothek in `/components`
- Wiederverwendbare Bausteine: Button, Card, Accordion, Form, Modal
- Design-Tokens aus dem Branding (Farben, Schriften, Abstände) als Tailwind-Config

---

## Backend & Daten

| Technologie | Einsatz | Begründung |
|-------------|---------|------------|
| **Next.js API Routes** | Kontaktformular, einfache Endpoints | Kein separater Server nötig im MVP |
| **Supabase** oder **Firebase** | Auth, Datenbank (Phase 2+) | Schneller Start, skalierbar, Realtime-fähig |
| **PostgreSQL** | Relationale Daten (Buchungen, Events) | Robust, über Supabase verfügbar |

### Datenmodelle (geplant)

```
Event          – id, title, description, ageGroup, duration, price, images, theme
Booking        – id, eventId, customerName, email, date, status, notes
ContactRequest – id, name, email, message, createdAt, status
Testimonial    – id, author, rating, text, eventId, approved
```

---

## Content Management

| Option | Phase | Beschreibung |
|--------|-------|--------------|
| **Markdown / MDX** | MVP | Event-Beschreibungen und Blog-Beiträge als Dateien im Repo |
| **Sanity** oder **Contentful** | Phase 2 | Headless CMS für nicht-technische Redakteure |
| **Supabase Storage** | Phase 2 | Bild-Upload und Medienverwaltung |

Für den MVP reicht eine dateibasierte Content-Lösung (MDX in `/content`), um schnell starten zu können ohne externe Abhängigkeiten.

---

## E-Mail & Benachrichtigungen

| Dienst | Einsatz |
|--------|---------|
| **Resend** oder **SendGrid** | Transaktions-E-Mails (Buchungsbestätigung, Kontaktanfrage) |
| **React Email** | HTML-E-Mail-Templates in React schreiben |

---

## Zahlungen (Phase 2)

| Dienst | Einsatz |
|--------|---------|
| **Stripe** | Online-Zahlung, Anzahlungen, Gutscheine |

---

## Hosting & Deployment

| Dienst | Einsatz | Begründung |
|--------|---------|------------|
| **Vercel** | Hosting & CI/CD | Native Next.js-Integration, Preview-Deployments |
| **GitHub** | Versionskontrolle | Branching, Pull Requests, Issues |
| **GitHub Actions** | CI-Pipeline | Linting, Tests, Build-Checks |

### Umgebungen
- **Development** — lokale Entwicklung (`localhost:3000`)
- **Preview** — automatisch pro Pull Request auf Vercel
- **Production** — `www.panda-bande-events.de` (Domain noch festzulegen)

---

## Qualitätssicherung

| Tool | Einsatz |
|------|---------|
| **ESLint** | Code-Qualität und Konventionen |
| **Prettier** | Einheitliche Code-Formatierung |
| **TypeScript** | Statische Typprüfung |
| **Vitest** oder **Jest** | Unit- und Komponententests |
| **Playwright** | End-to-End-Tests für kritische User Flows |
| **Lighthouse CI** | Performance- und SEO-Monitoring |

---

## Analytics & Monitoring

| Tool | Einsatz | Datenschutz |
|------|---------|-------------|
| **Plausible** oder **Matomo** | Seitenaufrufe, Conversion | DSGVO-freundlich, kein Cookie-Banner nötig (Plausible) |
| **Sentry** | Fehler-Tracking in Production | Nur mit Einwilligung oder anonymisiert |
| **Vercel Analytics** | Web Vitals | Integriert, datenschutzschonend |

---

## Sicherheit

- HTTPS durch Vercel (automatisch)
- Umgebungsvariablen für API-Keys (`.env.local`, nie im Repo)
- CSRF-Schutz bei Formularen
- Rate Limiting bei Kontakt- und Buchungsendpoints
- Input-Validierung mit **Zod**
- DSGVO: Datenschutzerklärung, Impressum, Cookie-Einwilligung

---

## Ordnerstruktur (geplant)

```
/
├── docs/                  # Projektdokumentation
│   ├── 01_VISION/
│   ├── 02_BRANDING/
│   ├── 03_FEATURES/
│   ├── 04_TECH/
│   └── 05_ROADMAP/
├── src/
│   ├── app/               # Next.js App Router (Seiten & Layouts)
│   ├── content/           # MDX-Dateien für Events & Blog
│   └── styles/            # Globale Styles
├── components/            # Wiederverwendbare UI-Komponenten
├── lib/                   # Hilfsfunktionen, API-Clients, Validierung
├── public/                # Statische Assets (Bilder, Fonts, Favicon)
└── ...                    # Konfigurationsdateien (später)
```

---

## Entscheidungslog

| Entscheidung | Gewählt | Alternative | Begründung |
|--------------|---------|-------------|------------|
| Framework | Next.js | Astro, Remix | Ökosystem, Vercel-Integration, React-Kenntnisse |
| Styling | Tailwind CSS | CSS Modules, Styled Components | Schnelligkeit, Konsistenz mit Design-Tokens |
| CMS (MVP) | MDX-Dateien | Sanity sofort | Weniger Komplexität zum Start |
| Hosting | Vercel | Netlify, Railway | Beste Next.js-Unterstützung |
| Datenbank | Supabase | PlanetScale, Firebase | PostgreSQL, Auth, Storage in einem |

---

## Offene technische Fragen

- [ ] Finale Domain festlegen
- [ ] CMS ab Phase 2: Sanity vs. Contentful evaluieren
- [ ] Buchungssystem: Eigenentwicklung vs. Calendly-Integration im MVP
- [ ] Bildoptimierung: Next.js Image vs. Cloudinary für große Galerien
- [ ] E-Mail-Anbieter: Resend vs. SendGrid nach Kosten und DX vergleichen
