import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const payload = JSON.parse(fs.readFileSync(path.join(root, "data/runtime/place-open/forsvarsmuseet.json"), "utf8"));
assert.equal(payload.schema, "history-go-place-open-v1");
assert.equal(payload.place.id, "forsvarsmuseet");
assert.ok(payload.place.fagverk && typeof payload.place.fagverk === "object", "benchmark Place must carry Fagverk");
assert.ok(payload.place.for_na && typeof payload.place.for_na === "object", "benchmark Place must carry Before/after");
assert.ok(Array.isArray(payload.stories) && payload.stories.length, "benchmark Place must carry Stories");
assert.ok(Array.isArray(payload.leksikon) && payload.leksikon.length, "benchmark Place must carry Leksikon");
assert.ok(Array.isArray(payload.lesespor) && payload.lesespor.length, "benchmark Place must carry Lesespor");
assert.ok(payload.language, "benchmark Place must carry Språk");

const safePayload = JSON.stringify(payload).replace(/</g, "\\u003c");
const fixture = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/css/placeCard.css"><link rel="stylesheet" href="/css/place-popup-v2.css"><link rel="stylesheet" href="/css/place-popup-shortcuts.css">
</head><body class="hg-app">
<div id="placeCard" class="is-open"><div class="pc-body"><div class="pc-text"><div class="pc-title-row"><h2 id="pcTitle">Forsvarsmuseet</h2></div><p id="pcDesc"></p></div><div class="pc-grid"><div class="pc-frontcard"><img id="pcFrontImage" alt=""></div><div class="pc-side-stack"><div class="pc-icons-quad"><button class="pc-round">1</button><button class="pc-round">2</button><button class="pc-round">3</button><button class="pc-round">4</button></div></div><div id="pcEventsBox" class="pc-events-quad"></div></div></div></div>
<footer class="app-actions"><button id="pcInfo">Mer info</button><button id="pcQuiz">Ta quiz</button><button id="pcVisit">Registrer besøk</button><button id="pcRoute">Rute</button><button id="pcObserve">Observer</button><button id="pcNote">Notat</button></footer>
<script>
window.__acceptance = { leksikonInit:0, readingFallback:0, languageOwnerLoads:0, learningOwnerLoads:0, legacyPopupCalls:0, actions:0, longTasks:[] };
const payload = ${safePayload};
const place = payload.place;
window.PLACES = [place];
window.HGPlaceOpen = {
  getPlace(input) { const id = typeof input === 'object' ? input?.id : input; return id === place.id ? place : null; },
  get(id) { return id === place.id ? payload : null; }
};
window.HGStories = { getByPlace(id) { return id === place.id ? payload.stories : []; } };
window.LEKSIKON_BY_PLACE = {};
window.HGLeksikon = {
  async init() { window.__acceptance.leksikonInit += 1; await new Promise(r => setTimeout(r, 12)); window.LEKSIKON_BY_PLACE[place.id] = payload.leksikon; },
  leksikonReadRecordsForPlace() { return []; }
};
window.HGReads = { recordLeksikon() {} };
window.DataHub = {
  async loadLesespor() { window.__acceptance.readingFallback += 1; return { items: payload.lesespor }; }
};
window.HGLanguageLayer = {
  async decoratePopup(ownerPlace, root) {
    window.__acceptance.languageOwnerLoads += 1;
    await new Promise(r => setTimeout(r, 12));
    const panels = root?.querySelector('.hg-place-tab-panels');
    if (!panels || panels.querySelector('[data-place-panel="language"]')) return;
    const panel = document.createElement('section');
    panel.className = 'hg-place-tab-panel hg-place-language-panel';
    panel.dataset.placePanel = 'language';
    const term = payload.language?.entries?.[0]?.term || payload.language?.title || 'Språk';
    panel.textContent = String(term);
    panels.appendChild(panel);
  }
};
window.HGPlaceLearningSurface = {
  async loadRegistry() { window.__acceptance.learningOwnerLoads += 1; await new Promise(r => setTimeout(r, 12)); return { subjects:{} }; },
  renderLearningSection(_registry, ownerPlace) { return '<div class="hg-place-learning-section">' + String(ownerPlace.fagverk?.intro || ownerPlace.name) + '</div>'; }
};
window.HGPlacePopupTabs = {};
window.HGPlacePopupDirectTabs = {};
window.showPlacePopup = function legacyPopup() { window.__acceptance.legacyPopupCalls += 1; };
window.openPlaceCard = async function baseOpen(ownerPlace) {
  const card = document.getElementById('placeCard');
  card.dataset.currentPlaceId = ownerPlace.id;
  document.getElementById('pcTitle').textContent = ownerPlace.name;
  document.getElementById('pcDesc').textContent = ownerPlace.desc || ownerPlace.popupDesc || '';
  return ownerPlace;
};
HTMLElement.prototype.scrollIntoView = function() {};
for (const id of ['pcQuiz','pcVisit','pcRoute','pcObserve','pcNote']) document.getElementById(id).addEventListener('click', () => window.__acceptance.actions += 1);
try {
  new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__acceptance.longTasks.push(entry.duration); }).observe({entryTypes:['longtask']});
} catch {}
</script>
<script src="/dist/web/place-unified-surface.js"></script>
</body></html>`;

const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8", ".webp":"image/webp", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png" };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (pathname === "/__place_sheet_final__/index.html") { response.writeHead(200, { "content-type":mime[".html"] }); response.end(fixture); return; }
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end("not found"); return; }
  response.writeHead(200, { "content-type":mime[path.extname(file).toLowerCase()] || "application/octet-stream" });
  response.end(fs.readFileSync(file));
});

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
let browser;
try {
  browser = await chromium.launch({ headless:true });
  const page = await browser.newPage({ viewport:{ width:1100, height:820 } });
  await page.goto(`http://127.0.0.1:${port}/__place_sheet_final__/index.html`, { waitUntil:"networkidle" });

  await page.evaluate(() => performance.clearResourceTimings());
  const interactiveMs = await page.evaluate(async () => {
    const started = performance.now();
    await window.openPlaceCard(window.PLACES[0]);
    return performance.now() - started;
  });
  await page.waitForFunction(() => window.HGPlaceSheetState?.snapshot?.()?.phase === "full-ready", null, { timeout:5000 });

  const metrics = await page.evaluate(() => {
    const state = window.HGPlaceSheetState.snapshot();
    const card = document.getElementById("placeCard");
    const canonicalOrder = ["about","history","stories","before-after","news","reading","language","learning","sources"];
    const visibleOrder = [...card.querySelectorAll("[data-hg-place-sheet-section]")]
      .filter(node => !node.hidden && canonicalOrder.includes(node.dataset.hgPlaceSheetSection))
      .map(node => node.dataset.hgPlaceSheetSection);
    const sectionImages = [...card.querySelectorAll("[data-hg-place-sheet-section] img")];
    const resources = performance.getEntriesByType("resource");
    return {
      state,
      domNodes: card.querySelectorAll("*").length,
      longestLongTask: Math.max(0, ...window.__acceptance.longTasks),
      fetchRequests: resources.filter(entry => ["fetch","xmlhttprequest"].includes(entry.initiatorType)).length,
      imageRequests: resources.filter(entry => entry.initiatorType === "img").length,
      sectionImageCount: sectionImages.length,
      nonLazySectionImages: sectionImages.filter(img => img.getAttribute("loading") !== "lazy").length,
      visibleOrder,
      counters: { ...window.__acceptance, longTasks:undefined },
      direct: card.classList.contains("is-place-sheet-direct") && card.classList.contains("is-unified-place"),
      legacyHostCount: card.querySelectorAll("#pcUnifiedKnowledgeHost, .hg-unified-renderer-embedded").length,
      standalonePopupCount: document.querySelectorAll("body > .hg-popup.place-popup-v2").length,
      collections: card.querySelectorAll(".pc-icons-quad .pc-round").length,
      actionsConnected: ["pcQuiz","pcVisit","pcRoute","pcObserve","pcNote"].every(id => document.getElementById(id)?.isConnected)
    };
  });

  const canonicalOrder = ["about","history","stories","before-after","news","reading","language","learning","sources"];
  assert.equal(metrics.state.placeId, "forsvarsmuseet");
  assert.equal(metrics.state.phase, "full-ready");
  assert.equal(Object.values(metrics.state.sections).every(value => ["rendered","omitted"].includes(value)), true, "no applicable section may finish failed");
  assert.equal(metrics.state.sections.sources, "rendered");
  assert.equal(metrics.state.sections.history, "rendered");
  assert.equal(metrics.state.sections.stories, "rendered");
  assert.equal(metrics.state.sections["before-after"], "rendered");
  assert.equal(metrics.state.sections.reading, "rendered");
  assert.equal(metrics.state.sections.language, "rendered");
  assert.equal(metrics.state.sections.learning, "rendered");
  assert.deepEqual(metrics.visibleOrder, canonicalOrder.filter(id => metrics.visibleOrder.includes(id)), "visible standard sections remain in canonical order");

  assert.equal(metrics.direct, true);
  assert.equal(metrics.legacyHostCount, 0);
  assert.equal(metrics.standalonePopupCount, 0);
  assert.equal(metrics.counters.legacyPopupCalls, 0, "standard Place never enters legacy popup presentation");
  assert.equal(metrics.collections, 4);
  assert.equal(metrics.actionsConnected, true);

  assert.ok(interactiveMs <= 500, `interactive hero/shell must stay <=500ms, got ${interactiveMs.toFixed(1)}ms`);
  assert.ok(metrics.longestLongTask <= 250, `longest main-thread task must stay <=250ms, got ${metrics.longestLongTask.toFixed(1)}ms`);
  assert.ok(metrics.domNodes <= 1500, `full-ready DOM budget exceeded: ${metrics.domNodes}`);
  assert.ok(metrics.fetchRequests <= 1, `unexpected duplicate owner/network fetches: ${metrics.fetchRequests}`);
  assert.equal(metrics.nonLazySectionImages, 0, "all section media below the hero must remain lazy-loadable");
  assert.ok(metrics.imageRequests <= metrics.sectionImageCount, "lazy image behavior must not create more image requests than section images");

  assert.equal(metrics.counters.leksikonInit, 1, "News and Sources share one canonical Leksikon owner load");
  assert.equal(metrics.counters.readingFallback, 0, "preloaded canonical Lesespor must not trigger aggregate fallback");
  assert.equal(metrics.counters.languageOwnerLoads, 1, "Språk owner must hydrate once per Place generation");
  assert.equal(metrics.counters.learningOwnerLoads, 1, "Fagverk owner must hydrate once per Place generation");

  const fullReadyMs = await page.evaluate(() => {
    const state = window.HGPlaceSheetState.snapshot();
    return state?.phase === "full-ready" ? performance.now() : NaN;
  });
  assert.ok(Number.isFinite(fullReadyMs));

  await page.locator("#pcQuiz").click();
  await page.locator("#pcVisit").click();
  await page.locator("#pcRoute").click();
  await page.locator("#pcObserve").click();
  await page.locator("#pcNote").click();
  assert.equal(await page.evaluate(() => window.__acceptance.actions), 5, "primary/secondary Place actions keep their DOM hooks");

  console.log("Place Sheet final performance metrics", {
    benchmark: payload.place.id,
    interactiveMs: Number(interactiveMs.toFixed(1)),
    longestLongTaskMs: Number(metrics.longestLongTask.toFixed(1)),
    domNodes: metrics.domNodes,
    fetchRequests: metrics.fetchRequests,
    imageRequests: metrics.imageRequests,
    sectionImages: metrics.sectionImageCount,
    visibleSections: metrics.visibleOrder,
    ownerLoads: metrics.counters
  });
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
