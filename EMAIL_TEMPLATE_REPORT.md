# EMAIL TEMPLATE REPORT

## Verwaltete Vorlagen

| Slug | Name | Footer | Info-Box |
|------|------|--------|----------|
| `inquiry-auto-reply` | Anfrage Kunde | ✓ | ✓ |
| `inquiry-admin` | Anfrage Admin | ✗ | ✗ |
| `quote-send` | Angebot | ✓ | ✗ |
| `invoice-send` | Rechnung | ✓ | ✗ |
| `review-admin` | Bewertung erhalten | ✗ | ✗ |
| `review-request` | Bewertungsanfrage | ✓ | ✗ |
| `password-reset` | Passwort vergessen | ✓ | ✗ |
| `account-created` | Account erstellt | ✓ | ✗ |
| `email-test` | Testmail | ✓ | ✗ |
| `general-message` | Allgemeine Nachricht | ✓ | ✗ |
| `security-login` | Login-Hinweis | ✗ | ✗ |

## Pro Template editierbar

- Betreff, Headline, Einleitung, Haupttext
- CTA Text + Link
- Info-Box (optional)
- Footer an/aus
- Logo / Markenname / Slogan sichtbar
- Theme-Override

## Renderer-Pipeline

1. `EmailTemplateLayout` aus DB oder Admin-Editor
2. `composeTemplateBodyHtml()` — Headline, Intro, Body, Info-Box, CTA
3. `wrapEmailHtml()` — Logo, Brand, Footer, Signatur

## HTML-Override

Experten-Modus: `body_html` ersetzt strukturierte Felder, behält aber globalen Shell-Renderer.

## Test-Tools

- **Testmail senden** — aktuelle (auch unsaved) Layout-Daten
- **Alle Templates testen** — sendet alle aktiven CORE-Vorlagen

## Variablen

Siehe Admin → Vorlagen → Platzhalter-Hilfe. Vollständige Liste in `EMAIL_CMS_REPORT.md`.
