#!/usr/bin/env node
/**
 * Service worker scope / canonical URL fix verification.
 * Run: node scripts/admin-pwa-scope-fix-test.mjs
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

const routes = read("lib/admin/routes.ts");
if (routes.includes('ADMIN_HOME_PATH = "/admin/"') && routes.includes('ADMIN_SW_SCOPE = "/admin/"')) {
  ok("Canonical routes module");
} else fail("routes.ts");

const nextConfig = read("next.config.ts");
if (nextConfig.includes("trailingSlash: true")) ok("Next.js trailingSlash enabled");
else fail("trailingSlash");

const middleware = read("src/middleware.ts");
if (middleware.includes("ADMIN_HOME_PATH") && middleware.includes('pathname === "/admin"')) {
  ok("Middleware legacy /admin redirect");
} else fail("middleware redirect");
if (middleware.includes("ADMIN_PWA_CAPTURE_PATH")) ok("pwa-capture.js public");
else fail("pwa-capture public");

const manifest = read("src/app/admin/manifest.webmanifest/route.ts");
if (manifest.includes("ADMIN_HOME_PATH") && manifest.includes("ADMIN_SW_SCOPE")) ok("Manifest uses canonical constants");
else fail("manifest");

const sw = read("public/admin/sw.js");
if (sw.includes('"/admin/"') && sw.includes("pb-admin-shell-v8")) ok("SW shell caches /admin/");
else fail("sw.js shell");

const swHelper = read("lib/admin/push/service-worker.ts");
if (swHelper.includes("ADMIN_SW_SCOPE") && swHelper.includes("serviceWorker.ready")) ok("Push SW helper");
else fail("push service-worker helper");

const nav = read("lib/admin/nav.ts");
if (nav.includes("ADMIN_HOME_PATH")) ok("Nav dashboard href canonical");
else fail("nav");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
