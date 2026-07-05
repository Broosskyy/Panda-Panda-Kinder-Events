# E-Mail-Setup mit Resend

Diese Anleitung beschreibt die produktionsreife E-Mail-Konfiguration für Panda-Bande Kinderevents. Alle Absenderdaten werden **ausschließlich im CMS** gepflegt — nicht im Code oder in `.env` (außer dem API-Key).

## Übersicht

| Komponente | Zweck |
|------------|--------|
| `RESEND_API_KEY` | Authentifizierung bei Resend (`.env.local`) |
| CMS → Einstellungen → E-Mail | Firmenname, Absender, Reply-To, Benachrichtigungen |
| Resend Dashboard | Domain hinzufügen, DNS-Einträge, Verifizierung |

**Verhalten:**

- **Keine verifizierte Domain** → Versand über `onboarding@resend.dev` (Resend-Testdomain), Absendername aus dem CMS
- **Verifizierte Domain** → Versand über Ihre Firmenadresse, z. B. `Panda-Bande Kinderevents <info@panda-bande-events.de>`

Betroffen sind alle E-Mails: Kontaktanfragen, CRM-Angebote/Rechnungen, Test-E-Mails.

---

## 1. Resend-Account einrichten

1. Account unter [resend.com](https://resend.com) anlegen
2. **API Keys** → neuen Key erstellen
3. Key in `.env.local` eintragen:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

4. Entwicklungsserver neu starten (`npm run dev`)

> **Hinweis:** Ohne API-Key ist der E-Mail-Versand deaktiviert. Im Admin erscheint ein entsprechender Hinweis.

---

## 2. CMS-Einstellungen (E-Mail)

Im Admin: **Einstellungen → E-Mail**

| Feld | Beispiel | Beschreibung |
|------|----------|--------------|
| Firmenname | Panda-Bande Kinderevents | Erscheint in E-Mail-Signaturen |
| Absendername | Panda-Bande Kinderevents | Name im `From`-Feld |
| Absender-E-Mail | info@panda-bande-events.de | Ziel-Adresse nach Domain-Verifizierung |
| Reply-To-Adresse | info@panda-bande-events.de | Antworten landen hier |
| Benachrichtigungs-E-Mail | info@panda-bande-events.de | Kontaktanfragen & CRM-Kopien |

Nach dem Speichern zeigt der Bereich **Resend Domain Status** den aktuellen Zustand und den effektiven Absender.

### Testdomain-Hinweis

Solange keine eigene Domain verifiziert ist, erscheint im Admin:

> Momentan wird die Resend-Testdomain verwendet. Nach der Verifizierung einer eigenen Domain werden alle E-Mails automatisch über Ihre Firmenadresse versendet.

Der tatsächliche Versand erfolgt dann z. B. als:

```
From: Panda-Bande Kinderevents <onboarding@resend.dev>
Reply-To: info@panda-bande-events.de
```

---

## 3. Eigene Domain in Resend hinzufügen

1. Resend Dashboard → **Domains** → **Add Domain**
2. Domain eingeben, z. B. `panda-bande-events.de`
3. Resend zeigt die erforderlichen **DNS-Einträge**

### Typische DNS-Einträge

Die exakten Werte stehen in Ihrem Resend-Dashboard. Üblicherweise:

| Typ | Name | Wert | Zweck |
|-----|------|------|--------|
| TXT | `@` oder `_resend` | von Resend vorgegeben | Domain-Verifizierung |
| MX | `@` oder Subdomain | von Resend vorgegeben | E-Mail-Empfang (optional für Versand) |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | DMARC (empfohlen) |
| CNAME | `resend._domainkey` | von Resend vorgegeben | DKIM-Signatur |

### DNS beim Domain-Provider

1. DNS-Verwaltung Ihres Providers öffnen (z. B. IONOS, Strato, Cloudflare)
2. Einträge exakt wie in Resend angegeben anlegen
3. TTL: Standard (oft 300–3600 s)
4. **Propagation:** 5 Minuten bis 48 Stunden — meist unter 1 Stunde

### Verifizierung prüfen

- Resend Dashboard: Status **Verified**
- Admin: **Domain-Status prüfen** unter Einstellungen → E-Mail
- Optional: **Test-E-Mail senden** an eine eigene Adresse

---

## 4. Nach erfolgreicher Verifizierung

Sobald die Domain in Resend **verified** ist:

```
From: Panda-Bande Kinderevents <info@panda-bande-events.de>
Reply-To: info@panda-bande-events.de
```

**Kein Code-Deploy nötig** — das System erkennt den Status automatisch bei jedem Versand und in der Admin-Statusprüfung.

Im Admin erscheint statt des Testdomain-Hinweises:

> Eigene Domain aktiv. E-Mails werden über `Panda-Bande Kinderevents <info@…>` versendet.

---

## 5. Test-E-Mail senden

1. Einstellungen → E-Mail → Abschnitt **Test-E-Mail senden**
2. Empfänger-Adresse eingeben
3. **Test-E-Mail senden** klicken

Die Test-Mail enthält:

- Aktuellen Absender (`From`)
- Reply-To
- Domain-Status
- Hinweis, ob Testdomain oder eigene Domain aktiv ist

---

## 6. Umgebungsvariablen (Referenz)

```env
# Pflicht für E-Mail-Versand
RESEND_API_KEY=re_xxxxxxxx

# Optional: Fallback für Benachrichtigungen, wenn im CMS leer
INQUIRY_NOTIFICATION_EMAIL=info@ihre-domain.de
```

| Variable | Status |
|----------|--------|
| `RESEND_API_KEY` | **Erforderlich** |
| `RESEND_FROM_EMAIL` | **Entfernt** — Absender kommt aus dem CMS |
| `INQUIRY_NOTIFICATION_EMAIL` | Optionaler Fallback für Benachrichtigungs-E-Mail |

---

## 7. Domain wechseln / migrieren

### Neue Domain hinzufügen

1. Neue Domain in Resend anlegen und DNS verifizieren
2. Im CMS **Absender-E-Mail** und **Reply-To** auf die neue Adresse ändern
3. Speichern → **Domain-Status prüfen**
4. Test-E-Mail senden

### Alte Domain entfernen

1. CMS auf neue Adresse umstellen und testen
2. Erst danach alte Domain im Resend-Dashboard löschen

### Von Testdomain auf Produktion

1. Domain in Resend verifizieren
2. CMS-Felder mit Firmenadresse füllen (falls noch nicht geschehen)
3. Test-E-Mail senden — `From` sollte die Firmenadresse zeigen
4. Testdomain-Hinweis im Admin verschwindet automatisch

---

## 8. Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| „RESEND_API_KEY ist nicht gesetzt“ | Key in `.env.local`, Server neu starten |
| Testdomain trotz DNS | DNS-Propagation abwarten; Resend-Status prüfen |
| Domain „pending“ | Alle DNS-Einträge (SPF/DKIM) im Provider prüfen |
| E-Mails im Spam | DKIM/DMARC verifizieren; Absendername konsistent halten |
| 403 / Domain not verified | Absender-Domain muss in Resend als **verified** stehen |
| Keine Benachrichtigung bei Anfragen | **Benachrichtigungs-E-Mail** im CMS prüfen |

### API-Endpunkte (Admin)

- `GET /api/admin/email/status` — Domain-Status und aufgelöster Absender
- `POST /api/admin/email/test` — Test-E-Mail (`{ "to": "…" }`)

---

## 9. Technische Details (Entwickler)

- Absender-Logik: `lib/email/sender.ts` → `resolveEmailSender()`
- Domain-Prüfung: Resend API `domains.list()`, Abgleich mit Absender-Domain
- E-Mail-Versand: `lib/email.ts` (`sendInquiryNotification`, `sendCrmDocumentEmail`, `sendTestEmail`)
- CMS-Typ: `SiteEmailSettings` in `lib/cms/types.ts`, Sektion `email` in `site_settings`

Die Konstante `onboarding@resend.dev` ist die einzige fest codierte Adresse — sie wird nur verwendet, wenn keine eigene Domain verifiziert ist.
