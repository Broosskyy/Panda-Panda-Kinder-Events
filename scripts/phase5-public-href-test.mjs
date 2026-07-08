/**
 * Phase 5 QA: public hash links must resolve to homepage sections from any page.
 * Run: node scripts/phase5-public-href-test.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`✓ ${label}`);
  passed++;
}

function fail(label) {
  console.error(`✗ ${label}`);
  failed++;
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

// Utility exists
if (fs.existsSync(path.join(root, "lib/public-href.ts"))) {
  const util = read("lib/public-href.ts");
  if (util.includes('href.startsWith("#")') && util.includes("return `/${href}`")) {
    ok("resolvePublicHref converts #anchors to /#anchors");
  } else {
    fail("resolvePublicHref implementation");
  }
} else {
  fail("lib/public-href.ts missing");
}

const header = read("components/layout/Header.tsx");
if (header.includes("resolvePublicHref") && !header.includes('href="#kontakt"')) {
  ok("Header uses resolvePublicHref for nav and CTA");
} else {
  fail("Header hash link fix");
}

const footer = read("components/layout/Footer.tsx");
if (footer.includes("resolvePublicHref(item.href)")) {
  ok("Footer uses resolvePublicHref");
} else {
  fail("Footer hash link fix");
}

const logo = read("components/ui/Logo.tsx");
if (logo.includes('resolvePublicHref("#startseite")')) {
  ok("Logo links to /#startseite");
} else {
  fail("Logo hash link fix");
}

const sticky = read("components/layout/StickyCtaBar.tsx");
if (sticky.includes('resolvePublicHref("#kontakt")')) {
  ok("Sticky CTA uses resolvePublicHref");
} else {
  fail("Sticky CTA hash link fix");
}

const nav = read("lib/admin/nav.ts");
if (nav.includes('"/admin/faq"') && nav.includes('"/admin/beitraege"')) {
  ok("Admin nav includes FAQ and Blog");
} else {
  fail("Admin nav FAQ/Blog entries");
}

const middleware = read("src/middleware.ts");
if (middleware.includes('method === "DELETE"') && middleware.includes("/api/admin/login")) {
  ok("Middleware allows logout without session cookie");
} else {
  fail("Middleware logout whitelist");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
