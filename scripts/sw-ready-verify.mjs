import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? "http://localhost:3015";

async function diagnose(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 30_000 });
  await new Promise((r) => setTimeout(r, 4000));
  return page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration("/admin/");
    const regBare = await navigator.serviceWorker.getRegistration("/admin");
    const start = performance.now();
    let readyResolved = false;
    let readyError = null;
    try {
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT 15s")), 15_000)),
      ]);
      readyResolved = true;
    } catch (e) {
      readyError = e instanceof Error ? e.message : String(e);
    }
    return {
      href: location.href,
      pathname: location.pathname,
      regSlash: reg?.active?.state ?? null,
      regBare: regBare?.active?.state ?? null,
      controller: navigator.serviceWorker.controller?.scriptURL ?? null,
      readyResolved,
      readyMs: Math.round(performance.now() - start),
      readyError,
    };
  });
}

const browser = await puppeteer.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("[console]", msg.text());
});

const canonical = await diagnose(page, "/admin/");
console.log("=== CANONICAL /admin/ ===");
console.log(JSON.stringify(canonical, null, 2));

const legacy = await diagnose(page, "/admin");
console.log("\n=== LEGACY /admin (should redirect) ===");
console.log(JSON.stringify(legacy, null, 2));

await browser.close();
process.exit(canonical.readyResolved ? 0 : 1);
