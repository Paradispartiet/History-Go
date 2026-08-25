import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const ordinaryCategories = [
  "by", "historie", "historisk", "kunst", "litteratur", "media", "musikk",
  "naeringsliv", "politikk", "popkultur", "psykologi", "religion", "scenekunst", "sport",
  "subkultur", "vitenskap", "filosofi", "film_tv", "lekeplass", "trening", "transport"
];

const fixture = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/css/placeCard.css"><link rel="stylesheet" href="/css/place-rounds-fill-layout.css"><link rel="stylesheet" href="/css/place-popup-shortcuts.css">
<style>:root{--pc-round-gap:12px;--place-card-media-height:260px;--place-card-orb-size:110px}body{margin:0;background:#111}#placeCard .pc-grid{display:grid;grid-template-columns:220px 360px;grid-template-rows:auto auto auto;width:580px;margin:20px}.pc-frontcard{width:220px;height:260px}.pc-side-stack{height:260px}.pc-icons-quad{display:grid;min-height:0}.pc-round{box-sizing:border-box;background:#29343b;color:white;border:1px solid #ddd;display:grid;place-items:center}#pcQuiz{display:block}@media(max-width:700px){#placeCard .pc-grid{grid-template-columns:220px 360px;width:580px;margin:10px}.pc-side-stack{height:250px}}</style></head><body>
<div id="placeCard" data-current-place-id="audit"><div class="pc-body"><div class="pc-title-row"><h2>Audit</h2><div id="pcBadgesIcon" class="pc-round"></div></div><div id="pcMeta"><span>Politikk &amp; samfunn · 1950–1979</span><span class="pc-epoke">Epoke: Velferdsstat, korporatisme og planlegging</span><span class="pc-progress-status-line">Status: Ikke fullført · Gjenstår: Ta quiz</span></div><div class="pc-grid">
<div class="pc-frontcard"><div class="pc-card-face pc-card-face-front" data-media-state="fallback"><img id="pcFrontImage" alt=""></div></div>
<div class="pc-side-stack"><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div></div></div><div class="pc-events-quad"></div></div>
<div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div></div></div><button id="pcQuiz" hidden>Ta quiz</button>
<script>const category=new URLSearchParams(location.search).get('category')||'by';window.PLACES=[{id:'audit',name:'Audit',category}];</script>
<script src="/js/ui/place-rounds-visual-collections.js"></script><script src="/js/ui/place-rounds-fill-layout.js"></script><script src="/js/ui/place-popup-shortcuts.js"></script>
<script>addEventListener('DOMContentLoaded',()=>HGPlaceCardCollections.apply(PLACES[0]).then(()=>{HGPlaceRoundsFillLayout.layout();window.__ready=true}).catch(error=>window.__error=String(error)))</script></body></html>`;

const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8" };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (pathname === "/__audit__/fullness.html") { response.writeHead(200, { "content-type":mime[".html"] }); response.end(fixture); return; }
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end("not found"); return; }
  response.writeHead(200, { "content-type":mime[path.extname(file)] || "application/octet-stream" }); response.end(fs.readFileSync(file));
});

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
let browser;
try {
  browser = await chromium.launch({ headless:true });
  const page = await browser.newPage({ viewport:{ width:900, height:700 } });
  const verify = async (category, expectedShapes) => {
    await page.goto(`http://127.0.0.1:${port}/__audit__/fullness.html?category=${category}`, { waitUntil:"networkidle" });
    await page.waitForFunction(() => window.__ready === true);
    assert.equal(await page.locator(".pc-icons-quad .pc-round:not([hidden])").count(), 4, category);
    assert.equal(await page.locator(".pc-icons-quad").getAttribute("data-collection-count"), "4", category);
    assert.deepEqual(await page.locator(".pc-icons-quad .pc-round:not([hidden])").evaluateAll(nodes => nodes.sort((a,b) => Number(a.style.order) - Number(b.style.order)).map(node => node.dataset.collectionShape)), expectedShapes, category);
    const cells = await page.locator(".pc-icons-quad .pc-round:not([hidden])").evaluateAll(nodes => nodes.sort((a,b) => Number(a.style.order) - Number(b.style.order)).map(node => { const r=node.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height }; }));
    assert.equal(new Set(cells.map(cell => Math.round(cell.y))).size, 2, category);
    cells.forEach((cell, index) => expectedShapes[index] === "circle"
      ? assert.ok(Math.abs(cell.w - cell.h) < 2, `${category} circle ${index}`)
      : assert.ok(cell.w > cell.h, `${category} rectangle ${index}`));
    const shortcuts = await page.locator(".pc-place-popup-shortcut").evaluateAll(nodes => nodes.map(node => { const r=node.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height }; }));
    assert.equal(shortcuts.length, 6, `${category} shortcuts`);
    assert.equal(new Set(shortcuts.map(cell => Math.round(cell.y))).size, 1, `${category} shortcut row`);
    const collectionBottom = Math.max(...cells.map(cell => cell.y + cell.h));
    assert.ok(shortcuts.every(cell => cell.y >= collectionBottom), `${category} shortcuts below collections`);
    const [shortcutRow, frontCard, sideStack] = await Promise.all([
      page.locator(".pc-place-popup-shortcuts").boundingBox(),
      page.locator(".pc-frontcard").boundingBox(),
      page.locator(".pc-side-stack").boundingBox()
    ]);
    assert.ok(shortcutRow && frontCard && sideStack, `${category} full-width shortcut geometry`);
    assert.ok(Math.abs(shortcutRow.x - frontCard.x) < 2, `${category} shortcuts begin under front image`);
    assert.ok(Math.abs(shortcutRow.x + shortcutRow.width - (sideStack.x + sideStack.width)) < 2, `${category} shortcuts end under collections`);
    assert.ok(shortcutRow.y >= Math.max(frontCard.y + frontCard.height, sideStack.y + sideStack.height), `${category} shortcuts below both media columns`);
    const metadata = await page.locator("#pcMeta > *").evaluateAll(nodes => nodes.map(node => { const r=node.getBoundingClientRect(); return { y:r.y, h:r.height, scrollHeight:node.scrollHeight, whiteSpace:getComputedStyle(node).whiteSpace }; }));
    assert.equal(metadata.length, 3, `${category} metadata items`);
    assert.equal(new Set(metadata.map(cell => Math.round(cell.y))).size, 1, `${category} metadata row`);
    assert.ok(metadata.every(cell => cell.whiteSpace === "nowrap" && cell.scrollHeight <= cell.h + 1), `${category} metadata no-wrap`);
    assert.equal(await page.locator("#pcBadgesIcon").evaluate(node => node.parentElement.classList.contains("pc-title-row")), true, category);
    assert.equal(await page.locator("#pcQuiz").isVisible(), true, category);
    assert.match(await page.locator(".pc-card-face-front").evaluate(node => getComputedStyle(node, "::before").content), /HISTORY GO/, category);
  };
  for (const category of ordinaryCategories) await verify(category, ["circle", "rectangle", "rectangle", "rectangle"]);
  await verify("natur", ["circle", "circle", "rectangle", "rectangle"]);
  await page.setViewportSize({ width:390, height:844 });
  await verify("by", ["circle", "rectangle", "rectangle", "rectangle"]);
  await verify("natur", ["circle", "circle", "rectangle", "rectangle"]);
  assert.equal(await page.evaluate(() => window.__error || null), null);
  console.log("PlaceCard full-grid all-category browser audit OK");
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
