# FINAL Visible Release Cleanup Report

**Branch:** `cursor/final-release-cleanup-e022`  
**Datum:** 2026-07-07  
**Ziel:** Sichtbare Restfehler, falsche Inhalte und widersprüchliche Statusanzeigen vor Release bereinigen — keine neuen Features.

---

## 1. E-Mail-Testmail & Domainstatus

| Anforderung | Umsetzung |
|-------------|-----------|
| Logo per absoluter URL | Bereits über `lib/email/resolve-image-url.ts` + `wrapEmailHtml` — fehlender Import in `lib/email.ts` ergänzt |
| Kein „Domain nicht verifiziert“ bei API-Einschränkung | `unknown` + erfolgreiche Testmail → grüner Hinweis mit `DOMAIN_MANUAL_CONFIRM_MESSAGE` |
| Einheitliche Texte | Zentral in `lib/email/domain-status-copy.ts` |
| Admin-Banner | `DomainVerificationBanner` + `EmailBrandingPanel` berücksichtigen `hasSuccessfulTest` |
| API | `/api/admin/email/status` liefert `hasSuccessfulTest` aus Versandprotokoll |

**Testmail-Text bei `unknown`:** „Versand funktioniert – Domainprüfung manuell in Resend bestätigt.“

---

## 2. Systemstatus

| Anforderung | Umsetzung |
|-------------|-----------|
| „Automatische Prüfung nicht möglich“ nicht kritisch | `softenUnavailableApiLevel` + `softenWhenTestMailSucceeded` in `lib/admin/status-summary.ts` |
| Versand/Resend/Zoho OK nach Testmail | `lib/admin/email-system-status.ts` + `lib/admin/system-status.ts` |
| Backup-Hinweis | `level: "ok"`, Meldung: **„Manuelles App-Backup verfügbar.“**, Aktion: Einstellungen → Systemstatus → Backup |

---

## 3. About / Team Inhalte

| Vorher | Nachher |
|--------|---------|
| Hardcoded „Gründerin & persönliche Ansprechpartnerin“ | Neutral: „Persönliche Ansprechpartnerin“ + „Liebevolle Betreuung mit Erfahrung.“ |
| Defaults „Lisa“ / „Gründerin“ | Defaults: „Panda-Bande Team“ / neutrale Texte |
| CMS „Manuel“ + „Gründerin“ | `sanitizeGenderedRole` + `sanitizeAboutIntro` in `normalize-settings.ts` |

---

## 4. Bilder / Crops

- Neue CSS-Klasse `.portrait-cover` (`object-fit: cover`, `object-position: center 22%`)
- Angewendet auf: About, Team, Galerie, Aktuelles
- Team ohne Bild: Initialen-Fallback (unverändert)

---

## 5. Blog / Aktuelles

- `isValidPublishedPost()` filtert Platzhalter-Titel und unpassende Bilder (z. B. Schnecke)
- `fetchPublishedPosts()` + `fetchPostBySlug()` nutzen den Filter
- Entwürfe mit `published: false` bleiben ausgeblendet

---

## 6. Admin UX

- Domain-Banner: Grün bei funktionierendem Versand, Gelb nur wenn Prüfung fehlt **ohne** Testmail
- Branding-Panel: gleiche Logik, keine widersprüchlichen unknown + nicht verifiziert Meldungen
- Systemstatus-Panel: laienfreundliche Ampel-Texte (unverändert, konsistent mit Backend)

---

## Geänderte Dateien (Auswahl)

```
lib/email/domain-status-copy.ts          (neu)
lib/admin/email-system-status.ts
lib/admin/system-status.ts
lib/admin/status-summary.ts
lib/email.ts
lib/email/resend-domain-check.ts
lib/email/resend-status.ts
lib/cms/defaults.ts
lib/cms/normalize-settings.ts
lib/cms/content-quality.ts
lib/cms/data.ts
components/admin/email/DomainVerificationBanner.tsx
components/admin/email/EmailBrandingPanel.tsx
components/admin/email/EmailSettingsShell.tsx
components/admin/views/SettingsView.tsx
components/admin/views/DashboardView.tsx
components/sections/About.tsx
components/sections/Gallery.tsx
components/sections/News.tsx
components/ui/TeamMemberImage.tsx
src/app/api/admin/email/status/route.ts
src/app/globals.css
scripts/email-system-test.mjs
```

---

## Verifikation

```bash
npm run lint        # ✓ 0 errors
npm run typecheck   # ✓
npm run build       # ✓
node scripts/email-system-test.mjs  # ✓ 65 passed
```

---

## Manuelle Checks (empfohlen)

1. **Admin → Einstellungen → E-Mail:** Testmail senden → grüner Domain-Hinweis bei API-Einschränkung
2. **Admin → Einstellungen → Systemstatus:** Backup-Zeile „Manuelles App-Backup verfügbar“
3. **Startseite → Über uns:** Kein „Gründerin“-Text bei männlichem CMS-Namen
4. **Aktuelles:** Keine Schnecke-/Platzhalter-Beiträge öffentlich sichtbar
