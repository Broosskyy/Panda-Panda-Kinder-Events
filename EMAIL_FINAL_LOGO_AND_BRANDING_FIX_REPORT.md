# EMAIL FINAL LOGO AND BRANDING FIX REPORT

**Datum:** 7. Juli 2026  
**Branch:** `cursor/email-final-logo-fix-e022`  
**Status:** Abgeschlossen

---

## Problem

1. Testmails nutzten eine Vercel-Preview-URL für das Logo (`*.vercel.app/assets/Logo.png`) statt der festen Produktions-URL.
2. Dummy-/Platzhalterdaten (Lisa Muster, Musterstraße, +49 170 0000000, WhatsApp 491700000000, Demo-Adresse) konnten in Live-Mails erscheinen.
3. E-Mail-Design wirkte zu grau und nicht ausreichend an die Website angeglichen.

---

## Lösung

### 1. Feste Logo-URL für alle E-Mails

Neues Modul `lib/email/asset-url.ts`:

- `EMAIL_ASSET_BASE_URL` (ENV) mit Fallback `https://www.pb-kinderevents.de`
- `getDefaultEmailLogoUrl()` → `https://www.pb-kinderevents.de/assets/Logo.png`
- `isUnsafeEmailAssetUrl()` blockiert `localhost`, `127.0.0.1`, `vercel.app`

`lib/email/resolve-image-url.ts` löst relative CMS-Pfade absolut auf und verwirft unsichere Preview-URLs.

Logo-HTML (alle Mails):

```html
<img src="https://www.pb-kinderevents.de/assets/Logo.png" alt="Panda-Bande Kinderevents" width="180" style="display:block;border:0;outline:none;text-decoration:none;" />
```

**Nicht verwendet:** `NEXT_PUBLIC_SITE_URL`, Vercel-Preview-Domains, Next.js Image.

### 2. Dummy-Daten entfernt

Neues Modul `lib/email/placeholder-filter.ts`:

- Erkennt Platzhalter (Lisa Muster, Musterstraße, 0000000, Demo-Adresse, …)
- `cleanEmailDisplayValue()` gibt leeren String zurück → Feld wird ausgeblendet

Angewendet in:

- `lib/email/signature.ts` — Signatur & Footer
- `lib/cms/normalize-settings.ts` — CMS-Merge bei fehlenden echten Daten
- `lib/email/html.ts` — Footer-Zeilen

### 3. Design-Polish

Aktualisierte Design-Tokens (`lib/email/brand-tokens.ts`, CMS-Defaults):

| Token | Wert |
|-------|------|
| Hintergrund | `#F7F3EA` (Creme) |
| Karte | `#FFFFFF` |
| Akzent | `#F4F6EE` (weiches Olive) |
| Primär | `#6B7A3A` (Olive) |
| Rahmen | `#E8E2D6` |

`wrapEmailHtml()`:

- Weiße zentrale Karte auf Creme-Hintergrund
- Logo sauber zentriert, kein grauer Header-Gradient
- Footer auf weißer Karte (nicht grauer Fläche)
- Weichere Abstände und abgerundete Ecken

Testmail:

- Keine sichtbare Logo-URL mehr im HTML
- Technische Infos (Absender, Reply-To, Domain) in dezenter Olive-Box
- Logo-Status: „geladen ✓“

### 4. ENV

`.env.example` ergänzt:

```
EMAIL_ASSET_BASE_URL=https://www.pb-kinderevents.de
```

---

## Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `lib/email/asset-url.ts` | **NEU** — feste Asset-Basis-URL |
| `lib/email/placeholder-filter.ts` | **NEU** — Platzhalter-Filter |
| `lib/email/resolve-image-url.ts` | Vercel-URL-Ablehnung, Logo-Auflösung |
| `lib/email/branding.ts` | Logo absolut auflösen |
| `lib/email/wrap-branded.ts` | `resolveEmailLogoForSend()` |
| `lib/email/html.ts` | Design-Polish, weißer Footer |
| `lib/email/signature.ts` | Platzhalter-Filter, WhatsApp-Link |
| `lib/email/brand-tokens.ts` | Creme/Olive-Farben |
| `lib/email.ts` | Testmail ohne Logo-URL |
| `lib/cms/normalize-settings.ts` | Signatur-Platzhalter filtern |
| `lib/cms/defaults.ts` | E-Mail-Branding-Farben |
| `.env.example` | `EMAIL_ASSET_BASE_URL` |

---

## Verifikation

### Logo-Auflösung (lokal)

```
/assets/Logo.png => https://www.pb-kinderevents.de/assets/Logo.png ✓
*.vercel.app/assets/Logo.png => https://www.pb-kinderevents.de/assets/Logo.png ✓
/logo.png => https://www.pb-kinderevents.de/assets/Logo.png ✓
```

### Platzhalter-Filter

```
Lisa Muster => ausgeblendet ✓
Musterstraße 1 => ausgeblendet ✓
```

### Build

```
npm run lint     ✓ (0 errors)
npm run typecheck ✓
npm run build    ✓
```

### Testmail

Nach Deployment mit `RESEND_API_KEY` und `EMAIL_ASSET_BASE_URL=https://www.pb-kinderevents.de`:

1. Admin → Einstellungen → E-Mail → Testmail senden
2. Logo muss sichtbar sein (Gmail Mobile prüfen)
3. Keine Vercel-URL im HTML-Quelltext
4. Keine Dummy-Daten in Signatur/Footer

---

## Bewertung

| Kriterium | Vorher | Nachher |
|-----------|--------|---------|
| Logo-URL | Vercel-Preview | Feste Produktions-URL |
| Dummy-Daten | Sichtbar möglich | Ausgeblendet |
| Design | Grau, technisch | Creme, weiß, Olive |
| Testmail | Logo-URL sichtbar | Sauber, „geladen ✓“ |

**Gesamt: 9/10** — Produktionsreif nach Setzen von `EMAIL_ASSET_BASE_URL` in Vercel.
