# RC2 Security & Privacy Report

**Version:** 0.9.0-rc.2  
**Datum:** 2026-07-05  
**Branch:** `cursor/rc2-security-e022`

---

## RC2 Status: ✔ CODE ABGESCHLOSSEN — Live-Verifikation ausstehend

Alle geplanten Code-Maßnahmen sind umgesetzt. Build und Lint bestanden.

---

## Gefundene Risiken (Audit)

| Risiko | Schwere | Status |
|--------|---------|--------|
| Admin-Cookie = Base64(Passwort) | Kritisch | ✔ behoben — HMAC-signierte Session |
| Kein Login Rate Limit | Hoch | ✔ behoben — 5/15min |
| Upload: MIME ODER Extension | Hoch | ✔ behoben — AND + Magic Bytes |
| Upload: unsanitizierter Ordner | Mittel | ✔ behoben — Allowlist |
| Mass-Assignment Admin APIs | Mittel | ✔ behoben — Zod-Schemas |
| Keine Security Headers | Mittel | ✔ behoben — Middleware |
| Kein Spam-Schutz Formulare | Hoch | ✔ behoben — Honeypot + Timing + Rate Limit |
| Fehlende Input Max-Längen | Mittel | ✔ behoben |
| API Error Leakage | Mittel | ✔ behoben — generische Meldungen |
| Analytics RPC öffentlich | Mittel | ✔ Migration erstellt |
| Datenschutz unvollständig | Mittel | ✔ technisch vorbereitet |

---

## Umgesetzte Maßnahmen

### Admin Security
- ✔ Zufällige Session-ID + HMAC-SHA256 Signatur
- ✔ httpOnly, secure (Production), sameSite=strict, 8h Ablauf
- ✔ Timing-safe Passwortvergleich
- ✔ Login Rate Limit (5/15min/IP)
- ✔ Logout löscht Cookie zuverlässig
- ✔ ADMIN_PASSWORD nie im Client

### API Routes
- ✔ Alle `/api/admin/*` mit `requireAdmin()`
- ✔ Reviews/Bookings vereinheitlicht
- ✔ Öffentliche Routen: nur erlaubte Operationen
- ✔ Reviews GET: explizite Spalten, nur `approved=true`
- ✔ Keine `error.message` an öffentliche Clients

### Supabase / RLS
- ✔ Bestehende deny-all Policies dokumentiert
- ✔ Migration `20260705_rc2_security_rls.sql` — RPC REVOKE
- ✔ Service Role nur serverseitig

### Input Validation
- ✔ Zod Max-Längen für Kontakt + Bewertungen
- ✔ Datumsformat-Validierung
- ✔ HTML-Stripping (`stripHtml`)
- ✔ Instagram-URL-Validierung im CMS
- ✔ Admin-Schemas für Services, FAQ, Galerie

### Upload Security
- ✔ JPEG/PNG/WebP only (MIME + Extension + Magic Bytes)
- ✔ 5 MB Maximum
- ✔ Eindeutige Dateinamen
- ✔ Ordner-Allowlist pro Bucket
- ✔ Pfad-Validierung bei DELETE

### Spam-Schutz
- ✔ Honeypot-Feld (`website`)
- ✔ Mindest-Submit-Zeit (3 Sekunden)
- ✔ Rate Limits: Inquiry 5/h, Reviews 3/h, Track 120/h, Login 5/15min
- ✔ IP nur im Arbeitsspeicher für Rate Limit — nicht in DB gespeichert

### Datenschutz / Legal
- ✔ Datenschutzseite mit allen geforderten Abschnitten
- ✔ Klarer Hinweis: „Vor Veröffentlichung rechtlich prüfen“
- ✔ Impressum/AGB: weiterhin Platzhalter (Inhaltssache)

### Security Headers
- ✔ X-Content-Type-Options: nosniff
- ✔ X-Frame-Options: DENY
- ✔ Referrer-Policy: strict-origin-when-cross-origin
- ✔ Permissions-Policy
- ✔ HSTS (Production)
- ✔ CSP (self + Supabase + Unsplash + Fonts)

### Error Handling
- ✔ `safeApiError()` — log serverseitig, generisch clientseitig
- ✔ Keine Stacktraces öffentlich
- ✔ Keine ENV-Werte in Responses

---

## Regression Test

| Funktion | Build | Manuell |
|----------|-------|---------|
| Admin Login | ✔ Code | ⏳ nach Deploy |
| CMS speichern | ✔ Code | ⏳ nach Deploy |
| Galerie Upload | ✔ Code | ⏳ nach Deploy |
| Beitrag erstellen | ✔ Code | ⏳ nach Deploy |
| Bewertung absenden | ✔ Code | ⏳ nach Deploy |
| Bewertung freigeben | ✔ Code | ⏳ nach Deploy |
| Kontaktformular | ✔ Code | ⏳ nach Deploy |
| Statistik | ✔ Code | ⏳ nach Deploy |
| Öffentliche Website | ✔ Build | ⏳ nach Deploy |
| Responsive | ✔ unverändert | ⏳ nach Deploy |

---

## Build & Lint

| Check | Ergebnis |
|-------|----------|
| `npm run build` | ✔ bestanden |
| `npm run lint` | ✔ bestanden |

---

## Offene Punkte vor Launch

1. Migration `20260705_rc2_security_rls.sql` auf Supabase Production ausführen
2. Rechtstexte juristisch finalisieren
3. Speicherdauer in Datenschutz festlegen
4. Manueller Test: Admin Login, Formulare, Uploads nach Deploy
5. Optional: Turnstile/CAPTCHA bei anhaltendem Spam

---

## Dokumentation

- `docs/05_ROADMAP/SECURITY_PRIVACY_RC2.md` — Daten, Zugriff, Backups
- `docs/05_ROADMAP/RC2_SECURITY_PRIVACY_REPORT.md` — dieser Report
