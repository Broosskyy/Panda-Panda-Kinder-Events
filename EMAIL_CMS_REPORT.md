# EMAIL CMS REPORT

## Admin-Bereiche

| Route | Tab | Funktion |
|-------|-----|----------|
| `/admin/einstellungen?tab=email&emailTab=branding` | E-Mail Branding | Logo, Farben, Themes, Header |
| `/admin/einstellungen?tab=email&emailTab=signature` | Signatur | Footer-Kontaktdaten |
| `/admin/einstellungen?tab=email&emailTab=general` | Allgemein | Absender, Legacy-Texte |
| `/admin/einstellungen?tab=email&emailTab=testmode` | Testmodus | Umleitung + Prefix |
| `/admin/emails` | Vorlagen | Template-Editor + Preview |

---

## E-Mail Branding CMS-Felder

### Allgemein
- `companyName`, `senderName`, `replyTo`
- `adminEmail`, `website`, `defaultCtaUrl`
- `closingLine` (Abschlusssatz)

### Logo & Header
- `logoUrl` (absolute HTTPS)
- `logoWidth` (140), `logoHeight` (0=auto)
- `logoPaddingTop`, `logoPaddingBottom`
- `brandDisplayName`, `slogan`
- `showLogo`, `showBrandName`, `showSlogan`
- `headerImageUrl`

### Theme Hell
- `backgroundColor`, `cardColor`, `primaryColor`, `secondaryColor`
- `textColor`, `textMutedColor`, `borderColor`, `accentColor`
- `buttonColor`, `buttonTextColor`, `linkColor`
- `cardRadius`, `shadowEnabled`, `fontFamily`, `theme`

### Theme Dunkel
- `darkBackgroundColor`, `darkCardColor`
- `darkPrimaryColor`, `darkSecondaryColor`
- `darkTextColor`, `darkTextMutedColor`, `darkBorderColor`
- `darkAccentColor`, `darkButtonColor`, `darkButtonTextColor`

---

## Signatur CMS-Felder

- Firma, Telefon, WhatsApp, Instagram, Facebook, TikTok, YouTube
- Website, Adresse, Öffnungszeiten
- Impressum, Datenschutz, Abschlusssatz, Freitext
- `showSocialIcons`

**Leere Felder werden ausgeblendet** — keine Dummy-Daten (`placeholder-filter.ts`).

---

## Template CMS-Felder (`EmailTemplateLayout`)

- `headline`, `intro`, `body`
- `infoBoxEnabled`, `infoBoxItems[]`
- `ctaText`, `ctaUrl`
- `footerEnabled`
- `showLogo`, `showBrandName`, `showSlogan`
- `themeOverride`

---

## ENV

```
EMAIL_ASSET_BASE_URL=https://www.pb-kinderevents.de
RESEND_API_KEY=re_...
```

---

## Variablen (Template)

| Variable | Beschreibung |
|----------|--------------|
| `{{customer_name}}` / `{{name}}` | Kundenname |
| `{{customer_email}}` / `{{email}}` | E-Mail |
| `{{customer_phone}}` / `{{phone}}` | Telefon |
| `{{event_type}}` / `{{eventType}}` | Event-Art |
| `{{event_date}}` / `{{eventDate}}` | Datum |
| `{{event_location}}` / `{{eventLocation}}` | Ort |
| `{{message}}` / `{{reviewText}}` | Nachricht |
| `{{quote_number}}` / `{{offerNumber}}` | Angebotsnr. |
| `{{invoice_number}}` / `{{invoiceNumber}}` | Rechnungsnr. |
| `{{total_amount}}` / `{{amount}}` | Betrag |
| `{{rating}}` | Sterne |
| `{{websiteUrl}}` / `{{website}}` | Website |
| `{{admin_url}}` / `{{adminUrl}}` | Admin-Link |
| `{{slogan}}`, `{{tagline}}` | Markentext |

Fehlende Werte → leer, nie `undefined`/`null`.
