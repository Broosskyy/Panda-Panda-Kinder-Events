# Favicon & PWA Icon Regeneration Report

**Branch:** `cursor/favicon-pwa-regeneration-e022`  
**Icon-Version (Cache-Bust):** `7`  
**Master-Datei:** `public/assets/logo.png` (Kopie von `Logo.png`, nur für Icon-Generator)  
**Header/CMS-Logo:** unverändert `/assets/Logo.png`

---

## Neu erstellte Icon-Dateien

| Datei | Größe | Verwendung |
|-------|-------|------------|
| `public/favicon.ico` | 16+32 multi-size | Browser-Tab, Shortcut |
| `public/favicon-16x16.png` | 16×16 | Browser-Tab |
| `public/favicon-32x32.png` | 32×32 | Browser-Tab |
| `public/apple-touch-icon.png` | 180×180 | iOS Homescreen |
| `public/android-chrome-192x192.png` | 192×192 | PWA / Android |
| `public/android-chrome-512x512.png` | 512×512 | PWA / Browser metadata |
| `public/android-chrome-maskable-512x512.png` | 512×512 maskable | PWA adaptive Icon |
| `public/mstile-150x150.png` | 150×150 | Windows Tile |
| `public/assets/logo.png` | 1536×1024 | Icon-Master (Generator-Quelle) |
| `src/app/icon.png` | 32×32 | Next.js App Router |
| `src/app/favicon.ico` | multi-size | Next.js App Router |
| `src/app/apple-icon.png` | 180×180 | Next.js App Router |

---

## Geänderte Referenzen

| Datei | Änderung |
|-------|----------|
| `lib/brand.ts` | Neue Asset-Pfade, `iconVersion: "7"`, `favicon48`/`favicon64` entfernt |
| `src/app/layout.tsx` | `<link>` für 16/32/ico/apple-touch; `msapplication-config` mit `?v=7` |
| `src/app/manifest.ts` | Nutzt neue `BRAND.assets.*` Pfade (via `withIconVersion`) |
| `public/branding/browserconfig.xml` | `mstile-150x150.png?v=7` |
| `lib/brand/resolve.ts` | Legacy-Muster für alte `/icons/panda-*` und `/favicon.png` |
| `lib/cms/normalize-settings.ts` | CMS-Fallback bereinigt alte Icon-URLs |
| `components/admin/views/SettingsView.tsx` | Tab-Icon-Vorschau mit `BRAND.assets` + `?v=7` |
| `src/middleware.ts` | Matcher für neue Root-Icon-Dateinamen |
| `scripts/generate-brand-assets.mjs` | Generator liest `logo.png`, schreibt Standard-Namen |
| `public/assets/README.md` | Dokumentation Icon-Master vs. Header-Logo |
| `public/branding/README.md` | Aktualisierte Icon-Pfade |

---

## Entfernte alte Dateien

- `public/favicon.png`
- `public/icons/` (komplett): `panda-icon-*.png`, `panda-apple-touch-icon.png`, `panda-mark.png`, `favicon-32.png`, `favicon.ico`

---

## Verbleibende alte Referenzen

**Im Code:** Keine aktiven Referenzen auf `panda-icon-*`, `/icons/`, oder `favicon.png`. Legacy-Pfade werden in `resolve.ts` und `normalize-settings.ts` nur zum Bereinigen veralteter CMS-Einträge verwendet.

**In historischen Docs** (nicht produktionsrelevant): `CHANGELOG.md`, `PWA_INSTALL_GUIDE.md`, `FINAL_*_REPORT.md` erwähnen noch alte Pfade — keine Laufzeit-Auswirkung.

**Nicht vorhanden:** `manifest.json`, `head.tsx` — Projekt nutzt `src/app/manifest.ts` und `layout.tsx`.

---

## Cache Busting

- `BRAND.iconVersion = "7"`
- Alle Icon-URLs in Metadata/Manifest via `withIconVersion()` → `?v=7`
- `browserconfig.xml` und `msapplication-config` mit Version-Query

---

## Verifikation

| Check | Status |
|-------|--------|
| `npm run typecheck` | ✓ |
| `npm run lint` | ✓ (nur bestehende Warnings) |
| `npm run build` | ✓ |
| `/manifest.webmanifest` | ✓ (Next.js `manifest.ts`) |
| Header-Logo `/assets/Logo.png` | ✓ unverändert |
| CMS Branding-Logo | ✓ unverändert |

**Manuell nach Deploy prüfen:** Browser-Tab, Android Tab-Vorschau, installierte PWA, Homescreen-Icon, CMS-Vorschau, Vercel Preview.

---

## Regeneration

```bash
npm run generate:brand-assets
```

Läuft automatisch via `prebuild`. Bei erneuter Regeneration `iconVersion` in `lib/brand.ts` und `ICON_VERSION` in `scripts/generate-brand-assets.mjs` erhöhen.
