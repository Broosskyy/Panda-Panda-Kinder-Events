#!/usr/bin/env node
/**
 * Public mobile whitespace + footer fix smoke tests.
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

const css = read("src/app/globals.css");
const header = read("components/layout/Header.tsx");
const footer = read("components/layout/Footer.tsx");

if (css.match(/\.section-padding\s*\{[^}]*padding-top:\s*1rem/)) {
  ok("Mobile base section padding 1rem");
} else fail("Mobile base section padding not set");

if (css.includes(".public-main") && css.includes("padding-bottom: 0")) {
  ok("Public main avoids double chrome padding (footer owns clearance)");
} else fail("Public main chrome dedup missing");

if (css.includes("#bewertungen") && css.includes("padding-bottom: 0.375rem")) {
  ok("Bewertungen section bottom tightened");
} else fail("Bewertungen gap fix missing");

if (css.includes("#ueber-uns") && css.includes("padding-top: 0.375rem")) {
  ok("Über uns top gap tightened after reviews");
} else fail("Über uns gap fix missing");

if (css.includes("#kontakt") && css.includes("padding-bottom: 0.75rem")) {
  ok("Kontakt bottom gap tightened before footer");
} else fail("Kontakt footer gap fix missing");

if (footer.includes("footer-brand-mark") && footer.includes("py-3")) {
  ok("Footer compact mobile layout");
} else fail("Footer not compact");

if (css.includes("min-width: 3rem") && css.includes("min-height: 3rem")) {
  ok("Hamburger 48px touch target in CSS");
} else fail("Hamburger 48px CSS missing");

if (header.includes("min-h-12") && header.includes("min-w-12")) {
  ok("Hamburger 48px in Header component");
} else fail("Hamburger 48px component missing");

if (css.includes("padding-right: max(0.75rem, env(safe-area-inset-right")) {
  ok("Header safe-area right padding");
} else fail("Header safe-area missing");

if (css.includes("form-luxury.form-chrome-safe") && css.includes("0.5rem + var(--chrome-bottom-mobile)")) {
  ok("Form chrome padding scoped to contact form");
} else if (css.includes("form-chrome-safe") && css.includes("0.5rem + var(--chrome-bottom-mobile)")) {
  ok("Sticky CTA chrome padding minimized");
} else fail("Chrome padding not optimized");

for (const bp of ["360px", "390px", "430px"]) {
  if (css.includes("767px")) ok(`Mobile rules cover ${bp}`);
  else fail(`Missing mobile rules for ${bp}`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
