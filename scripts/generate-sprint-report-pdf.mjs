#!/usr/bin/env node
/**
 * Generiert PDF aus einem Sprint-Report Markdown.
 * Usage: node scripts/generate-sprint-report-pdf.mjs Sprint-Report-Mobile-Bugfix
 */
import { existsSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const name = process.argv[2];

if (!name) {
  console.error("Usage: npm run sprint-report:pdf -- <report-name-without-extension>");
  console.error("Example: npm run sprint-report:pdf -- Sprint-Report-Mobile-Bugfix");
  process.exit(1);
}

const mdPath = join(root, "docs/05_ROADMAP", `${name}.md`);
const outDir = join(root, "docs/05_ROADMAP/downloads");
const publicDir = join(root, "public/downloads/sprint-reports");
const pdfPath = join(outDir, `${name}.pdf`);
const publicPdfPath = join(publicDir, `${name}.pdf`);

if (!existsSync(mdPath)) {
  console.error(`File not found: ${mdPath}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

const { mdToPdf } = await import("md-to-pdf");

const css = `
  body { font-family: system-ui, sans-serif; font-size: 11pt; line-height: 1.5; max-width: 800px; margin: 2rem auto; color: #2c2c2c; }
  h1 { font-size: 1.5rem; border-bottom: 2px solid #52563e; padding-bottom: 0.5rem; }
  h2 { font-size: 1.15rem; color: #52563e; margin-top: 1.5rem; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 10pt; }
  th, td { border: 1px solid #e5e2db; padding: 0.4rem 0.6rem; text-align: left; }
  th { background: #f4f1ea; }
  code { background: #f4f1ea; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
  hr { border: none; border-top: 1px solid #e5e2db; margin: 2rem 0; }
`;

const pdf = await mdToPdf(
  { path: mdPath },
  {
    dest: pdfPath,
    pdf_options: { format: "A4", margin: "20mm" },
    css,
    launch_options: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  }
);

if (pdf?.filename) {
  copyFileSync(pdfPath, publicPdfPath);
  console.log(`PDF created: ${pdf.filename}`);
  console.log(`Public copy: ${publicPdfPath}`);
} else {
  console.error("PDF generation failed");
  process.exit(1);
}
