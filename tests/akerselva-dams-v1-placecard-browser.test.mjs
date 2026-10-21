import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const places = [
  JSON.parse(read("data/places/natur/oslo/brekkedammen.json")),
  JSON.parse(read("data/places/natur/oslo/places_oslo_natur_akerselvarute/nydalsdammen.json"))
];
const collection = JSON.parse(read("data/quizcards/natur/topp10_natur_akerselva_dams_20261021.json"));
const manifest = JSON.parse(read("data/quizcards/natur/manifest.json"));
const source = read("js/ui/place-card.js");
const patch = read("js/ui/place-card-quizcards-patch.js");
const ts = read("js/ui/placeQuizCards.ts");
const style = read("css/placeCard.css");

assert.ok(manifest.collections.includes("topp10_natur_akerselva_dams_20261021.json"));
assert.match(ts, /"natur\\/manifest\\.json"/);
assert.match(patch, /"natur\\/manifest\\.json"/);
assert.match(source, /frontImgEl\\.style\\.objectFit = imageComposition\\.portraitFit === "cover"/);
assert.match(style, /\\.pc-frontcard\\s*\\{[^}]*aspect-ratio:\\s*3\\s*\\/\\s*4/s);
assert.equal(collection.cards.length, 2);
for (const place of places) {
  const card = collection.cards.find(x => x.targetId === place.id);
  assert.ok(card, "missing QuizCard for " + place.id);
  assert.equal(card.questions.length, 10);
  assert.equal(card.questionCount, 10);
  assert.equal(place.frontImage, place.image, "reuse the existing credited source, without a fabricated replacement");
  assert.equal(place.frontImageMeta.sourceUrl, place.imageSourceUrl);
  assert.equal(place.frontImageMeta.licenseShortName, place.imageMeta.licenseShortName);
  assert.equal(place.imageComposition.portraitFit, "cover");
  const sourceQuiz = JSON.parse(read("data/quiz/natur/" + place.id + "_sets.json"));
  const indexed = new Map(sourceQuiz.sets.flatMap(x => x.questions).map(q => [q.id, q]));
  for (const entry of card.questions) {
    const q = indexed.get(entry.sourceQuestionId);
    assert.ok(q, "missing source question: " + entry.sourceQuestionId);
    assert.equal(entry.question, q.question);
    assert.equal(entry.answer, q.answer);
    assert.equal(entry.answerIndex, q.answerIndex);
    assert.deepEqual(entry.options, q.options);
  }
}
for (const id of ["pcFrontCardFlip", "pcQuizCardContent", "pcQuizExpandBtn", "pcQuizExpandedClose"]) {
  assert.ok(read("index.html").includes('id="' + id + '"'), "real app lacks " + id);
}
const begin = source.indexOf("function bindPlaceCardQuizFlip(");
const end = source.indexOf("\nfunction setPlaceCardQuizImage(", begin);
assert.ok(begin >= 0 && end > begin);
const bindSource = source.slice(begin, end);

const html = [
  '<!doctype html><html lang="nb"><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<link rel="stylesheet" href="/css/placeCard.css">',
  '<style>body{margin:0}#placeCard{position:relative;width:min(100%,660px);margin:auto}',
  '#pcFrontCardFlip{width:240px;max-width:calc(100% - 12px);margin:8px}</style>',
  '</head><body class="hg-app"><div id="placeCard" class="is-open">',
  '<h2 id="pcTitle"></h2>',
  '<section id="pcQuizExpanded" class="pc-quiz-expanded" role="dialog" aria-modal="true" hidden>',
  '<div class="pc-quiz-expanded-toolbar"><strong id="pcQuizExpandedTitle">Quizkort</strong>',
  '<button id="pcQuizExpandedClose" type="button">Lukk</button></div>',
  '<div id="pcQuizExpandedContent" class="pc-quiz-expanded-content"></div></section>',
  '<div id="pcFrontCardFlip" class="pc-frontcard" role="button" tabindex="0"',
  ' aria-label="Vis quizkort"><div class="pc-card-flip-inner">',
  '<div class="pc-card-face pc-card-face-front"><img id="pcFrontImage" alt="Stedsfoto"></div>',
  '<div class="pc-card-face pc-card-face-back"><div id="pcQuizCardBack" class="pc-quiz-card-back">',
  '<img id="pcQuizCardImage" class="pc-quiz-card-image" alt="" hidden>',
  '<div id="pcQuizCardContent" class="pc-quiz-card-content" hidden></div>',
  '<button id="pcQuizExpandBtn" class="pc-quiz-expand-btn" type="button">Vis quizkort stort</button>',
  '</div></div></div></div></div></body></html>'
].join("");

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }
  const absolute = path.resolve(root, "." + pathname);
  if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) {
    res.writeHead(404); res.end("not found"); return;
  }
  const type = pathname.endsWith(".css") ? "text/css" : pathname.endsWith(".js")
    ? "text/javascript" : "application/json";
  res.writeHead(200, { "content-type": type + "; charset=utf-8" });
  res.end(fs.readFileSync(absolute));
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const base = "http://127.0.0.1:" + server.address().port;
  for (const [width, height] of [[390, 844], [768, 1024], [1280, 900]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.goto(base);
      await page.evaluate(() => {
        window.TEST_MODE = true;
        window.visited = {};
        window.HG_I18N = { t: (_key, fallback) => fallback };
        window.DataHub = { loadQuizCardsCollection: async name => {
          const response = await fetch("/data/quizcards/" + name);
          return response.ok ? response.json() : null;
        } };
        window.openPlaceCard = async item => {
          document.getElementById("placeCard").dataset.currentPlaceId = item.id;
          document.getElementById("pcFrontCardFlip").dataset.currentPlaceId = item.id;
          document.getElementById("pcTitle").textContent = item.name;
          const image = document.getElementById("pcFrontImage");
          image.style.objectFit = item.imageComposition?.portraitFit === "cover" ? "cover" : "";
          image.style.objectPosition = item.imageComposition?.portraitPosition || "50% 50%";
          // Do not rely on a third-party network response for this UI regression.
          image.src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="#708090"/></svg>');
          return true;
        };
      });
      await page.addScriptTag({ url: "/js/ui/place-card-quizcards-patch.js" });
      await page.addScriptTag({ content: "const tUI = (_key, fallback) => fallback;\n" + bindSource });
      await page.evaluate(() => bindPlaceCardQuizFlip(
        document.getElementById("pcFrontCardFlip"), document.getElementById("pcQuizCardImage")
      ));
      for (const place of places) {
        await page.evaluate(async item => {
          const flip = document.getElementById("pcFrontCardFlip");
          flip.classList.remove("has-quiz-card", "is-flipped");
          await window.openPlaceCard(item);
        }, place);
        await page.waitForFunction(() => {
          const flip = document.getElementById("pcFrontCardFlip");
          const txt = document.getElementById("pcQuizCardContent");
          return flip.classList.contains("has-quiz-card") && !txt.hidden;
        });
        const card = page.locator("#pcFrontCardFlip");
        const content = await page.locator("#pcQuizCardContent").textContent();
        assert.match(content, new RegExp(place.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
        assert.equal(await page.locator("#pcFrontImage").evaluate(el => getComputedStyle(el).objectFit), "cover");
        assert.equal(await card.getAttribute("aria-label"), "Vis quizkort");
        await card.click();
        assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), true);
        await page.locator("#pcQuizExpandBtn").click();
        assert.equal(await page.locator("#pcQuizExpanded").evaluate(el => el.hidden), false);
        assert.equal(await page.locator("#pcQuizExpandedContent").getAttribute("data-mode"), "rendered");
        await page.keyboard.press("Escape");
        assert.equal(await page.locator("#pcQuizExpanded").evaluate(el => el.hidden), true);
        await card.focus();
        await page.keyboard.press("Enter");
        assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), false);
        await page.keyboard.press("Space");
        assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), true);
        console.log(place.id + ": card load / flip / expand / keyboard OK at " + width);
      }
      assert.deepEqual(errors, [], "browser errors at " + width);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
