# EMAIL COMPATIBILITY REPORT

## Getestete Strategie

| Anforderung | Umsetzung |
|-------------|-----------|
| Inline CSS | Alle Styles inline oder in `<style>` mit Media Queries |
| Keine CSS Grids | Table-basiertes Layout (`role="presentation"`) |
| Keine Animationen | Keine CSS-Animationen/Transitions |
| Keine externen Fonts | `Helvetica, Arial, sans-serif` |
| Absolute Bild-URLs | `EMAIL_ASSET_BASE_URL` — keine Preview-Domains |
| Alt-Texte | Logo: Firmenname/Markenname |
| Responsive | `@media (max-width: 600px)` Padding-Anpassungen |

## Client-Kompatibilität

| Client | Status | Hinweise |
|--------|--------|----------|
| Gmail (Web/Mobile) | ✓ | Table-Layout, inline styles |
| Apple Mail (iOS/macOS) | ✓ | `color-scheme` meta |
| Outlook.com | ✓ | Tables, keine Grid/Flex im Body |
| Outlook Desktop | ⚠ | Auto-Dark via Media Query eingeschränkt |
| GMX / WEB.DE | ✓ | Standard HTML-Tables |
| Yahoo Mail | ✓ | Inline CSS |
| Android Mail | ✓ | Responsive padding |

## Bilder

- Nur `https://` absolute URLs
- Logo: `width` Attribut (CMS, Standard 140px)
- Header-Bild: max-width 600px

## Barrierefreiheit

- `lang="de"` auf `<html>`
- Logo `alt`-Text aus Markenname
- Ausreichende Farbkontraste (Olive auf Weiß/Creme)
- Keine rein farbcodierten Informationen ohne Text

## Bekannte Einschränkungen

1. **Dark Mode Auto** — nicht alle Clients unterstützen `prefers-color-scheme` in E-Mails
2. **Outlook Desktop** — border-radius und box-shadow können abweichen
3. **Custom Fonts** — bewusst nicht verwendet (Kompatibilität > Design)
4. **Open Tracking** — Schema vorhanden, Webhooks noch nicht aktiv
