/**
 * Onboarding Weiter button hard fix verification.
 * Run: node scripts/onboarding-next-button-hard-fix-test.mjs
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

const wizard = read("components/admin/AdminOnboardingWizard.tsx");
const css = read("src/app/globals.css");

if (wizard.includes("admin-onboarding-v2-btn-next-full") && wizard.indexOf("Weiter") < wizard.indexOf("Zurück")) {
  ok("Footer row 1: Weiter before Zurück in DOM");
} else fail("Weiter must be first primary action");

if (wizard.includes("admin-onboarding-v2-footer-nav")) ok("Footer row 2: Zurück + Überspringen");
else fail("Footer nav row missing");

if (wizard.includes("admin-onboarding-v2-text-btn-full")) ok("Footer row 3: Nicht erneut anzeigen full width");
else fail("Dismiss row missing");

if (!wizard.includes("footer-primary")) ok("Old 2-col Zurück+Weiter row removed");
else fail("Old footer-primary layout still present");

if (css.includes(".admin-onboarding-v2-root") && css.includes("--admin-accent: var(--color-primary)")) {
  ok("Portal root defines admin tokens outside .admin-shell");
} else fail("Portal CSS token scope missing");

if (css.includes("background: var(--color-primary)") && css.includes(".admin-onboarding-v2-btn-next")) {
  ok("Weiter button uses global --color-primary (visible outside admin-shell)");
} else fail("Weiter button color fallback");

if (css.includes("admin-onboarding-v2-btn-next-full")) ok("Weiter full-width class");
else fail("Weiter full-width CSS");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
