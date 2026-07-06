# Vollständige Test-Checkliste

**Checkpoint v1.0-checkpoint**

## Build & Code

- [x] `npm run lint` — ohne Fehler
- [x] `npm run typecheck` — ohne Fehler
- [x] `npm run build` — erfolgreich
- [x] `npm run test:crm` — 6/6 bestanden

## Öffentliche Website

- [ ] Startseite lädt (`/`)
- [ ] Header & Navigation
- [ ] Hero sichtbar
- [ ] Leistungen-Sektion
- [ ] Galerie
- [ ] Bewertungen
- [ ] FAQ (Akkordeon)
- [ ] Kontaktformular absenden
- [ ] Footer & Impressum/Datenschutz
- [ ] Mobile Ansicht (schmales Fenster)
- [ ] Desktop Ansicht

## Admin — Zugang

- [ ] Admin Login (Passwort)
- [ ] Login mit Benutzername/E-Mail (Multi-User)
- [ ] 2FA Code (wenn aktiv)
- [ ] Logout
- [ ] Passwort-Reset-Flow (Staging)

## Admin — Bereiche

- [ ] Dashboard lädt
- [ ] Website → Inhalte speichern
- [ ] Website → Team anlegen/bearbeiten
- [ ] Leistungen CRUD
- [ ] Galerie Upload
- [ ] FAQ CRUD
- [ ] Beiträge CRUD
- [ ] Bewertungen freigeben
- [ ] Anfragen Status ändern
- [ ] Kunde anlegen
- [ ] Angebot erstellen
- [ ] Rechnung erstellen
- [ ] PDF öffnet (Angebot/Rechnung)
- [ ] E-Mail Test senden
- [ ] Benutzer anlegen
- [ ] Rolle ändern
- [ ] 2FA einrichten
- [ ] Audit Log Eintrag sichtbar
- [ ] Einstellungen (Firma, E-Mail)

## Daten

- [ ] Speichern persistiert nach Reload
- [ ] Bearbeiten funktioniert
- [ ] Löschen/Archivieren
- [ ] Sichtbarkeit Team → Website
- [ ] Sortierung/Reihenfolge

## Backup & Doku

- [x] Backup-Anleitungen vorhanden (`backups/checkpoint-v1/`)
- [x] Restore-Anleitung vorhanden
- [x] PROJECT_MASTER_GUIDE.md
- [x] Export-Skripte (`export:cms`, `export:crm`)

---

**Hinweis:** Checkboxen mit [x] wurden im Checkpoint-Lauf automatisch verifiziert (Build/Tests). Manuelle UI-Tests in Produktion/Staging durch Betreiber abhaken.
