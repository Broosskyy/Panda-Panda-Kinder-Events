/**
 * PWA installed status detection fix verification.
 * Run: node scripts/admin-pwa-installed-status-test.mjs
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

const pwa = read("lib/admin/pwa-install.ts");

if (pwa.includes("readPwaInstalledFlag()") && pwa.includes("resolvePwaInstalled")) {
  ok("resolvePwaInstalled uses localStorage flag");
} else fail("Installed flag in resolvePwaInstalled");

if (pwa.includes("isAndroidAppReferrer") && pwa.includes("android-app://")) ok("Android app referrer detection");
else fail("Android referrer");

if (pwa.includes('display-mode: ${mode}') || pwa.includes("fullscreen") && pwa.includes("minimal-ui")) {
  ok("Extended display-mode detection");
} else fail("Display mode detection");

if (pwa.includes("hasPwaInstalledSignals")) ok("Combined installed signals helper");
else fail("hasPwaInstalledSignals");

if (pwa.includes('"unclear"') && !pwa.includes("blocked_chrome")) ok("Neutral unclear status replaces blocked_chrome error");
else fail("Reality status unclear");

if (pwa.includes("hasTrueTechnicalPwaBlockers")) ok("True technical blockers only for real errors");
else fail("Technical blocker split");

if (pwa.includes("serviceWorkerActive = Boolean(reg?.active) || serviceWorkerControlling")) {
  ok("SW active derived from controlling state");
} else fail("SW active/controlling consistency");

if (pwa.includes("möglicherweise bereits installiert")) ok("Neutral browser-tab message");
else fail("Neutral message");

const panel = read("components/admin/AdminPwaInstallPanel.tsx");
if (panel.includes("isStandalonePwa()")) ok("Panel differentiates standalone vs installed flag");
else fail("Panel standalone message");

const provider = read("components/admin/AdminPwaProvider.tsx");
if (provider.includes("clearPwaInstalledFlag") && provider.includes("onBeforeInstall")) {
  ok("beforeinstallprompt clears stale installed flag");
} else fail("Reinstall prompt clears flag");

const probe = read("components/admin/AdminPwaInstallHelpSheet.tsx");
if (probe.includes("serviceWorkerControlling")) ok("ProbeDetails SW active uses controlling");
else fail("ProbeDetails fix");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
