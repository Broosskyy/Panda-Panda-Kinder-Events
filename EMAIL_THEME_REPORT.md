# EMAIL THEME REPORT

## Theme-Modi

| Modus | Verhalten |
|-------|-----------|
| **Hell** | Inline-Styles aus CMS Hell-Farben |
| **Dunkel** | Inline-Styles aus CMS Dunkel-Farben (`dark*` Felder) |
| **Automatisch** | Hell inline + `@media (prefers-color-scheme: dark)` Fallback |

## CMS Hell-Farben

- `backgroundColor`, `cardColor`, `primaryColor`, `secondaryColor`
- `textColor`, `textMutedColor`, `borderColor`, `accentColor`
- `buttonColor`, `buttonTextColor`, `linkColor`
- `cardRadius`, `shadowEnabled`

## CMS Dunkel-Farben

- `darkBackgroundColor` (#1a1a18)
- `darkCardColor` (#2a2a26)
- `darkPrimaryColor`, `darkSecondaryColor`
- `darkTextColor`, `darkTextMutedColor`, `darkBorderColor`
- `darkAccentColor`, `darkButtonColor`, `darkButtonTextColor`

## Template-Override

Jede Vorlage kann `themeOverride` setzen: `light` | `dark` | `auto` | leer (global).

## Preview

Admin-Vorschau: Desktop, Tablet, Mobil, **Hell**, **Dunkel**.

## Design-Tokens

`lib/email/design-system.ts` → `resolveActiveDesignTokens()` liefert konsistente Tokens für `html.ts` und `template-compose.ts`.

## Einschränkungen

- Outlook Desktop rendert `@media (prefers-color-scheme: dark)` nicht zuverlässig → Auto-Modus zeigt dort Hell-Variante
- Keine externen Webfonts (System-Font-Stack für Kompatibilität)
