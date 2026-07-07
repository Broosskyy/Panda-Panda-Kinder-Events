# E-Mail-Setup — Panda-Bande Kinderevents

Produktionsanleitung für das E-Mail-System. Stand: Version 1.0.

---

## Provider

| Komponente | Wert |
|------------|------|
| **E-Mail-Provider** | [Resend](https://resend.com) (API) |
| **Transport** | Resend REST API — kein SMTP, kein Nodemailer |
| **Vorlagen** | Supabase `email_templates` + Code-Fallback |
| **Logging** | Supabase `email_logs` (sent / failed) |

---

## Benötigte Umgebungsvariablen

```env
# Pflicht — Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx

# Optional — Fallback wenn CMS-Empfänger leer
INQUIRY_NOTIFICATION_EMAIL=info@ihre-domain.de

# Für Links in E-Mails (Passwort-Reset, Dashboard-CTA)
NEXT_PUBLIC_SITE_URL=https://ihre-domain.de
```

| Variable | Pflicht | Beschreibung |
|----------|---------|--------------|
| `RESEND_API_KEY` | **Ja** | Authentifizierung bei Resend |
| `INQUIRY_NOTIFICATION_EMAIL` | Nein | Fallback für Admin-Benachrichtigungen |
| `NEXT_PUBLIC_SITE_URL` | Empfohlen | Canonical URL für E-Mail-Links |
| `RESEND_FROM_EMAIL` | **Entfernt** | Absender kommt aus CMS |

Alle Absender-, Reply-To- und Empfänger-Adressen werden im **CMS Admin → Einstellungen → E-Mail** gepflegt.

---

## CMS-Einstellungen

| Feld | Beispiel | Zweck |
|------|----------|-------|
| Firmenname | Panda-Bande Kinderevents | Signatur |
| Absendername | Panda-Bande Kinderevents | From-Name |
| Absender-E-Mail | info@panda-bande-events.de | From-Adresse (nach Domain-Verifizierung) |
| Reply-To | info@panda-bande-events.de | Antworten |
| Kontaktformular-Empfänger | info@panda-bande-events.de | Admin bei neuer Anfrage |
| Admin-Benachrichtigung | info@panda-bande-events.de | Bewertungen & System |
| Auto-Reply aktivieren | ✓ | Kundenbestätigung nach Anfrage |

---

## DNS-Einrichtung (Schritt für Schritt)

### 1. Domain in Resend hinzufügen

1. [resend.com/domains](https://resend.com/domains) → **Add Domain**
2. Domain eingeben: `panda-bande-events.de`
3. Resend zeigt die erforderlichen DNS-Einträge

### 2. DNS-Einträge beim Domain-Provider

| Typ | Name | Zweck |
|-----|------|-------|
| **TXT** | `@` oder `_resend` | Domain-Verifizierung |
| **CNAME** | `resend._domainkey` | **DKIM** — E-Mail-Signatur |
| **TXT** | `@` | **SPF** — `v=spf1 include:amazonses.com ~all` (Wert von Resend) |
| **TXT** | `_dmarc` | **DMARC** — `v=DMARC1; p=quarantine; rua=mailto:dmarc@ihre-domain.de` |
| **MX** | (optional) | Nur für Empfang über Resend |

> Die exakten Werte stehen im Resend-Dashboard. Niemals Werte von anderen Domains kopieren.

### 3. Verifizierung

1. DNS propagieren lassen (5 Min. – 48 Std., meist < 1 Std.)
2. Resend Dashboard: Status **Verified**
3. Admin → Einstellungen → E-Mail → **Domain-Status prüfen**
4. **Test-E-Mail senden**

### 4. SPF / DKIM / DMARC Checkliste

- [ ] SPF-TXT-Eintrag gesetzt
- [ ] DKIM-CNAME (`resend._domainkey`) gesetzt
- [ ] DMARC-TXT (`_dmarc`) gesetzt
- [ ] Resend zeigt Domain als **Verified**
- [ ] Test-E-Mail landet im Posteingang (nicht Spam)
- [ ] `From`-Adresse zeigt Firmenadresse (nicht `onboarding@resend.dev`)

---

## E-Mail-Flows

### Kontaktanfrage

```
Kunde sendet Formular
  → Speicherung in booking_requests (Status: neu, Quelle: Website)
  → Admin: HTML-E-Mail mit allen Details + Dashboard-CTA
  → Kunde: Bestätigungsmail (Logo, CI-Farben, persönlicher Text)
  → Logging in email_logs (sent/failed, 3× Retry)
```

### Bewertung

```
Kunde sendet Bewertung
  → Speicherung in reviews (approved: false)
  → Admin: HTML-E-Mail mit Sterne + Dashboard-CTA
  → Logging in email_logs
```

### CRM (Angebot / Rechnung)

```
Admin sendet Dokument
  → PDF-Anhang per E-Mail
  → Kopie an Firmenadresse (optional)
  → Logging mit Quote/Invoice-ID
```

---

## Absender & Reply-To

| Modus | From | Reply-To |
|-------|------|----------|
| Testdomain (keine Verifizierung) | `Panda-Bande <onboarding@resend.dev>` | CMS Reply-To |
| Produktion (verifiziert) | `Panda-Bande <info@ihre-domain.de>` | CMS Reply-To |

---

## Limits & Retry

| Aspekt | Wert |
|--------|------|
| Retry bei Fehler | 3 Versuche (400ms, 800ms, 1200ms Backoff) |
| Rate Limit Anfragen | 5 pro Stunde pro IP |
| Rate Limit Bewertungen | 3 pro Stunde pro IP |
| Resend Free Tier | 100 E-Mails/Tag, 3.000/Monat (Stand Resend Free) |
| Resend Pro | Höhere Limits — siehe Resend Pricing |

---

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Keine E-Mails | `RESEND_API_KEY` in Vercel prüfen |
| Testdomain aktiv | Domain in Resend verifizieren |
| Admin-Mail fehlt, Anfrage gespeichert | `email_logs` prüfen, Empfänger im CMS |
| E-Mails im Spam | DKIM + DMARC verifizieren |
| 403 Domain not verified | Absender-Domain muss in Resend verified sein |
| Kunde keine Bestätigung | Auto-Reply im CMS aktivieren |

### Admin-Endpunkte

- `GET /api/admin/email/status` — Domain-Status
- `POST /api/admin/email/test` — Test-E-Mail (`{ "to": "..." }`)
- `GET /api/admin/email/logs` — Versandprotokoll

---

## Tests ausführen

```bash
npm run test:email    # Statische E-Mail-System-Tests
npm run test:crm      # CRM inkl. E-Mail-Export-Check
```

Manuell nach Deploy:

1. Test-E-Mail im Admin senden
2. Kontaktformular auf der Website ausfüllen
3. Bewertung absenden
4. `email_logs` im Admin prüfen

---

## Technische Referenz

| Modul | Pfad |
|-------|------|
| Haupt-API | `lib/email.ts` |
| Transport + Retry | `lib/email/transport.ts` |
| HTML-Builder | `lib/email/builders.ts` |
| Layout-Wrapper | `lib/email/html.ts` |
| Vorlagen | `lib/email/templates-db.ts` |
| Rendering | `lib/email/render.ts` |
| Logging | `lib/email/log.ts` |
| Absender-Auflösung | `lib/email/sender.ts` |
| Domain-Status | `lib/email/resend-status.ts` |

---

*Panda-Bande Kinderevents — E-Mail-System v1.0*
