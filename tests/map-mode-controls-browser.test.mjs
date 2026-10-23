import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

// This fixture loads the production CSS in production order. It reproduces a
// hidden header/footer and an asynchronously re-opened, empty PlaceCard — the
// two visual symptoms reported from Android map mode.
const root = process.cwd();
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="/css/theme.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/map.css">
  <link rel="stylesheet" href="/css/placeCard.css">
</head><body class="hg-app hg-phone mode-map">
  <div id="mapLayer" style="background:#d3e7d0"></div>
  <header class="site-header" style="display:none"></header>
  <div id="nearbyListContainer" style="display:flex"></div>
  <div id="placeCard" style="display:flex" aria-hidden="true"></div>
  <div class="map-controls" style="bottom:130px">
    <div class="hg-map-style-toggle">
      <button class="hg-map-style-btn is-active">Kart</button>
      <button class="hg-map-style-btn">Detaljert</button>
    </div>
    <div class="hg-map-utility-row"><button class="hg-map-utility-btn">×</button></div>
    <div class="hg-map-category-filter"><button class="hg-map-category-trigger">Alle</button></div>
  </div>
</body></html>`;
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  if (pathname === "/test") {
    res.writeHead(200, { "content-type": "text/html" }); res.end(html); return;
  }
  if (!["/css/theme.css", "/css/layout.css", "/css/map.css", "/css/placeCard.css"].includes(pathname)) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { "content-type": "text/css" });
  res.end(fs.readFileSync(path.join(root, pathname.slice(1))));
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const addr = server.address();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const [width, height] of [[360, 780], [390, 844], [691, 1450]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${addr.port}/test`);
    const measured = await page.evaluate(() => {
      const dock = document.querySelector(".map-controls");
      const rect = dock.getBoundingClientRect();
      return {
        bottomGap: window.innerHeight - rect.bottom,
        top: rect.top,
        height: rect.height,
        placeCard: getComputedStyle(document.querySelector("#placeCard")).display,
        nearby: getComputedStyle(document.querySelector("#nearbyListContainer")).display,
        dockBackground: getComputedStyle(document.querySelector(".hg-map-style-toggle")).backgroundColor,
        bodyMode: document.body.classList.contains("mode-map")
      };
    });
    assert.equal(measured.bodyMode, true);
    assert.equal(measured.placeCard, "none", `ghost PlaceCard visible at ${width}px`);
    assert.equal(measured.nearby, "none", `legacy drawer visible at ${width}px`);
    assert.ok(measured.bottomGap >= 0 && measured.bottomGap <= 35,
      `map controls must be at visual bottom: ${JSON.stringify(measured)}`);
    assert.ok(measured.top > height * 0.7, "dock must not float in upper map");
    assert.equal(measured.dockBackground, "rgb(5, 5, 5)");
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
