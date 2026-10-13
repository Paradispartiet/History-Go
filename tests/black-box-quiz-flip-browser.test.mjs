import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const place = JSON.parse(read("data/places/scenekunst/oslo/places_scenekunst/black_box_teater.json"));
const quiz = JSON.parse(read("data/quizcards/scenekunst/black_box_teater_quizkort_v1.json"));
const source = read("js/ui/place-card.js");
const appMarkup = read("index.html");
for (const id of ["pcFrontCardFlip", "pcQuizCardContent", "pcQuizExpandBtn", "pcQuizExpandedClose"]) {
  assert.ok(appMarkup.includes('id="' + id + '"'), "real app lacks " + id);
}
assert.equal(place.id, "black_box_teater");
assert.ok(!place.frontImage, "separate front photograph must not be misreported as complete");
assert.equal(quiz.cards[0].questions.length, 10);
const begin = source.indexOf("function bindPlaceCardQuizFlip(");
const end = source.indexOf("\nfunction setPlaceCardQuizImage(", begin);
assert.ok(begin >= 0 && end > begin, "shipping handler must be present");
const bindSource = source.slice(begin, end);
const html = [
  '<!doctype html><html lang="nb"><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<link rel="stylesheet" href="/css/placeCard.css">',
  '<style>body{margin:0}#placeCard{position:relative;width:min(100%,660px);margin:auto}',
  '#pcFrontCardFlip{width:240px;max-width:calc(100% - 12px);margin:8px}</style>',
  '</head><body class="hg-app"><div id="placeCard" class="is-open">',
  '<h2 id="pcTitle">Black Box teater</h2>',
  '<section id="pcQuizExpanded" class="pc-quiz-expanded" role="dialog" aria-modal="true" hidden>',
  '<div class="pc-quiz-expanded-toolbar"><strong id="pcQuizExpandedTitle">Quizkort</strong>',
  '<button id="pcQuizExpandedClose" type="button">Lukk</button></div>',
  '<div id="pcQuizExpandedContent" class="pc-quiz-expanded-content"></div></section>',
  '<div id="pcFrontCardFlip" class="pc-frontcard" role="button" tabindex="0"',
  ' data-current-place-id="black_box_teater" aria-label="Vis quizkort">',
  '<div class="pc-card-flip-inner"><div class="pc-card-face pc-card-face-front">',
  '<img id="pcFrontImage" alt="Kun QA-plassholder"></div>',
  '<div class="pc-card-face pc-card-face-back"><div id="pcQuizCardBack" class="pc-quiz-card-back">',
  '<img id="pcQuizCardImage" class="pc-quiz-card-image" alt="" hidden>',
  '<div id="pcQuizCardContent" class="pc-quiz-card-content" hidden></div>',
  '<button id="pcQuizExpandBtn" class="pc-quiz-expand-btn" type="button">Vis quizkort stort</button>',
  '</div></div></div></div></div></body></html>'
].join("");
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname === "/") {
    res.writeHead(200, {"content-type":"text/html; charset=utf-8"});
    res.end(html); return;
  }
  const absolute = path.resolve(root, "." + pathname);
  if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) {
    res.writeHead(404); res.end("not found"); return;
  }
  const type = pathname.endsWith(".css") ? "text/css" : pathname.endsWith(".js")
    ? "text/javascript" : "application/json";
  res.writeHead(200, {"content-type":type + "; charset=utf-8"});
  res.end(fs.readFileSync(absolute));
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({headless:true});
  const base = "http://127.0.0.1:" + server.address().port;
  for (const [width, height] of [[390, 844], [768, 1024], [1280, 900]]) {
    const page = await browser.newPage({viewport:{width,height}});
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.goto(base);
      await page.evaluate(() => {
        window.TEST_MODE = true;
        window.visited = {};
        window.HG_I18N = {t:(_key, fallback) => fallback};
        window.openPlaceCard = async item => {
          document.getElementById("pcTitle").textContent = item.name;
          return true;
        };
        window.DataHub = {loadQuizCardsCollection: async name => {
          const response = await fetch("/data/quizcards/" + name);
          return response.ok ? response.json() : null;
        }};
      });
      await page.addScriptTag({url:"/js/ui/place-card-quizcards-patch.js"});
      await page.addScriptTag({content:"const tUI = (_key, fallback) => fallback;\n" + bindSource});
      await page.evaluate(async item => {
        // A test-only neutral graphic: NOT a front photograph.
        document.getElementById("pcFrontImage").src = "data:image/svg+xml," +
          encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="#708090"/></svg>');
        await window.openPlaceCard(item);
        bindPlaceCardQuizFlip(document.getElementById("pcFrontCardFlip"),
          document.getElementById("pcQuizCardImage"));
      }, place);
      await page.waitForFunction(() => !document.getElementById("pcQuizCardContent").hidden);
      const card = page.locator("#pcFrontCardFlip");
      const content = await page.locator("#pcQuizCardContent").textContent();
      assert.match(content, /Black Box teater/);
      assert.match(content, /Konsert for Grønland/);
      assert.match(content, /Scenekunstquiz/);
      assert.equal(await card.evaluate(el => el.classList.contains("has-quiz-card")), true);
      assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), false);
      await card.click();
      assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), true, "click at " + width);
      assert.equal(await card.getAttribute("aria-label"), "Vis frontbilde");
      await page.evaluate(() => document.getElementById("pcQuizCardImage").dispatchEvent(new Event("error")));
      assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), true);
      await page.locator("#pcQuizExpandBtn").click();
      assert.equal(await page.locator("#pcQuizExpanded").evaluate(el => el.hidden), false);
      assert.equal(await page.locator("#pcQuizExpandedContent").getAttribute("data-mode"), "rendered");
      assert.match(await page.locator("#pcQuizExpandedContent").textContent(), /Black Box teater/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#pcQuizExpanded").evaluate(el => el.hidden), true);
      await card.focus();
      await page.keyboard.press("Enter");
      assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), false);
      await page.keyboard.press("Space");
      assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), true);
      assert.deepEqual(errors, [], "browser errors at " + width);
      console.log("Black Box QuizCard real data, click, Enter, Space, expand and Escape OK " + width + "px");
    } finally {
      await page.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
