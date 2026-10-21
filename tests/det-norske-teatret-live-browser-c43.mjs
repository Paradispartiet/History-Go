import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { chromium, request } from "playwright";

// C43 checks the ACTUAL publicly deployed GitHub Pages application and bytes,
// not the local fixture used by C42. A failing run is a deploy/UI blocker.
// No data is written to the public app and no external image is copied.
const base = "https://paradispartiet.github.io/History-Go/";
const placePath = "data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json";
const localPlace = JSON.parse(fs.readFileSync(placePath, "utf8"));
const c41 = JSON.parse(fs.readFileSync("reports/place-production/det-norske-teatret/20261020/object-photo-inline-source-c41.json", "utf8"));
const expectedFile = c41.museum_image.file;
const expectedSha256 = c41.museum_image.sha256;
const output = path.resolve("artifacts/dnt-c43");
fs.mkdirSync(output, { recursive: true });
const report = { schema: "dnt_c43_deployed_browser_check_v1", site: base,
  place_id: "det_norske_teatret", outcome: "NOT_YET_VERIFIED",
  checked: [], blocked: [], screenshots: [], source_only: true,
  note: "Deployed Chromium test on GitHub runner; not a physical Android/iOS device or a complete map-to-PlaceCard user journey." };
const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
let browser;
let api;
try {
  api = await request.newContext({ timeout: 30000, ignoreHTTPSErrors: false });
  const get = async (relative, kind) => {
    const response = await api.get(new URL(relative, base).href, { maxRedirects: 3 });
    assert.equal(response.status(), 200, kind + " deployment HTTP status " + response.status());
    const bytes = await response.body();
    assert.ok(bytes.length, kind + " must not be empty");
    report.checked.push({ kind, url: response.url(), status: 200, length: bytes.length });
    return bytes;
  };
  const html = (await get("index.html", "app-html")).toString("utf8");
  assert.match(html, /History Go/i);
  const js = (await get("js/ui/place-popup-tabs.js", "popup-tabs-script")).toString("utf8");
  assert.match(js, /hg-place-source-photo-grid/, "C41 source photos must exist in actually deployed JS");
  const css = (await get("css/place-popup-tabs.css", "popup-tabs-css")).toString("utf8");
  assert.match(css, /hg-place-source-photo img/);
  const deployedPlace = JSON.parse((await get(placePath, "canonical-place-data")).toString("utf8"));
  assert.equal(deployedPlace.id, localPlace.id);
  assert.equal(deployedPlace.frontImage, localPlace.frontImage);
  const costume = deployedPlace.externalLinks.find(link => link.previewImage === expectedFile);
  assert.ok(costume, "live Place JSON must expose the licensed C41 museum image");
  assert.equal(costume.credit, c41.museum_image.credit);
  assert.equal(costume.license, "CC BY-SA 4.0");
  assert.ok(deployedPlace.externalLinks.some(x => x.url?.includes("Hulda-bunaden_OHA-9.jpg")),
    "original Juleroser photograph must remain a link");
  const museum = await get(expectedFile, "madame-de-sade-800-webp");
  assert.equal(sha256(museum), expectedSha256, "deployed museum image byte hash must equal reviewed asset");
  const front = await get(deployedPlace.frontImage, "2013-facade-900x1350");
  assert.equal(sha256(front), localPlace.frontImageMeta.assetSha256, "facade SHA-256 must match canonical provenance");
  report.checked.push({ kind: "deployed-provenance", objects_published: 0, museum_sha256: sha256(museum), facade_sha256: sha256(front) });

  browser = await chromium.launch({ headless: true });
  for (const [device, width, height] of [["mobile", 390, 844], ["desktop", 1280, 900]]) {
    const context = await browser.newContext({
      viewport: { width, height }, locale: "nb-NO", serviceWorkers: "block", permissions: []
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", err => errors.push(err.message));
    try {
      const response = await page.goto(base + "index.html?dnt-c43-live-qa=20261021", { waitUntil: "domcontentloaded", timeout: 60000 });
      assert.equal(response?.status(), 200, "live app index request must load");
      await page.waitForFunction(() => typeof window.showPlacePopup === "function"
        && !!window.showPlacePopup.__hgPlacePopupTabs, null, { timeout: 60000 });
      // Trigger the REAL shipped popup from the REAL deployed page and deployed
      // canonical Place data. Bypasses map-location selection only, not UI code.
      await page.evaluate(async p => { await window.showPlacePopup(p); }, deployedPlace);
      const tab = page.locator('.hg-popup.place-popup-v2 [data-place-tab="sources"]').last();
      await tab.waitFor({ state: "visible", timeout: 30000 });
      await tab.click({ timeout: 12000 });
      const panel = page.locator('.hg-popup.place-popup-v2 [data-place-panel="sources"]').last();
      assert.equal(await panel.isVisible(), true);
      const image = panel.locator(".hg-place-source-photo img");
      assert.equal(await image.count(), 1);
      await image.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const image = document.querySelector('.hg-popup.place-popup-v2 [data-place-panel="sources"] .hg-place-source-photo img');
        return image?.complete && image.naturalWidth === 800 && image.naturalHeight === 800;
      }, null, { timeout: 20000 });
      assert.equal(await image.getAttribute("src"), expectedFile);
      const caption = panel.locator(".hg-place-source-photo figcaption");
      await caption.scrollIntoViewIfNeeded();
      assert.match(await caption.innerText(), /Lone Lunde.*Oslo Museum/);
      assert.match(await caption.innerText(), /CC BY-SA 4\.0/);
      const sourceLink = caption.locator("a");
      assert.equal(await sourceLink.getAttribute("href"), c41.museum_image.source);
      assert.equal(await sourceLink.isVisible(), true);
      const publisherLink = panel.locator('a[href*="Hulda-bunaden_OHA-9.jpg"]');
      assert.equal(await publisherLink.count(), 1);
      assert.equal(await panel.locator('img[src*="detnorsketeatret.imgix.net"]').count(), 0);
      const bounds = await page.evaluate(() => {
        const img = document.querySelector('.hg-popup.place-popup-v2 [data-place-panel="sources"] .hg-place-source-photo img');
        const box = img.getBoundingClientRect();
        return { left: box.left, right: box.right, fit: getComputedStyle(img).objectFit };
      });
      assert.equal(bounds.fit, "contain");
      assert.ok(bounds.left >= -1 && bounds.right <= width + 1, "live image must fit viewport: " + JSON.stringify(bounds));
      const screenshot = path.join(output, device + "-live.png");
      await page.screenshot({ path: screenshot, fullPage: true });
      report.screenshots.push(screenshot);
      report.checked.push({kind: "deployed-app-popup", device, width, height,
        source_image_decoded: true, source_credit_visible: true, gallery_fit: bounds.fit,
        unrelated_pageerrors: errors.slice(0, 8) });
      console.log("C43 deployed " + device + ": visible museum source photo, credit and publisher link PASS");
    } catch (err) {
      const screenshot = path.join(output, device + "-failure.png");
      await page.screenshot({ path: screenshot, fullPage: true, timeout: 7000 }).catch(() => {});
      report.screenshots.push(screenshot);
      report.blocked.push({device, failure: String(err), pageerrors: errors.slice(0, 12)});
      throw err;
    } finally { await context.close(); }
  }
  report.outcome = "LIVE_CHROMIUM_SOURCE_TAB_PASS_NOT_PHYSICAL_DEVICE_SIGNOFF";
} catch (error) {
  report.outcome = "BLOCKED_REQUIRES_FOLLOW_UP";
  report.blocked.push({ failure: String(error) });
  console.error("C43 deployed check FAILED: " + error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await api?.dispose();
  fs.writeFileSync(path.join(output, "result.json"), JSON.stringify(report, null, 2) + "\n");
  console.log("C43 outcome: " + report.outcome);
}
