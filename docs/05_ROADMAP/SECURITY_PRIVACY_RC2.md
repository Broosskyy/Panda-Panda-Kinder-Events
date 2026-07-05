# Security & Privacy — RC2 Dokumentation

**Version:** 0.9.0-rc.2  
**Stand:** 2026-07-05

---

## Welche Daten werden gespeichert?

| Datenart | Inhalt | Tabelle / Ort |
|----------|--------|---------------|
| Kontaktanfragen | Name, Telefon, E-Mail, Event-Details, Nachricht | `booking_requests` (Supabase) |
| Bewertungen | Name, Event-Art, Sterne, Text, optional Bilder | `reviews` + Storage `reviews` |
| CMS-Inhalte | Hero, Kontakt, Über uns, Footer, Leistungen, FAQ, Galerie, Beiträge | `site_settings`, `cms_*`, `gallery_images` |
| Statistik | Pfad, Gerätetyp, Session-ID, Zeitstempel (keine IP) | `page_views` |
| Admin-Session | Signiertes Session-Token im httpOnly-Cookie | Browser-Cookie |

---

## Wo werden sie gespeichert?

- **Supabase (PostgreSQL):** Anfragen, Bewertungen, CMS, Statistik
- **Supabase Storage:** Galerie, Bewertungsbilder, Site-Assets
- **Resend:** E-Mail-Versand (transient, keine dauerhafte Speicherung bei Resend im App-Code)
- **Vercel:** Hosting, Serverless-Funktionen, kurzzeitige Logs

---

## Wer hat Zugriff?

| Rolle | Zugriff |
|-------|---------|
| Öffentliche Besucher | Nur veröffentlichte Inhalte über Next.js SSR/API |
| Admin | Passwortgeschütztes Panel, alle CMS-Daten und Anfragen |
| Service Role Key | Ausschließlich serverseitig in API Routes — nie im Browser |

---

## Technische Schutzmaßnahmen (RC2)

- Admin-Session: zufälliges Token + HMAC-Signatur, httpOnly, secure, sameSite=strict
- Login Rate Limit: 5 Versuche / 15 Min pro IP
- Öffentliche Formulare: Honeypot, Mindest-Submit-Zeit, Rate Limits
- Uploads: MIME + Extension + Magic Bytes, 5 MB max, Ordner-Allowlist
- Input Validation: Zod mit Max-Längen, HTML-Stripping
- API Errors: generische Client-Meldungen, Details nur serverseitig geloggt
- Security Headers: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy
- RLS: deny-all auf allen Tabellen für anon/authenticated
- Analytics RPCs: REVOKE für public/anon/authenticated (Migration)

---

## Vor Launch rechtlich prüfen

- [ ] Impressum finalisieren (echte Firmendaten)
- [ ] Datenschutzerklärung juristisch prüfen (Platzhalter ersetzen)
- [ ] AGB finalisieren
- [ ] Speicherdauer in Datenschutz festlegen (`[X Monate]`)
- [ ] Cookie-/Tracking-Hinweis prüfen (aktuell cookie-frei)
- [ ] Auftragsverarbeitungsverträge: Supabase, Vercel, Resend

---

## Backup-Empfehlung

- **Supabase:** Tägliche automatische Backups im Supabase-Dashboard aktivieren (Pro Plan) oder wöchentlicher `pg_dump` Export
- **Storage:** Periodischer Export kritischer Buckets (`gallery`, `site-assets`)
- **Code:** GitHub als Source of Truth

---

## Lösch-/Archivierungsregeln (Empfehlung)

| Datenart | Empfehlung |
|----------|------------|
| Kontaktanfragen | Nach Abschluss + 12 Monate löschen oder anonymisieren |
| Abgelehnte Bewertungen | Nach 6 Monaten löschen |
| Freigegebene Bewertungen | Auf Anfrage löschen (DSGVO Art. 17) |
| Statistik (`page_views`) | Aggregierte Daten behalten, Rohdaten nach 24 Monaten löschen |
| Admin-Logs (Vercel) | Standard-Retention prüfen |

---

## Hinweis für spätere CRM / Rechnungen

Diese RC2-Maßnahmen gelten für die aktuelle Website. Für zukünftige CRM-, Angebots- oder Rechnungsfunktionen sind zusätzlich erforderlich:

- Getrennte Rollen und Berechtigungen
- Verschlüsselung sensibler Finanzdaten
- Revisionssichere Dokumentenspeicherung
- Erweiterte DSGVO-Dokumentation (AV-Verträge, TOMs)
- Penetrationstest vor Go-Live der Finanzmodule
