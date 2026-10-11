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
  '<div id="placeCard" class="is-open is-place-sheet-direct" data-current-place-id="test_place"><div class="pc-body"><div id="pcEventsBox"></div></div></div>',
  footerMarkup,
  '<script>window.PLACES = [{id:"test_place", name:"Teststed"}, {id:"other_place", name:"Annet sted"}];',
  'window.HGEvents = {ready:true, getUpcomingByPlace: id => id === "test_place" ? [{title:"Historisk møte"}] : []};',
  'window.HG_SpotmeetingUI = {open: args => window.__meetOpened = args};',
  'window.showPlaceCardRoundPopup = args => window.__eventsOpened = args;',
  '</script>',
  '<script src="/js/core/viewportManager.js"></script>',
  '<script>window.ViewportManager.init();</script>',
  '<script src="/js/ui/place-onsite-surface.js"></script>',
  '</body></html>'
].join("\n");

const allowed = new Set([
  "/css/base.css", "/css/layout.css", "/css/footer.css",
  "/js/core/viewportManager.js", "/js/ui/place-onsite-surface.js"
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

    await page.waitForFunction(() => document.querySelectorAll("#pcOnSiteFooter [data-hg-onsite-action]").length === 2);
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
        safeBottom: parseFloat(getComputedStyle(footer).paddingBottom) - (innerWidth <= 520 ? 6 : 8),
        actionsScroll: { scrollWidth: actions.scrollWidth, clientWidth: actions.clientWidth, overflowX: getComputedStyle(actions).overflowX },
        footerBackground: getComputedStyle(footer).backgroundColor,
        hasMoreInfo: Boolean(document.getElementById("pcInfo")),
        icons: ["pcRoute", "pcObserve", "pcNote"].map(id => ({
          mask: getComputedStyle(document.getElementById(id), "::before").webkitMaskImage,
          foreground: getComputedStyle(document.getElementById(id), "::before").backgroundColor,
          border: getComputedStyle(document.getElementById(id)).borderTopColor
        })),
        onsite: [...document.querySelectorAll("#pcOnSiteFooter button")].map(el => ({
          action: el.dataset.hgOnsiteAction,
          mask: getComputedStyle(el.querySelector(".pc-onsite-action-icon"), "::before").webkitMaskImage,
          foreground: getComputedStyle(el.querySelector(".pc-onsite-action-icon"), "::before").backgroundColor,
          label: el.getAttribute("aria-label")
        })),
        onsiteBoxHidden: document.getElementById("pcEventsBox").hidden,
        footerOnsiteHidden: document.getElementById("pcOnSiteFooter").hidden,
        viewportFooter: window.HGViewport?.footerHeight,
      };
    });

    const isPhone = width <= 520;
    assert.equal(actual.phone, isPhone, `mode at ${width}`);
    assert.equal(actual.viewportFooter, isPhone ? 60 : 72, `runtime footer at ${width}`);
    assert.ok(Math.abs(actual.footer.bottom - height) < 1, `footer anchored at ${width}`);
    assert.ok(Math.abs(actual.footer.height - ((isPhone ? 60 : 72) + actual.safeBottom)) < 1.5,
      `no unused extra footer height at ${width}`);
    assert.ok(actual.buttons.every(b => Math.abs(
      (b.top + b.bottom) / 2 - (actual.buttons[0].top + actual.buttons[0].bottom) / 2
    ) < 1), `footer buttons stay vertically centered in one row at ${width}`);
    assert.ok(actual.mini.height <= (isPhone ? 48 : 56), `mini fits row at ${width}`);
    assert.equal(actual.footerBackground, "rgba(0, 0, 0, 0)", `map visible below footer at ${width}`);
    assert.equal(actual.hasMoreInfo, false, `obsolete info button removed at ${width}`);
    assert.ok(actual.icons.every(icon => icon.mask && icon.mask !== "none"), `vector icons render at ${width}`);
    assert.ok(actual.icons.every(icon => icon.foreground === "rgb(16, 27, 35)"),
      `all footer glyphs are dark at ${width}`);
    assert.equal(new Set(actual.icons.map(icon => icon.border)).size, 3,
      `three discrete neon accent colors at ${width}`);
    assert.deepEqual(actual.onsite.map(item => item.action), ["events", "meet"],
      `canonical Events and Meet live in footer at ${width}`);
    assert.ok(actual.onsite.every(icon => icon.mask && icon.mask !== "none" && icon.foreground === "rgb(16, 27, 35)"),
      `Events and Meet have dark vector icons at ${width}`);
    assert.equal(actual.footerOnsiteHidden, false, `on-site footer actions visible at ${width}`);
    assert.equal(actual.onsiteBoxHidden, true, `old Events/Meet box removed at ${width}`);
    assert.equal(actual.actionsScroll.overflowX, "auto", `horizontal scroll enabled at ${width}`);
    assert.ok(actual.actionsScroll.scrollWidth >= actual.actionsScroll.clientWidth,
      `actions do not clip at ${width}`);
    if (width <= 390) {
      assert.ok(actual.actionsScroll.scrollWidth > actual.actionsScroll.clientWidth,
        `phone actions have real horizontal overflow at ${width}`);
      const scrolled = await page.locator(".app-actions").evaluate(el => {
        el.scrollLeft = el.scrollWidth;
        return el.scrollLeft;
      });
      assert.ok(scrolled > 0, `actions can actually scroll sideways at ${width}`);
    }

    await page.locator('#pcOnSiteFooter [data-hg-onsite-action="events"]').evaluate(el => el.click());
    assert.match(await page.evaluate(() => window.__eventsOpened?.html || ""), /Historisk møte/,
      `Events button keeps its popup behavior at ${width}`);
    await page.locator('#pcOnSiteFooter [data-hg-onsite-action="meet"]').evaluate(el => el.click());
    assert.equal(await page.evaluate(() => window.__meetOpened?.contextId), "test_place",
      `Meet opens for the selected place at ${width}`);

    await page.locator("#placeCard").evaluate(el => { el.dataset.currentPlaceId = "other_place"; });
    await page.waitForFunction(() => document.querySelector('#pcOnSiteFooter [data-hg-onsite-action="meet"]')?.dataset.placeId === "other_place");
    assert.equal(await page.locator("#pcOnSiteFooter .pc-onsite-action-count").count(), 0,
      `event count refreshes when switching places at ${width}`);
    await page.locator('#pcOnSiteFooter [data-hg-onsite-action="meet"]').evaluate(el => el.click());
    assert.equal(await page.evaluate(() => window.__meetOpened?.contextId), "other_place",
      `Meet never routes to the previous place at ${width}`);

    await page.locator("#placeCard").evaluate(el => { delete el.dataset.currentPlaceId; });
    await page.waitForFunction(() => document.getElementById("pcOnSiteFooter").hidden);
    assert.equal(await page.locator("#pcOnSiteFooter button").count(), 0,
      `no stale place actions when the place is cleared at ${width}`);
    await page.close();
    console.log(`Mobile footer layout and on-site behavior OK at ${width}x${height}`);
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
