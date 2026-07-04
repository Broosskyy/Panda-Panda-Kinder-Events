#!/usr/bin/env node
/**
 * Live verification for panda-bande-events.de
 * Usage: node scripts/live-verify.mjs [baseUrl]
 * Exit 0 = all automated checks passed, 1 = failures
 */
const BASE = process.argv[2] || "https://panda-bande-events.de";
const SESSION = `live-verify-${Date.now()}`;

const results = [];

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  const icon = passed ? "✔" : "✖";
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchText(url, opts = {}) {
  const res = await fetch(url, { ...opts, redirect: "follow" });
  const text = await res.text();
  return { res, text };
}

async function main() {
  console.log(`\nLive verify: ${BASE}\n`);

  try {
    const { res: homeRes, text: home } = await fetchText(BASE);
    record("Homepage erreichbar", homeRes.ok, `HTTP ${homeRes.status}`);
    record(
      "Cache-Control no-store",
      (homeRes.headers.get("cache-control") || "").includes("no-store"),
      homeRes.headers.get("cache-control") || "missing",
    );
    record("Kein Review-Loading-Text", !home.includes("Bewertungen werden geladen"));
    record("Bewertungen-Sektion vorhanden", home.includes('id="bewertungen"'));
    record("Leistungen einmal im DOM", (home.match(/id="leistungen"/g) || []).length === 1);
    record("Ablauf einmal im DOM", (home.match(/id="ablauf"/g) || []).length === 1);
    record("Hero-Tagline im HTML", /font-accent[^>]*>[^<]{3,}/.test(home));
  } catch (e) {
    record("Homepage erreichbar", false, e.message);
  }

  try {
    const { res, text } = await fetchText(`${BASE}/api/reviews`);
    const data = JSON.parse(text);
    record("Reviews API", res.ok, `HTTP ${res.status}`);
    record("Reviews API JSON", Array.isArray(data.reviews));
    if (data.reviews?.length) {
      const r = data.reviews[0];
      record("Review profile_image_url Feld", "profile_image_url" in r);
      record("Review event_image_url Feld", "event_image_url" in r);
      if (r.profile_image_url) {
        record("Profilbild URL gültig", r.profile_image_url.startsWith("http"));
      }
    }
  } catch (e) {
    record("Reviews API", false, e.message);
  }

  try {
    const res = await fetch(`${BASE}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/", referrer: null, sessionId: SESSION }),
    });
    const data = await res.json();
    record("Tracking API antwortet", res.ok || res.status === 503, `HTTP ${res.status}`);
    if (res.status === 503) {
      record("Tracking Supabase konfiguriert", false, "503 — Env/Migration prüfen");
    } else {
      record("Tracking Insert", data.ok === true, JSON.stringify(data));
    }
  } catch (e) {
    record("Tracking API", false, e.message);
  }

  try {
    const { res } = await fetchText(`${BASE}/aktuelles`);
    record("/aktuelles erreichbar", res.ok, `HTTP ${res.status}`);
  } catch (e) {
    record("/aktuelles erreichbar", false, e.message);
  }

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} bestanden\n`);

  if (failed.length) {
    console.log("NICHT BESTANDEN (automatisiert):");
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
    console.log("\nCMS Admin-Tests (Hero/Kontakt/Galerie/…) erfordern manuellen Admin-Zugang.\n");
    process.exit(1);
  }
}

main();
