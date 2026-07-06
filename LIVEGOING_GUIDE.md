# Panda-Bande — Livegang-Anleitung

Schritt-für-Schritt-Anleitung für den produktiven Start von Panda-Bande Kinderevents.

---

## Voraussetzungen

- Vercel-Projekt mit Deployment
- Supabase-Projekt mit allen Migrationen
- Resend-Account
- Eigene Domain (optional zum Start, empfohlen für Livegang)

---

## Phase 1: Technische Basis (ca. 30 Min.)

### 1. Supabase prüfen

1. Alle Migrationen in `supabase/migrations/` ausgeführt
2. Storage-Buckets: `gallery`, `reviews`, `site-assets`
3. `site_settings` enthält CMS-Daten

### 2. Vercel Environment Variables

In Vercel → Settings → Environment Variables:

| Variable | Wert |
|----------|------|
| `NEXT_PUBLIC_SITE_URL` | `https://ihre-domain.de` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key |
| `RESEND_API_KEY` | Resend API Key |
| `ADMIN_PASSWORD` | Nur bis erster Admin-Benutzer |

**Wichtig:** Nach Änderung an `NEXT_PUBLIC_*` neu deployen.

### 3. Deployment

```bash
git push origin main
# oder Merge des Release-PRs — Vercel deployt automatisch
```

Prüfen: Build erfolgreich, keine Fehler in Vercel Logs.

---

## Phase 2: Admin einrichten (ca. 15 Min.)

1. `/admin` öffnen
2. Mit `ADMIN_PASSWORD` einloggen (falls noch kein Benutzer)
3. **Sicherheit → Benutzer** → ersten Admin anlegen
4. **Sicherheit → 2FA** → für Owner aktivieren
5. Passwort ändern

---

## Phase 3: Inhalte & Unternehmensdaten (ca. 30–60 Min.)

1. **Einstellungen → Unternehmensdaten** — Firma, Adresse, IBAN, PDF-Texte
2. **Einstellungen → E-Mail** — Absender, Reply-To, Empfänger
3. **Website → Inhalte** — Hero, Texte, Kontakt
4. **Website → Team** — öffentliche Teammitglieder
5. **Impressum/Datenschutz** — echte Firmendaten (rechtlich prüfen lassen)

---

## Phase 4: Domain verbinden

Siehe `DOMAIN_EMAIL_SETUP_GUIDE.md` für Details.

1. Domain bei Anbieter kaufen
2. In Vercel: Domain hinzufügen
3. DNS-Einträge setzen (A/CNAME laut Vercel)
4. `NEXT_PUBLIC_SITE_URL` auf finale Domain setzen
5. Redeploy

---

## Phase 5: E-Mail live schalten

1. Domain in Resend hinzufügen und DNS verifizieren
2. Absender-E-Mail in Admin setzen (z. B. `info@ihre-domain.de`)
3. Test-E-Mail senden (Einstellungen → E-Mail)
4. Kontaktformular auf Website testen
5. Dashboard: kein gelber Hinweis „Resend-Testdomain aktiv"

---

## Phase 6: Finaler Test

`RELEASE_CHECKLIST.md` vollständig abarbeiten.

Automatische Checks:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:crm
npm run live:verify   # falls URL gesetzt
```

---

## Phase 7: Go-Live

1. DNS auf Produktion zeigen lassen
2. Website in Browser testen (Desktop + Mobile)
3. Google Search Console: Sitemap einreichen (`/sitemap.xml`)
4. Optional: Google Analytics / Business Profile

---

## Nach dem Livegang

- Erste 48h: Vercel- und Supabase-Logs beobachten
- Wöchentlich: Supabase-Backup prüfen
- Bei Problemen: `TECHNICAL_RUNBOOK.md`

---

## Rollback

1. Vercel: vorheriges Deployment promoten
2. Datenbank: nur über Supabase-Backup restoren
3. Git: `git checkout v1.0-checkpoint` als Referenzstand
