# Backup System Report

## Was wurde umgesetzt

Panda-Bande hat ein **manuelles Admin-Backup** erhalten:

- **Pfad:** Admin → Einstellungen → Systemstatus → **Backup**
- **Aktion:** Button „Backup herunterladen“
- **Format:** ZIP-Archiv mit JSON + CSV pro Tabelle
- **API:** `GET /api/admin/backup/export` (nur für Admins mit `settings:write`)

Technische Bausteine:

| Datei | Zweck |
|-------|--------|
| `lib/admin/backup-export.ts` | Daten sammeln, ZIP erzeugen, `backup-info.json` |
| `lib/admin/sanitize-export.ts` | Secrets entfernen, CSV-Hilfe |
| `src/app/api/admin/backup/export/route.ts` | Geschützter Download-Endpunkt |
| `components/admin/settings/SystemSettingsShell.tsx` | Unter-Reiter Systemstatus / Backup |
| `components/admin/settings/SystemBackupPanel.tsx` | Laien-UI mit Erklärung und Download |
| `scripts/backup-test.mjs` | Statische Smoke-Tests (`npm run test:backup`) |

---

## Welche Tabellen werden gesichert

| ZIP-Datei | Datenbank-Quelle |
|-----------|------------------|
| `settings.json` | `site_settings` (als normalisiertes Settings-Bundle) |
| `booking_requests.json` / `.csv` | `booking_requests` |
| `customers.json` / `.csv` | `crm_customers` |
| `reviews.json` / `.csv` | `reviews` |
| `gallery_items.json` / `.csv` | `gallery_images` |
| `blog_posts.json` / `.csv` | `cms_posts` |
| `quotes.json` / `.csv` | `crm_quotes` + `crm_quote_items` (Positionen verschachtelt) |
| `invoices.json` / `.csv` | `crm_invoices` + `crm_invoice_items` (Positionen verschachtelt) |
| `email_templates.json` / `.csv` | `email_templates` |
| `email_logs.json` / `.csv` | `email_logs` |
| `backup-info.json` | Metadaten (Datum, Domain, Version, Zähler, Warnungen) |

**Dateiname:** `panda-bande-backup-YYYY-MM-DD-HH-mm.zip`

---

## Welche Daten werden bewusst ausgeschlossen

Nicht exportiert:

- `admin_users`, `admin_sessions`, `admin_roles` und andere Auth-/Sicherheitstabellen
- Passwörter und Passwort-Hashes (`password_hash`, `totp_secret`, `token_hash`, …)
- API-Keys, Tokens, Session-Daten
- Umgebungsvariablen (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, …)
- Binärdateien aus Storage (Galerie-Bilder, PDFs) — nur Metadaten/Pfade in JSON

Felder mit sensiblen Schlüsselnamen werden im Export als `[REDACTED]` ersetzt.

---

## Wie Admin das Backup nutzt

1. Im Admin einloggen (Benutzer mit Schreibrecht für Einstellungen).
2. **Einstellungen → Systemstatus → Backup** öffnen.
3. Kurze Erklärung lesen.
4. **„Backup herunterladen“** klicken.
5. ZIP lokal sichern (z. B. Cloud-Speicher, externes Laufwerk).

Nach erfolgreichem Export: Toast **„Backup wurde erstellt.“**

Bei Teilproblemen (z. B. fehlende Tabelle): ZIP wird trotzdem erstellt, Warnungen stehen in `backup-info.json` und in der UI.

---

## Grenzen dieses Backups

- **Kein vollständiges Datenbank-Backup** — nur ausgewählte CMS-/CRM-Tabellen.
- **Kein Restore** — Import/Wiederherstellung ist nicht Teil dieses Features.
- **Keine Medien-Dateien** — Bilder/PDFs müssen separat aus Supabase Storage gesichert werden.
- **Keine E-Mail-Alias-Tabelle** (`email_aliases`) — kann bei Bedarf später ergänzt werden.
- Abhängig von Supabase Free: bei sehr großen Datenmengen kann der Export länger dauern oder speicherintensiv sein.

---

## Empfehlung für Supabase Pro später

Auf **Supabase Pro** empfiehlt sich zusätzlich:

1. **Automatische tägliche Projekt-Backups** (PITR / managed backups) aktivieren.
2. Dieses Panda-Bande-Backup weiterhin **wöchentlich manuell** als leicht lesbare Sicherung (JSON/CSV) nutzen.
3. Storage-Buckets (`gallery`, `reviews`, `site-assets`) separat versionieren oder spiegeln.
4. Restore-Tests mindestens einmal pro Quartal durchführen.

Das manuelle Backup bleibt sinnvoll als **schnell exportierbare, menschenlesbare Kopie** — auch mit Pro-Tarif.

---

## Tests & Build

```bash
npm run test:backup
npm run lint
npm run typecheck
npm run build
```

Abgedeckte Prüfungen (`test:backup`):

- Export-Route und Dateien vorhanden
- `settings:write`-Schutz aktiv
- Alle geforderten ZIP-Dateien konfiguriert
- Keine Auth-Tabellen im Export
- Keine eingebetteten ENV-Secrets
- UI-Meldungen für Erfolg und Teilausfall
