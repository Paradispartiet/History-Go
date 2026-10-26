import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

// C42 is a real Chromium layout/asset test, not a JSDOM render assertion.
// It exercises shipping popup-tab JavaScript and CSS with the canonical Place
// and actual checked-in WebP bytes. This is NOT a deployed-device signoff.
const root = process.cwd();
const place = JSON.parse(fs.readFileSync("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json", "utf8"));
const report = JSON.parse(fs.readFileSync("reports/place-production/det-norske-teatret/20261020/object-photo-inline-source-c41.json", "utf8"));
const c47 = JSON.parse(fs.readFileSync("reports/place-production/det-norske-teatret/20261021/foyer-painting-kilder-c47.json","utf8"));
const stagedImage = place.externalLinks.find(link => link.previewImage);
assert.equal(stagedImage?.previewImage, report.museum_image.file);
assert.ok(place.frontImage?.endsWith(".webp"));
assert.ok(fs.existsSync(place.frontImage));
assert.ok(fs.existsSync(stagedImage.previewImage));

const serializedPlace = JSON.stringify(place).replaceAll("<", "\\u003c");
const fixture = [
  '<!doctype html><html lang="nb"><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<link rel="stylesheet" href="/History-Go/css/place-popup-v2.css">',
  '<link rel="stylesheet" href="/History-Go/css/place-popup-tabs.css">',
  '<style>html{box-sizing:border-box}*,*::before,*::after{box-sizing:inherit}',
  'body{margin:0;background:#050a11;color:#fff;font:14px/1.5 Arial,sans-serif}',
  '.hg-popup.place-popup-v2{position:relative!important;inset:auto!important;display:block!important;min-height:100vh}',
  '.hg-popup.place-popup-v2 .hg-popup-inner{position:relative;margin:0 auto}',
  '#c42FrontImage{display:block;width:auto;max-width:100%;height:280px;object-fit:contain;margin:auto}',
  '</style></head><body class="hg-app">',
  '<div class="hg-popup place-popup-v2"><div class="hg-popup-inner">',
  '<article class="hg-place-popup-v2"><header class="hg-place-popup-header">',
  '<h1 class="hg-modal-title">Det Norske Teatret</h1></header>',
  '<div class="hg-place-popup-body"><div class="hg-place-hero">',
  '<div class="hg-place-hero-media" style="display:grid;place-items:center">',
  '<img id="c42FrontImage" src="' + place.frontImage + '" alt="Det Norske Teatret, fasade 2013">',
  '</div></div></div></article></div></div>',
  '<script>window.C42_PLACE=' + serializedPlace + ';',
  'window.showPlacePopup=function(place){window.__openedPlace=place;return true;};',
  'window.showPlacePopup.__hgPlacePopupV2=true;',
  'window.LEKSIKON_BY_PLACE={det_norske_teatret:[]};',
  'window.HGStories={byPlace:{det_norske_teatret:[]}};',
  'window.LESESPOR=[];window.HG_PLACE_OPEN_LANGUAGE={det_norske_teatret:null};',
  '</script>',
  '<script src="/History-Go/js/ui/place-popup-tabs.js"></script>',
  '<script>document.addEventListener("DOMContentLoaded",()=>{window.showPlacePopup(window.C42_PLACE);});</script>',
  '</body></html>'
].join("");

const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".webp": "image/webp", ".jpg": "image/jpeg" };
const prefix = "/History-Go/";
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname === prefix + "__c42__.html") {
    res.writeHead(200, { "content-type": mime[".html"] });
    res.end(fixture);
    return;
  }
  if (!pathname.startsWith(prefix)) { res.writeHead(404); res.end("Not found"); return; }
  const relativePath = pathname.slice(prefix.length);
  const file = path.resolve(root, relativePath);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end("Not found"); return;
  }
  res.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream" });
  res.end(fs.readFileSync(file));
});

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port + prefix + "__c42__.html";
const outputDir = "artifacts/dnt-c42";
fs.mkdirSync(outputDir, { recursive: true });
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const [device, width, height] of [["mobile", 390, 844], ["desktop", 1280, 900], ["small-mobile", 320, 700]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    const assetFailures = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => {
      if (response.status() >= 400 && /\/(?:bilder|js\/ui|css)\//.test(response.url())) {
        assetFailures.push(response.status() + " " + response.url());
      }
    });
    try {
      await page.goto(base, { waitUntil: "load" });
      const sourcesTab = page.locator('[data-place-tab="sources"]');
      await sourcesTab.waitFor({ state: "visible" });
      await sourcesTab.click();
      const panel = page.locator('[data-place-panel="sources"]');
      assert.equal(await panel.isVisible(), true, "Kilder must open at " + width);
      const photo = panel.locator(".hg-place-source-photo img");
      assert.equal(await photo.count(), 2, "C47 includes two documentary source photos, no canonical Objects");
      assert.equal(await photo.first().getAttribute("src"), report.museum_image.file);
      await photo.first().scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const img = document.querySelector('.hg-place-source-photo img');
        return img?.complete && img.naturalWidth === 800 && img.naturalHeight === 800;
      }, null, { timeout: 15000 });
      await page.waitForFunction(() => {
        const img = document.getElementById("c42FrontImage");
        return img?.complete && img.naturalWidth === 900 && img.naturalHeight === 1350;
      }, null, { timeout: 15000 });
      assert.match(await panel.innerText(), /Lone Lunde.*Oslo Museum/);
      assert.match(await panel.innerText(), /CC BY-SA 4\.0/);
      assert.match(await panel.innerText(), /ikke en ferdig Objects-samling/);
      assert.match(await photo.first().getAttribute("alt"), /Madame de Sade/);
      const painting=photo.nth(1);
      await painting.scrollIntoViewIfNeeded();
      await page.waitForFunction(asset=>{
        const img=document.querySelectorAll(".hg-place-source-photo img")[1];
        return img?.getAttribute("src")===asset && img.complete &&
          img.naturalWidth===800 && img.naturalHeight===800;
      },c47.new_photo.asset,{timeout:15000});
      assert.equal(await painting.getAttribute("src"),c47.new_photo.asset);
      assert.match(await painting.getAttribute("alt"),/Johannessen/);
      assert.equal(await painting.evaluate(el=>getComputedStyle(el).objectFit),"contain");
      const paintingBox=await painting.boundingBox();
      assert.ok(paintingBox && paintingBox.x>=-1 && paintingBox.x+paintingBox.width<=width+1,
        "C47 painting should fit mobile/desktop width");
      const paintingCaption=panel.locator(".hg-place-source-photo figcaption").nth(1);
      assert.match(await paintingCaption.innerText(),/Wolfmann.*Wikimedia Commons/);
      assert.match(await paintingCaption.innerText(),/CC BY-SA 4\.0/);
      assert.equal(await paintingCaption.locator("a").getAttribute("href"),c47.new_photo.source);
      const sourceLink = panel.locator('.hg-place-source-photo a').first();
      assert.equal(await sourceLink.getAttribute("href"), report.museum_image.source);
      assert.equal(await sourceLink.getAttribute("target"), "_blank");
      assert.match(await sourceLink.getAttribute("rel"), /noopener noreferrer/);
      const juleroser = panel.locator('a[href*="Hulda-bunaden_OHA-9.jpg"]');
      assert.equal(await juleroser.count(), 1, "external Juleroser image must remain a link");
      assert.equal(await panel.locator('img[src*="detnorsketeatret.imgix.net"]').count(), 0);
      const geometry = await page.evaluate(() => {
        const image = document.querySelector(".hg-place-source-photo img");
        const card = document.querySelector(".hg-place-source-photo");
        const grid = document.querySelector(".hg-place-source-photo-grid");
        const imageRect = image.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        return { cardLeft: cardRect.left, cardRight: cardRect.right,
          imageWidth: imageRect.width, cardWidth: cardRect.width,
          gridDisplay: getComputedStyle(grid).display,
          fit: getComputedStyle(image).objectFit };
      });
      assert.equal(geometry.gridDisplay, "grid");
      assert.equal(geometry.fit, "contain", "do not crop the physical garment");
      assert.ok(geometry.imageWidth > 0 && geometry.imageWidth <= geometry.cardWidth + 1);
      assert.ok(geometry.cardLeft >= -1 && geometry.cardRight <= width + 1,
        "source photo must fit viewport at " + width + ": " + JSON.stringify(geometry));
      // Keep screenshots both above and below the scroll fold. A DOM-only
      // assertion on the credit would miss an unreachable/cut-off caption.
      await page.screenshot({ path: path.join(outputDir, device + "-photo.png"), fullPage: true });
      const caption = panel.locator(".hg-place-source-photo figcaption").first();
      await caption.scrollIntoViewIfNeeded();
      assert.equal(await caption.isVisible(), true, "source caption must be visible after scroll");
      const captionBox = await caption.boundingBox();
      assert.ok(captionBox && captionBox.y >= -1 && captionBox.y + captionBox.height <= height + 1,
        "source credit/citation must be in the visible viewport at " + width);
      assert.equal(await sourceLink.isVisible(), true, "original-source link must be reachable");
      assert.match(await caption.innerText(), /Lone Lunde.*Oslo Museum/);
      await page.screenshot({ path: path.join(outputDir, device + "-credit.png"), fullPage: true });
      assert.deepEqual(assetFailures, [], "asset HTTP failures at " + width);
      assert.deepEqual(errors, [], "browser JS errors at " + width);
      console.log("C42 " + device + " " + width + "px: museum and facade WebP decoded, Sources usable, attribution and geometry OK");
    } finally {
      await page.screenshot({ path: path.join(outputDir, device + ".png"), fullPage: true }).catch(() => {});
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
