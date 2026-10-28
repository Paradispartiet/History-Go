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
      ["sprakatlas.html", "Til kartet", "/index.html"],
      ["finn-fauna.html", "Til kartet", "/index.html"],
      ["finn-flora.html", "Til kartet", "/index.html"]
    ]) {
      await page.goto(base + "/" + pathname, { waitUntil: "domcontentloaded", timeout: 30000 });
      const back = page.locator(".hg-universal-back").first();
      await back.waitFor({ state: "visible", timeout: 12000 });
      const home = page.locator(".hg-universal-home").first();
      await home.waitFor({ state: "visible", timeout: 12000 });
      assert.equal(await home.getAttribute("aria-label"), "History GO – hjem til kartet");
      assert.equal(new URL(await home.getAttribute("href"), base).hash, "#/map");
      assert.equal(new URL(await home.locator("img").getAttribute("src"), base).pathname, "/bilder/logo_historygo.PNG");
      assert.equal((await back.textContent()).trim(), "←", pathname + ": arrow only");
      assert.equal(await back.getAttribute("aria-label"), "Tilbake til " + label.replace(/^Til /, ""), pathname + ": accessible destination");
      const href = await back.getAttribute("href");
      assert.ok(href && new URL(href, base).pathname === destination, pathname + ": safe return URL");
      const rect = await back.boundingBox();
      assert.ok(rect && rect.x >= 0 && rect.x + rect.width <= width + 1, pathname + ": within " + width + "px viewport");
      if (pathname.startsWith("finn-")) {
        assert.equal((await back.textContent()).trim(), "←", pathname + ": icon-only back arrow");
        const brand = page.locator(".ne-header .ne-brand img");
        await brand.waitFor({ state: "visible" });
        const logoRect = await brand.boundingBox();
        const logoHref = await page.locator(".ne-brand").getAttribute("href");
        assert.equal(new URL(logoHref, base).hash, "#/map", pathname + ": logo opens History Go map");
        assert.ok(logoRect?.width >= 78, pathname + ": enlarged logo");
        const menuRect = await page.locator("#natureMenuToggle").boundingBox();
        assert.ok(logoRect && menuRect && rect, pathname + ": header parts rendered");
        assert.ok(rect.x + rect.width <= logoRect.x + 1, pathname + ": arrow and logo do not overlap");
        assert.ok(logoRect.x + logoRect.width <= menuRect.x + 1, pathname + ": logo and menu do not overlap");
        assert.equal(await page.locator("#natureBack").count(), 1, pathname + ": only one back link");
      }
    }

    await page.goto(base + "/index.html#/map", { waitUntil: "domcontentloaded", timeout: 30000 });
    assert.equal(await page.locator("header.site-header > .hg-universal-home").count(), 0,
      "index map must not display a small secondary History GO logo");
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
    assert.equal(await page.locator("header.site-header > .hg-universal-home").count(), 0,
      "index place view must not show small map-home logo");
    assert.equal((await placeBack.textContent()).trim(), "←", "map back link shows only the arrow");
    assert.equal(await placeBack.getAttribute("aria-label"), "Tilbake til kartet");
    const logo = page.locator("header.site-header > .hg-brand");
    await logo.waitFor({ state: "visible", timeout: 12000 });
    assert.equal(await logo.evaluate((el) => el.tagName), "BUTTON", "home logo is a real button");
    assert.equal(await logo.getAttribute("aria-label"), "Åpne History Go-startsiden");
    assert.equal(await page.locator("#btnStartMenu").count(), 0, "the old Hurtigmeny shortcut is absent");
    const logoRect = await logo.boundingBox();
    assert.ok(logoRect && logoRect.width >= (width <= 860 ? 84 : 105), "HG logo is nearly twice its former size at " + width + "px");
    const headerRect = await page.locator("header.site-header").boundingBox();
    assert.ok(headerRect && logoRect.y >= headerRect.y - 1,
      "HG logo stays within the top edge of the header at " + width + "px");
    const backRect = await placeBack.boundingBox();
    const exploreRect = await page.locator("header.site-header #nearbyExploreToggle").boundingBox();
    assert.ok(logoRect && backRect && exploreRect, "header elements are measurable");
    assert.ok(backRect.x >= logoRect.x + logoRect.width - 1, width + "px: back arrow does not cover the logo, " + JSON.stringify({ logoRect, backRect }));
    assert.ok(backRect.x + backRect.width <= exploreRect.x + 1,
      width + "px: back arrow does not cover Utforsk without a redundant small home logo");
    // Use the genuine welcome module even with external map dependencies blocked.
    if (!(await page.evaluate(() => Boolean(window.HGOnboarding?.open)))) {
      await page.addScriptTag({ path: "js/ui/onboarding-welcome.js" });
    }
    await logo.click();
    await page.locator("#hgOnboardingModal[aria-hidden='false']").waitFor({ state: "visible" });
    assert.equal(new URL(page.url()).hash, "#/place/navigation-test", "logo opens welcome without losing current place route");
    await page.locator(".hg-onb-close").click();
    await placeBack.click();
    await page.waitForFunction(() => location.hash === "#/map");
    assert.equal(await page.locator("header.site-header > .hg-universal-home").count(), 0,
      "index map still has no secondary logo after return");
    await context.close();
    console.log("Shared header browser navigation ok at " + width + "px");
  }
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
