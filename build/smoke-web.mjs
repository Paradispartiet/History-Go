// build/smoke-web.mjs
// Headless røyktest for migrerte browser-sider, uten ekte nettleser.
//
// Bruker JSDOM (ren JS, ingen browser-binær) til å laste en faktisk HTML-side
// fra disk, kjøre <script>-taggene i rekkefølge (inkl. de esbuild-bygde
// dist/web-bundlene), og verifisere at:
//   1. ingen dist/web/*.js-bundle feiler å laste (404),
//   2. forventede migrerte window-globaler publiseres,
//   3. samler konsollfeil (rapporteres; brukes ikke til hard-fail siden
//      ikke-migrerte klassiske scripts kan feile på JSDOM-manglende API-er).
//
// Kjør: npm run smoke:web   (krever npm run build:web først)
//
// MERK: JSDOM gjør ikke layout og mangler enkelte browser-API-er (canvas,
// MapLibre, IntersectionObserver, ekte fetch). Dette er derfor en
// integrasjons-røyktest for migreringen (bundles laster + globaler finnes),
// ikke en full visuell test. index.html (MapLibre/canvas) testes ikke her.

import jsdomPkg from "jsdom";
const { JSDOM, VirtualConsole } = jsdomPkg;
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Sider å teste og hvilke migrerte globaler som MÅ finnes etter last.
 * @type {{ page: string; globals: string[] }[]}
 */
const TARGETS = [
  { page: "emner.html", globals: ["Emner", "HGInsights", "computeEmneDekningV2"] },
  { page: "knowledge.html", globals: ["Emner", "HGInsights", "Fagkart", "getKnowledgeUniverse", "renderKnowledgeSection"] },
  {
    page: "profile.html",
    globals: ["HGInsights", "FagHealthReport", "HGKnowledgeEngine", "HG_SOCIAL_INDEX", "HGModeration", "getKnowledgeUniverse"]
  },
  // Laster knowledge-motoren via root-shim (../knowledge.js -> document.write dist/web/knowledge.js)
  { page: "knowledge/knowledge_historie.html", globals: ["Emner", "HGInsights", "getKnowledgeUniverse", "renderKnowledgeSection"] }
];

const onlyArg = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const targets = onlyArg.length
  ? TARGETS.filter((t) => onlyArg.some((a) => t.page.includes(a)))
  : TARGETS;

// Map en absolutt URL-sti (file:// eller http path) til en lokal repo-fil.
function localFileFor(urlStr) {
  try {
    const u = new URL(urlStr);
    if (u.protocol === "file:") return fileURLToPath(u);
    // http(s)://host/<path> -> repo-relativ
    return path.join(ROOT, decodeURIComponent(u.pathname));
  } catch {
    return null;
  }
}

// Statisk sjekk: finn alle <script src> som peker på dist/web og bekreft at
// fila faktisk finnes på disk relativt til siden (fanger feil sti / manglende bundle).
function checkBundleRefs(html, pageAbs) {
  const dir = path.dirname(pageAbs);
  const refs = [...html.matchAll(/<script[^>]*\ssrc=["']([^"']*dist\/web\/[^"']+)["']/g)].map((m) => m[1]);
  const missing = [];
  const present = [];
  for (const ref of refs) {
    const resolved = path.resolve(dir, ref);
    (fs.existsSync(resolved) ? present : missing).push(ref);
  }
  return { present, missing };
}

// En enkel fetch som serverer lokale filer (absolutte stier fra repo-roten),
// slik at data-loaders ikke krasjer. Returnerer 404-aktig svar hvis filen mangler.
function makeLocalFetch() {
  return async function localFetch(input) {
    const urlStr = typeof input === "string" ? input : input?.url || String(input);
    let rel = urlStr;
    try {
      const u = new URL(urlStr, "http://localhost/");
      rel = decodeURIComponent(u.pathname);
    } catch {}
    const filePath = path.join(ROOT, rel.replace(/^\/+/, ""));
    const exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    const body = exists ? fs.readFileSync(filePath, "utf8") : "";
    return {
      ok: exists,
      status: exists ? 200 : 404,
      statusText: exists ? "OK" : "Not Found",
      url: urlStr,
      async json() { return JSON.parse(body || "{}"); },
      async text() { return body; }
    };
  };
}

async function smokePage({ page, globals }) {
  const abs = path.join(ROOT, page);
  if (!fs.existsSync(abs)) return { page, ok: false, reason: `mangler fil: ${page}` };

  const consoleErrors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => consoleErrors.push(`jsdomError: ${e.message}`));
  vc.on("error", (...a) => consoleErrors.push(`console.error: ${a.join(" ")}`));

  const html = fs.readFileSync(abs, "utf8");
  const bundleRefs = checkBundleRefs(html, abs);

  // Fjern eksterne http(s)-scripts/links (leaflet, supabase, MapLibre, CDN-er).
  // De er ikke migreringsrelevante, og JSDOM henger på nettverksforsøk mot dem
  // (nettverkspolicy blokkerer) — det gjorde testen flaky. Lokale dist/web/js
  // er relative og påvirkes ikke.
  const htmlForDom = html
    .replace(/<script\b[^>]*\ssrc=["']https?:\/\/[^"']*["'][^>]*><\/script>/gi, "<!-- ext script stripped -->")
    .replace(/<link\b[^>]*\shref=["']https?:\/\/[^"']*["'][^>]*\/?>/gi, "<!-- ext link stripped -->");

  const dom = new JSDOM(htmlForDom, {
    url: pathToFileURL(abs).href,
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.DEBUG = false;
      window.fetch = makeLocalFetch();
      // file:// gir opaque origin -> localStorage kaster. Inject in-memory shim.
      const mkStore = () => {
        const m = new Map();
        return {
          getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null),
          setItem: (k, v) => void m.set(String(k), String(v)),
          removeItem: (k) => void m.delete(String(k)),
          clear: () => m.clear(),
          key: (i) => [...m.keys()][i] ?? null,
          get length() { return m.size; }
        };
      };
      Object.defineProperty(window, "localStorage", { value: mkStore(), configurable: true });
      Object.defineProperty(window, "sessionStorage", { value: mkStore(), configurable: true });
      // Stub API-er JSDOM mangler, som ellers gir falske feil.
      window.scrollTo = () => {};
      window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
      if (!window.navigator.serviceWorker) {
        Object.defineProperty(window.navigator, "serviceWorker", {
          value: { register: () => Promise.resolve({ scope: "/" }), addEventListener() {}, ready: Promise.resolve({}) },
          configurable: true
        });
      }
      window.IntersectionObserver = window.IntersectionObserver || class { observe() {} unobserve() {} disconnect() {} };
      window.requestAnimationFrame = window.requestAnimationFrame || ((cb) => setTimeout(() => cb(Date.now()), 0));
    }
  });

  // Vent på at DOMContentLoaded-handlere + async last skal kjøre.
  await new Promise((r) => setTimeout(r, 1200));

  const win = dom.window;

  const missingGlobals = globals.filter((g) => typeof win[g] === "undefined");

  dom.window.close();

  // Hard fail: en dist/web-bundle som siden refererer mangler på disk, eller
  // en forventet migrert global ble ikke publisert etter at scriptene kjørte.
  const ok = bundleRefs.missing.length === 0 && missingGlobals.length === 0;
  return {
    page,
    ok,
    bundlesReferenced: bundleRefs.present.map((u) => u.split("dist/web/")[1]),
    bundle404: bundleRefs.missing,
    missingGlobals,
    consoleErrors: consoleErrors.slice(0, 8)
  };
}

let allOk = true;
for (const t of targets) {
  const r = await smokePage(t);
  allOk = allOk && r.ok;
  console.log(`\n${r.ok ? "✅ PASS" : "❌ FAIL"}  ${r.page}`);
  if (r.reason) console.log(`   ${r.reason}`);
  if (r.bundlesReferenced?.length) console.log(`   dist/web-bundles funnet: ${r.bundlesReferenced.join(", ")}`);
  if (r.bundle404?.length) console.log(`   ⛔ 404 på bundle: ${r.bundle404.join(", ")}`);
  if (r.missingGlobals?.length) console.log(`   ⛔ manglende globaler: ${r.missingGlobals.join(", ")}`);
  if (r.consoleErrors?.length) {
    console.log(`   ⚠ konsoll/feil (ikke nødvendigvis migreringsrelatert):`);
    r.consoleErrors.forEach((e) => console.log(`      - ${e.slice(0, 160)}`));
  }
}

console.log(`\n${allOk ? "✅ ALLE SIDER OK" : "❌ NOEN SIDER FEILET"}`);
process.exit(allOk ? 0 : 1);
