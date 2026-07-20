// build/smoke-web.mjs
// Headless røyktest for migrerte browser-sider, uten ekte nettleser.
//
// Bruker JSDOM til å laste faktiske HTML-sider fra disk, kjøre script-tagene
// og verifisere at forventede browser-globaler publiseres. Legacy Knowledge-
// fagsider testes ikke lenger som egne apper; de er kun kompatibilitetsredirects.

import jsdomPkg from "jsdom";
const { JSDOM, VirtualConsole } = jsdomPkg;
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TARGETS = [
  { page: "emner.html", globals: ["Emner", "HGInsights", "computeEmneDekningV2", "HGCourses"] },
  {
    page: "knowledge.html",
    globals: ["Emner", "HGInsights", "getKnowledgeUniverse", "renderKnowledgeSection", "HGKnowledgeV2"]
  },
  {
    page: "profile.html",
    globals: [
      "HGInsights", "FagHealthReport", "HGKnowledgeEngine", "HG_SOCIAL_INDEX", "HGModeration",
      "getKnowledgeUniverse", "getTriviaUniverse", "saveTriviaPoint", "HGCourses"
    ]
  },
  {
    page: "Civication.html",
    globals: [
      "CivicationState", "CivicationCalendar", "CivicationEventEngine", "CivicationMailEngine",
      "CivicationMailRuntime", "CivicationDailyMailBuilder", "CivicationNextActionSelector",
      "CivicationNextActionUI", "CivicationDayProgression", "CivicationPsyche", "CivicationEventChannels",
      "CivicationCityMap"
    ]
  }
];

const onlyArg = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const targets = onlyArg.length
  ? TARGETS.filter((target) => onlyArg.some((arg) => target.page.includes(arg)))
  : TARGETS;

function checkBundleRefs(html, pageAbs) {
  const dir = path.dirname(pageAbs);
  const refs = [...html.matchAll(/<script[^>]*\ssrc=["']([^"']*dist\/web\/[^"']+)["']/g)].map((match) => match[1]);
  const missing = [];
  const present = [];

  for (const ref of refs) {
    const resolved = path.resolve(dir, ref);
    (fs.existsSync(resolved) ? present : missing).push(ref);
  }

  return { present, missing };
}

function makeLocalFetch() {
  return async function localFetch(input) {
    const urlStr = typeof input === "string" ? input : input?.url || String(input);
    let rel = urlStr;
    try {
      const url = new URL(urlStr, "http://localhost/");
      rel = decodeURIComponent(url.pathname);
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

function makeStore() {
  const values = new Map();
  return {
    getItem: (key) => values.has(String(key)) ? values.get(String(key)) : null,
    setItem: (key, value) => void values.set(String(key), String(value)),
    removeItem: (key) => void values.delete(String(key)),
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() { return values.size; }
  };
}

async function smokePage({ page, globals }) {
  const abs = path.join(ROOT, page);
  if (!fs.existsSync(abs)) return { page, ok: false, reason: `mangler fil: ${page}` };

  const consoleErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (error) => consoleErrors.push(`jsdomError: ${error.message}`));
  virtualConsole.on("error", (...args) => consoleErrors.push(`console.error: ${args.join(" ")}`));

  const html = fs.readFileSync(abs, "utf8");
  const bundleRefs = checkBundleRefs(html, abs);
  const htmlForDom = html
    .replace(/<script\b[^>]*\ssrc=["']https?:\/\/[^"']*["'][^>]*><\/script>/gi, "<!-- ext script stripped -->")
    .replace(/<link\b[^>]*\shref=["']https?:\/\/[^"']*["'][^>]*\/?>/gi, "<!-- ext link stripped -->");

  const dom = new JSDOM(htmlForDom, {
    url: pathToFileURL(abs).href,
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.DEBUG = false;
      window.fetch = makeLocalFetch();
      Object.defineProperty(window, "localStorage", { value: makeStore(), configurable: true });
      Object.defineProperty(window, "sessionStorage", { value: makeStore(), configurable: true });
      window.scrollTo = () => {};
      window.matchMedia = window.matchMedia || (() => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {}
      }));
      if (!window.navigator.serviceWorker) {
        Object.defineProperty(window.navigator, "serviceWorker", {
          value: { register: () => Promise.resolve({ scope: "/" }), addEventListener() {}, ready: Promise.resolve({}) },
          configurable: true
        });
      }
      window.IntersectionObserver = window.IntersectionObserver || class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
      window.requestAnimationFrame = window.requestAnimationFrame || ((callback) => setTimeout(() => callback(Date.now()), 0));
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const missingGlobals = globals.filter((name) => typeof dom.window[name] === "undefined");
  dom.window.close();

  return {
    page,
    ok: bundleRefs.missing.length === 0 && missingGlobals.length === 0,
    bundlesReferenced: bundleRefs.present.map((url) => url.split("dist/web/")[1]),
    bundle404: bundleRefs.missing,
    missingGlobals,
    consoleErrors: consoleErrors.slice(0, 8)
  };
}

let allOk = true;
for (const target of targets) {
  const result = await smokePage(target);
  allOk = allOk && result.ok;
  console.log(`\n${result.ok ? "✅ PASS" : "❌ FAIL"}  ${result.page}`);
  if (result.reason) console.log(`   ${result.reason}`);
  if (result.bundlesReferenced?.length) console.log(`   dist/web-bundles funnet: ${result.bundlesReferenced.join(", ")}`);
  if (result.bundle404?.length) console.log(`   ⛔ 404 på bundle: ${result.bundle404.join(", ")}`);
  if (result.missingGlobals?.length) console.log(`   ⛔ manglende globaler: ${result.missingGlobals.join(", ")}`);
  if (result.consoleErrors?.length) {
    console.log("   ⚠ konsoll/feil (ikke nødvendigvis migreringsrelatert):");
    result.consoleErrors.forEach((error) => console.log(`      - ${error.slice(0, 160)}`));
  }
}

console.log(`\n${allOk ? "✅ ALLE SIDER OK" : "❌ NOEN SIDER FEILET"}`);
process.exit(allOk ? 0 : 1);
