import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "index.html"), "utf8");
const headerStart = source.indexOf('<header class="site-header">');
const headerEnd = source.indexOf("</header>", headerStart);
assert.ok(headerStart >= 0 && headerEnd > headerStart, "Canonical app header exists");
assert.equal((source.match(/id="languageSelect"/g) || []).length, 1,
  "Exactly one language select must exist in the app");
const headerMarkup = source.slice(headerStart, headerEnd + "</header>".length);

const fixture = [
  '<!doctype html><html lang="nb"><head><meta charset="utf-8"><base href="/">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  '<link rel="stylesheet" href="/css/theme.css">',
  '<link rel="stylesheet" href="/css/base.css">',
  '<link rel="stylesheet" href="/css/layout.css">',
  '<link rel="stylesheet" href="/css/miniProfile.css">',
  '<link rel="stylesheet" href="/css/nearby.css">',
  '</head><body class="hg-app">',
  headerMarkup,
  '<script src="/js/i18n.js"></script>',
  '<script src="/js/ui/header-menu.js"></script>',
  '</body></html>'
].join("\n");

const files = new Set([
  "/css/theme.css", "/css/base.css", "/css/layout.css",
  "/css/miniProfile.css", "/css/nearby.css",
  "/css/lesespor.css", "/css/header-learning-menu.css",
  "/js/i18n.js", "/js/ui/header-menu.js"
]);
const translations = {
  "ui.attr.language": "Språk",
  "ui.language.label": "Språk"
};
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  if (pathname === "/__audit__/header-language.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fixture);
    return;
  }
  if (pathname.startsWith("/data/i18n/")) {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(translations));
    return;
  }
  if (files.has(pathname)) {
    response.writeHead(200, { "content-type": pathname.endsWith(".css")
      ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8" });
    response.end(fs.readFileSync(path.join(root, pathname.slice(1))));
    return;
  }
  response.writeHead(404);
  response.end("not found");
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const { port } = server.address();
  for (const [width, height] of [[320, 700], [390, 844], [768, 1024], [1024, 900]]) {
    const page = await browser.newPage({ viewport: { width, height }, locale: "nb-NO" });
    await page.goto(`http://127.0.0.1:${port}/__audit__/header-language.html`, { waitUntil: "load" });
    await page.waitForFunction(() =>
      document.getElementById("languageSelect")?.dataset.hgI18nBound === "1");

    assert.equal(await page.locator("#languageSelect").count(), 1);
    assert.equal(await page.locator(".site-header > .top-actions > #languageSelect").count(), 0,
      "Language flag no longer occupies top header row");
    assert.equal(await page.locator("#headerMenuPanel .header-menu-heading-tools > #languageSelect").count(), 1,
      "Flag is beside menu heading");
    assert.equal(await page.locator("#headerMenuPanel").getAttribute("hidden"), "",
      "Quick menu starts closed");

    await page.locator("#headerMenuButton").click();
    const geometry = await page.evaluate(() => {
      const bounds = selector => {
        const { x, y, right, bottom, width, height } =
          document.querySelector(selector).getBoundingClientRect();
        return { x, y, right, bottom, width, height };
      };
      return {
        title: bounds(".header-menu-intro strong"),
        flag: bounds("#languageSelect"),
        panel: bounds("#headerMenuPanel"),
        overflow: document.documentElement.scrollWidth > innerWidth + 1
      };
    });
    assert.ok(geometry.flag.x >= geometry.title.right + 3,
      `Language flag must be immediately to right of Hurtigmeny at ${width}px`);
    assert.ok(Math.abs(
      geometry.flag.y + geometry.flag.height / 2 -
      (geometry.title.y + geometry.title.height / 2)
    ) <= 3, `Title and language select center vertically at ${width}px`);
    assert.ok(geometry.flag.right <= geometry.panel.right - 4
      && geometry.flag.bottom <= geometry.panel.bottom - 4,
    `Flag inside menu panel at ${width}px`);
    assert.equal(geometry.overflow, false, `No horizontal overflow at ${width}px`);

    await page.locator("#languageSelect").selectOption("en");
    await page.waitForFunction(() => document.documentElement.lang === "en");
    assert.equal(await page.locator("#languageSelect").inputValue(), "en");
    assert.equal(await page.evaluate(() => localStorage.getItem("hg_lang")), "en");
    assert.equal(await page.locator("#headerMenuPanel").isVisible(), true,
      "Language change does not close the menu");

    await page.locator("#languageSelect").selectOption("nb");
    await page.waitForFunction(() => document.documentElement.lang === "nb");
    assert.equal(await page.evaluate(() => localStorage.getItem("hg_lang")), "nb");

    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#headerMenuPanel").isVisible(), false);
    console.log(`Hurtigmeny flag and language switching OK at ${width}x${height}`);
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
