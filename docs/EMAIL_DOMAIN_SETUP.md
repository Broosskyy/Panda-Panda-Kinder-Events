# E-Mail-Domain Setup

Komplette Anleitung: Domain kaufen, Resend einrichten, DNS konfigurieren und E-Mail im Dashboard aktivieren.

## Übersicht

| Schritt | Wo | Ergebnis |
|---------|-----|----------|
| 1 | Domain-Provider | Eigene Domain (z. B. `panda-bande-events.de`) |
| 2 | Resend Dashboard | Domain hinzugefügt, DNS-Einträge sichtbar |
| 3 | DNS-Provider | SPF/DKIM/DMARC gesetzt |
| 4 | Resend | Status **Verified** |
| 5 | Vercel | `RESEND_API_KEY` gesetzt |
| 6 | Admin Dashboard | Absender + Adressen eingetragen |
| 7 | Test-E-Mail | Versand bestätigt |

---

## 1. Domain kaufen

Empfohlene Anbieter: IONOS, Strato, Cloudflare, Namecheap.

1. Wunschdomain prüfen und registrieren
2. DNS-Verwaltung im Provider öffnen (für Schritt 3)

---

## 2. Domain in Resend hinzufügen

1. [resend.com](https://resend.com) → einloggen
2. **Domains** → **Add Domain**
3. Domain eingeben: `ihre-domain.de`
4. Resend zeigt die erforderlichen DNS-Einträge

---

## 3. DNS-Einträge setzen (SPF / DKIM / DMARC)

Im DNS-Panel Ihres Domain-Providers die von Resend angezeigten Einträge anlegen:

| Typ | Zweck |
|-----|--------|
| **TXT** (SPF/Verification) | Domain-Verifizierung & Absender-Autorisierung |
| **CNAME** (DKIM) | E-Mail-Signatur — wichtig gegen Spam |
| **TXT** (DMARC) | Empfohlen: `v=DMARC1; p=none;` oder strenger nach Go-Live |

**Wichtig:**
- Werte exakt aus dem Resend-Dashboard übernehmen
- Keine doppelten SPF-Einträge — nur einen SPF-TXT pro Domain/Subdomain
- Propagation: meist 15–60 Minuten, kann bis 48 h dauern

### Verifizierung prüfen

Resend Dashboard → Domain → Status **Verified**

---

## 4. Vercel Umgebungsvariablen

Im Vercel-Projekt unter **Settings → Environment Variables**:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

Optional (Fallback, wenn CMS-Feld leer):

```env
INQUIRY_NOTIFICATION_EMAIL=info@ihre-domain.de
```

Nach Änderung: **Redeploy** auslösen.

Lokal: Werte in `.env.local` eintragen und Dev-Server neu starten.

---

## 5. Dashboard — E-Mail-Adresse eintragen

Admin → **Einstellungen → E-Mail**

| Feld | Beispiel |
|------|----------|
| Absendername | Panda-Bande Kinderevents |
| Absender-E-Mail | info@panda-bande-events.de |
| Reply-To-Adresse | info@panda-bande-events.de |
| Kopie-an-Adresse | info@panda-bande-events.de |
| Angebots-Kopie an | angebote@panda-bande-events.de |
| Rechnungs-Kopie an | rechnung@panda-bande-events.de |
| Kontaktformular-Empfänger | kontakt@panda-bande-events.de |

### Gewünschte Adressen

Unter **Gewünschte E-Mail-Adressen** können Sie Prefixe hinterlegen:

- `info@ihre-domain.de`
- `kontakt@ihre-domain.de`
- `rechnung@ihre-domain.de`
- `angebote@ihre-domain.de`

> **Hinweis:** Mailboxen müssen beim Domain-/Mailanbieter eingerichtet werden (Weiterleitung oder Postfach). Das Dashboard kann die Adresse für den Versand nutzen, sobald Domain und Resend verifiziert sind.

### Vor Verifizierung

Ohne verifizierte Domain gilt:

- Versand über `onboarding@resend.dev` (Resend-Testdomain)
- Admin-Hinweis: *„Eigene Absenderadresse erst nach Resend-Domain-Verifizierung möglich."*

---

## 6. Test-E-Mail senden

1. Einstellungen → E-Mail → **Domain-Status prüfen**
2. Status sollte **Domain verifiziert** zeigen
3. Test-E-Mail an eigene Adresse senden
4. Prüfen: `From` zeigt Ihre Firmenadresse (nicht `onboarding@resend.dev`)

---

## 7. Unternehmensdaten

Admin → **Einstellungen → Unternehmensdaten**

Diese Daten erscheinen in PDFs (Angebote/Rechnungen) und E-Mail-Signaturen:

- Firmenname, Logo, Straße, PLZ, Ort
- Telefon, E-Mail, Website
- IBAN, BIC, Bankname
- Steuernummer, USt-ID
- Standardtexte für Angebote und Rechnungen

---

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Domain „pending" | DNS-Einträge prüfen, 1–2 h warten |
| E-Mails im Spam | DKIM + DMARC verifizieren |
| 403 Domain not verified | Resend-Status muss **Verified** sein |
| Testdomain trotz DNS | Absender-E-Mail muss zur verifizierten Domain passen |
| Keine Anfragen im Postfach | Kontaktformular-Empfänger im CMS prüfen |

---

## Weitere Dokumentation

- `docs/EMAIL_SETUP.md` — technische Details zum Absender-System
- Resend Docs: [resend.com/docs](https://resend.com/docs)
