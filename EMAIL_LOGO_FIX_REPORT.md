# EMAIL LOGO FIX REPORT

**Datum:** 2026-07-07  
**Branch:** `cursor/fix-email-logo-e022`  
**Problem:** Test-E-Mails kamen korrekt an, aber das Logo/Bild im Header wurde nicht geladen.

---

## Ursache

E-Mail-Clients können keine relativen Bildpfade (`/assets/Logo.png`) oder lokale CMS-Pfade auflösen. Der zentrale Layout-Renderer `wrapEmailHtml()` hat zwar ein `<img>`-Tag erzeugt, aber `src` enthielt teils relative Pfade. Zusätzlich nutzte `getSiteUrl()` historisch die falsche Fallback-Domain (`panda-bande-events.de` statt `pb-kinderevents.de`).

---

## Lösung

### Neues Modul: `lib/email/resolve-image-url.ts`

| Funktion | Zweck |
|----------|--------|
| `getEmailAssetBaseUrl()` | Basis-URL für E-Mail-Bilder: `NEXT_PUBLIC_SITE_URL` → `getSiteUrl()` → `https://pb-kinderevents.de` (kein localhost) |
| `resolveEmailImageUrl()` | Relativ → absolut; absolute URLs unverändert; `data:`-URLs verworfen; Supabase-`site-assets`-Pfade via `resolveImageUrl()` |
| `buildEmailLogoHeaderHtml()` | Logo mit absoluter URL **oder** Text-Fallback „Panda-Bande Kinderevents“ (kein broken image) |
| `buildEmailHeaderImageRow()` | Optionales Header-Bild mit absoluter URL |

Konstanten:
- `EMAIL_LOGO_ALT = "Panda-Bande Kinderevents"`
- `EMAIL_ASSET_BASE_FALLBACK = "https://pb-kinderevents.de"`

### Zentraler Renderer: `lib/email/html.ts`

- Logo und Header-Bild werden ausschließlich über die neuen Resolver-Funktionen eingebunden.
- Keine relativen `src`-Attribute mehr in der Ausgabe.

### Aktualisierte Aufrufer

| Datei | Änderung |
|-------|----------|
| `lib/email/wrap-branded.ts` | `getEmailAssetBaseUrl()` für alle CMS-Vorlagen |
| `lib/email/builders.ts` | Branded E-Mails (Anfrage, Bewertung) |
| `lib/email/render.ts` | Template-Variable `logo_url` als absolute URL |
| `lib/email.ts` | Test-E-Mail, Auto-Reply-Fallback, CRM-Dokumente |
| `lib/brand/resolve.ts` | `toAbsoluteBrandUrl()` delegiert an `resolveEmailImageUrl()` |
| `lib/site-url.ts` | Default → `https://pb-kinderevents.de` |
| `src/app/api/admin/email/compose/route.ts` | Kein `getSiteUrl()` mehr als Bild-Basis |

### Verhalten

```
/assets/Logo.png     → https://pb-kinderevents.de/assets/Logo.png
logo.png             → https://pb-kinderevents.de/logo.png
https://cdn…/x.png   → unverändert
(leer / data: URL)   → Text-Fallback „Panda-Bande Kinderevents“
```

- Kein Base64 in E-Mails
- Alt-Text immer: **Panda-Bande Kinderevents**

---

## Tests & Verifikation

### Automatisiert

```bash
npm run test:email   # 55 passed (inkl. Logo-URL-Checks)
npm run lint         # 0 errors
npm run typecheck    # OK
npm run build        # OK
```

### Runtime-Check (tsx)

```bash
npx tsx -e "import { wrapEmailHtml } from './lib/email/html.ts'; ..."
```

Ergebnis:
- Absolute Logo-URL: `https://pb-kinderevents.de/assets/Logo.png` ✓
- Alt-Text gesetzt ✓
- Keine relativen `img src` ✓
- Text-Fallback ohne `<img>` bei leerem Logo ✓

### Test-E-Mail (manuell in Produktion)

In dieser Cloud-Umgebung ist kein `RESEND_API_KEY` gesetzt — Live-Versand nicht möglich.

**Nach Deploy bitte prüfen:**

1. Admin → E-Mails → Test-E-Mail senden
2. In der empfangenen Mail: Logo sichtbar unter `https://pb-kinderevents.de/assets/Logo.png` (oder CMS-Logo-URL)
3. Rechtsklick auf Bild → „Adresse kopieren“ → muss mit `https://` beginnen

---

## Betroffene E-Mail-Typen

Alle Pfade über `wrapEmailHtml()` / `wrapBrandedEmailHtml()`:

- Test-E-Mail
- Kontaktanfrage (Admin + Auto-Reply)
- Bewertung (Admin + Anfrage)
- Angebot / Rechnung (CRM)
- Passwort-Reset
- Admin Compose / CMS-Vorlagen

---

## Zusammenfassung

| Kriterium | Status |
|-----------|--------|
| Absolute öffentliche Bild-URLs | ✅ |
| Basis `NEXT_PUBLIC_SITE_URL` + Fallback `pb-kinderevents.de` | ✅ |
| CMS/Branding-Logo korrekt aufgelöst | ✅ |
| Kein Base64 / keine lokalen Pfade | ✅ |
| Alt-Text „Panda-Bande Kinderevents“ | ✅ |
| Text-Fallback statt broken image | ✅ |
| lint / typecheck / build | ✅ |
