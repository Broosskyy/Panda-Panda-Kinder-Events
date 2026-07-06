# Panda-Bande — Release-Checkliste

**Version:** 1.0.0  
**Stand:** 2026-07-06  
**Zweck:** Vor dem Livegang alle Punkte abhaken.

---

## Öffentliche Website

- [ ] Startseite lädt ohne Fehler
- [ ] Header und Navigation funktionieren
- [ ] Hero-Bereich mit Bild und Text
- [ ] Leistungen-Sektion sichtbar
- [ ] Galerie lädt Bilder
- [ ] Bewertungen werden angezeigt (freigegebene)
- [ ] FAQ öffnet/schließt
- [ ] Beiträge/Aktuelles erreichbar
- [ ] Kontaktformular sendet Anfrage
- [ ] Footer mit Kontakt und Rechtlichem
- [ ] Impressum, Datenschutz, AGB erreichbar
- [ ] Mobile Darstellung (320–430px) ohne Layoutfehler
- [ ] Desktop Darstellung korrekt
- [ ] Kein horizontaler Scroll
- [ ] WhatsApp-Button überlappt nicht mit Cookie-Banner

## Admin Dashboard

- [ ] Login funktioniert
- [ ] 2FA einrichten und einloggen
- [ ] Dashboard zeigt Statistiken
- [ ] Benutzer anlegen (Sicherheit → Benutzer)
- [ ] Team anlegen (Website → Team)
- [ ] Website-Inhalte speichern
- [ ] Galerie-Upload
- [ ] FAQ bearbeiten
- [ ] Leistungen bearbeiten
- [ ] Beitrag erstellen/veröffentlichen
- [ ] Bewertung freigeben
- [ ] Anfrage verwalten
- [ ] Kunde anlegen
- [ ] Angebot erstellen
- [ ] Rechnung erstellen
- [ ] PDF öffnet korrekt
- [ ] E-Mail senden (Test + CRM)
- [ ] Audit-Log zeigt Aktionen

## Domain & URL

- [ ] `NEXT_PUBLIC_SITE_URL` in Vercel gesetzt
- [ ] Canonical URLs zeigen eigene Domain
- [ ] `/sitemap.xml` enthält korrekte URLs
- [ ] `/robots.txt` verweist auf korrekte Sitemap
- [ ] OpenGraph-Vorschau geprüft (z. B. metatags.io)
- [ ] Passwort-Reset-Link zeigt eigene Domain

## E-Mail

- [ ] `RESEND_API_KEY` in Vercel gesetzt
- [ ] Domain in Resend verifiziert
- [ ] Absendername in Einstellungen → E-Mail
- [ ] Absender-E-Mail konfiguriert
- [ ] Reply-To konfiguriert
- [ ] Kopie-an konfiguriert
- [ ] Kontaktformular-Empfänger gesetzt
- [ ] Test-E-Mail erfolgreich
- [ ] Kein Hinweis „Resend-Testdomain aktiv" im Dashboard

## Unternehmensdaten

- [ ] Firmenname in Einstellungen → Unternehmensdaten
- [ ] Adresse vollständig
- [ ] Telefon und E-Mail korrekt
- [ ] Website-URL gesetzt
- [ ] Instagram / WhatsApp in CMS Kontakt
- [ ] IBAN/BIC optional für Rechnungen
- [ ] Daten erscheinen in PDF
- [ ] Daten erscheinen in E-Mail-Footer
- [ ] Footer auf Website korrekt

## PWA

- [ ] `/manifest.webmanifest` erreichbar
- [ ] Icons laden (192, 512, Apple Touch)
- [ ] „Zum Home-Bildschirm hinzufügen" auf Android
- [ ] „Zum Home-Bildschirm" auf iOS
- [ ] Theme Color passt zur Marke

## SEO

- [ ] Title und Description sinnvoll
- [ ] OpenGraph und Twitter Card
- [ ] JSON-LD auf Startseite (LocalBusiness, FAQ)
- [ ] Blog-Beiträge mit Canonical und OG
- [ ] Alt-Texte bei Bildern

## Sicherheit

- [ ] Erster Admin-Benutzer angelegt (nicht nur Legacy-Passwort)
- [ ] 2FA für Owner aktiviert
- [ ] Keine Secrets im Repository
- [ ] Supabase RLS aktiv
- [ ] Admin-Routen nicht indexierbar

## Backup

- [ ] Supabase-Backup-Strategie definiert
- [ ] Export-Skripte getestet (`npm run export:cms`, `export:crm`)
- [ ] Restore-Anleitung gelesen

---

## Freigabe

| Rolle | Name | Datum | Unterschrift |
|-------|------|-------|--------------|
| Technik | | | |
| Inhalt | | | |
| Betrieb | | | |

**Go-Live freigegeben:** [ ] Ja  [ ] Nein
