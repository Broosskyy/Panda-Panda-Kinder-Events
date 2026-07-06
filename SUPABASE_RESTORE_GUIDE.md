# Supabase — Wiederherstellung Schritt für Schritt

## 1. Neues Supabase-Projekt erstellen

1. [supabase.com](https://supabase.com) → New Project
2. Region wählen (EU empfohlen)
3. Datenbank-Passwort sicher notieren (Passwort-Manager)

## 2. SQL-Migrationen ausführen

1. Supabase → **SQL Editor**
2. Jede Datei aus `supabase/migrations/` **in Reihenfolge** öffnen und ausführen
3. Oder: Supabase CLI `supabase db push` (wenn CLI eingerichtet)

## 3. Storage Buckets anlegen

Migration `20260704_storage_buckets_public.sql` legt an:
- `gallery`, `reviews`, `site-assets` (public, 5MB, Bilder)

Manuell prüfen unter **Storage**.

## 4. Policies prüfen

Nach Migrationen: **Authentication → Policies** und **Storage → Policies**  
Öffentliche Lese-Policies für die drei Buckets müssen existieren.

## 5. Umgebungsvariablen setzen

In Vercel oder `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (geheim!)
```

Aus Supabase → Settings → API kopieren.

## 6. Verbindung testen

```bash
npm install
npm run build
npm run dev
```

Admin öffnen: `http://localhost:3000/admin`

## 7. Admin Login testen

**Fall A — Legacy:** Nur `ADMIN_PASSWORD` in `.env.local`, keine `admin_users`  
**Fall B — Multi-User:** Ersten Admin anlegen (Bootstrap-API oder SQL), dann mit Benutzername/E-Mail login

## 8. Website testen

- Startseite `/`
- Kontaktformular (Staging)
- Galerie-Bilder (nach Storage-Upload)

## 9. Daten importieren (optional)

Wenn JSON-Exporte vorhanden:
- Manuell über Admin UI
- Oder SQL INSERT aus vorbereitetem Dump

## 10. Ersten Admin-Benutzer (Multi-User)

```http
POST /api/admin/auth/bootstrap
```
(nur wenn noch keine `admin_users` existieren; erfordert gültiges `ADMIN_PASSWORD`)

---

**Checkliste:** `backups/checkpoint-v1/RESTORE_CHECKLIST.md`
