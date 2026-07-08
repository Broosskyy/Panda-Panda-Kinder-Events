#!/usr/bin/env node
/**
 * CMS services fix smoke tests.
 * Run: node scripts/admin-services-cms-fix-test.mjs
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

const migration = read("supabase/migrations/20260734_cms_services_category_button_link.sql");
if (migration.includes("category") && migration.includes("button_link")) ok("Migration category + button_link");
else fail("Migration");

const seed = read("lib/cms/services-db.ts");
if (seed.includes("ensureCmsServicesSeeded") && seed.includes("staticServices")) ok("One-time seed from static services");
else fail("Seed logic");

if (seed.includes("swapServiceSortOrder")) ok("Reorder swap helper");
else fail("Reorder helper");

const api = read("src/app/api/admin/services/route.ts");
if (api.includes("ensureCmsServicesSeeded") && api.includes("service_create")) ok("API seeds on GET + audit");
else fail("API");

const actions = ["service_image_change", "service_visibility_change", "service_sort_change", "service_delete"];
for (const action of actions) {
  if (api.includes(action)) ok(`Audit: ${action}`);
  else fail(`Audit missing: ${action}`);
}

const schema = read("lib/cms/admin-schemas.ts");
if (schema.includes("button_link") && schema.includes("category") && schema.includes("image_url")) ok("Extended service schema");
else fail("Schema");

const data = read("lib/cms/data.ts");
if (data.includes("return cmsServices") && !data.includes("staticServices")) {
  ok("Public fetch uses CMS data only (no static fallback)");
} else fail("Public fetch fallback logic");

const staticServices = read("lib/services.ts");
const titles = ["Kinderschminken", "Kindergeburtstage", "Hochzeiten"];
for (const title of titles) {
  if (staticServices.includes(title)) ok(`Static service: ${title}`);
  else fail(`Missing static: ${title}`);
}

const view = read("components/admin/views/ServicesView.tsx");
if (view.includes("Leistung hinzufügen") && view.includes("admin-service-card")) ok("Admin mobile service cards");
else fail("Admin UI");

if (view.includes("Ausblenden") && view.includes("Bearbeiten")) ok("Admin service actions");
else fail("Admin actions");

const publicUi = read("components/sections/Services.tsx");
if (publicUi.includes("buttonLink")) ok("Public UI uses button link");
else fail("Public button link");

const css = read("src/app/globals.css");
if (css.includes("admin-services-page") && css.includes("admin-service-card")) ok("Services mobile CSS");
else fail("Services CSS");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
