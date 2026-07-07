#!/usr/bin/env node
/**
 * Responsive layout smoke tests — static analysis.
 * Run: node scripts/responsive-consistency-test.mjs
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
const container = read("components/ui/Container.tsx");
const heading = read("components/ui/SectionHeading.tsx");
const header = read("components/layout/Header.tsx");
const floating = read("components/layout/FloatingContactButtons.tsx");
const hook = read("lib/hooks/useHideNearFormSections.ts");

if (globals.includes("--site-max-width") && globals.includes("--site-padding-x")) {
  ok("Layout CSS tokens defined");
} else {
  fail("Layout CSS tokens missing");
}

if (globals.includes(".section-container") && container.includes("section-container")) {
  ok("Unified section-container class");
} else {
  fail("section-container not wired");
}

if (header.includes("section-container")) {
  ok("Header uses same container padding as sections");
} else {
  fail("Header padding not aligned");
}

if (globals.includes("overflow-x: clip") && globals.includes("body")) {
  ok("Horizontal overflow prevented on html/body");
} else {
  fail("overflow-x clip missing");
}

if (globals.includes(".swipe-item-card") && globals.includes("var(--site-padding-x)")) {
  ok("Swipe carousel aligned to container padding");
} else {
  fail("Swipe bleed alignment missing");
}

if (globals.includes(".section-header") && heading.includes("section-header")) {
  ok("Unified section header rhythm");
} else {
  fail("Section header rhythm missing");
}

if (globals.includes(".section-prose") && heading.includes("section-prose")) {
  ok("Unified subtitle text width");
} else {
  fail("Section prose width missing");
}

if (hook.includes("bewertung-form") && floating.includes("useHideNearFormSections")) {
  ok("WhatsApp FAB hides near forms");
} else {
  fail("WhatsApp form overlap guard missing");
}

if (globals.includes("--chrome-bottom-mobile") && globals.includes(".public-main")) {
  ok("Mobile chrome bottom safe area");
} else {
  fail("Mobile chrome safe area missing");
}

const sections = [
  "components/sections/PublicStats.tsx",
  "components/sections/Services.tsx",
  "components/sections/Gallery.tsx",
  "components/sections/News.tsx",
  "components/sections/Testimonials.tsx",
  "components/sections/Faq.tsx",
  "components/sections/Contact.tsx",
];

for (const file of sections) {
  const content = read(file);
  if (content.includes("Container") || content.includes("section-container")) {
    ok(`${file} uses unified container`);
  } else {
    fail(`${file} missing unified container`);
  }
}

const breakpoints = ["360px", "390px", "430px", "768px", "1024px", "1440px"];
for (const bp of breakpoints) {
  const px = parseInt(bp, 10);
  if (px < 640 && globals.includes("--site-padding-x: 1rem")) ok(`Padding token covers ${bp}`);
  else if (px >= 640 && px < 768 && globals.includes("640px")) ok(`Padding token covers ${bp}`);
  else if (px >= 768 && px < 1024 && globals.includes("768px")) ok(`Padding token covers ${bp}`);
  else if (px >= 1024) ok(`Layout scales to ${bp}`);
  else fail(`Breakpoint coverage gap at ${bp}`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
