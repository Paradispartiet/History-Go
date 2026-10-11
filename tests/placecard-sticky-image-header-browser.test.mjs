import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.match(index, /css\/place-card-sticky-header\.css/);
assert.match(index, /js\/ui\/place-card-sticky-header\.js/);
assert.ok(index.indexOf('id="pcHeaderHero"') < index.indexOf('id="pcDesc"'),
  "Canonical landscape header precedes PlaceCard content");

const files = [
  "/css/placeCard.css",
  "/css/place-popup-shortcuts.css",
  "/css/place-unified-surface.css",
  "/css/place-sheet-phase6.css",
  "/css/place-card-sticky-header.css",
  "/js/ui/place-card-sticky-header.js"
];
const fixture = `<!doctype html><html lang="nb"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/placeCard.css">
<link rel="stylesheet" href="/css/place-popup-shortcuts.css">
<link rel="stylesheet" href="/css/place-unified-surface.css">
<link rel="stylesheet" href="/css/place-sheet-phase6.css">
<link rel="stylesheet" href="/css/place-card-sticky-header.css">
<style>
html,body {margin:0;background:#101219;color:#fff;font-family:system-ui;}
#placeCard {top:12px;bottom:12px;}
#placeCard .pc-body > .scroll-fixture {flex:0 0 1800px;}
#placeCard .pc-sheet-section-nav {flex:0 0 auto;}
</style></head><body class="hg-app">
<div id="placeCard" class="is-open is-unified-place is-place-sheet-direct">
<button id="pcCollapseBtn" class="pc-collapse-btn" aria-label="Minimer">▾</button>
<div class="pc-body">
  <div class="pc-text"><div id="pcHeaderHero" class="pc-heading-hero">
    <img id="pcHeaderImage" class="pc-heading-image" alt="">
    <div class="pc-heading-content">
      <div class="pc-title-row"><h2 id="pcTitle">Vaterlandsparken</h2></div>
      <div id="pcMeta" class="pc-meta"><span>By</span></div>
      <div id="pcStatusBar" class="pc-status-bar"><button class="pc-progress-status-line">STATUS: IKKE FULLFØRT</button></div>
    </div>
  </div></div>
  <nav class="pc-sheet-section-nav"><button type="button">Om</button><button type="button">Fortellinger</button></nav>
  <p id="pcDesc">Historisk beskrivelse</p>
  <div class="scroll-fixture">Langt innhold</div>
</div></div>
<script defer src="/js/ui/place-card-sticky-header.js"></script>
</body></html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/__audit__/sticky.html") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(fixture);
    return;
  }
  if (files.includes(url.pathname)) {
    const contentType = url.pathname.endsWith(".css") ? "text/css" : "text/javascript";
    res.writeHead(200, { "content-type": contentType + "; charset=utf-8" });
    res.end(fs.readFileSync(path.join(root, url.pathname.slice(1))));
    return;
  }
  res.writeHead(404);
  res.end("not found");
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));

let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const [width, height] of [[390, 844], [768, 1024], [1280, 900]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`http://127.0.0.1:${server.address().port}/__audit__/sticky.html`);
    await page.evaluate(() => {
      if (innerWidth <= 520) document.body.classList.add("hg-phone");
      const canvas = document.createElement("canvas");
      canvas.width = 1200; canvas.height = 750;
      canvas.getContext("2d").fillStyle = "#f3f1e9";
      canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
      const image = document.querySelector("#pcHeaderImage");
      image.src = canvas.toDataURL();
      document.querySelector("#pcHeaderHero").classList.add("has-photo-source", "has-image");
    });
    await page.waitForFunction(() =>
      document.querySelector("#pcHeaderHero")?.dataset.pcContrast === "dark"
      && document.querySelector(".pc-sticky-image-header-photo")?.naturalWidth > 0
    );
    assert.equal(await page.evaluate(() => document.querySelector(".pc-sticky-image-header")?.getAttribute("aria-hidden")), "true",
      "Mirrored title must not create a second accessible heading");
    assert.equal(await page.evaluate(() => document.querySelector("#pcTitle").textContent), "Vaterlandsparken");
    assert.equal(await page.evaluate(() => document.querySelector("#pcTitle").parentElement.parentElement.querySelector("#pcStatusBar button").textContent),
      "STATUS: IKKE FULLFØRT");
    assert.equal(await page.evaluate(() => document.querySelector("#pcTitle").parentElement.parentElement.querySelector("#pcMeta span").textContent), "By");
    assert.equal(await page.evaluate(() => document.querySelector("#placeCard").classList.contains("is-sticky-image-visible")), false);

    await page.evaluate(() => document.querySelector(".pc-body").scrollTop = 300);
    await page.waitForFunction(() =>
      document.querySelector(".pc-sticky-image-header")?.dataset.pcContrast === "dark"
      && document.querySelector("#placeCard")?.classList.contains("is-sticky-image-visible")
    );
    const geometry = await page.evaluate(() => {
      const rect = (selector) => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { y: r.y, bottom: r.bottom, height: r.height };
      };
      return { card: rect("#placeCard"), sticky: rect(".pc-sticky-image-header"),
        scroller: rect(".pc-body"), nav: rect(".pc-sheet-section-nav"),
        color: getComputedStyle(document.querySelector(".pc-sticky-image-header-title")).color,
        title: document.querySelector(".pc-sticky-image-header-title").textContent,
        image: document.querySelector(".pc-sticky-image-header-photo").getAttribute("src")
      };
    });
    assert.ok(geometry.sticky.height >= 60 && geometry.sticky.height <= 90, "Compact header is only a sliver: " + JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.sticky.bottom - geometry.scroller.y) < 2,
      "Sticky photo owns separate flex height above scroller: " + JSON.stringify(geometry));
    assert.ok(geometry.nav.y >= geometry.scroller.y - 1, "Section navigation stays in scroller below photo");
    assert.equal(geometry.color, "rgb(16, 24, 32)", "Bright photo uses dark text");
    assert.equal(geometry.title, "Vaterlandsparken");
    assert.ok(geometry.image.startsWith("data:image/png"), "Compact header uses original place image");

    await page.evaluate(() => {
      document.querySelector("#pcTitle").textContent = "Nytt stedsnavn";
      const canvas = document.createElement("canvas");
      canvas.width = 1200; canvas.height = 750;
      const context = canvas.getContext("2d");
      context.fillStyle = "#101726";
      context.fillRect(0, 0, canvas.width, canvas.height);
      document.querySelector("#pcHeaderImage").src = canvas.toDataURL();
    });
    await page.waitForFunction(() => {
      const sticky = document.querySelector(".pc-sticky-image-header");
      return sticky?.dataset.pcContrast === "light"
        && sticky.querySelector(".pc-sticky-image-header-title")?.textContent === "Nytt stedsnavn";
    });
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".pc-sticky-image-header-title")).color),
      "rgb(255, 255, 255)", "Dark image uses light text");

    await page.evaluate(() => document.querySelector(".pc-body").scrollTop = 0);
    await page.waitForFunction(() => !document.querySelector("#placeCard")?.classList.contains("is-sticky-image-visible"));
    await page.close();
    console.log(`PlaceCard sticky image contrast, layout and scroll OK: ${width}x${height}`);
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
