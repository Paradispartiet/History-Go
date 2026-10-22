// Real app hydration; no mocked PlaceCard renderer or metadata.
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
const root = process.cwd();
const out = "artifacts/place-image-credits";
fs.mkdirSync(out, { recursive: true });
const ids = ["grunnlovsbygget_bankplassen","akershus_kaier","oslo_mek","grensen_kjopesenter","vippetangen_fisketorg","frysja_industriomrade","norges_varemesse","bryn_industriomrade","gronlikaia","christiania_seildugsfabrik","sagene_skole","stortorget","norges_bank_bankplassen_4","gamle_trikkestallen","gamle_radhus","grev_wedels_plass","sofienbergparken"];
const types = {".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript",
  ".json":"application/json", ".css":"text/css", ".svg":"image/svg+xml",
  ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".wasm":"application/wasm"};
const server = http.createServer((request, response) => {
  const file = path.resolve(root, "." + decodeURIComponent(new URL(request.url, "http://localhost").pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404); response.end(); return;
  }
  response.writeHead(200, {"content-type":types[path.extname(file).toLowerCase()] || "application/octet-stream"});
  fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));

let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true });
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__HG_APP_READY__ === true && window.__HG_ROUTER_STARTED__ === true, null, { timeout: 30000 });
    await page.locator("#hgOnboardingModal .hg-onb-primary").click({ timeout: 2000 }).catch(() => page.evaluate(() => window.HGOnboarding?.close?.()));
    await page.waitForTimeout(850);
    for (const id of ids) {
      const { place } = JSON.parse(fs.readFileSync(`data/runtime/place-open/${id}.json`, "utf8"));
      await page.evaluate(place => window.openPlaceCard(place), place);
      const slot = page.locator(`[data-hg-place-sheet-sources="1"][data-place-id="${id}"]`);
      await slot.locator('[data-image-credit="image"]').waitFor({ state: "visible", timeout: 15000 });
      for (const field of ["image", "frontImage"]) {
        const credit = slot.locator(`[data-image-credit="${field}"]`);
        const meta = place[`${field}Meta`];
        await credit.scrollIntoViewIfNeeded();
        assert.ok(await credit.isVisible(), `${id}: ${field} visible`);
        const text = await credit.innerText();
        for (const value of [meta.credit, meta.license, meta.transformation]) assert.ok(text.includes(value), `${id}: ${value}`);
        const original = credit.getByRole("link", { name: "Åpne originalkilde" });
        assert.equal(await original.getAttribute("href"), meta.sourcePage);
        await original.focus();
        assert.equal(await original.evaluate(el => document.activeElement === el), true);
        const bounds = await credit.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, `${id}: horizontal overflow`);
      }
      await slot.locator('.hg-place-image-credits').screenshot({ path: `${out}/${id}-${width}.png` });
      results.push({ id, width, passed: true });
      console.log("CREDITS PASS", id, width);
    }
    await page.close();
  }
  assert.equal(results.length, 34);
} finally {
  fs.writeFileSync(`${out}/report.json`, JSON.stringify({ results, scope: "Real app credit rendering, focus and width; not source-license or editorial approval" }, null, 2));
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
