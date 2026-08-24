import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const place = JSON.parse(fs.readFileSync("data/places/by/oslo/places/christiania_torv.json", "utf8"));
const related = place.related_place_ids.map(id => ({ id, name: id.replaceAll("_", " ") }));
const fixture = `<!doctype html><html><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="/css/place-rounds-fill-layout.css">
  <style>
    :root{--pc-round-gap:12px;--place-card-orb-size:120px}
    body{margin:0;font-family:sans-serif}.pc-grid{display:grid;grid-template-columns:280px 360px;gap:16px;width:656px;margin:24px}
    .pc-media{height:300px;background:#ccd6df;border-radius:16px}.pc-side-stack,.pc-icons-quad{height:300px}
    .pc-round{box-sizing:border-box;background:#315b78;color:white;border:2px solid #fff;display:grid;place-items:center;overflow:hidden}
    #pcQuiz{margin:0 24px;padding:12px 22px}.pc-action-primary{font-weight:700;background:#ffd85b}
    @media(max-width:700px){.pc-grid{grid-template-columns:1fr;width:auto;margin:12px}.pc-media{height:180px}.pc-side-stack,.pc-icons-quad{height:260px}}
  </style></head><body>
  <div id="placeCard" data-current-place-id="christiania_torv">
    <div class="pc-body"><div class="pc-title-row"><h2>Christiania Torv</h2><div id="pcBadgesIcon" class="pc-round"></div></div>
      <div class="pc-grid"><div class="pc-media">frontImage-/medieflate</div><div class="pc-side-stack"><div class="pc-icons-quad">
        <div id="pcPeopleIcon" class="pc-round">People</div><div id="pcBrandsIcon" class="pc-round">Brands</div>
      </div></div></div>
      <div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div>
    </div>
  </div><button id="pcQuiz" hidden>Ta quiz</button><div id="capture"></div>
  <script>window.PLACES=${JSON.stringify([place, ...related])};window.showPlaceCardRoundPopup=payload=>{window.__lastPopup={title:payload.title,kind:payload.kind,html:payload.html};document.getElementById('capture').innerHTML=payload.html};</script>
  <script src="/js/ui/place-rounds-visual-collections.js"></script>
  <script src="/js/ui/place-rounds-fill-layout.js"></script>
  <script>window.addEventListener('DOMContentLoaded',()=>{window.HGPlaceCardCollections.apply(window.PLACES[0]).then(()=>{window.__auditReady=true}).catch(error=>{window.__auditError=String(error&&error.stack||error)})})</script>
  </body></html>`;

const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8" };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (pathname === "/__audit__/christiania-torv.html") {
    response.writeHead(200, { "content-type": mime[".html"] });
    response.end(fixture);
    return;
  }
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404); response.end("not found"); return;
  }
  response.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream" });
  response.end(fs.readFileSync(file));
});

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1100, height: 760 } });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}/__audit__/christiania-torv.html`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__auditReady === true);

  const verify = async expectedWidth => {
    assert.equal(await page.locator(".pc-icons-quad").getAttribute("data-collection-count"), "3");
    assert.equal(await page.locator(".pc-icons-quad").getAttribute("data-collection-profile-source"), "place_card_profile_v2");
    assert.equal(await page.locator(".pc-icons-quad .pc-round:not([hidden])").count(), 3);
    assert.equal(await page.locator("#pcQuiz").isVisible(), true);
    assert.equal(await page.locator("#pcQuiz").evaluate(node => node.classList.contains("pc-action-primary")), true);
    const geometry = await page.evaluate(() => {
      const box = element => {
        const rect = element.getBoundingClientRect();
        return { x:rect.x, y:rect.y, width:rect.width, height:rect.height };
      };
      const people = box(document.getElementById("pcPeopleIcon"));
      const objects = box(document.getElementById("pcObjectsIcon"));
      const related = box(document.getElementById("pcCategoryCollectionIcon"));
      const grid = box(document.querySelector(".pc-icons-quad"));
      return { people, objects, related, grid };
    });
    assert.ok(Math.abs(geometry.people.width - geometry.people.height) < 2);
    assert.ok(geometry.objects.width > geometry.objects.height);
    assert.ok(geometry.related.width > geometry.related.height);
    assert.ok(Math.abs((geometry.related.x + geometry.related.width / 2) - (geometry.grid.x + geometry.grid.width / 2)) < 3);
    assert.ok(geometry.grid.width >= expectedWidth);
  };

  await verify(350);
  await page.locator("#pcObjectsIcon").click();
  await page.waitForFunction(() => window.__lastPopup?.kind === "objects");
  assert.equal(await page.locator("#capture [data-visual-round-item]").count(), 1);
  await page.locator("#pcCategoryCollectionIcon").click();
  await page.waitForFunction(() => window.__lastPopup?.kind === "related");
  assert.equal(await page.locator("#capture [data-visual-round-item]").count(), 5);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__auditReady === true);
  await verify(350);
  assert.equal(await page.evaluate(() => window.__auditError || null), null);
  await context.close();
  console.log("Christiania Torv PlaceCard collections v2 browser audit OK");
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
