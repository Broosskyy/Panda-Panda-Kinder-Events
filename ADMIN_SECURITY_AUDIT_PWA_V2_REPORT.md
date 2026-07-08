# Admin Security + Audit + PWA V2 (2026)

## Zusammenfassung

Der Adminbereich wurde auf Enterprise-Niveau für **Sicherheit**, **Nachvollziehbarkeit** und **installierbare PWA** erweitert. Alle sicherheitsrelevanten Aktionen werden asynchron mit Client-Kontext protokolliert. Neue Sicherheitsseiten (Sicherheitscenter, Login-Historie, Sessions) bieten Übersicht und Steuerung. Nur `/admin` ist als standalone PWA installierbar; nach Logout wird die PWA gesperrt.

**Branch:** `cursor/admin-security-audit-pwa-v2-e022`

---

## 1. Audit Log

### Infrastruktur

| Komponente | Beschreibung |
|------------|--------------|
| `lib/auth/audit.ts` | Asynchrones `queueAuditLog` mit Retry; Sanitisierung von Passwörtern/Tokens |
| `lib/auth/request-context.ts` | IP-Maskierung, UA-Parsing, grobe Geo (Vercel/CF-Header) |
| `lib/auth/audit-admin.ts` | Helper `auditAdminRequest()` |
| Migration `20260730_security_audit_pwa_v2.sql` | Geo/Device-Spalten für Audit + Login-Historie |

### Protokollierte Felder

Benutzer, Rolle, Zeitstempel, maskierte IP, Land/Region/Stadt (grob), Browser, OS, Gerät, User-Agent, Aktion, Bereich, Objekt-ID, Vorher/Nachher (sanitisiert), Erfolg/Fehler.

**Nicht gespeichert:** Passwörter, Tokens, Secrets.

### Abgedeckte Aktionen

| Bereich | Aktionen |
|---------|----------|
| Auth | `login`, `login_failed`, `logout`, `password_reset`, `password_reset_requested` |
| Benutzer | `create`, `update`, `delete`, `activate`, `deactivate`, `role_change`, `password_change` |
| Security | `2fa_enable`, `2fa_disable`, `revoke_session`, `revoke_other_sessions`, `permissions_changed` |
| CRM | `quote_created`, `quote_updated`, Angebots-/Rechnungs-Lifecycle via `logCrmAudit` |
| Website | `content_updated`, Galerie/Blog/Bewertungen/FAQ/Services |
| Einstellungen | `settings_updated`, `module_toggle` |
| Backup/Export | `export` (Backup, Audit, Analytics) |

---

## 2. Login-Historie

**Seite:** `/admin/sicherheit/login-historie`

- Anzeige: Benutzer, Rolle, IP (maskiert), Standort, Browser/OS/Gerät, Zeit, Erfolg/Fehler
- Filter: Benutzer-ID, Zeitraum, IP, Gerät, Erfolg
- API: `GET /api/admin/security/login-history`

---

## 3. Sicherheitscenter

**Seite:** `/admin/sicherheit`

- Aktive Sessions (Top 5)
- Sicherheits-Chips: 2FA-Status, Session-Anzahl, erfolgreiche Logins
- Warnungen: 2FA aus, fehlgeschlagene Logins, viele Geräte, Systemstatus
- Schnellzugriff: Login-Historie, Audit, 2FA, Benutzer
- API: `GET /api/admin/security/center`

---

## 4. Sessions

**Seite:** `/admin/sicherheit/sitzungen`

- Alle Sessions mit Gerätelabel und „dieses Gerät“-Markierung
- **Andere Geräte abmelden** / **Alle Geräte abmelden**
- **Einzelne Session beenden** (neu)
- API: `GET/POST /api/admin/security/sessions`

---

## 5. PWA (nur Admin)

| Eigenschaft | Wert |
|-------------|------|
| Name | Panda-Bande Admin |
| Manifest | `/admin/manifest.webmanifest` |
| Scope | `/admin` |
| Display | `standalone` |
| Service Worker | `/admin-sw.js` (scope `/admin`) |
| Offline | Shell via `/offline` |
| Install-Hinweis | `AdminPwaRegister` Banner |

Öffentliche Website: `manifest.ts` mit `display: "browser"` — nicht installierbar.

### PWA-Schutz

- Service Worker reagiert nur auf `/admin`-Pfade
- `LOCK_PWA`-Message löscht Caches bei Logout
- `lockAdminPwa()` wird in `AdminSidebar` nach Logout aufgerufen

---

## 6. Serversicherheit

- `requireAdmin()` prüft Berechtigungen serverseitig
- Freundliche Fehlermeldung: *„Du hast für diesen Bereich keine Berechtigung.“* (403 JSON, keine technische Fehlerseite)

---

## 7. Performance

- Audit-Schreibvorgänge blockieren keine API-Response (`queueAuditLog` + `void`)
- Ein Retry nach 250 ms bei Fehlern
- Fehler werden geloggt, Request schlägt nicht fehl

---

## 8. Datenschutz

- IP: letztes Oktett maskiert (`xxx`)
- Geo: nur Header-basiert (Land/Region/Stadt), keine GPS
- Keine sensiblen Felder in Audit-Payloads

---

## 9. Push-Benachrichtigungen

**Status:** Optional — nicht in diesem Sprint implementiert. Bestehendes In-App-Benachrichtigungssystem (`AdminNotificationCenter`) bleibt aktiv.

---

## 10. Tests

```bash
npm run test:security   # 36 statische Checks
npm run lint            # ✓
npm run typecheck       # ✓
npm run build           # ✓
```

`scripts/security-audit-pwa-test.mjs` prüft:

- Audit-Infrastruktur + Sanitisierung
- Login/Logout-Audit
- PWA-Manifest + Service Worker + Logout-Lock
- Audit auf Kern-API-Routen
- Migration-Spalten

---

## 11. Geänderte / neue Dateien

### Neu

- `lib/auth/request-context.ts`
- `lib/auth/audit-admin.ts`
- `components/admin/AdminPwaRegister.tsx`
- `components/admin/views/SecurityCenterView.tsx`
- `public/admin-sw.js`
- `src/app/admin/manifest.webmanifest/route.ts`
- `src/app/api/admin/security/center/route.ts`
- `supabase/migrations/20260730_security_audit_pwa_v2.sql`
- `scripts/security-audit-pwa-test.mjs`

### Erweitert

- Audit auf: gallery, reviews, posts, quotes, invoices, faqs, services, team, bootstrap, password-reset, analytics export, settings (alle Sektionen)
- Security-Routen: `writeAuditLogFromRequest` mit IP/Geo/Device
- `LoginHistoryView`, `AuditView`, `SessionsView`, `AdminSidebar`
- `globals.css` — PWA-Install-Banner

---

## 12. Deployment-Hinweise

1. Migration ausführen: `20260730_security_audit_pwa_v2.sql`
2. Nach Deploy: Login testen → Audit-Eintrag prüfen
3. PWA: Chrome → `/admin` → Installieren (nur nach Login sichtbar)

---

## Ergebnis

| Kriterium | Status |
|-----------|--------|
| Audit Log vollständig | ✓ |
| Login-Historie | ✓ |
| Sicherheitscenter | ✓ |
| Sessions (inkl. Einzel-Revoke) | ✓ |
| Admin-PWA | ✓ |
| PWA Logout-Sperre | ✓ |
| Serverseitige Rechte | ✓ |
| lint / typecheck / build | ✓ |
