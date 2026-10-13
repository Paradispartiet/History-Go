import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const payload = JSON.parse(fs.readFileSync(path.join(root, "data/runtime/place-open/black_box_teater.json"), "utf8"));
assert.equal(payload.place.id, "black_box_teater");
assert.deepEqual(payload.place.place_card_profile.collection_ids, ["people", "productions"]);
const stylePaths = ["/css/placeCard.css", "/css/place-sheet.css", "/css/place-rounds-fill-layout.css"];
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".webp": "image/webp", ".avif": "image/avif", ".jpg": "image/jpeg" };
const html = "<!doctype html><html lang='nb'><head><meta charset='utf-8'>"
  + "<meta name='viewport' content='width=device-width,initial-scale=1'></head><body></body></html>";
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (pathname === "/") {
    response.writeHead(200, { "content-type": mime[".html"] }); response.end(html); return;
  }
  const file = path.resolve(root, "." + pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404); response.end("not found"); return;
  }
  response.writeHead(200, { "content-type": mime[path.extname(file).toLowerCase()] || "application/octet-stream" });
  response.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const [width, height] of [[390, 844], [768, 1024], [1280, 900]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://127.0.0.1:" + server.address().port + "/");
    for (const url of stylePaths) await page.addStyleTag({ url });
    await page.evaluate(({ place, people }) => {
      document.body.className = "hg-app" + (innerWidth <= 720 ? " hg-phone" : "");
      document.body.innerHTML = [
        '<div id="placeCard" class="is-open is-unified-place is-place-sheet-direct" data-current-place-id="black_box_teater">',
        '<div class="pc-body"><section class="pc-sheet-shell">',
        '<div class="pc-sheet-hero"><div class="pc-sheet-hero-copy"><div class="pc-text">',
        '<div id="pcHeaderHero" class="pc-heading-hero"><img id="pcHeaderImage" class="pc-heading-image" alt="">',
        '<div class="pc-heading-content"><div class="pc-title-row"><h2 id="pcTitle">Black Box teater</h2>',
        '<div id="pcPeopleIcon" class="pc-round"></div><div id="pcBadgesIcon" class="pc-round">Merker</div>',
        '</div></div></div><p id="pcDesc"></p></div></div>',
        '<div class="pc-sheet-hero-media"><div class="pc-frontcard"><img id="pcFrontImage" alt=""></div>',
        '<div class="pc-sheet-explore-grid"><div class="pc-side-stack"><div class="pc-icons-quad">',
        '<div id="pcObjectsIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div>',
        '</div></div><div id="pcEventsBox" class="pc-events-quad"></div></div></div>',
        '</section></div></div><button id="pcQuiz">Ta quiz</button>'
      ].join("");
      window.PLACES = [place];
      window.getPeopleForPlace = () => people;
      window.__popup = null;
      window.showPlaceCardRoundPopup = data => { window.__popup = data; };
      document.getElementById("pcDesc").textContent = place.desc;
      document.getElementById("pcHeaderImage").src = place.image;
    }, { place: payload.place, people: payload.people });
    await page.addScriptTag({ url: "/js/ui/place-rounds-visual-collections.js" });
    await page.evaluate(async () => window.HGPlaceCardCollections.apply(window.PLACES[0]));
    const result = await page.evaluate(() => {
      const card = document.querySelector("#placeCard");
      const icon = document.querySelector("#pcCategoryCollectionIcon");
      const preview = icon?.querySelector("img");
      const people = document.querySelector("#pcPeopleIcon");
      const r = preview?.getBoundingClientRect();
      return {
        mode: card.dataset.collectionMode, source: card.dataset.collectionProfileSource,
        count: Number(card.dataset.collectionCount), gridCount: Number(card.dataset.collectionGridCount),
        id: icon?.dataset.collectionId, previewStatus: icon?.dataset.previewStatus,
        previewCount: Number(icon?.dataset.collectionItemCount),
        previewWidth: r?.width || 0, previewHeight: r?.height || 0,
        peopleCount: Number(people?.dataset.collectionItemCount),
        peopleInTitle: Boolean(people?.closest(".pc-title-row")),
        frontImageMissing: !window.PLACES[0].frontImage,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2
      };
    });
    assert.equal(result.mode, "place-card-collections-v2", "canonical mode at " + width);
    assert.equal(result.source, "place_card_profile_v2", "profile at " + width);
    assert.equal(result.count, 2, "People + Productions at " + width);
    assert.equal(result.gridCount, 1, "only Productions in grid at " + width);
    assert.equal(result.id, "productions", "collection ID at " + width);
    assert.equal(result.previewStatus, "member-image", "preview at " + width);
    assert.equal(result.previewCount, 2, "two documented productions at " + width);
    assert.equal(result.peopleCount, 1, "Inger Buresund at " + width);
    assert.equal(result.peopleInTitle, true, "People beside title at " + width);
    assert.equal(result.frontImageMissing, true, "frontImage still unresolved at " + width);
    assert.ok(result.previewWidth > 15 && result.previewHeight > 15, "visible collection preview at " + width);
    assert.equal(result.horizontalOverflow, false, "no document horizontal overflow at " + width);
    await page.waitForFunction(() => document.querySelector("#pcCategoryCollectionIcon img")?.complete);
    const decoded = await page.locator("#pcCategoryCollectionIcon img").evaluate(img => [img.naturalWidth, img.naturalHeight]);
    assert.deepEqual(decoded, [1024, 512], "real decoded AVIF preview at " + width);
    await page.locator("#pcCategoryCollectionIcon").click();
    const popup = await page.evaluate(() => window.__popup);
    assert.equal(popup?.kind, "productions", "click opens Productions at " + width);
    assert.match(popup?.html || "", /Konsert for Grønland/);
    assert.match(popup?.html || "", /Ways of Seeing/);
    assert.ok(!/Hjelp vi får gjester/.test(popup?.html || ""), "no Aker Brygge item at " + width);
    const images = await page.evaluate(async markup => {
      const container = document.createElement("div");
      container.innerHTML = markup;
      document.body.appendChild(container);
      const imgs = [...container.querySelectorAll("img")];
      await Promise.all(imgs.map(img => img.decode()));
      const result = imgs.map(img => ({ src: img.getAttribute("src"), width: img.naturalWidth, height: img.naturalHeight }));
      container.remove();
      return result;
    }, popup.html);
    assert.equal(images.length, 2, "two production images at " + width);
    for (const image of images) {
      assert.match(image.src, /^bilder\/kort\/productions\/black_box_.*\.avif$/);
      assert.deepEqual([image.width, image.height], [1024, 512], "decoded production artwork at " + width);
    }
    assert.deepEqual(errors, [], "browser JavaScript errors at " + width);
    console.log("Black Box production preview, click and two AVIF images OK at " + width + "px");
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
