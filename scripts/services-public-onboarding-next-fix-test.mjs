/**
 * Services public rendering + onboarding next fix verification.
 * Run: node scripts/services-public-onboarding-next-fix-test.mjs
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

const data = read("lib/cms/data.ts");
if (data.includes("hasMinimumServiceContent") && !data.includes("isValidCmsService")) {
  ok("Public services use minimum content check, not placeholder filter");
} else fail("Public services filter");

const quality = read("lib/cms/content-quality.ts");
if (quality.includes("hasMinimumServiceContent")) ok("hasMinimumServiceContent helper");
else fail("content-quality helper");

const services = read("components/sections/Services.tsx");
if (services.includes('id="leistungen"') && services.includes("aria-label=\"Leistungen\"")) {
  ok("Services section anchor always rendered");
} else fail("Services section anchor");

const header = read("components/layout/Header.tsx");
if (header.includes("navigateToPublicSection(hash)") && header.includes("scrollToPublicSection(hash)")) {
  ok("Mobile nav scrolls on home and navigates from subpages");
} else fail("Mobile nav handler");

const href = read("lib/public-href.ts");
if (href.includes('id === "anfrage"') && href.includes("kontakt")) ok("anfrage maps to kontakt");
else fail("anfrage/kontakt mapping");

const wizard = read("components/admin/AdminOnboardingWizard.tsx");
if (wizard.includes("admin-onboarding-v2-actions-primary--single") && wizard.includes("Weiter")) {
  ok("Onboarding step 1 full-width Weiter");
} else fail("Onboarding Weiter layout");
if (!wizard.includes("disabled={isFirst}")) ok("Zurück hidden on step 1 (not disabled slot)");
else fail("Zurück still disabled on step 1");

const css = read("src/app/globals.css");
if (css.includes("admin-onboarding-v2-actions-primary--single") && css.includes("position: sticky")) {
  ok("Onboarding sticky footer + single-column primary actions");
} else fail("Onboarding footer CSS");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
