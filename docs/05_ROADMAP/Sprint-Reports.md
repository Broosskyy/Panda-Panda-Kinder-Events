# Sprint Reports — Direkt-Download

> Nach jedem Sprint: Report als PDF/Markdown herunterladen.

**Repository:** [Broosskyy/Panda-Panda-Kinder-Events](https://github.com/Broosskyy/Panda-Panda-Kinder-Events)

---

## PDF-Downloads (Direktlinks)

| Version | Sprint | PDF herunterladen |
|---------|--------|-------------------|
| **0.6.0** | Responsive / Mobile Bugfix | **[Sprint-Report-Mobile-Bugfix.pdf](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/main/public/downloads/sprint-reports/Sprint-Report-Mobile-Bugfix.pdf)** |
| **0.5.0** | Premium Design V3 | **[Sprint-Report-Premium-Design-V3.pdf](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/main/public/downloads/sprint-reports/Sprint-Report-Premium-Design-V3.pdf)** |
| **0.4.0** | Accessibility | **[Sprint-Report-Accessibility.pdf](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/main/public/downloads/sprint-reports/Sprint-Report-Accessibility.pdf)** |
| **0.3.0** | Premium UI/UX V2 | **[Sprint-Report-Premium-UI-UX-V2.pdf](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/main/public/downloads/sprint-reports/Sprint-Report-Premium-UI-UX-V2.pdf)** |

### Auf der Live-Website (nach Deploy)

```
https://DEINE-DOMAIN/api/downloads/sprint-reports/Sprint-Report-Mobile-Bugfix.pdf
```

---

## Markdown-Reports

| Version | Sprint | Markdown |
|---------|--------|----------|
| **0.6.0** | Mobile Bugfix | [Sprint-Report-Mobile-Bugfix.md](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/main/docs/05_ROADMAP/Sprint-Report-Mobile-Bugfix.md) |
| **0.5.0** | Premium Design V3 | [Sprint-Report-Premium-Design-V3.md](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/main/docs/05_ROADMAP/Sprint-Report-Premium-Design-V3.md) |
| **0.4.0** | Accessibility | [Sprint-Report-Accessibility.md](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/main/docs/05_ROADMAP/Sprint-Report-Accessibility.md) |
| **0.3.0** | Premium UI/UX V2 | [Sprint-Report-Premium-UI-UX-V2.md](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/main/docs/05_ROADMAP/Sprint-Report-Premium-UI-UX-V2.md) |

### Zusatzberichte

| Thema | Markdown |
|-------|----------|
| Mobile Bugfix — Bug-Liste | [Mobile-Bugfix-Report.md](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/main/docs/05_ROADMAP/Mobile-Bugfix-Report.md) |
| Quality Gap — Go-Live | [Quality-Gap-Review.md](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/main/docs/05_ROADMAP/Quality-Gap-Review.md) |

---

## Neuen Sprint-Report anlegen

1. Vorlage: `Sprint-Report-TEMPLATE.md` → `Sprint-Report-<Name>.md`
2. PDF erzeugen: `npm run sprint-report:pdf -- Sprint-Report-<Name>`
3. Dateiname in `src/app/api/downloads/sprint-reports/[file]/route.ts` → `ALLOWED` ergänzen
4. Eintrag in **dieser Datei** ergänzen
5. `CHANGELOG.md` aktualisieren

---

## Warum Downloads vorher nicht funktionierten

Die Links zeigten auf `main`, die Dateien lagen nur auf dem Feature-Branch → **404**.  
Fix: PDFs in `public/downloads/sprint-reports/` + Merge nach `main`.
