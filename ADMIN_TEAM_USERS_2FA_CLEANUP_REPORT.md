# Admin Team / Users / 2FA Cleanup — Report

**Datum:** 2026-07-06  
**Branch:** `cursor/admin-team-users-cleanup-e022`  
**Version:** `1.0.0-rc.2`

## Zusammenfassung

Klare Trennung zwischen **öffentlichem Team** (Website) und **Admin-Benutzern** (Login). Navigation aufgeräumt, 2FA-Einrichtung im Admin verständlich und voll nutzbar.

---

## Team vs. Benutzer

| | **Team** (öffentlich) | **Benutzer** (Admin) |
|---|---|---|
| **Pfad** | Website → Team | Sicherheit → Benutzer & Rollen |
| **Zweck** | Sichtbare Personen auf der Website | Dashboard-Login & Rechte |
| **Login** | Nein | Ja (Passwort + optional 2FA) |
| **Pflichtfelder** | Name, Position, Sichtbar | Benutzername, E-Mail, Anzeigename, Rolle, Passwort (neu) |
| **Daten** | `team_members` → sync → CMS `publicTeam` | `admin_users` |

### Optionale Verknüpfung

`admin_users.team_member_id` verknüpft einen Admin-Benutzer optional mit einem öffentlichen Teammitglied — ohne Login-Rechte für das Teammitglied.

---

## Navigation (neu)

- **Website:** Inhalte, Leistungen, Galerie, Beiträge, FAQ, **Team**
- **Sicherheit:** Benutzer & Rollen, 2FA, Sitzungen, Login-Historie, Aktivitätsprotokoll
- **Einstellungen:** Unternehmensdaten, E-Mail, System (Tabs)

`/admin/benutzer` leitet auf `/admin/sicherheit/benutzer` um.

---

## 2FA — Wo und wie

**Pfad:** Sicherheit → 2FA (`/admin/sicherheit/2fa`)

**Ablauf:**
1. Status: Aktiv / Nicht aktiv
2. „2FA einrichten“ → QR-Code + Secret (Text-Fallback)
3. 6-stelligen Code eingeben → „2FA aktivieren“
4. Backup-Codes anzeigen, kopieren, herunterladen
5. Backup-Codes neu generieren (mit 2FA-Code)
6. Deaktivieren mit Passwortbestätigung

**Login:** Nach Passwort wird bei aktivierter 2FA der Code abgefragt. Option „Diesem Gerät 30 Tage vertrauen“ bleibt im Login-Formular.

**Hinweis:** 2FA ist verfügbar, sobald mindestens ein `admin_users`-Eintrag existiert (nicht im Legacy-Einzelpasswort-Modus).

---

## Rollen

| Rolle | Kurzbeschreibung |
|-------|------------------|
| Administrator | Alles |
| Manager | CRM + Kommunikation + Website |
| Redakteur | Website-Inhalte, Beiträge, Galerie, FAQ, Leistungen |
| Mitarbeiter | Website + CRM (eingeschränkt) |
| Buchhaltung | Kunden, Angebote, Rechnungen |
| Nur Lesen | Alles ansehen, nichts ändern |

Erklärungen in der Benutzer-Verwaltung als Rollenübersicht.

---

## Öffentliche Website

- Team-CRUD synchronisiert automatisch nach CMS `publicTeam`
- Sichtbare Mitglieder (`active: true`) erscheinen in der About-Sektion
- Keine Änderung an der öffentlichen Komponenten-Struktur — nur Datenquelle konsolidiert
- Team-Bearbeitung aus „Inhalte“ entfernt → Verweis auf Website → Team

---

## Migration

`supabase/migrations/20260713_team_users_cleanup.sql`
- `admin_users.team_member_id` (optional FK)
- `team_members.email` optional

---

## Audit-Log (erweitert)

- `public_team`: create, update, deactivate, archive, delete
- `admin_users`: create, update, activate, deactivate, role_change, password_reset
- `security`: 2fa_enable, 2fa_disable, 2fa_backup_regenerate

Keine Passwörter oder Secrets im Log.

---

## Getestet

- `npm run lint` — 0 Fehler
- `npm run typecheck` — OK
- `npm run build` — OK (60 Routen inkl. Sicherheits-Unterrouten)

### Manuelle Test-Checkliste

- [ ] Teammitglied anlegen → auf Website sichtbar wenn „Sichtbar“
- [ ] Benutzer anlegen → Login
- [ ] 2FA einrichten (QR + Code)
- [ ] Login mit 2FA
- [ ] Backup-Code-Login
- [ ] 2FA deaktivieren mit Passwort
- [ ] Audit-Einträge sichtbar unter Aktivitätsprotokoll

---

## Offene Punkte

- Permission-basierte Sidebar-Ausblendung (UI)
- Security-Policy-Einstellungen (Passwortregeln) — API existiert, UI unter System optional nachrüstbar
