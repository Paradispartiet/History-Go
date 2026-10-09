import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.match(indexHtml, /href="css\/person-popup-v2\.css/, "Person V2 stylesheet must be loaded in the app");

const start = indexHtml.indexOf('<footer class="site-footer app-footer"');
const end = indexHtml.indexOf("</footer>", start);
assert.ok(start !== -1 && end > start, "Canonical footer exists");
const footer = indexHtml.slice(start, end + "</footer>".length);

const styles = [
  "css/theme.css", "css/base.css", "css/layout.css", "css/placeCard.css",
  "css/footer.css", "css/people.css", "css/popups.css",
  "css/popup-polish.css", "css/person-popup-v2.css"
];
const scripts = ["js/ui/popup-utils.js", "js/ui/person-popup-v2.js"];
const fixture = [
  '<!doctype html><html><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  ...styles.map(file => '<link rel="stylesheet" href="/' + file + '">'),
  '<style>#mapLayer{position:fixed;inset:0;background:repeating-linear-gradient(45deg,#243d31 0 24px,#365a40 24px 48px)}</style>',
  '</head><body class="hg-app">',
  '<div id="mapLayer"></div>',
  '<header class="site-header"><span>History Go</span></header>',
  '<div id="placeCard" class="is-hidden"></div>',
  footer,
  '<script>',
  'document.body.classList.toggle("hg-phone", innerWidth <= 520);',
  'document.documentElement.style.setProperty("--hg-visual-header-height", "56px");',
  'document.documentElement.style.setProperty("--hg-visual-footer-height", innerWidth <= 520 ? "60px" : "72px");',
  '</script>',
  ...scripts.map(file => '<script src="/' + file + '"></script>'),
  '<script>',
  'window.showPersonPopup({id:"layout_test_person",name:"Person med historisk biografi",category:"historie",',
  'desc:"Historisk introduksjon.",',
  'popupDesc:Array(28).fill("Denne personen deltok i viktige historiske hendelser og arbeidet på flere steder.").join("\\n\\n")});',
  '</script>',
  '</body></html>'
].join("\n");
const served = new Set([...styles, ...scripts].map(file => "/" + file));
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  if (pathname === "/__audit__/person-popup.html") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(fixture);
  } else if (served.has(pathname)) {
    const file = pathname.slice(1);
    res.writeHead(200, { "content-type": file.endsWith(".css") ? "text/css" : "text/javascript" });
    res.end(fs.readFileSync(path.join(root, file)));
  } else {
    res.writeHead(404); res.end("not found");
  }
});

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const { port } = server.address();
  for (const [width, height] of [[320,700],[390,844],[768,1024],[1024,900],[1440,900]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto("http://127.0.0.1:" + port + "/__audit__/person-popup.html", { waitUntil: "load" });
    await page.locator(".hg-popup.person-popup.person-popup-v2 .hg-person-popup-header").waitFor();

    const state = await page.evaluate(() => {
      const bounds = selector => {
        const e = document.querySelector(selector);
        const { x, y, right, bottom, width, height } = e.getBoundingClientRect();
        return { x,y,right,bottom,width,height };
      };
      const overlay = document.querySelector(".hg-popup.person-popup.person-popup-v2");
      const inner = overlay.querySelector(".hg-popup-inner");
      const body = overlay.querySelector(".hg-person-popup-body");
      const atMapEdge = document.elementFromPoint(3, Math.round(inner.getBoundingClientRect().top + 20));
      return {
        overlay: bounds(".hg-popup.person-popup.person-popup-v2"),
        inner: bounds(".hg-popup.person-popup.person-popup-v2 .hg-popup-inner"),
        placeCard: bounds("#placeCard"),
        header: bounds(".site-header"),
        footer: bounds(".app-footer"),
        modalHeader: bounds(".hg-person-popup-header"),
        overlayPosition: getComputedStyle(overlay).position,
        overlayBackground: getComputedStyle(overlay).backgroundColor,
        overlayBackdrop: getComputedStyle(overlay).backdropFilter,
        overlayZ: Number(getComputedStyle(overlay).zIndex),
        headerZ: Number(getComputedStyle(document.querySelector(".site-header")).zIndex),
        footerZ: Number(getComputedStyle(document.querySelector(".app-footer")).zIndex),
        scrollable: body.scrollHeight > body.clientHeight,
        scrollOverflow: getComputedStyle(body).overflowY,
        mapEdgeVisible: atMapEdge?.id === "mapLayer",
        totalHorizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1
      };
    });

    assert.equal(state.overlayPosition, "fixed", "person card fixed like PlaceCard at " + width);
    assert.equal(state.overlayBackground, "rgba(0, 0, 0, 0)", "no black fullscreen backdrop at " + width);
    assert.equal(state.overlayBackdrop, "none", "map remains unblurred outside popup at " + width);
    assert.ok(Math.abs(state.overlay.y - state.placeCard.y) < 1,
      "same top offset as PlaceCard at " + width);
    assert.ok(Math.abs(state.overlay.x - state.placeCard.x) < 1
      && Math.abs(state.overlay.width - state.placeCard.width) < 1,
      "same width and side frame as PlaceCard at " + width);
    assert.ok(state.overlay.y >= state.header.bottom + 11,
      "header visible above person card at " + width);
    assert.ok(state.overlay.bottom <= state.footer.y - 11,
      "footer visible below person card at " + width);
    assert.ok(state.overlayZ < state.footerZ && state.overlayZ < state.headerZ,
      "person popup beneath footer and header layers at " + width);
    assert.ok(state.overlay.width <= 760.5 && state.inner.height <= state.overlay.height + 1,
      "responsive card respects height and width limits at " + width);
    assert.ok(state.modalHeader.y >= state.inner.y
      && state.modalHeader.bottom <= state.inner.bottom,
      "person header stays inside card at " + width);
    assert.equal(state.scrollOverflow, "auto", "person biography owns internal scrolling");
    assert.equal(state.scrollable, true, "long biography scrolls within popup at " + width);
    assert.equal(state.mapEdgeVisible, true, "map remains visible on outside edge at " + width);
    assert.equal(state.totalHorizontalOverflow, false, "no viewport horizontal overflow at " + width);

    await page.locator(".hg-popup-close").click();
    assert.equal(await page.locator(".hg-popup.person-popup-v2").count(), 0,
      "popup close remains usable at " + width);
    console.log("People PlaceCard framing OK at " + width + "x" + height);
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
