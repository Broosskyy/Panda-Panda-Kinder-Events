#!/usr/bin/env node
/**
 * Onboarding V2 modal smoke tests.
 * Run: node scripts/admin-onboarding-v2-test.mjs
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
const steps = read("lib/admin/onboarding.ts");

if (wizard.includes("createPortal")) ok("Wizard portals to document.body");
else fail("Wizard missing portal");

if (wizard.includes("data-admin-onboarding")) ok("Wizard sets onboarding lock attribute");
else fail("Missing onboarding lock");

if (wizard.includes("admin-onboarding-v2-panel")) ok("V2 panel class used");
else fail("V2 panel missing");

if (wizard.includes("onSkip") && wizard.includes("onClose")) ok("Separate skip vs close handlers");
else fail("Skip/close handlers missing");

if (wizard.includes("admin-onboarding-v2-bullets")) ok("Bullet list in wizard");
else fail("Bullets UI missing");

if (css.includes("admin-onboarding-v2-root") && css.includes("z-index: 220")) ok("V2 overlay above bottom nav");
else fail("V2 z-index/overlay missing");

if (css.includes('html[data-admin-onboarding="open"] .admin-bottom-nav')) ok("Bottom nav hidden during tutorial");
else fail("Bottom nav not hidden");

if (css.includes("var(--admin-panel-solid)") && css.includes("admin-onboarding-v2-panel")) {
  ok("Solid panel styling");
} else fail("Panel/backdrop styling weak");

if (css.includes("admin-onboarding-v2-footer")) ok("Sticky footer section");
else fail("Footer styling missing");

if (steps.includes("bullets:") && steps.includes("iconKey:")) ok("Steps have bullets and icons");
else fail("Step content incomplete");

const provider = read("components/admin/AdminOnboardingProvider.tsx");
if (provider.includes("dismissSession") && provider.includes("ONBOARDING_SESSION_DISMISS_KEY")) ok("Provider skip/dismiss wiring");
else fail("Provider wiring incomplete");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
