# Panda-Bande — Projekt-Handbuch für Einsteiger

**Version:** v1.0-checkpoint · **Stand:** 2026-07-06

Dieses Dokument erklärt das Panda-Bande-Projekt so, dass auch Menschen ohne Technik-Vorkenntnisse verstehen, **was** das System ist und **wo** man was einstellt.

---

## 1. Was ist Panda-Bande?

Panda-Bande ist ein **Kinderevents-Unternehmen** (Kindergeburtstage, Familienfeiern). Dieses Software-Projekt ist die **digitale Begleitung**: eine öffentliche Website plus ein internes Verwaltungssystem (Admin), mit dem Inhalte, Anfragen, Kunden, Angebote und Rechnungen verwaltet werden.

---

## 2. Was ist die Website?

Die **Website** ist das, was Besucher im Browser sehen: Startseite, Leistungen, Galerie, Bewertungen, FAQ, Kontaktformular, Impressum, Datenschutz.  
Adresse (lokal): `http://localhost:3000` · (live): deine Domain, z. B. `https://panda-bande-events.de`

---

## 3. Was ist das Admin Dashboard?

Das **Admin Dashboard** ist der geschützte Bereich unter `/admin`. Nur eingeloggte Personen sehen ihn. Dort pflegst du Inhalte, bearbeitest Anfragen und führst das CRM (Kunden, Angebote, Rechnungen).

---

## 4. Was ist das CMS?

**CMS** = Content Management System = **Inhaltsverwaltung**.  
Damit änderst du Texte, Bilder und Einstellungen der Website **ohne Programmierung**: Hero-Text, Über-uns, Footer, Leistungen, Galerie, FAQ, Beiträge usw.

---

## 5. Was ist das CRM?

**CRM** = Customer Relationship Management = **Kundenverwaltung**.  
Du speicherst Kunden, erstellst Angebote und Rechnungen, verknüpfst Anfragen von der Website und kannst PDFs versenden.

---

## 6. Was sind Kunden?

Im CRM sind **Kunden** Firmen oder Privatpersonen, für die du Events organisierst. Jeder Kunde kann mehrere Anfragen, Angebote und Rechnungen haben.

---

## 7. Was sind Angebote?

Ein **Angebot** ist ein dokumentiertes Preisangebot für einen Kunden (Positionen, MwSt., Gesamtsumme). Es kann als PDF erzeugt und per E-Mail verschickt werden.

---

## 8. Was sind Rechnungen?

Eine **Rechnung** ist wie ein Angebot, aber für die Abrechnung nach dem Event. Auch hier: PDF, E-Mail, Status (offen, bezahlt, …).

---

## 9. Was ist das Team?

**Team** = Personen, die **öffentlich auf der Website** gezeigt werden (Name, Position, Foto).  
Pfad im Admin: **Website → Team**.  
Teammitglieder haben **keinen Login**.

---

## 10. Was sind Admin-Benutzer?

**Admin-Benutzer** sind **Login-Accounts** für das Dashboard (Benutzername, E-Mail, Passwort, Rolle).  
Pfad: **Sicherheit → Benutzer & Rollen**.  
Sie erscheinen **nicht** automatisch auf der Website.

---

## 11. Unterschied Team vs. Benutzer

| | Team | Benutzer |
|---|------|----------|
| Sichtbar für Besucher? | Ja (wenn „sichtbar“) | Nein |
| Kann sich einloggen? | Nein | Ja |
| Wo verwalten? | Website → Team | Sicherheit → Benutzer |

Optional kann ein Benutzer mit einem Teammitglied **verknüpft** werden — das ändert nichts an den Login-Rechten des Team-Eintrags.

---

## 12. Was ist 2FA?

**2FA** = Zwei-Faktor-Authentifizierung. Nach dem Passwort gibst du einen **6-stelligen Code** aus einer App (Google Authenticator, Microsoft Authenticator) ein. Das schützt den Admin-Account zusätzlich.  
Einrichtung: **Sicherheit → 2FA**.

---

## 13. Was sind Audit Logs?

Das **Aktivitätsprotokoll** speichert, **wer wann was** im Admin gemacht hat (z. B. Team geändert, Benutzer angelegt, 2FA aktiviert).  
Pfad: **Sicherheit → Aktivitätsprotokoll**. Passwörter werden **nicht** geloggt.

---

## 14. Was ist Supabase?

**Supabase** ist die **Online-Datenbank** (und Datei-Speicher) in der Cloud. Dort liegen alle Inhalte, Kunden, Anfragen und Einstellungen. Die Website und das Admin-Panel lesen und schreiben über sichere Verbindungen dorthin.

---

## 15. Was ist Vercel?

**Vercel** ist der **Hosting-Anbieter** für die Website (Next.js). Bei jedem Git-Push kann automatisch eine neue Version online gehen. Umgebungsvariablen (Secrets) trägst du im Vercel-Dashboard ein.

---

## 16. Was ist Resend?

**Resend** ist der **E-Mail-Dienst**. Er verschickt Benachrichtigungen (neue Anfrage), Angebots-/Rechnungs-Mails und Passwort-Reset. API-Key in Vercel/`.env.local`; Absender-Adresse im Admin unter **Einstellungen → E-Mail**.

---

## 17. Was ist Storage?

**Storage** = Dateiablage bei Supabase (Bilder). Buckets: `gallery`, `reviews`, `site-assets`. Bilder werden hochgeladen und per URL auf der Website angezeigt.

---

## 18. Was sind Migrationen?

**Migrationen** sind SQL-Dateien in `supabase/migrations/`. Sie **bauen die Datenbankstruktur auf** (Tabellen, Spalten). Bei neuem Supabase-Projekt werden sie der Reihe nach ausgeführt. Sie löschen keine Daten, wenn sie „idempotent“ sind.

---

## 19. Was ist ein Deployment?

**Deployment** = **Veröffentlichung** einer neuen Version der Software auf dem Server (Vercel). Nach erfolgreichem Build ist die Website für alle erreichbar.

---

## 20. Was ist ein Backup?

Ein **Backup** ist eine **Sicherungskopie** von Datenbank, Dateien und dokumentierten Einstellungen. Falls etwas schiefgeht, kann man damit wiederherstellen.  
Anleitungen: Ordner `backups/checkpoint-v1/` und `SUPABASE_RESTORE_GUIDE.md`.

---

## Schnellnavigation

| Ich möchte … | Wo? |
|--------------|-----|
| Website-Text ändern | Admin → Website → Inhalte |
| Team anzeigen lassen | Admin → Website → Team |
| Anfrage bearbeiten | Admin → Kommunikation → Anfragen |
| Angebot erstellen | Admin → CRM → Angebote |
| Benutzer anlegen | Admin → Sicherheit → Benutzer & Rollen |
| 2FA einrichten | Admin → Sicherheit → 2FA |
| E-Mail-Absender ändern | Admin → Einstellungen → E-Mail |
| Technische Details | `TECHNICAL_RUNBOOK.md` |
| Alles testen | `FULL_TEST_CHECKLIST.md` |

---

## Wichtige Dateien im Projekt

| Datei | Zweck |
|-------|--------|
| `PROJECT_STRUCTURE.md` | Ordner und Code-Struktur |
| `FEATURE_OVERVIEW.md` | Feature-Status-Tabelle |
| `ADMIN_USER_MANUAL.md` | Schritt-für-Schritt im Admin |
| `TECHNICAL_RUNBOOK.md` | Für Entwickler |
| `CHECKPOINT_V1_SUMMARY.md` | Aktueller Checkpoint-Status |

**Keine Passwörter oder API-Keys in diese Dokumente schreiben!**
