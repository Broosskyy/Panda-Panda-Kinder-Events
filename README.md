# Panda-Bande Kinderevents

Unvergessliche Kinderfeiern und Familien-Events — digital präsentiert, persönlich umgesetzt.

## Projektstatus

🟢 **Sprint 2 gestartet** — Formular, Bewertungen, Admin; Vercel-ready nach ENV-Setup.

## Entwicklung

```bash
npm install
cp .env.example .env.local   # Werte eintragen
npm run dev      # http://localhost:3000
npm run build    # Production Build
npm run lint     # ESLint
```

### Umgebungsvariablen

Siehe `.env.example` — benötigt für volle Funktionalität:
- **Supabase** (Anfragen & Bewertungen speichern)
- **Resend** (E-Mail an manuel.bauch0705@gmail.com)
- **ADMIN_PASSWORD** (Admin-Bereich unter `/admin`)

### Logo

Originales Logo nach `public/assets/logo.png` legen (siehe `public/assets/README.md`).

## Projektstruktur

```
/
├── src/app/           # Next.js App Router (Seiten, Layout)
├── components/        # UI-Komponenten und Sektionen
├── lib/               # Daten, Config, Validierung
├── public/            # Statische Assets (Logo, Illustrationen)
└── docs/              # Projektdokumentation
```

## Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| [Vision](docs/01_VISION/Vision.md) | Mission, Ziele, Zielgruppe und Werte |
| [Branding](docs/02_BRANDING/Branding.md) | Markenidentität, Farben, Typografie und Designstil |
| [Design-System](docs/02_BRANDING/Design-System.md) | Vollständiges UI-Design-System (aus Mockup abgeleitet) |
| [Feature-Liste Final](docs/03_FEATURES/Feature-Liste-Final.md) | Konsolidierte Feature-Liste (Report + Mockup) |
| [Report-Mockup-Abgleich](docs/03_FEATURES/Report-Mockup-Abgleich.md) | Abweichungen und Entscheidungen |
| [Features (Original)](docs/03_FEATURES/Features.md) | Ursprüngliche Feature-Spezifikation |
| [Techstack](docs/04_TECH/Techstack.md) | Technische Architektur und Tool-Auswahl |
| [Roadmap](docs/05_ROADMAP/Roadmap.md) | Entwicklungsphasen V0–V4 |
| [V1 To-do-Liste](docs/05_ROADMAP/V1-Todo-Liste.md) | Konkrete Aufgaben für Version 1 |

## Nächste Schritte (Sprint 2)

- E-Mail-Versand für Anfrageformular (Resend/SendGrid)
- Echte Fotos und finale Texte von Panda-Bande einpflegen
- Rechtstexte durch Anwalt prüfen lassen
- Vercel Deployment mit Custom Domain

Siehe [Roadmap](docs/05_ROADMAP/Roadmap.md) und [CHANGELOG.md](CHANGELOG.md).
