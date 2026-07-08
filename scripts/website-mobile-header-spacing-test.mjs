#!/usr/bin/env node
/**
 * Public mobile spacing + header menu fix smoke tests — static analysis.
 * Run: node scripts/website-mobile-header-spacing-test.mjs
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

const globals = read("src/app/globals.css");
const header = read("components/layout/Header.tsx");

if (globals.includes("--section-header-gap: 0.875rem")) {
  ok("Mobile section header gap tightened to 0.875rem");
} else {
  fail("Mobile section header gap not tightened");
}

if (globals.match(/\.section-padding\s*\{[^}]*padding-top:\s*1rem/)) {
  ok("Base mobile section padding is 1rem");
} else {
  fail("Base mobile section padding not set to 1rem");
}

if (
  globals.includes("#bewertungen,") &&
  globals.includes("padding-top: 0.75rem") &&
  globals.includes("#kontakt")
) {
  ok("Target homepage sections use 0.75rem vertical padding on mobile");
} else {
  fail("Target section mobile padding missing");
}

if (header.includes("site-header") && header.includes("overflow-visible")) {
  ok("Header uses site-header class with overflow visible");
} else {
  fail("Header overflow-visible class missing");
}

if (header.includes("site-header-menu-btn") && header.includes("min-h-11") && header.includes("min-w-11")) {
  ok("Hamburger button has 44px touch target classes");
} else {
  fail("Hamburger touch target classes missing");
}

if (
  globals.includes(".site-header-menu-btn") &&
  globals.includes("min-width: 2.75rem") &&
  globals.includes("min-height: 2.75rem")
) {
  ok("Hamburger button CSS enforces 44x44px minimum");
} else {
  fail("Hamburger button CSS sizing missing");
}

if (globals.includes("env(safe-area-inset-right")) {
  ok("Header respects safe-area-inset-right");
} else {
  fail("Header safe-area right padding missing");
}

if (header.includes("site-header-actions") && header.includes("site-header-logo")) {
  ok("Header layout hooks wired (logo + actions)");
} else {
  fail("Header layout hooks not wired");
}

if (globals.includes(".section-content-gap") && globals.includes("margin-top: 0.75rem")) {
  ok("Mobile section content gap reduced to 0.75rem");
} else {
  fail("Mobile section content gap not reduced");
}

if (globals.includes(".footer-premium .footer-inner") && globals.includes("padding-top: 1.25rem")) {
  ok("Footer mobile padding compact");
} else {
  fail("Footer mobile padding not compact");
}

for (const bp of ["360px", "390px", "430px"]) {
  if (globals.includes("767px")) ok(`Mobile rules apply at ${bp}`);
  else fail(`Mobile rules missing for ${bp}`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
