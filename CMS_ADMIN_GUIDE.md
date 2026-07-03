# Panda-Bande CMS — Admin-Anleitung

Diese Anleitung erklärt, wie du die Website **ohne Programmierkenntnisse** über das Admin-Dashboard pflegst.

## Zugang

1. Öffne `https://deine-domain.de/admin`
2. Gib das Admin-Passwort ein (wird in der Hosting-Umgebung als `ADMIN_PASSWORD` hinterlegt)
3. Nach der Anmeldung siehst du die Sidebar mit allen Bereichen

## Dashboard

Auf der Startseite findest du:

- Anzahl neuer Anfragen
- Offene Bewertungen zur Freigabe
- Anzahl Galerie-Bilder und Beiträge
- Schnellzugriffe zu häufig genutzten Aufgaben

---

## Hero ändern

**Navigation:** Website Inhalte → Bereich **Hero**

| Feld | Bedeutung |
|------|-----------|
| Tagline | Kleiner Text über der Headline |
| Headline | Große Überschrift auf der Startseite |
| Subtitle | Beschreibungstext unter der Headline |
| CTA 1 / CTA 2 | Text der beiden Buttons |

Nach dem Bearbeiten auf **Hero speichern** klicken. Die Änderungen erscheinen sofort auf der Website (ggf. Seite neu laden).

---

## Telefonnummer & Kontakt ändern

**Navigation:** Website Inhalte → Bereich **Kontakt**

- **Telefon** — wird in der Kontakt-Section angezeigt
- **WhatsApp** — Nummer ohne +, z. B. `491234567890`
- **E-Mail** — Kontakt-E-Mail
- **Instagram URL** — vollständiger Link zum Profil
- **Instagram Handle** — Anzeigename, z. B. `@pandabande`
- **Einsatzgebiet** — Region / Stadt

Auf **Kontakt speichern** klicken.

> Das Kontaktformular selbst bleibt unverändert — nur die angezeigten Kontaktdaten werden aktualisiert.

---

## Über uns & Footer

**Navigation:** Website Inhalte

- **Über uns:** Name, Texte, Mission, Werte und Gründerinnen-Bild
- **Footer:** Tagline und Copyright-Name

Bild hochladen: Button **Bild hochladen** → JPG, PNG oder WebP (max. 5 MB).

---

## Galerie pflegen

**Navigation:** Galerie

| Aktion | So geht's |
|--------|-----------|
| Bild hochladen | **Bild hinzufügen** → Datei wählen |
| Titel / Kategorie | In der Karte bearbeiten und speichern |
| Reihenfolge | Mit Pfeilen nach oben/unten sortieren |
| Ein-/Ausblenden | Sichtbarkeit umschalten |
| Löschen | Papierkorb — unwiderruflich |

Erlaubte Formate: JPG, PNG, WebP (max. 5 MB).

---

## Bewertung freigeben

**Navigation:** Bewertungen

1. Filter **Ausstehend** wählen
2. Bewertung öffnen und prüfen (Text, Sterne, optional Bilder)
3. Aktionen:
   - **Freigeben** — erscheint auf der Website
   - **Ablehnen** — bleibt verborgen
   - **Antwort schreiben** — öffentliche Antwort von Panda-Bande
   - **Verifiziert** — zeigt Badge „Verifizierte Buchung“
   - **Löschen** — endgültig entfernen

Besucher können beim Absenden optional ein Profilbild und Eventfoto hochladen.

---

## Beitrag erstellen (Aktuelles)

**Navigation:** Beiträge

1. Titel, Untertitel und Text eingeben
2. Optional: Kategorie, Datum, Hero-Bild, Slug
3. **Veröffentlicht** aktivieren für die Website
4. **Speichern**

Veröffentlichte Beiträge erscheinen in der Section **Aktuelles** und unter `/aktuelles/dein-slug`.

---

## Leistungen & FAQ

**Navigation:** Leistungen bzw. FAQ

- Neu anlegen, bearbeiten, löschen
- Reihenfolge per Sortierung ändern
- Ein-/Ausblenden steuert die Sichtbarkeit auf der Website

Ohne CMS-Einträge werden die Standard-Inhalte aus der Website-Konfiguration angezeigt.

---

## Anfragen verwalten

**Navigation:** Anfragen

Status setzen:

| Status | Bedeutung |
|--------|-----------|
| Neu | Gerade eingegangen |
| Kontaktiert | Ihr habt euch gemeldet |
| Bestätigt | Buchung bestätigt |
| Abgeschlossen | Event vorbei |
| Abgesagt | Anfrage abgelehnt / storniert |

**Notizen** sind nur intern sichtbar.

---

## Bilder — Regeln

Alle Uploads laufen über Supabase Storage:

| Bucket | Verwendung |
|--------|------------|
| `gallery` | Galerie-Bilder |
| `reviews` | Bewertungs-Fotos |
| `site-assets` | Über-uns-Bilder, Beitrags-Hero |

- Formate: JPG, PNG, WebP
- Max. 5 MB pro Datei
- Uploads erfolgen serverseitig (sicher)

---

## Tipps

- Nach größeren Änderungen die Startseite im Browser prüfen (auch mobil)
- Entwürfe bei Beiträgen: **Veröffentlicht** erst aktivieren, wenn alles stimmt
- Bei Problemen: Hosting-Logs prüfen oder technischen Support kontaktieren

---

*Panda-Bande CMS v0.8.0*
