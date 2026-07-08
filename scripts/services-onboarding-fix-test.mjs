/**
 * Services public flow + onboarding fix verification.
 * Run: node scripts/services-onboarding-fix-test.mjs
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
if (data.includes("noStore()") && data.includes("queryCmsServices")) ok("Public services fetch opts out of static cache");
else fail("noStore in fetchCmsServices");

if (!data.includes("return staticServices") && !data.includes("staticServices")) {
  ok("No static services fallback on public homepage");
} else fail("Static services fallback still present in data.ts");

if (data.includes('.eq("visible", true)')) ok("Public query filters visible services");
else fail("Visible filter missing");

const api = read("src/app/api/admin/services/route.ts");
if (api.includes("nextSortOrder") && api.includes("revalidatePublicCms()") && api.includes("seed.seeded")) {
  ok("API sets sort order + revalidates after seed");
} else fail("API create/seed revalidation");

const provider = read("components/admin/AdminOnboardingProvider.tsx");
if (provider.includes("ONBOARDING_SESSION_DISMISS_KEY") && provider.includes("dismissSession")) {
  ok("Onboarding session dismiss state");
} else fail("Session dismiss missing");

if (provider.includes("getClientOnboardingSteps") && !provider.includes("await loadStatus()")) {
  ok("Onboarding steps render without blocking loadStatus");
} else fail("Onboarding still blocks on loadStatus");

const wizard = read("components/admin/AdminOnboardingWizard.tsx");
const wizardChecks = [
  ["onSkip", "Überspringen handler"],
  ["onClose", "Close handler"],
  ["Escape", "ESC closes"],
  ["admin-onboarding-v2-backdrop", "Backdrop click target"],
  ["Weiter", "Weiter button label"],
  ["Zurück", "Zurück button label"],
  ["Fertig", "Fertig on last step"],
];
for (const [needle, label] of wizardChecks) {
  if (wizard.includes(needle)) ok(`Wizard: ${label}`);
  else fail(`Wizard missing: ${label}`);
}

const css = read("src/app/globals.css");
if (css.includes("max-height: min(600px") && css.includes("max-width: 44rem")) {
  ok("Onboarding panel size constraints");
} else fail("Onboarding size constraints");

if (css.includes("admin-onboarding-v2-scale-in 280ms") || css.includes("280ms ease-out")) {
  ok("Onboarding animation under 300ms");
} else fail("Onboarding animation timing");

const gate = read("components/admin/AdminGate.tsx");
if (gate.includes("initialCompleted={Boolean(loginSnapshot?.onboardingCompleted)}")) {
  ok("Login snapshot seeds onboarding completed state");
} else fail("Onboarding initialCompleted wiring");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
