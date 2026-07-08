# Admin PWA + Action Popups + Mobile Polish Fix Report

**Date:** 2026-07-08  
**Branch:** `cursor/admin-pwa-action-popups-mobile-e022`

## 1. PWA — Warum `beforeinstallprompt` fehlte

### Diagnose (technisch alles OK, Prompt fehlt)

Wenn Manifest, Service Worker, Icons und HTTPS als **OK** angezeigt werden, der **Install-Prompt** aber fehlt, liegt es fast immer an einem dieser Punkte:

| Ursache | Erklärung |
|---------|-----------|
| **SW kontrolliert Seite nicht** (`sw_not_controlling`) | Chrome feuert `beforeinstallprompt` nur, wenn der Service Worker die **aktuelle Seite kontrolliert**. Nach der ersten Registrierung ist `navigator.serviceWorker.controller` oft noch `null` — erst nach Reload. |
| **Chromes Engagement-Heuristik** (`prompt_pending`) | Alle technischen Kriterien erfüllt, aber Chrome zeigt den Prompt noch nicht (häufig: erneuter Besuch, längere Nutzung, nicht im In-App-Browser). |
| **Prompt zuvor abgelehnt** | Nutzer hat „Nicht installieren“ gewählt — Chrome unterdrückt den Prompt für eine Weile. |
| **Bereits installiert** | App ist schon auf dem Startbildschirm. |
| **Kein Chrome Android** | z. B. Firefox, Samsung Internet ohne Prompt-API, Instagram-In-App-Browser. |

### Konkrete Reparaturen

1. **Service Worker nach `/admin/sw.js`** verschoben — natürlicher Scope `/admin/`
2. **Frühe Registrierung** auf allen `/admin`-Seiten (auch Login)
3. **Auto-Reload einmalig** nach SW-Aktivierung, wenn die Seite noch nicht kontrolliert wird
4. **Manifest** mit absoluter `start_url`, `scope: "/admin/"`, `id`, `prefer_related_applications: false`
5. **`explainPwaBlockers()`** — zeigt im Dashboard genau **warum** der Prompt fehlt (nicht nur „Fehlt“)
6. **Installationshilfe** als sauberes Overlay-Modal (kein verschwommenes Sheet)
7. **„Installationsstatus prüfen“** lädt SW neu, prüft SW-Kontrolle, MIME-Type der Icons

## 2. Einheitliche Aktions-Popups

### Neues System

| Komponente | Zweck |
|------------|-------|
| `AdminOverlayModal` | Basis-Modal (z-index 220, Body-Lock, sticky Footer) |
| `AdminActionResultModal` | Erfolg / Fehler / Warnung mit Icon + optionalen Details |
| `AdminActionConfirmModal` | Bestätigung für gefährliche Aktionen + „wird protokolliert“ |
| `AdminActionFeedbackProvider` | Zentraler Provider mit `showResult`, `confirm`, `runAction` |
| `ACTION_RESULTS` | Deutsche Preset-Meldungen |

### Migrierte Views (11 Dateien)

- InvitesView, UsersView, AdminUserManageDialog
- BookingsView, CustomersView
- ReviewsView, GalleryView
- QuotesView, InvoicesView
- EmailsView, TeamView

**Wichtige Aktionen mit Result-Modal:** Einladen, Erstellen, Speichern, Senden, Archivieren, Löschen, Freigeben, Link kopieren, E-Mail-Test, 2FA zurücksetzen u. a.

**Gefährliche Aktionen mit Confirm-Modal:** Löschen, Archivieren, Widerrufen, Deaktivieren, Stornieren.

## 3. Mobile Modals

- `z-index: 220` — über Bottom Nav und FAB
- `html[data-admin-overlay-modal="open"]` versteckt Bottom Nav / FAB / Mobile Header
- Weniger Backdrop-Blur (bessere Lesbarkeit)
- `max-height` + interner Scroll + sticky Footer
- Safe-Area-Padding für 360/390/430px

## 4. Öffentliche Website

### Hamburger-Menü
- Bereits gefixt: `site-header-menu-btn`, 44×44px, `overflow-visible`, Safe-Area rechts

### Mobile Leerraum (weitere ~25–40 % Reduktion)
- Basis `.section-padding`: `0.75rem`
- Sektionen inkl. `#ablauf`, `#galerie`, `#warum-panda-bande`: `0.625rem` Padding
- `--section-header-gap`: `0.75rem`

## 5. Tests

```bash
npm run test:admin-pwa-action-popups  # 8/8
npm run test:admin-pwa-install        # (bestehend)
npm run lint                          # ✓
npm run typecheck                     # ✓
npm run build                         # ✓
```

## 6. Manuelle QA-Checkliste

- [ ] Chrome Android: Status prüfen → Diagnose zeigt konkrete Blocker
- [ ] Nach erstem Besuch: Auto-Reload → SW kontrolliert Seite → Prompt erscheint ggf.
- [ ] Benutzer einladen → Result-Modal
- [ ] Anfrage archivieren/löschen → Confirm + Result
- [ ] Modal auf 360px: Buttons nicht abgeschnitten
- [ ] Website Hamburger vollständig sichtbar
- [ ] Weniger Scrollweg zwischen Sektionen
