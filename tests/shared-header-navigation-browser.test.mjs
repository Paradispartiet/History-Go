import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { chromium } from "playwright";

const root = process.cwd();
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const file = path.resolve(root, "." + pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404); response.end("Not found"); return;
  }
  response.setHeader("content-type", types[path.extname(file)] || "application/octet-stream");
  response.end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port;
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem("hg_onboarding_shown_v1", "1"));

    for (const [pathname, label, destination] of [
      ["profile.html", "Til kartet", "/index.html"],
      ["knowledge.html", "Til min samling", "/profile.html"],
      ["sprakatlas.html", "Til kartet", "/index.html"]
    ]) {
      await page.goto(base + "/" + pathname, { waitUntil: "domcontentloaded", timeout: 30000 });
      const back = page.locator(".hg-universal-back").first();
      await back.waitFor({ state: "visible", timeout: 12000 });
      assert.equal((await back.textContent()).trim(), "←", pathname + ": arrow only");
      assert.equal(await back.getAttribute("aria-label"), "Tilbake til " + label.replace(/^Til /, ""), pathname + ": accessible destination");
      const href = await back.getAttribute("href");
      assert.ok(href && new URL(href, base).pathname === destination, pathname + ": safe return URL");
      const rect = await back.boundingBox();
      assert.ok(rect && rect.x >= 0 && rect.x + rect.width <= width + 1, pathname + ": within " + width + "px viewport");
    }

    await page.goto(base + "/index.html#/map", { waitUntil: "domcontentloaded", timeout: 30000 });
    // The full map depends on external tiles/CDNs, deliberately blocked in this
    // isolated navigation check. Mark its shell ready so the startup gate does
    // not block the real pointer interaction under test.
    await page.evaluate(() => {
      document.body.classList.remove("hg-load-failed");
      document.body.classList.add("hg-loaded");
      location.hash = "#/place/navigation-test";
    });
    const placeBack = page.locator(".hg-universal-back").first();
    await placeBack.waitFor({ state: "visible", timeout: 12000 });
    assert.equal((await placeBack.textContent()).trim(), "←", "map back link shows only the arrow");
    assert.equal(await placeBack.getAttribute("aria-label"), "Tilbake til kartet");
    const logo = page.locator("header.site-header > .hg-brand");
    await logo.waitFor({ state: "visible", timeout: 12000 });
    const logoRect = await logo.boundingBox();
    const backRect = await placeBack.boundingBox();
    const actionsRect = await page.locator("header.site-header .top-actions").boundingBox();
    assert.ok(logoRect && backRect && actionsRect, "header elements are measurable");
    assert.ok(backRect.x >= logoRect.x + logoRect.width, width + "px: back arrow does not cover the logo");
    assert.ok(backRect.x + backRect.width <= actionsRect.x + 1, width + "px: back arrow leaves room for header tools");
    await placeBack.click();
    await page.waitForFunction(() => location.hash === "#/map");
    await context.close();
    console.log("Shared header browser navigation ok at " + width + "px");
  }
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
