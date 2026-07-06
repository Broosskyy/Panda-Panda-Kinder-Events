# Storage-Backup — Anleitung

## Buckets

| Bucket | Inhalt | Öffentlich |
|--------|--------|------------|
| `gallery` | Galerie-Bilder | Ja (Lesezugriff) |
| `reviews` | Bewertungsfotos | Ja |
| `site-assets` | CMS-Assets (Hero, Logo, …) | Ja |

## Option A: Supabase Dashboard

1. **Storage** → Bucket wählen
2. Ordner/Dateien markieren → Download (einzeln oder als ZIP je nach UI)

## Option B: Supabase CLI

```bash
# CLI installieren und einloggen
supabase login
supabase storage cp -r ss://gallery ./backup/gallery --project-ref YOUR_PROJECT_REF
supabase storage cp -r ss://reviews ./backup/reviews --project-ref YOUR_PROJECT_REF
supabase storage cp -r ss://site-assets ./backup/site-assets --project-ref YOUR_PROJECT_REF
```

## Option C: Skript (API)

Metadaten stehen in `gallery_images` (Tabelle). Bild-URLs in CMS-JSON (`site_settings`).  
Nach DB-Restore: Pfade in `gallery_images.storage_path` zeigen auf Bucket-Dateien.

## Wiederherstellung

1. Buckets anlegen (Migration `20260704_storage_buckets_public.sql` oder Dashboard)
2. Dateien hochladen (gleiche Pfade wie `storage_path`)
3. Website und Admin-Galerie prüfen

## Hinweis zu PDFs

Angebots- und Rechnungs-PDFs werden **on-the-fly** generiert (`pdf-lib`), nicht dauerhaft in Storage gespeichert.  
Backup der **CRM-Daten** reicht zur Wiedererstellung von PDFs.
