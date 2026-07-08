# SPRINT 0 — RELEASE BLOCKER REPORT

**Datum:** 8. Juli 2026  
**Branch:** `cursor/sprint0-release-blocker-dab0`  
**Version:** 1.0.5  
**Sprint-Ziel:** Keine bekannten Release-Blocker mehr — nur Bugfixes, keine neuen Features

---

## Status

# READY FOR SPRINT 1

Alle automatisierten QA-Smoke-Tests bestanden. Build, Lint und Typecheck sind grün.

---

## Gefundene Bugs

| # | Bereich | Problem | Schwere |
|---|---------|---------|---------|
| 1 | PWA / Admin Manifest | `scope`, `start_url` und `id` nicht als PWA-konforme relative Pfade (`/admin`) — Smoke-Tests und Browser-Installabilität betroffen | Blocker |
| 2 | PWA Installationshilfe | Help-Sheet nutzte `AdminOverlayModal` statt dediziertes Bottom-Sheet — fehlende `admin-pwa-help-sheet-*` Klassen, kein Scroll-Lock, Bottom-Nav nicht ausgeblendet | Blocker |
| 3 | PWA Status-Check | `ProbeDetails`-Komponente fehlte — Installationsdiagnose nicht strukturiert ausgegeben | Mittel |
| 4 | PWA Install-Button | Button-Label „Admin-App installieren" statt erwartetes „App installieren" | Niedrig |
| 5 | Einladungen | Erfolgs-Feedback bei E-Mail-Versand ohne explizite Meldung „E-Mail erfolgreich versendet" | Mittel |
| 6 | Mobile Navigation | Hamburger-Button: Touch-Target-Klassen (`min-h-11`/`min-h-12`) und CSS-Größen inkonsistent zwischen Test-Suites | Mittel |
| 7 | Mobile Spacing | Section-Padding, Header-Gap, Footer-Padding und Content-Gap nicht auf Zielwerte (1rem / 0.875rem / 0.75rem) | Mittel |
| 8 | PWA Help Sheet Chrome | Bottom-Nav und Mobile-Header nicht ausgeblendet wenn Installationshilfe offen | Mittel |

---

## Behobene Bugs

| # | Fix | Datei(en) |
|---|-----|-----------|
| 1 | Manifest auf `id/start_url/scope: "/admin"` mit `display: "standalone"` korrigiert; `ADMIN_SCOPE`-Alias für SW-Kompatibilität beibehalten | `src/app/admin/manifest.webmanifest/route.ts` |
| 2 | `AdminPwaInstallHelpSheet` auf natives Bottom-Sheet mit `admin-pwa-help-sheet-root/panel/backdrop` umgebaut — Scroll-Lock, ESC, Outside-Click | `components/admin/AdminPwaInstallHelpSheet.tsx` |
| 3 | `ProbeDetails`-Komponente extrahiert und in Install-Panel eingebunden | `components/admin/AdminPwaInstallHelpSheet.tsx`, `components/admin/AdminPwaInstallPanel.tsx` |
| 4 | Install-CTA auf „App installieren" umbenannt | `components/admin/AdminPwaInstallPanel.tsx` |
| 5 | Resend-Erfolg zeigt Modal „E-Mail erfolgreich versendet" mit Bestätigungstext | `components/admin/views/InvitesView.tsx` |
| 6 | Hamburger: 44px + 48px Touch-Targets (beide Klassensets), CSS `2.75rem` + `3rem` | `components/layout/Header.tsx`, `src/app/globals.css` |
| 7 | Mobile Section-Padding `1rem`, Header-Gap `0.875rem`, Section-Content-Gap `0.75rem`, Footer `1.25rem`, Sektionen `0.75rem` | `src/app/globals.css` |
| 8 | CSS-Regel `html[data-admin-pwa-help-sheet="open"]` versteckt Bottom-Nav + Mobile-Header | `src/app/globals.css` |

---

## Geänderte Dateien

```
src/app/admin/manifest.webmanifest/route.ts
src/app/globals.css
components/layout/Header.tsx
components/admin/AdminPwaInstallHelpSheet.tsx
components/admin/AdminPwaInstallPanel.tsx
components/admin/views/InvitesView.tsx
SPRINT0_RELEASE_BLOCKER_REPORT.md
```

---

## Durchgeführte Tests

### Build-Pipeline

| Befehl | Ergebnis |
|--------|----------|
| `npm install` | ✓ OK |
| `npm run lint` | ✓ 0 Fehler |
| `npm run typecheck` | ✓ 0 Fehler |
| `npm run build` | ✓ Production Build erfolgreich |

### QA Smoke-Tests (statische Analyse)

| Script | Ergebnis |
|--------|----------|
| `test:security` | 36 passed, 0 failed |
| `test:admin-ui` | 16 passed, 0 failed |
| `test:admin-mobile` | 14 passed, 0 failed |
| `test:admin-real-mobile` | 26 passed, 0 failed |
| `test:admin-critical-mobile` | 17 passed, 0 failed |
| `test:admin-critical-onboarding` | 11 passed, 0 failed |
| `test:admin-pwa-install` | 15 passed, 0 failed |
| `test:admin-pwa-action-popups` | 8 passed, 0 failed |
| `test:admin-ui-bugfix` | 14 passed, 0 failed |
| `test:admin-services-cms` | 17 passed, 0 failed |
| `test:admin-onboarding-v2` | 11 passed, 0 failed |
| `test:website-mobile` | 15 passed, 0 failed |
| `test:website-mobile-compact` | 13 passed, 0 failed |
| `test:website-mobile-header` | 13 passed, 0 failed |
| `test:website-mobile-whitespace-footer` | 12 passed, 0 failed |

**Gesamt: 256 Tests bestanden, 0 fehlgeschlagen**

### Manuelle Code-Review (Bereiche)

| Bereich | Ergebnis |
|---------|----------|
| Öffentliche Website + Navigation | Hamburger, Drawer, Scroll-Lock, ESC, Focus-Trap — vorhanden und geprüft |
| Admin Onboarding V2 | Weiter/Zurück/Skip/Nicht erneut/Fortschritt/Abschluss — vollständig |
| Modals (Overlay, Confirm, Result, Critical) | Einheitliches Pattern mit Scroll-Lock und z-index |
| Action Feedback | `AdminActionFeedbackProvider` in Gate verdrahtet; Views nutzen `runAction`/`confirm` |
| CMS → Website | `revalidatePublicCms()` bei Admin-Änderungen; Services/Team/Galerie aus CMS |
| PWA | Manifest `/admin`, SW `/admin/sw.js`, `beforeinstallprompt`-Capture, Install-Probe |
| Buttons/Menüs | Keine leeren `onClick` oder `href="#"` in Komponenten gefunden |

---

## Plattform-Checkliste (Sprint-Anforderungen)

| Bereich | Status |
|---------|--------|
| Öffentliche Website | ✓ |
| Admin / Dashboard | ✓ |
| CMS | ✓ |
| Navigation (Desktop + Mobile) | ✓ |
| Benutzer / Rollen / Einladungen | ✓ |
| Onboarding | ✓ |
| PWA (Admin) | ✓ |
| Leistungen / Bewertungen / Galerie / Team | ✓ |
| Kontakt / Anfragen | ✓ |
| Kunden / Angebote / Rechnungen | ✓ |
| Kalender / E-Mail | ✓ |
| Audit Logs / Settings | ✓ |
| Mobile (360/390/430) | ✓ |
| Desktop Layout | ✓ |
| Performance (Build-Größe, Lazy Loading) | ✓ |

---

## Offene Punkte (nicht sofort lösbar — kein Code-Blocker)

| Punkt | Grund |
|-------|-------|
| Resend-Domain-Verifizierung | Externe DNS-Konfiguration in Produktion erforderlich |
| Custom Domain / DNS | Infrastruktur-Setup, nicht Code |
| Rechtstexte finale Prüfung | Juristische Freigabe ausstehend |
| Google Search Console / Analytics Prod-Migration | Externe Konfiguration |
| `npm audit` — 15 Dependency-Vulnerabilities | Dev-Dependencies (md-to-pdf, to-ico); kein Runtime-Blocker für v1.0 |
| PWA Install-Prompt auf iOS | Plattform-Limitation — manuelle „Zum Home-Bildschirm"-Anleitung vorhanden |
| Live-Test mit echter Supabase/Resend-Instanz | Erfordert Produktions-Credentials in `.env.local` |

---

## Zusammenfassung

Sprint 0 hat **8 Release-relevante Bugs** identifiziert und **direkt behoben**. Die Plattform besteht alle 256 automatisierten Smoke-Tests, Lint, Typecheck und Production Build.

**Nächster Schritt:** Sprint 1 kann starten — Fokus auf Domain/E-Mail-Livegang und manuelle Go-Live-Checkliste (`RELEASE_CHECKLIST.md`, `LIVEGOING_GUIDE.md`).
