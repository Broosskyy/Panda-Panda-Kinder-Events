# Wiederherstellungs-Checkliste

## Vorbereitung

- [ ] Neues oder bestehendes Supabase-Projekt bereit
- [ ] Vercel-Projekt oder lokale `.env.local` mit korrekten Variablen
- [ ] Backup-Dateien griffbereit (SQL, JSON, Storage)

## Datenbank

- [ ] Alle Migrationen aus `supabase/migrations/` in Reihenfolge ausgeführt
- [ ] Oder: `full-backup.sql` eingespielt
- [ ] Tabellen vorhanden (mind. `site_settings`, `booking_requests`)

## Storage

- [ ] Buckets `gallery`, `reviews`, `site-assets` existieren
- [ ] Dateien hochgeladen
- [ ] Öffentliche Lese-Policies aktiv

## Umgebung

- [ ] `NEXT_PUBLIC_SUPABASE_URL` gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` gesetzt (geheim!)
- [ ] `RESEND_API_KEY` gesetzt (falls E-Mail)
- [ ] `ADMIN_PASSWORD` oder Admin-Benutzer in DB
- [ ] `NEXT_PUBLIC_SITE_URL` korrekt

## Anwendung

- [ ] `npm install`
- [ ] `npm run build` erfolgreich
- [ ] Deploy oder `npm run dev` lokal

## Funktionstest

- [ ] Startseite lädt
- [ ] Admin-Login funktioniert
- [ ] Eine CMS-Änderung speichern
- [ ] Kontaktformular testen (Staging)
- [ ] CRM: Kunde + Angebot + PDF testen

## Nach Restore

- [ ] Secrets rotieren, falls Backup kompromittiert sein könnte
- [ ] Audit-Log prüfen
- [ ] `FULL_TEST_CHECKLIST.md` durchgehen
