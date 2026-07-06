# Panda-Bande Checkpoint v1.0

**Version:** `v1.0-checkpoint`  
**Datum:** 2026-07-06  
**Zweck:** Sicherung, Wiederherstellung und Übergabe — keine Secrets in diesem Ordner.

## Was ist hier?

| Datei | Inhalt |
|-------|--------|
| `DATABASE_BACKUP_GUIDE.md` | Datenbank sichern (Schema + Daten) |
| `STORAGE_BACKUP_GUIDE.md` | Bilder und Dateien aus Supabase Storage sichern |
| `ENV_BACKUP_TEMPLATE.md` | Platzhalter für Umgebungsvariablen (keine echten Keys!) |
| `RESTORE_CHECKLIST.md` | Schritt-für-Schritt Wiederherstellung |
| `TEST_CHECKLIST.md` | Kurz-Checkliste nach Restore |

## Zugehörige Projekt-Dokumente (Repository-Root)

- `PROJECT_MASTER_GUIDE.md` — Einstieg für Nicht-Techniker
- `SUPABASE_RESTORE_GUIDE.md` — Supabase neu aufsetzen
- `TECHNICAL_RUNBOOK.md` — Für Entwickler
- `CHECKPOINT_V1_SUMMARY.md` — Status dieses Checkpoints

## Export-Skripte

```bash
# CMS-Daten als JSON (benötigt .env.local mit Supabase)
node scripts/export-cms.mjs > backups/checkpoint-v1/cms-export.json

# CRM-Daten als JSON
node scripts/export-crm.mjs > backups/checkpoint-v1/crm-export.json
```

**Hinweis:** Exporte manuell speichern und sicher aufbewahren. Nicht in Git committen, wenn sie personenbezogene Daten enthalten.

## Git-Tag (optional)

```bash
git tag v1.0-checkpoint
git push origin v1.0-checkpoint
```
