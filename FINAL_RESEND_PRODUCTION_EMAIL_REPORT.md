# Final Resend Production Email Report

## Zusammenfassung

Das gesamte E-Mail-System wurde auf die **Produktionsadresse** umgestellt. Alle ausgehenden Mails nutzen einheitlich:

| Feld | Wert |
|------|------|
| **From** | `Panda-Bande <info@pb-kinderevents.de>` |
| **Reply-To** | `info@pb-kinderevents.de` |
| **Admin-Empfänger** | `info@pb-kinderevents.de` (sofern CMS leer) |

Der Versand läuft weiterhin ausschließlich über **Resend** (`lib/email/transport.ts`).

---

## Entfernte Entwicklungs-/Fallback-Absender

| Adresse | Status |
|---------|--------|
| `onboarding@resend.dev` | Entfernt — kein automatischer Test-Absender mehr |
| `hallo@panda-bande-events.de` | Als veraltet erkannt → ersetzt durch `info@pb-kinderevents.de` |
| `kontakt@` (unvollständig) | Entfernt aus CMS-Defaults |
| `noreply@` | Entfernt aus Standard-Alias-Liste |
| `@panda-bande-events.de` | Als veraltete Domain in `normalizeProductionEmail()` abgefangen |

---

## Technische Änderungen

### Kernlogik (`lib/email/sender.ts`)

- Neue Hilfsfunktionen: `normalizeProductionEmail()`, `normalizeSenderName()`
- `resolveEmailSender()` verwendet **immer** die Produktionsadresse — kein Resend-Testdomain-Fallback
- `mergeEmailSettings()` normalisiert alle Empfänger- und Absenderfelder beim Laden
- `usesTestDomain` bedeutet jetzt: **Domain in Resend noch nicht verifiziert** (nicht: Test-Absender aktiv)

### Konstanten (`lib/email/constants.ts`)

```typescript
DEFAULT_COMPANY_EMAIL = "info@pb-kinderevents.de"
DEFAULT_SENDER_NAME = "Panda-Bande"
DEFAULT_FROM_ADDRESS = "Panda-Bande <info@pb-kinderevents.de>"
```

### CMS-Defaults (`lib/cms/defaults.ts`)

- `senderName`: `Panda-Bande`
- Alle E-Mail-Empfänger-Felder: `info@pb-kinderevents.de`
- `customAddresses`: vollständige Produktionsadressen statt Prefixe wie `kontakt@`

### Aliase (`lib/email/aliases-db.ts`)

Standard-Aliase ohne `noreply@`, `kontakt@`, `hallo@` — alle leiten auf `info@pb-kinderevents.de` weiter.

### CRM-Versand

- Angebote/Rechnungen: Resend-Testdomain-Ausnahme entfernt — Versand nur bei verifizierter Domain

### Admin-UI

- Dashboard und Einstellungen zeigen keinen Hinweis mehr auf `onboarding@resend.dev`
- Stattdessen: Hinweis auf Resend-Domain-Verifizierung für `pb-kinderevents.de`

---

## Geprüfte E-Mail-Flows

| Flow | From | Reply-To | Admin/Empfänger |
|------|------|----------|-----------------|
| Kontaktformular (Admin) | Produktion | Kunden-E-Mail | `info@pb-kinderevents.de` |
| Kontaktformular (Kundenbestätigung) | Produktion | `info@pb-kinderevents.de` | Kunde |
| Bewertungsanfrage | Produktion | `info@pb-kinderevents.de` | Kunde |
| Neue Bewertung (Admin) | Produktion | `info@pb-kinderevents.de` | `info@pb-kinderevents.de` |
| Angebote (PDF) | Produktion | `info@pb-kinderevents.de` | Kunde + Kopie |
| Rechnungen (PDF) | Produktion | `info@pb-kinderevents.de` | Kunde + Kopie |
| Passwort vergessen | Produktion | `info@pb-kinderevents.de` | Admin |
| Test-E-Mail (Admin) | Produktion | `info@pb-kinderevents.de` | Testempfänger |

Alle Flows nutzen `resolveEmailSender()` / `resolveFlowEmailSender()` → `sendEmailWithRetry()` → Resend.

---

## Voraussetzung für Live-Versand

1. `RESEND_API_KEY` in Vercel/`.env.local` setzen
2. Domain **`pb-kinderevents.de`** in Resend verifizieren (DKIM/SPF)
3. Optional: CMS unter **Einstellungen → E-Mail** prüfen (Werte können leer bleiben — Fallback greift)

Ohne verifizierte Domain zeigt das Admin-Panel einen Hinweis; der konfigurierte Absender bleibt trotzdem `info@pb-kinderevents.de`.

---

## Tests & Build

```bash
npm run test:email   # 41/41
npm run lint         # OK
npm run typecheck    # OK
npm run build        # OK
```

Neue E-Mail-Tests:

- Kein `onboarding@resend.dev` / `RESEND_TEST_FROM` in `sender.ts`
- `DEFAULT_SENDER_NAME = "Panda-Bande"`
- `normalizeProductionEmail()` vorhanden

---

## Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `lib/email/constants.ts` | Sender-Name + From-Konstante |
| `lib/email/sender.ts` | Produktions-Normalisierung, kein Test-Fallback |
| `lib/email/resend-status.ts` | Keine Testdomain-Logik mehr |
| `lib/email.ts` | Test-E-Mail-Texte aktualisiert |
| `lib/cms/defaults.ts` | Produktions-Defaults |
| `lib/email/aliases-db.ts` | Bereinigte Standard-Aliase |
| `src/app/api/admin/quotes/[id]/send/route.ts` | Keine resend.dev-Ausnahme |
| `src/app/api/admin/invoices/[id]/send/route.ts` | Keine resend.dev-Ausnahme |
| `components/admin/views/DashboardView.tsx` | UI-Hinweise |
| `components/admin/views/SettingsView.tsx` | UI-Hinweise |
| `components/admin/email/EmailBrandingPanel.tsx` | UI-Hinweise |
| `.env.example` | Dokumentation |
| `scripts/email-system-test.mjs` | Erweiterte Tests |
