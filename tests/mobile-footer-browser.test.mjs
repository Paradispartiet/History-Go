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
  '<header class="site-header"><button id="nearbyExploreToggle">Utforsk</button><a id="miniProfile" href="#">Profil</a><button class="iconbtn" type="button">☰</button></header>',
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
    // Exercise a real pointer click and native keyboard activation. An inert
    // thumbnail under the footer's pointer-events:none rule fails here.
    await page.locator("#pcMini").evaluate(el => {
      el.addEventListener("click", () => {
        window.__miniTapCount = (window.__miniTapCount || 0) + 1;
      });
    });
    await page.locator("#pcMini").click();
    assert.equal(await page.evaluate(() => window.__miniTapCount), 1,
      `thumbnail accepts a pointer click at ${width}`);
    await page.locator("#pcMini").focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => window.__miniTapCount), 2,
      `thumbnail accepts keyboard activation at ${width}`);

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
        footerImage: getComputedStyle(footer).backgroundImage,
        footerLine: getComputedStyle(footer).borderTopColor,
        headerBackground: getComputedStyle(document.querySelector(".site-header")).backgroundColor,
        headerLine: getComputedStyle(document.querySelector(".site-header")).borderBottomColor,
        headerBorderWidths: ["nearbyExploreToggle","miniProfile"].map(id => getComputedStyle(document.getElementById(id)).borderTopWidth).concat(getComputedStyle(document.querySelector(".site-header .iconbtn")).borderTopWidth),
        headerButtonBackgrounds: ["nearbyExploreToggle","miniProfile"].map(id => getComputedStyle(document.getElementById(id)).backgroundColor).concat(getComputedStyle(document.querySelector(".site-header .iconbtn")).backgroundColor),
        miniBorderWidth: getComputedStyle(mini).borderTopWidth,
        hasMoreInfo: Boolean(document.getElementById("pcInfo")),
        icons: ["pcQuiz", "pcVisit", "pcRoute", "pcObserve", "pcNote"].map(id => ({
          id,
          image: getComputedStyle(document.getElementById(id), "::before").backgroundImage,
          borderWidth: getComputedStyle(document.getElementById(id)).borderTopWidth,
          text: document.getElementById(id).textContent.trim(),
          fontSize: getComputedStyle(document.getElementById(id)).fontSize,
          background: getComputedStyle(document.getElementById(id)).backgroundColor
        })),
        onsite: [...document.querySelectorAll("#pcOnSiteFooter button")].map(el => ({
          action: el.dataset.hgOnsiteAction,
          image: getComputedStyle(el.querySelector(".pc-onsite-action-icon"), "::before").backgroundImage,
          borderWidth: getComputedStyle(el).borderTopWidth,
          background: getComputedStyle(el).backgroundColor,
          label: el.getAttribute("aria-label"),
          labelDisplay: getComputedStyle(el.querySelector(".pc-onsite-action-label")).display
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
    assert.equal(actual.footerBackground, "rgb(0, 0, 0)", `black footer at ${width}`);
    assert.equal(actual.headerBackground, "rgb(0, 0, 0)", `black header at ${width}`);
    assert.equal(actual.footerImage, "none", `no gradient fill at ${width}`);
    assert.equal(actual.footerLine, "rgb(246, 200, 0)", `header-yellow footer perimeter at ${width}`);
    assert.equal(actual.headerLine, actual.footerLine, `both bars use the same yellow line at ${width}`);
    assert.ok(actual.headerBorderWidths.every(value => value === "0px"),
      `no frames around header icons or profile at ${width}`);
    assert.ok(actual.headerButtonBackgrounds.every(value => value === "rgba(0, 0, 0, 0)"),
      `header actions have no circular background fills at ${width}`);
    assert.equal(actual.miniBorderWidth, "0px", `collapsed thumbnail has no decorative frame at ${width}`);
    assert.equal(actual.hasMoreInfo, false, `obsolete info button absent at ${width}`);
    assert.ok(actual.icons.every(icon => icon.image.includes("data:image/svg+xml")),
      `all five principal icons render at ${width}`);
    assert.equal(new Set(actual.icons.map(icon => icon.image)).size, 5,
      `different pictogram per action at ${width}`);
    // The text remains accessible to assistive technology, but only the
    // distance/visit status should be visually printed next to its icon.
    assert.deepEqual(actual.icons.map(icon => icon.text),
      ["Ta quiz", "Registrer besøk", "Rute", "Observer", "Notat"],
      `semantic action names remain at ${width}`);
    assert.ok(actual.icons.filter(icon => icon.id !== "pcVisit")
      .every(icon => icon.fontSize === "0px"),
      `Quiz, Route, Observe and Note hide visible text at ${width}`);
    assert.notEqual(actual.icons.find(icon => icon.id === "pcVisit").fontSize, "0px",
      `live distance/visit status remains legible at ${width}`);
    assert.ok(actual.icons.every(icon => icon.borderWidth === "0px"),
      `all footer buttons are entirely unframed at ${width}`);
    assert.ok(actual.icons.every(icon => icon.background === "rgba(0, 0, 0, 0)"),
      `all footer actions have transparent, uncircled backgrounds at ${width}`);
    assert.ok(actual.icons.every(icon => {
      const art = decodeURIComponent(icon.image);
      return art.includes("#f6c800") && art.includes("#f8f8f1");
    }), `all footer glyphs have unified yellow and white strokes at ${width}`);
    assert.deepEqual(actual.onsite.map(item => item.action), ["events", "meet"],
      `canonical Events and Meet are in footer at ${width}`);
    assert.ok(actual.onsite.every(icon => icon.image.includes("data:image/svg+xml")),
      `Event and Meet icons render at ${width}`);
    assert.notEqual(actual.onsite[0].image, actual.onsite[1].image,
      `Events and Meet are visually distinct at ${width}`);
    assert.equal(actual.onsite.find(icon => icon.action === "events").labelDisplay, "none",
      `Events uses icon-only presentation at ${width}`);
    assert.notEqual(actual.onsite.find(icon => icon.action === "meet").labelDisplay, "none",
      `Møtes keeps its visible label at ${width}`);
    assert.ok(actual.onsite.every(icon => icon.borderWidth === "0px" && icon.background === "rgba(0, 0, 0, 0)"),
      `Events and Meet are unframed like the other footer actions at ${width}`);
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
