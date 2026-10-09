import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const headerStart = html.indexOf('<header class="site-header">');
const headerEnd = html.indexOf('</header>', headerStart);
const nearbyStart = html.indexOf('<div id="nearbyListContainer"');
const nearbyEnd = html.indexOf('<div id="toast"', nearbyStart);
assert.ok(headerStart >= 0 && headerEnd > headerStart && nearbyStart > headerEnd
  && nearbyEnd > nearbyStart, "Header and canonical Explore drawer exist");
assert.equal((html.match(/id="nearbyExploreToggle"/g) || []).length, 1,
  "Utforsk must have exactly one toggle button in the document");
const headerMarkup = html.slice(headerStart, headerEnd + '</header>'.length);
assert.match(headerMarkup, /<button id="nearbyExploreToggle"/,
  "The single Utforsk button is inside header");
const nearbyMarkup = html.slice(nearbyStart, nearbyEnd);

const fixture = [
  '<!doctype html><html><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<link rel="stylesheet" href="/css/theme.css">',
  '<link rel="stylesheet" href="/css/base.css">',
  '<link rel="stylesheet" href="/css/layout.css">',
  '<link rel="stylesheet" href="/css/nearby.css">',
  '<link rel="stylesheet" href="/css/miniProfile.css">',
  '<link rel="stylesheet" href="/css/people.css">',
  '<link rel="stylesheet" href="/css/nature.css">',
  '<style>:root{--hg-visual-header-height:56px;--hg-visual-footer-height:72px}',
  '#mapLayer{background:repeating-linear-gradient(45deg,#263b28 0 20px,#315035 20px 40px)}',
  '</style></head><body class="hg-app">',
  '<div id="mapLayer"></div>',
  headerMarkup,
  nearbyMarkup,
  '<footer class="app-footer"></footer>',
  '<script src="/js/ui/nearby-drawer.js"></script>',
  '<script>',
  'document.body.classList.toggle("hg-phone", innerWidth <= 520);',
  'document.documentElement.style.setProperty("--hg-visual-footer-height", innerWidth <= 520 ? "60px" : "72px");',
  'for (const id of ["nearbyList","leftPeopleList","leftNatureList","leftRoutesList","leftBadgesList"]) {',
  '  const list = document.getElementById(id);',
  '  for (let i = 0; i < 24; i++) {',
  '    const card = document.createElement("div");',
  '    card.className = "nearby-item";',
  '    card.innerHTML = \'<div class="nearby-thumbWrap"></div>\' +',
  '      \'<div class="nearby-content"><div class="nearby-title">Historisk sted \' + i +',
  '      \'</div><div class="nearby-meta">450 m unna</div></div>\';',
  '    list.appendChild(card);',
  '  }',
  '}',
  'window.HGNearbyDrawer.bindInteractions();',
  '</script>',
  '</body></html>'
].join("\n");

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname === "/__audit__/nearby.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fixture);
    return;
  }
  if (!["/css/theme.css", "/css/base.css", "/css/layout.css", "/css/nearby.css",
    "/css/miniProfile.css", "/css/people.css", "/css/nature.css",
    "/js/ui/nearby-drawer.js"].includes(pathname)) {
    response.writeHead(404); response.end("not found"); return;
  }
  response.writeHead(200, { "content-type": pathname.endsWith(".css")
    ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8" });
  response.end(fs.readFileSync(path.join(root, pathname.slice(1))));
});

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const [width, height] of [[320, 700], [390, 844], [768, 1024], [1024, 900], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto("http://127.0.0.1:" + port + "/__audit__/nearby.html", { waitUntil: "load" });
    assert.equal(await page.locator("#nearbyExploreToggle").count(), 1,
      "Only one Utforsk button at " + width);
    assert.equal(await page.locator("header.site-header .top-actions > #nearbyExploreToggle").count(), 1,
      "Utforsk is a direct header action at " + width);
    assert.equal(await page.locator("#nearbyExploreToggle").getAttribute("aria-controls"), "nearbyListContainer");
    const before = await page.evaluate(() => {
      const bounds = selector => document.querySelector(selector).getBoundingClientRect();
      const header = bounds("header.site-header");
      const logo = bounds("header.site-header .hg-brand");
      const toggle = bounds("#nearbyExploreToggle");
      return {
        headerBottom: header.bottom,
        toggleTop: toggle.top,
        toggleBottom: toggle.bottom,
        toggleLeft: toggle.left,
        toggleRight: toggle.right,
        logoRight: logo.right,
        pageScrollWidth: document.documentElement.scrollWidth
      };
    });
    assert.ok(before.toggleTop >= -1 && before.toggleBottom <= before.headerBottom + 1,
      "Utforsk fits vertically in the header at " + width);
    assert.ok(before.toggleLeft >= before.logoRight - 1,
      "Utforsk does not overlap the logo at " + width);
    assert.ok(before.toggleRight <= width - 2 && before.pageScrollWidth <= width + 1,
      "No horizontal header overflow at " + width);
    assert.equal(await page.locator("#nearbyListContainer").evaluate(node => getComputedStyle(node).display), "none",
      "Explore must start closed");
    await page.locator("#nearbyExploreToggle").click();
    assert.equal(await page.locator("#nearbyExploreToggle").getAttribute("aria-expanded"), "true");
    const state = await page.evaluate(() => {
      const rect = element => {
        const { x, y, right, bottom, width, height } = element.getBoundingClientRect();
        return { x, y, right, bottom, width, height };
      };
      const panel = document.getElementById("nearbyListContainer");
      const list = document.getElementById("nearbyList");
      return {
        header: rect(document.querySelector("header.site-header")),
        panel: rect(panel),
        list: rect(list),
        first: rect(list.children[0]),
        second: rect(list.children[1]),
        gridDisplay: getComputedStyle(list).display,
        scrollable: list.scrollHeight > list.clientHeight,
        hiddenDisplays: ["leftPeopleList","leftNatureList","leftRoutesList","leftBadgesList"]
          .map(id => getComputedStyle(document.getElementById(id)).display)
      };
    });
    assert.ok(state.panel.x >= (width <= 600 ? 9 : 15), "map margin left at " + width);
    assert.ok(state.panel.right <= width - (width <= 600 ? 9 : 15), "map margin right at " + width);
    assert.ok(Math.abs(state.panel.y - (state.header.bottom + 12)) <= 2,
      "Explore sits directly under header at " + width);
    assert.ok(state.panel.bottom <= height - (width <= 520 ? 70 : 88),
      "footer clearance at " + width);
    assert.ok(state.panel.height > (height - 146) * 0.74, "near-full-height Explore at " + width);
    assert.equal(state.gridDisplay, "grid", "places use CSS grid at " + width);
    assert.ok(state.list.height > 90 && state.scrollable, "internal vertical list scroll at " + width);
    assert.ok(state.first.width > 140 && state.first.height >= 145, "large cards at " + width);
    assert.ok(state.first.x >= state.list.x - 1 && state.first.right <= state.list.right + 1,
      "cards stay inside panel at " + width);
    assert.ok(state.hiddenDisplays.every(value => value === "none"), "inactive tabs stay hidden at " + width);
    if (width >= 390) {
      assert.ok(state.second.x > state.first.x, "multiple card columns at " + width);
    }

    for (const id of ["leftPeopleList","leftNatureList","leftRoutesList","leftBadgesList"]) {
      const displays = await page.evaluate(selected => {
        for (const item of document.querySelectorAll("#nearbyListContainer .nearby-strip")) {
          item.hidden = item.id !== selected;
        }
        return [...document.querySelectorAll("#nearbyListContainer .nearby-strip")]
          .map(node => [node.id, getComputedStyle(node).display]);
      }, id);
      assert.equal(displays.find(([item]) => item === id)[1], "grid", id + " grid at " + width);
      assert.ok(displays.filter(([item]) => item !== id).every(([, display]) => display === "none"),
        "other modes hidden with " + id + " at " + width);
    }

    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#nearbyExploreToggle").getAttribute("aria-expanded"), "false");
    assert.equal(await page.locator("#nearbyListContainer").evaluate(node => getComputedStyle(node).display), "none");
    await page.close();
    console.log("Nearby layout OK at " + width + "x" + height);
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
