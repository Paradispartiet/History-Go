import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const start = html.indexOf('<footer class="site-footer app-footer"');
const end = html.indexOf("</footer>", start);
assert.ok(start >= 0 && end > start, "Canonical footer markup exists");
const footerMarkup = html.slice(start, end + "</footer>".length);

const fixture = [
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  '<link rel="stylesheet" href="/css/base.css">',
  '<link rel="stylesheet" href="/css/layout.css">',
  '<link rel="stylesheet" href="/css/footer.css">',
  '</head><body class="hg-app">',
  '<div id="mapLayer"></div><div class="app-shell"></div>',
  footerMarkup,
  '<script src="/js/core/viewportManager.js"></script>',
  '<script>window.ViewportManager.init();</script>',
  '</body></html>'
].join("\n");

const allowed = new Set([
  "/css/base.css", "/css/layout.css", "/css/footer.css",
  "/js/core/viewportManager.js"
]);
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  if (pathname === "/__audit__/footer.html") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(fixture);
  } else if (allowed.has(pathname)) {
    res.writeHead(200, { "content-type": pathname.endsWith(".css")
      ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8" });
    res.end(fs.readFileSync(path.join(root, pathname.slice(1))));
  } else {
    res.writeHead(404); res.end("not found");
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const { port } = server.address();
  for (const [width, height] of [[320, 700], [390, 844], [768, 1024]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`http://127.0.0.1:${port}/__audit__/footer.html`, { waitUntil: "load" });

    // The collapsed place thumbnail must not create a taller second row.
    await page.locator("#pcMini").evaluate(el => { el.style.display = "block"; });
    const actual = await page.evaluate(() => {
      const footer = document.querySelector(".app-footer");
      const mini = document.querySelector("#pcMini");
      const actions = document.querySelector(".app-actions");
      const buttons = [...actions.querySelectorAll("button")];
      const rect = el => {
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, height: r.height };
      };
      return {
        phone: document.body.classList.contains("hg-phone"),
        footer: rect(footer),
        mini: rect(mini),
        buttons: buttons.map(rect),
        navHeight: getComputedStyle(footer).height,
        safeBottom: parseFloat(getComputedStyle(footer).paddingBottom) - (innerWidth <= 520 ? 6 : 7),
        actionsScroll: { scrollWidth: actions.scrollWidth, clientWidth: actions.clientWidth },
        viewportFooter: window.HGViewport?.footerHeight,
      };
    });

    const isPhone = width <= 520;
    assert.equal(actual.phone, isPhone, `mode at ${width}`);
    assert.equal(actual.viewportFooter, isPhone ? 60 : 72, `runtime footer at ${width}`);
    assert.ok(Math.abs(actual.footer.bottom - height) < 1, `footer anchored at ${width}`);
    assert.ok(Math.abs(actual.footer.height - ((isPhone ? 60 : 72) + actual.safeBottom)) < 1.5,
      `no unused extra footer height at ${width}`);
    assert.ok(actual.buttons.every(b => Math.abs(b.top - actual.buttons[0].top) < 1),
      `footer buttons stay on one row at ${width}`);
    assert.ok(actual.mini.height <= (isPhone ? 48 : 56), `mini fits row at ${width}`);
    assert.ok(actual.actionsScroll.scrollWidth >= actual.actionsScroll.clientWidth,
      `actions are horizontally scrollable at ${width}`);

    await page.close();
    console.log(`Mobile footer layout OK at ${width}x${height}`);
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
