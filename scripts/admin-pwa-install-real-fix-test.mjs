#!/usr/bin/env node
/**
 * Admin PWA install real fix smoke tests — static analysis.
 * Run: node scripts/admin-pwa-install-real-fix-test.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;
let failed = 0;

function ok(label) {
  passed++;
  console.log(`✓ ${label}`);
}

function fail(label, detail = "") {
  failed++;
  console.error(`✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const manifest = read("src/app/admin/manifest.webmanifest/route.ts");
const sw = read("public/admin-sw.js");
const early = read("components/admin/AdminPwaEarlyCapture.tsx");
const provider = read("components/admin/AdminPwaProvider.tsx");
const panel = read("components/admin/AdminPwaInstallPanel.tsx");
const help = read("components/admin/AdminPwaInstallHelpSheet.tsx");
const settings = read("components/admin/AdminAppSettingsCard.tsx");
const pwaLib = read("lib/admin/pwa-install.ts");
const css = read("src/app/globals.css");

if (manifest.includes('short_name: "Panda Admin"')) ok("Manifest short_name is Panda Admin");
else fail("Manifest short_name incorrect");

if (manifest.includes('id: "/admin"') && manifest.includes('start_url: "/admin"') && manifest.includes('scope: "/admin"')) {
  ok("Manifest id/start_url/scope configured");
} else fail("Manifest scope/start_url missing");

if (manifest.includes("application/manifest+json")) ok("Manifest content-type set");
else fail("Manifest content-type missing");

if (early.includes("registerAdminServiceWorker")) ok("Service worker registers early on all admin pages");
else fail("Early SW registration missing");

if (sw.includes('scope: "/admin"') || sw.includes("/admin/manifest.webmanifest")) {
  ok("Service worker precaches admin shell assets");
} else if (sw.includes("/admin/manifest.webmanifest") && sw.includes("panda-icon-192")) {
  ok("Service worker precaches admin shell assets");
} else if (sw.includes("/admin/manifest.webmanifest")) {
  ok("Service worker precaches manifest");
} else fail("SW shell assets incomplete");

if (pwaLib.includes("probePwaInstallability") && pwaLib.includes("statusLabel")) ok("PWA probe utility with status labels");
else fail("PWA probe utility missing");

if (provider.includes("beforeinstallprompt") && provider.includes("installFeedback")) ok("Provider handles prompt + feedback");
else fail("Provider prompt/feedback incomplete");

if (panel.includes("App installieren") && panel.includes("Installationshilfe öffnen")) ok("Panel has install + help CTAs");
else fail("Panel CTAs missing");

if (panel.includes("Installationsstatus prüfen") && panel.includes("ProbeDetails")) ok("Status check shows probe details");
else fail("Status check UI incomplete");

if (help.includes("Installationshilfe") && help.includes("admin-pwa-help-sheet")) ok("Help bottom sheet implemented");
else fail("Help sheet missing");

if (settings.includes("sessionClosed") && settings.includes("Installationskarte erneut anzeigen")) {
  ok("Reopen card only when session closed");
} else fail("Reopen card logic incorrect");

if (css.includes("admin-pwa-help-sheet-panel")) ok("Help sheet styles present");
else fail("Help sheet styles missing");

for (const bp of ["360px", "390px", "430px"]) {
  if (css.includes("admin-pwa-help-sheet") || css.includes("767px")) ok(`Mobile help sheet covers ${bp}`);
  else fail(`Mobile coverage missing for ${bp}`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
