/**
 * Final onboarding + PWA reality fix verification.
 * Run: node scripts/final-onboarding-pwa-reality-test.mjs
 */
import { existsSync, readFileSync } from "node:fs";
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

const wizard = read("components/admin/AdminOnboardingWizard.tsx");
if (wizard.includes("admin-onboarding-v2-footer-primary") && wizard.includes("admin-onboarding-v2-btn-next")) {
  ok("Onboarding footer: primary row with native Weiter button");
} else fail("Onboarding footer layout");
if (wizard.includes("disabled={isFirst}") && wizard.includes("Weiter")) ok("Step 1: Zurück disabled + Weiter visible");
else fail("Onboarding step 1 buttons");
if (!wizard.includes("actions-primary--single")) ok("No single-column footer (Weiter hidden bug)");
else fail("Single-column footer removed");

const css = read("src/app/globals.css");
if (css.includes("admin-onboarding-v2-footer-primary") && css.includes("grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)")) {
  ok("Footer CSS 2-column grid for primary + secondary");
} else fail("Footer CSS grid");
if (css.includes("grid-template-rows: auto auto minmax(0, 1fr) auto")) ok("Panel grid reserves footer space");
else fail("Panel grid layout");

if (!existsSync(join(root, "src/app/manifest.ts"))) ok("No global app/manifest.ts on /admin");
else fail("manifest.ts still present");

const pwa = read("lib/admin/pwa-install.ts");
if (pwa.includes("BLOCKED BY CHROME / MANUAL VERIFICATION NEEDED")) ok("Honest PWA blocked status");
else fail("PWA reality status");
if (pwa.includes("resolvePwaRealityStatus")) ok("PWA reality resolver");

const sw = read("public/admin/sw.js");
if (sw.includes("pb-admin-shell-v6")) ok("SW cache v6");

const brand = read("lib/brand.ts");
if (brand.includes('iconVersion: "9"')) ok("Icon cache bust v9");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
