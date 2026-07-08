#!/usr/bin/env node
/**
 * Mobile compactness + header fix smoke tests — static analysis.
 * Run: node scripts/website-mobile-compactness-test.mjs
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
const sticky = read("components/layout/StickyCtaBar.tsx");
const hook = read("lib/hooks/useFloatingContactAboveCta.ts");
const processSection = read("components/sections/Process.tsx");

if (globals.match(/\.section-padding\s*\{[^}]*padding-top:\s*1rem/)) {
  ok("Mobile section padding tightened to 1rem");
} else {
  fail("Mobile section padding not tightened");
}

if (globals.includes("--section-header-gap: 0.875rem")) {
  ok("Mobile section header gap reduced to 0.875rem");
} else {
  fail("Mobile section header gap not reduced");
}

if (globals.includes("--sticky-cta-bar-height: 3.25rem")) {
  ok("Sticky CTA bar height reduced");
} else {
  fail("Sticky CTA bar height not reduced");
}

if (globals.includes("--floating-contact-size: 3rem")) {
  ok("WhatsApp FAB size reduced");
} else {
  fail("WhatsApp FAB size not reduced");
}

if (sticky.includes("sticky-cta-bar--scroll-hidden")) {
  ok("Sticky CTA hides on scroll down");
} else {
  fail("Sticky CTA scroll-hide missing");
}

if (hook.includes("sticky-cta-bar--scroll-hidden") && hook.includes("data-sticky-cta-visible")) {
  ok("WhatsApp FAB reacts to sticky CTA visibility state");
} else {
  fail("WhatsApp FAB sticky sync incomplete");
}

if (header.includes("data-mobile-menu-open") && header.includes("position = \"fixed\"")) {
  ok("Mobile menu uses robust body scroll lock");
} else {
  fail("Mobile menu scroll lock incomplete");
}

if (header.includes("mobile-nav-panel") && header.includes("Tab")) {
  ok("Mobile menu panel + focus trap present");
} else {
  fail("Mobile menu panel/focus trap missing");
}

if (header.includes("site-header-menu-btn") && header.includes("site-header-actions")) {
  ok("Header menu button uses layout hooks");
} else {
  fail("Header menu layout hooks missing");
}

if (globals.includes("#ablauf .process-step-row") && globals.includes("flex-direction: row")) {
  ok("Process steps use compact horizontal cards on mobile");
} else {
  fail("Process compact mobile layout missing");
}

if (processSection.includes("hidden w-52 sm:w-64 lg:block")) {
  ok("Process mascot hidden on mobile");
} else {
  fail("Process mascot not hidden on mobile");
}

if (globals.includes("width: min(82vw, calc(100vw - 2 * var(--site-padding-x)")) {
  ok("Swipe cards bounded to viewport (no horizontal overflow)");
} else {
  fail("Swipe card overflow guard missing");
}

if (globals.includes("#ueber-uns .team-card-image") && globals.includes("max-height: 11rem")) {
  ok("Team cards use compact image area on mobile");
} else {
  fail("Team card compact image rules missing");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
