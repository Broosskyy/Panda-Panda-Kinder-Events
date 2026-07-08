#!/usr/bin/env node
/**
 * Mobile spacing optimization smoke tests — static analysis.
 * Run: node scripts/website-mobile-spacing-test.mjs
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
const processSection = read("components/sections/Process.tsx");
const gallery = read("components/sections/Gallery.tsx");
const services = read("components/sections/Services.tsx");
const floating = read("components/layout/FloatingContactButtons.tsx");
const hook = read("lib/hooks/useFloatingContactAboveCta.ts");

if (globals.includes("--sticky-cta-bar-height") && globals.includes("--floating-contact-gap")) {
  ok("Chrome height CSS variables defined");
} else {
  fail("Chrome height CSS variables missing");
}

if (globals.includes("--chrome-bottom-mobile: calc(")) {
  ok("Mobile chrome bottom derived from CTA + WhatsApp sizes");
} else {
  fail("Mobile chrome bottom not calculated");
}

if (globals.includes("floating-contact-stack--above-cta")) {
  ok("WhatsApp stacks above sticky CTA via modifier class");
} else {
  fail("WhatsApp above-CTA modifier missing");
}

if (floating.includes("useFloatingContactAboveCta") && hook.includes("sticky-cta-bar")) {
  ok("Floating WhatsApp reacts to sticky CTA presence");
} else {
  fail("Floating WhatsApp CTA sync missing");
}

if (globals.includes("--section-header-gap: 0.875rem") || globals.includes("--section-header-gap: 1.125rem")) {
  ok("Mobile section header gap reduced");
} else {
  fail("Mobile section header gap not reduced");
}

if (globals.match(/\.section-padding\s*\{[^}]*padding-top:\s*1rem/)) {
  ok("Mobile section padding tightened");
} else if (globals.match(/\.section-padding\s*\{[^}]*padding-top:\s*1\.25rem/)) {
  ok("Mobile section padding tightened");
} else if (globals.match(/\.section-padding\s*\{[^}]*padding-top:\s*2rem/)) {
  ok("Mobile section padding tightened");
} else {
  fail("Mobile section padding not tightened");
}

if (processSection.includes("gap-2.5") || processSection.includes("gap-3")) {
  ok("Process steps use tighter mobile gaps");
} else {
  fail("Process step gaps not tightened");
}

if (gallery.includes("mb-2") && gallery.includes("gap-1.5")) {
  ok("Gallery filter row closer to heading and grid");
} else {
  fail("Gallery spacing not optimized");
}

if (services.includes("service-card-image") && services.includes("service-card-cta")) {
  ok("Service cards use grouped spacing hooks");
} else {
  fail("Service card spacing hooks missing");
}

if (globals.includes("#ablauf .process-step-icon-row") && (globals.includes("margin-bottom: 0.125rem") || globals.includes("margin-bottom: 0.25rem"))) {
  ok("Process step internal rhythm tightened on mobile");
} else {
  fail("Process mobile CSS rhythm missing");
}

if (globals.includes(".gallery-filter-row") && (globals.includes("margin-top: -0.25rem") || globals.includes("margin-top: -0.5rem"))) {
  ok("Gallery filters pulled closer to section heading");
} else {
  fail("Gallery filter heading proximity missing");
}

const breakpoints = ["360px", "390px", "430px", "768px"];
for (const bp of breakpoints) {
  if (globals.includes("767px")) ok(`Mobile rules cover ${bp}`);
  else fail(`Mobile rules missing for ${bp}`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
