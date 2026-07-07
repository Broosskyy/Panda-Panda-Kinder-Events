# Team Section CMS Data Fix Report

**Branch:** `cursor/team-section-cms-data-fix-e022`  
**Datum:** 2026-07-07

---

## Problem

Teammitglieder wurden im Admin (Website → Team) angelegt, erschienen auf der öffentlichen Website aber nicht. Stattdessen wurden Platzhalter wie „Lisa“, „Panda-Bande Team“ oder generische Default-Daten angezeigt.

---

## Ursachenanalyse

| # | Frage | Antwort |
|---|--------|---------|
| 1 | **Admin-Datenquelle** | Tabelle `team_members` via `/api/admin/team` und `lib/team/db.ts` |
| 2 | **Öffentliche Datenquelle (vorher)** | `site_settings` → Key `publicTeam` über `fetchSiteSettings()` |
| 3 | **Warum Platzhalter?** | Mehrere Fallback-Ebenen griffen ein: |

### Konkrete Fehlerquellen

1. **`validate-settings.ts`**: `publicTeam` schlug fehl bei leerem `subtitle` oder leerem `items`-Array → `cmsSection()` gab **komplette Defaults** zurück (inkl. Platzhalter-Mitglieder).

2. **`normalize-settings.ts`**: Bei leeren `items` → Fallback auf `DEFAULT_SITE_SETTINGS.publicTeam.items`.

3. **`defaults.ts`**: Enthielt ein Dummy-Teammitglied („Panda-Bande Team“).

4. **`About.tsx`**: Default-Prop `team = DEFAULT_SITE_SETTINGS.publicTeam` und `fallbackSrc` für Bilder.

5. **Sync vs. Read**: Admin schreibt bei CRUD nach `publicTeam` (Sync), die öffentliche Seite las aber bei Validierungsfehlern wieder Defaults — nicht die Live-Tabelle `team_members`.

---

## Lösung

### Source of Truth für öffentliche Anzeige

Neues Modul **`lib/team/public.ts`**:

- `fetchPublicTeamMembers()` — liest direkt aus `team_members`
  - Filter: `active = true`, `archived = false`
  - Sortierung: `sort_order`, dann Name
  - Felder: Name, Position/Rolle, Beschreibung, Profilbild (mit `resolveImageUrl`)

- `fetchPublicTeam()` — kombiniert Sektions-Titel/Untertitel aus CMS mit Live-Mitgliedern

### Startseite

`src/app/page.tsx` nutzt `fetchPublicTeam()` statt `settings.publicTeam.items`.

### Platzhalter entfernt

- `defaults.ts`: `publicTeam.items = []`
- `normalize-settings.ts`: leeres Array statt Default-Mitglieder
- `data.ts`: `mergePublicTeamSettings()` — nur Titel/Untertitel aus CMS, **keine** gecachten `items` in Settings
- `validate-settings.ts`: leeres `items`-Array und leerer `subtitle` erlaubt
- `About.tsx`: kein Default-Team, kein Bild-Fallback auf About-Foto

### Sync (Admin → CMS Cache)

`syncTeamMembersToPublicCms()` bleibt für Konsistenz im Admin erhalten; die öffentliche Website ignoriert gecachte `items` und liest live aus `team_members`.

---

## Verhalten nach Fix

| Situation | Öffentliche Anzeige |
|-----------|---------------------|
| Aktive Teammitglieder in Admin | Nur diese, sortiert nach `sort_order` |
| Keine aktiven Mitglieder | Team-Grid wird ausgeblendet (kein Platzhalter) |
| Mitglied ohne Bild | Initialen-Avatar (kein fremdes Stock-Foto) |
| Admin speichert/aktiviert | Sofort sichtbar (direkter DB-Read, `force-dynamic`) |

---

## Geänderte Dateien

```
lib/team/public.ts                 (neu)
lib/team/sync-public.ts
lib/cms/defaults.ts
lib/cms/data.ts
lib/cms/normalize-settings.ts
lib/cms/validate-settings.ts
components/sections/About.tsx
src/app/page.tsx
scripts/email-system-test.mjs
```

---

## Verifikation

```bash
npm run lint
npm run typecheck
npm run build
node scripts/email-system-test.mjs
```

### Manueller Test

1. Admin → Team → Mitglied anlegen (Name, Position, Bild, `active`)
2. Speichern
3. Öffentliche Startseite → Über uns → Team-Grid prüfen
4. Sortierung per `sort_order` testen
5. Mitglied deaktivieren → darf nicht mehr erscheinen
6. Keine Platzhalter-Namen (Lisa, Panda-Bande Team als Dummy)
