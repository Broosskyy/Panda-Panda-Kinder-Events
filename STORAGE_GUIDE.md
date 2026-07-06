# Storage — Anleitung

## Buckets

| Bucket | Verwendung | Öffentlich? |
|--------|------------|-------------|
| `gallery` | Galerie-Bilder auf der Website | Ja (nur Lesen) |
| `reviews` | Fotos zu Bewertungen | Ja |
| `site-assets` | Hero, Logo, CMS-Uploads | Ja |

## Upload im Admin

1. **Galerie:** Admin → Galerie → Bild hochladen  
2. **Bewertungen:** Admin → Bewertungen → Bild-URLs  
3. **CMS:** Admin → Inhalte / Upload-API → `site-assets`

Technisch: `POST /api/admin/upload` → Supabase Storage + DB-Eintrag (`gallery_images`).

## URLs

Öffentliche Dateien:  
`https://[PROJECT].supabase.co/storage/v1/object/public/[bucket]/[path]`

## Sicherheit

| Erlaubt öffentlich | Nicht öffentlich |
|--------------------|------------------|
| Galerie-, Review-, Marketing-Bilder | Service Role Key |
| | Admin-Session-Tokens |
| | Passwort-Hashes |

Upload erfolgt **nur** über authentifizierte Admin-API (nicht direkt vom Browser mit anon key).

## Backup

Siehe `backups/checkpoint-v1/STORAGE_BACKUP_GUIDE.md`

## Wiederherstellung

1. Buckets neu anlegen (Migration oder Dashboard)
2. Dateien mit **gleichen Pfaden** hochladen wie in `gallery_images.storage_path`
3. CMS-JSON in `site_settings` prüfen (imageUrl-Felder)

## PDFs

CRM-PDFs werden **nicht** in Storage gespeichert — bei Bedarf aus CRM-Daten neu generieren.
