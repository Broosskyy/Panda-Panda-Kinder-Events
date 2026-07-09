/**
 * PWA installability root cause verification.
 * Run: node scripts/pwa-installability-root-cause-test.mjs
 */
import { readFileSync, existsSync } from "node:fs";
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

if (!existsSync(join(root, "src/app/manifest.ts"))) ok("Global app/manifest.ts removed (was injecting public manifest on /admin)");
else fail("src/app/manifest.ts still present");

const publicManifestRoute = read("src/app/manifest.webmanifest/route.ts");
if (publicManifestRoute.includes('display: "browser"')) ok("Public manifest served via route only");
else fail("Public manifest route");

const adminLayout = read("src/app/admin/layout.tsx");
if (adminLayout.includes("generateMetadata") && adminLayout.includes("/admin/manifest.webmanifest")) {
  ok("Admin layout generateMetadata with admin manifest");
} else fail("Admin layout manifest");

const capture = read("public/admin/pwa-capture.js");
if (capture.includes("ensureAdminManifestLink") && capture.includes("navigator.serviceWorker")) {
  ok("pwa-capture fixes manifest link + early SW register");
} else fail("pwa-capture bootstrap");

const manifest = read("src/app/admin/manifest.webmanifest/route.ts");
if (manifest.includes("new URL(request.url).origin") && manifest.includes("scope: `${origin}/admin/`")) {
  ok("Manifest uses absolute origin URLs");
} else fail("Manifest absolute URLs");

const pwa = read("lib/admin/pwa-install.ts");
if (pwa.includes("auditChromeInstallBlockers") && pwa.includes("isAdminManifestLinkCorrect")) {
  ok("Chrome installability audit helpers");
} else fail("Installability audit");
if (pwa.includes("Falsches Manifest im HTML")) ok("Detects wrong manifest link in HTML");
else fail("Wrong manifest detection");

const nextConfig = read("next.config.ts");
if (nextConfig.includes("Service-Worker-Allowed")) ok("next.config SW headers");
else fail("next.config headers");

const sw = read("public/admin/sw.js");
if (sw.includes("pb-admin-shell-v5")) ok("SW cache v5");
else fail("SW cache version");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
