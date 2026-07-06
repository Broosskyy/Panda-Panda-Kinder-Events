# Security & Administration Sprint v1.0 — Report

**Datum:** 2026-07-06  
**Branch:** `cursor/security-admin-v1-e022`  
**Version:** `1.0.0-rc.1`

## Zusammenfassung

Production-ready Admin-Authentifizierung mit Multi-User-System, rollenbasierter Berechtigung, 2FA (TOTP), Audit-Logs, Login-Historie, Session-Management und vollständig repariertem Team-CRUD. Legacy-Login (`ADMIN_PASSWORD`) bleibt aktiv, solange keine `admin_users` existieren.

## 1. Team Bugfix

- **Ursache:** Fehlende/fehlerhafte DB-Tabelle oder unbehandelte Supabase-Fehler → 500
- **Fix:** Graceful Fallback (`configured: false`, leere Liste), erweiterte Felder, Sortierung nach `sort_order`
- **Felder:** Vorname, Nachname, Benutzername, Anzeigename, Titel, Position, Beschreibung, Profilbild, Telefon, Social Links, Reihenfolge, Aktiv, Archivieren
- **API:** `GET/POST/PATCH/DELETE /api/admin/team` mit `team:write` Berechtigung

## 2. Neue Datenbank-Tabellen

| Tabelle | Zweck |
|---------|-------|
| `admin_roles` | 6 Systemrollen |
| `admin_permissions` | 22 granulare Rechte |
| `admin_role_permissions` | Rollen ↔ Rechte |
| `admin_users` | Benutzer mit bcrypt-Hash, 2FA |
| `admin_sessions` | HttpOnly-Session-Tokens (gehasht) |
| `admin_login_history` | Login-Erfolg/Fehler, Browser/OS/IP-Hash |
| `admin_audit_logs` | Aktivitätsprotokoll |
| `admin_password_resets` | Einmal-Reset-Tokens (1h) |
| `admin_backup_codes` | 10 2FA-Backup-Codes |
| `admin_security_settings` | Passwort-/Login-/Rate-Limit-Policies |
| `team_members` | Erweitert um 11 neue Spalten |

**Migration:** `supabase/migrations/20260712_security_admin_v1.sql` (idempotent)

## 3. Rollen & Rechte

| Rolle | Slug |
|-------|------|
| Administrator | `administrator` |
| Manager | `manager` |
| Mitarbeiter | `employee` |
| Redakteur | `editor` |
| Buchhaltung | `accounting` |
| Nur Lesen | `readonly` |

**Beispiel-Rechte:** `dashboard:read`, `website:write`, `crm:read`, `users:write`, `security:write`, `audit:read`, `team:write`, …

Serverseitige Prüfung via `requireAdmin(permission)` in allen geschützten APIs.

## 4. Authentifizierung

- Login mit **Benutzername ODER E-Mail** + Passwort
- **Angemeldet bleiben** (längere Session)
- **Passwort vergessen** per E-Mail (`/admin/passwort-reset`)
- **2FA TOTP** (Google/Microsoft Authenticator) mit QR-Code
- **10 Backup-Codes**, neu generierbar
- **„Diesem Gerät 30 Tage vertrauen“**
- **Legacy-Fallback:** Einzel-Passwort wenn `admin_users` leer

## 5. Sicherheit

| Maßnahme | Implementierung |
|----------|-----------------|
| Passwort-Hash | bcrypt (12 Rounds) |
| Cookies | HttpOnly, Secure (prod), SameSite=Lax |
| Rate Limiting | IP-basiert (Login + Reset) |
| Account Lockout | Nach N Fehlversuchen |
| Session Rotation | Token-Hash in DB |
| CSRF | SameSite Cookies + Server-only Session |

## 6. Neue APIs

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/admin/login` | GET/POST/DELETE | Login, 2FA, Session-Status, Logout |
| `/api/admin/users` | GET/POST/PATCH | Benutzerverwaltung |
| `/api/admin/auth/bootstrap` | POST | Erster Admin (Legacy-Passwort) |
| `/api/admin/password-reset/request` | POST | Reset-E-Mail |
| `/api/admin/password-reset/confirm` | POST | Neues Passwort setzen |
| `/api/admin/security/settings` | GET/PUT | Sicherheitseinstellungen |
| `/api/admin/security/2fa` | GET/POST | 2FA Setup/Verify/Disable |
| `/api/admin/security/sessions` | GET/POST | Aktive Sitzungen |
| `/api/admin/security/login-history` | GET | Login-Historie |
| `/api/admin/security/audit` | GET | Audit-Log |

## 7. Admin UI

| Bereich | Route |
|---------|-------|
| Benutzer | `/admin/benutzer` |
| Sicherheit | `/admin/sicherheit` |
| Team (erweitert) | `/admin/team` |
| Passwort-Reset | `/admin/passwort-reset` |
| Dashboard | Neue Karten: Aktive Benutzer, Logins, Systemstatus |

## 8. Lib-Module (`lib/auth/`)

- `password.ts`, `session.ts`, `users.ts`, `permissions.ts`
- `totp.ts`, `audit.ts`, `login-history.ts`
- `security-settings.ts`, `context.ts`, `password-reset.ts`

## 9. Build-Status

- `npm run lint` — 0 Fehler
- `npm run typecheck` — OK
- `npm run build` — OK (55 Routen)

## 10. Offene TODOs

1. **Migration in Produktion ausführen** — `20260712_security_admin_v1.sql` via Supabase
2. **Ersten Admin anlegen** — `POST /api/admin/auth/bootstrap` oder UI unter Benutzer
3. **Argon2id** — aktuell bcrypt; Upgrade wenn native Lib verfügbar
4. **Persistenter Rate-Limiter** — aktuell in-memory (serverless-lokal)
5. **Audit-Hooks** — weitere CMS/CRM-Routen mit `writeAuditLog` instrumentieren
6. **E-Mail Domain** — Resend-Domain in Produktion verifizieren für Reset-Mails
7. **Permission-basierte Nav** — Sidebar nach Rolle filtern (UI)

## 11. Keine Regressionen

- Legacy `ADMIN_PASSWORD`-Login unverändert nutzbar
- Öffentliche Website, CRM, CMS-Routen unverändert
- Bestehende Team-Daten (`name`, `email`, `role`) bleiben erhalten
