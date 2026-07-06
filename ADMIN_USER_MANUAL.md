# Admin-Bedienungsanleitung (für Nicht-Techniker)

**Panda-Bande · Stand v1.0-checkpoint**

Admin-Adresse: `https://deine-domain.de/admin` (lokal: `http://localhost:3000/admin`)

---

## Anmelden

1. Browser öffnen → `/admin` eingeben
2. **Benutzername oder E-Mail** und **Passwort** eingeben
3. Optional: „Angemeldet bleiben“ aktivieren
4. Bei 2FA: 6-stelligen Code aus der Authenticator-App eingeben

**Passwort vergessen?** Link auf der Login-Seite → E-Mail mit Reset-Link (falls konfiguriert).

---

## 2FA einrichten

1. **Sicherheit → 2FA**
2. **„2FA einrichten“** klicken
3. QR-Code mit Google/Microsoft Authenticator scannen
4. Code eingeben → **Aktivieren**
5. **Backup-Codes speichern** (kopieren oder herunterladen)

---

## Passwort ändern

- Eigenes Passwort: über **Passwort vergessen** oder Admin mit Rechten bittet dich, Passwort zurückzusetzen
- Admin kann unter **Benutzer & Rollen → Bearbeiten** ein neues Passwort setzen

---

## Teammitglied anlegen (Website)

1. **Website → Team**
2. **Teammitglied anlegen**
3. Ausfüllen: **Name**, **Position** (Pflicht), Foto-URL, Beschreibung
4. **„Auf der Website anzeigen“** aktivieren
5. **Speichern** — erscheint auf der Website unter „Über uns“

**Hinweis:** Das ist **nicht** ein Login-Account.

---

## Website-Text ändern

1. **Website → Inhalte**
2. Bereich wählen (Hero, Über uns, Footer, …)
3. Texte anpassen
4. **Speichern** klicken

---

## Bild hochladen

- **Galerie:** Website → Galerie → Upload
- **Hero/Logo:** Website → Inhalte → entsprechendes Feld + Upload wo angeboten

---

## Leistung ändern

1. **Website → Leistungen**
2. Eintrag bearbeiten oder neu anlegen
3. Titel, Beschreibung, Bild, optional Preis/Highlights
4. Speichern

---

## FAQ ändern

1. **Website → FAQ**
2. Frage + Antwort eingeben
3. Reihenfolge und Sichtbarkeit prüfen
4. Speichern

---

## Beitrag erstellen

1. **Website → Beiträge**
2. Neuen Beitrag anlegen
3. Titel, Inhalt, Bild, **Veröffentlichen** aktivieren
4. Speichern → sichtbar unter `/aktuelles`

---

## Bewertung freigeben

1. **Kommunikation → Bewertungen**
2. Neue Bewertung öffnen
3. **Freigeben** — erscheint auf der Website

---

## Anfrage verwalten

1. **Kommunikation → Anfragen**
2. Anfrage öffnen
3. Status ändern (z. B. kontaktiert, bestätigt)
4. Notizen ergänzen
5. Optional: Kunde anlegen

---

## Kunde anlegen

1. **CRM → Kunden**
2. **Neu** — Name, Kontakt, Adresse
3. Speichern

---

## Angebot erstellen

1. **CRM → Angebote**
2. Kunde wählen
3. Positionen hinzufügen (Beschreibung, Menge, Preis)
4. Speichern
5. **PDF** anzeigen oder **per E-Mail senden**

---

## Rechnung erstellen

1. **CRM → Rechnungen**
2. Analog zum Angebot
3. Fälligkeitsdatum setzen
4. PDF / E-Mail versenden

---

## E-Mail-Einstellungen

1. **Einstellungen → E-Mail** (Tab)
2. Absendername, Absender-E-Mail, Reply-To prüfen
3. **Test-E-Mail** senden
4. Speichern

**Hinweis:** Ohne verifizierte Domain bei Resend wird eine Test-Adresse genutzt.

---

## Benutzer anlegen

1. **Sicherheit → Benutzer & Rollen**
2. **Benutzer anlegen**
3. Benutzername, E-Mail, Anzeigename, Rolle, Passwort
4. Optional: Team-Verknüpfung
5. Speichern

---

## Rechte / Rollen

Rollen legen fest, was jemand darf (nur Lesen, Redakteur, Buchhaltung, …).  
Rolle beim Anlegen oder Bearbeiten eines Benutzers wählen.  
Übersicht steht auf der Benutzer-Seite.

---

## Audit Logs lesen

1. **Sicherheit → Aktivitätsprotokoll**
2. Liste zeigt: Zeit, Benutzer, Aktion (z. B. „create · public_team“)
3. Bei Problemen: Zeitpunkt und Aktion notieren, Techniker informieren

---

## Hilfe bei Problemen

| Problem | Was tun? |
|---------|----------|
| Seite lädt nicht | Internet prüfen, später erneut versuchen |
| Login klappt nicht | Passwort prüfen, Caps Lock, 2FA-Code |
| Speichern fehlgeschlagen | Pflichtfelder prüfen, Seite neu laden |
| E-Mail kommt nicht an | Einstellungen → E-Mail, Spam-Ordner |

Technische Details: `TECHNICAL_RUNBOOK.md` oder Entwickler kontaktieren.
