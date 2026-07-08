# Merge Report — package.json Konflikt

**Datum:** 2026-07-08  
**Branch:** `cursor/public-mobile-spacing-header-fix-e022`  
**Merge-Quelle:** `origin/cursor/admin-critical-onboarding-invites-email-e022`

## Konflikte

| Datei | Art |
|-------|-----|
| `package.json` | Content-Konflikt in `scripts` |

Keine weiteren Konfliktdateien. `src/app/globals.css` wurde automatisch gemergt.

## Ursache

Beide Branches haben dieselbe Stelle in `package.json` geändert:

- **HEAD (public-mobile-spacing):** `test:website-mobile`, `test:website-mobile-compact`, `test:website-mobile-header`
- **Incoming (admin-critical):** `test:admin-critical-onboarding`

## Lösung

Alle Script-Einträge aus beiden Branches übernommen, keine Duplikate:

```json
"test:admin-critical-onboarding": "node scripts/admin-critical-onboarding-invites-email-test.mjs",
"test:website-mobile": "node scripts/website-mobile-spacing-test.mjs",
"test:website-mobile-compact": "node scripts/website-mobile-compactness-test.mjs",
"test:website-mobile-header": "node scripts/website-mobile-header-spacing-test.mjs"
```

- **Dependencies / devDependencies:** identisch auf beiden Branches — keine Versionskonflikte.
- **package-lock.json:** `npm install` ausgeführt, Lockfile unverändert (bereits aktuell).
- **pnpm-lock.yaml / yarn.lock:** nicht vorhanden.

## Validierung

| Schritt | Ergebnis |
|---------|----------|
| `package.json` JSON-Syntax | ✓ gültig |
| `npm install` | ✓ erfolgreich |
| `npm run lint` | ✓ erfolgreich |
| `npm run typecheck` | ✓ erfolgreich |
| `npm run build` | ✓ erfolgreich |

## Ergebnis

Konflikt vollständig gelöst. Alle Änderungen aus beiden Branches erhalten.
