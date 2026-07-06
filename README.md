# Panda-Bande Kinderevents

Unvergessliche Kinderfeiern und Familien-Events — digital präsentiert, persönlich umgesetzt.

## Projektstatus

🟢 **v1.0-checkpoint** — Vollständige Website, Admin (CMS + CRM), Sicherheit (Benutzer, Rollen, 2FA, Audit). Dokumentation und Backup-Guides vorhanden. Siehe [Checkpoint Report](PROJECT_CHECKPOINT_REPORT.md).

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

## Checkpoint-Dokumentation (v1.0)

| Dokument | Beschreibung |
|----------|--------------|
| [PROJECT_MASTER_GUIDE](PROJECT_MASTER_GUIDE.md) | Einstieg für alle — Was ist Panda-Bande? |
| [PROJECT_STRUCTURE](PROJECT_STRUCTURE.md) | Ordnerstruktur und Code-Orientierung |
| [FEATURE_OVERVIEW](FEATURE_OVERVIEW.md) | Feature-Status und Risiken |
| [ADMIN_USER_MANUAL](ADMIN_USER_MANUAL.md) | Admin-Handbuch für Nicht-Techniker |
| [TECHNICAL_RUNBOOK](TECHNICAL_RUNBOOK.md) | Technisches Handbuch für Entwickler |
| [CHECKPOINT_V1_SUMMARY](CHECKPOINT_V1_SUMMARY.md) | Checkpoint-Zusammenfassung |
| [PROJECT_CHECKPOINT_REPORT](PROJECT_CHECKPOINT_REPORT.md) | Abschlussreport |
| [Backups](backups/checkpoint-v1/README.md) | Backup- und Restore-Guides |

## Projektdokumentation (Legacy)

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
| [Sprint Reports (Download)](docs/05_ROADMAP/Sprint-Reports.md) | Direkt-Download aller Sprint-Berichte |
| [V1 To-do-Liste](docs/05_ROADMAP/V1-Todo-Liste.md) | Konkrete Aufgaben für Version 1 |

## Nächste Schritte

Siehe [NEXT_STEPS_ROADMAP.md](NEXT_STEPS_ROADMAP.md) — Domain, Resend, SEO, Livegang.

Siehe auch [CHANGELOG.md](CHANGELOG.md) und [RELEASE_STATUS.md](RELEASE_STATUS.md).
