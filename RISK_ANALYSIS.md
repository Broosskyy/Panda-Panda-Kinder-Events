# Risikoanalyse — Panda-Bande v1.0-checkpoint

## Kritisch

| Risiko | Auswirkung | Mitigation |
|--------|------------|------------|
| Verlust `SUPABASE_SERVICE_ROLE_KEY` | Vollzugriff auf DB | Key rotieren, nie in Git, Passwort-Manager |
| Verlust CRM-Daten (Kunden, Rechnungen) | Geschäftsschaden | Regelmäßige Backups, `export:crm` |
| Admin-Account kompromittiert | Daten-Manipulation | 2FA, starke Passwörter, Audit Logs |
| Resend/Domain misconfigured | Keine Anfrage-Mails | Test-E-Mail, Domain verifizieren |

## Hoch

| Risiko | Auswirkung | Mitigation |
|--------|------------|------------|
| Fehlende Supabase-Migration in Prod | 500-Fehler, leere Seiten | Migrations-Checkliste, Restore-Guide |
| Legacy `ADMIN_PASSWORD` schwach | Unbefugter Admin-Zugang | Multi-User + 2FA, Passwort entfernen nach Bootstrap |
| Storage-Bilder gelöscht | Kaputte Galerie/CMS | Storage-Backup, Pfade in DB |
| DSGVO/Rechtstexte ungeprüft | Rechtliches Risiko | Anwalt, Impressum/Datenschutz aktualisieren |

## Mittel

| Risiko | Auswirkung | Mitigation |
|--------|------------|------------|
| Rate-Limit nur in-memory (Serverless) | Brute-Force theoretisch | Supabase/Vercel Limits, starke Passwörter |
| Analytics-Tabelle fehlt | Dashboard-Statistik leer | Migration `page_views` |
| Testdomain Resend | Mails nur an verifizierte Empfänger | Eigene Domain |
| Einzel-Entwickler-Wissen | Bus-Faktor | Diese Dokumentation |

## Niedrig

| Risiko | Auswirkung | Mitigation |
|--------|------------|------------|
| Blog wenig genutzt | Veralteter Content | Redaktionsplan |
| Team-Verknüpfung optional | Verwirrung | Handbuch Team vs. Benutzer |
| Performance nicht optimiert | Langsame Ladezeit | Bilder optimieren, Vercel CDN |

## Daten — nicht verlieren

1. `crm_customers`, `crm_quotes`, `crm_invoices` (+ items)
2. `booking_requests`
3. `site_settings`
4. `gallery_images` + Storage-Dateien
5. `admin_users` (Passwort-Hashes — nur verschlüsselt backuppen)

## Secrets — schützen

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_PASSWORD` (legacy)
- `totp_secret`, Session-Tokens (in DB, nicht exportieren)

## Produktionskritische Funktionen

1. Öffentliche Website (/)
2. Kontaktformular → E-Mail
3. Admin Login
4. CRM PDF + E-Mail
5. CMS Speichern

## Nice-to-have

- Erweiterte Analytics
- Permission-gefilterte Sidebar
- Argon2id statt bcrypt
- Automatisierte E2E-Tests
