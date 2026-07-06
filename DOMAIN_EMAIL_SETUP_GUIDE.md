# Panda-Bande — Domain & E-Mail Setup

Anleitung zur Vorbereitung der eigenen Domain und des E-Mail-Versands.

---

## 1. Domain mit Vercel verbinden

### Schritt 1: Domain hinzufügen

1. Vercel Dashboard → Projekt → **Settings** → **Domains**
2. Domain eingeben (z. B. `panda-bande-events.de`)
3. Vercel zeigt benötigte DNS-Einträge

### Schritt 2: DNS beim Domain-Anbieter

Typische Einträge:

| Typ | Name | Wert |
|-----|------|------|
| A | `@` | `76.76.21.21` (Vercel IP — aktuelle IP in Vercel prüfen) |
| CNAME | `www` | `cname.vercel-dns.com` |

**Hinweis:** Exakte Werte immer aus dem Vercel-Dashboard übernehmen.

### Schritt 3: NEXT_PUBLIC_SITE_URL setzen

In Vercel → Environment Variables:

```
NEXT_PUBLIC_SITE_URL=https://ihre-domain.de
```

Ohne trailing slash. Für alle Umgebungen (Production, Preview optional).

### Schritt 4: Redeploy

Nach Env-Änderung: **Deployments** → letztes Deployment → **Redeploy**.

### Was sich automatisch anpasst

| Bereich | Quelle |
|---------|--------|
| Canonical URLs | `getSiteUrl()` via `NEXT_PUBLIC_SITE_URL` |
| Sitemap | `/sitemap.xml` |
| Robots | `/robots.txt` |
| OpenGraph | Layout + `buildPageMetadata()` |
| Passwort-Reset-Links | API Route |
| PDF-Logo-Auflösung | Relative URLs → Site-URL |

### CMS/Admin

- **Einstellungen → Unternehmensdaten → Website:** für PDFs und E-Mail-Footer
- **CMS Kontakt:** Telefon, E-Mail, Instagram, WhatsApp für öffentliche Website

---

## 2. Resend Domain verifizieren

### Schritt 1: Domain in Resend

1. [resend.com](https://resend.com) → **Domains** → **Add Domain**
2. Domain eingeben (z. B. `panda-bande-events.de`)

### Schritt 2: DNS-Einträge

Resend zeigt SPF, DKIM und ggf. DMARC. Beim Domain-Anbieter eintragen.

### Schritt 3: Verifizierung abwarten

Status in Resend: **Verified** (kann bis 48h dauern).

### Schritt 4: Admin konfigurieren

**Admin → Einstellungen → E-Mail:**

| Feld | Beispiel |
|------|----------|
| Absendername | Panda-Bande Kinderevents |
| Absender-E-Mail | info@ihre-domain.de |
| Reply-To | hallo@ihre-domain.de |
| Kopie-an | intern@ihre-domain.de |
| Kontaktformular-Empfänger | anfragen@ihre-domain.de |

### Fallback-Verhalten

Solange die Domain **nicht** verifiziert ist:

- Versand über `onboarding@resend.dev`
- Admin zeigt **gelben Hinweis** im Dashboard und unter Einstellungen → E-Mail
- Empfänger auf Resend-Testdomain eingeschränkt

Nach Verifizierung: automatisch eigene Absenderadresse.

### Test

1. Einstellungen → E-Mail → **Test-E-Mail senden**
2. Kontaktformular auf Website ausfüllen
3. Angebot/Rechnung per E-Mail versenden (CRM)

---

## 3. E-Mail-Postfächer (beim Anbieter)

Das Dashboard **erstellt keine Mailboxen**. Diese müssen beim E-Mail-/Domain-Anbieter eingerichtet werden:

- `info@` — allgemein
- `hallo@` — Reply-To
- `anfragen@` — Kontaktformular (optional)

Weiterleitungen reichen für den Start.

---

## 4. Checkliste Domain & E-Mail

- [ ] Domain in Vercel verbunden, SSL aktiv
- [ ] `NEXT_PUBLIC_SITE_URL` gesetzt und deployed
- [ ] Canonical/Sitemap zeigen eigene Domain
- [ ] Domain in Resend verifiziert
- [ ] Absender-E-Mail in Admin gesetzt
- [ ] Test-E-Mail erfolgreich
- [ ] Kein „Resend-Testdomain aktiv"-Hinweis
- [ ] Kontaktformular liefert E-Mail

---

## Häufige Probleme

| Problem | Lösung |
|---------|--------|
| Falsche Canonical-URL | `NEXT_PUBLIC_SITE_URL` prüfen, redeployen |
| E-Mail kommt nicht an | Resend Logs, Spam-Ordner, Domain-Status |
| Testdomain-Hinweis bleibt | Domain in Resend auf „verified" prüfen |
| Passwort-Reset-Link falsch | `NEXT_PUBLIC_SITE_URL` in Vercel setzen |
