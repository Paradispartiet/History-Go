import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const read = pathName => fs.readFileSync(path.join(root, pathName), "utf8");
const places = [
  JSON.parse(read("data/places/natur/oslo/brekkedammen.json")),
  JSON.parse(read("data/places/natur/oslo/places_oslo_natur_akerselvarute/nydalsdammen.json"))
];
const collection = JSON.parse(read("data/quizcards/natur/topp10_natur_akerselva_dams_20261021.json"));
const manifest = JSON.parse(read("data/quizcards/natur/manifest.json"));
const placeCardSource = read("js/ui/place-card.js");
const cardControllerSource = read("js/ui/placeQuizCards.ts");
const patchSource = read("js/ui/place-card-quizcards-patch.js");

assert.ok(manifest.collections.includes("topp10_natur_akerselva_dams_20261021.json"));
for (const source of [placeCardSource, cardControllerSource, patchSource]) {
  assert.match(source, /natur\/manifest\.json/, "both runtime QuizCard loaders must support Natur");
}
assert.match(placeCardSource, /imageComposition\.portraitFit === "cover"/, "shipping PlaceCard must honor opt-in crop");
for (const place of places) {
  const card = collection.cards.find(c => c.targetId === place.id);
  assert.ok(card, `no QuizCard for ${place.id}`);
  assert.equal(card.questions.length, 10);
  assert.equal(place.frontImage, place.image, "use existing source without inventing a portrait asset");
  assert.equal(place.frontImageMeta.source, "existing_place_photo");
  assert.equal(place.frontImageMeta.licenseUrl, place.imageMeta.licenseUrl);
  assert.equal(place.imageComposition.portraitFit, "cover");
  assert.match(place.imageComposition.portraitPosition, /^\d+% \d+%$/);
  const activeQuiz = JSON.parse(read("data/quiz/natur/" + place.id + "_sets.json"));
  const questionById = new Map(activeQuiz.sets.flatMap(set => set.questions).map(q => [q.id, q]));
  for (const question of card.questions) {
    assert.ok(question.sourceQuizId && question.claim_id && question.source_urls?.length);
    const sourceQuestion = questionById.get(question.sourceQuestionId);
    assert.ok(sourceQuestion, "QuizCard question missing in active quiz");
    assert.equal(question.question, sourceQuestion.question);
    assert.equal(question.answer, sourceQuestion.answer);
    assert.equal(question.answerIndex, sourceQuestion.answerIndex);
    assert.deepEqual(question.options, sourceQuestion.options);
  }
}
for (const id of ["pcFrontCardFlip", "pcQuizCardContent", "pcQuizExpandBtn", "pcQuizExpandedClose"]) {
  assert.ok(read("index.html").includes(`id="${id}"`));
}
const start = placeCardSource.indexOf("function bindPlaceCardQuizFlip(");
const finish = placeCardSource.indexOf("\nfunction setPlaceCardQuizImage(", start);
assert.ok(start > 0 && finish > start, "real app click/keyboard handler must exist");
const bindSource = placeCardSource.slice(start, finish);
const markup = [
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
  '<div id="pcFrontCardFlip" class="pc-frontcard" role="button" tabindex="0" aria-label="Vis quizkort">',
  '<div class="pc-card-flip-inner"><div class="pc-card-face pc-card-face-front">',
  '<img id="pcFrontImage" alt="QA: ikke et fotografi"></div>',
  '<div class="pc-card-face pc-card-face-back"><div id="pcQuizCardBack" class="pc-quiz-card-back">',
  '<img id="pcQuizCardImage" alt="" hidden>',
  '<div id="pcQuizCardContent" class="pc-quiz-card-content" hidden></div>',
  '<button id="pcQuizExpandBtn" type="button">Vis quizkort stort</button>',
  '</div></div></div></div></div></body></html>'
].join("");
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(markup); return;
  }
  const absolute = path.resolve(root, "." + pathname);
  if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) {
    res.writeHead(404); res.end("not found"); return;
  }
  const mime = pathname.endsWith(".css") ? "text/css" : pathname.endsWith(".js") ? "text/javascript" : "application/json";
  res.writeHead(200, { "content-type": mime + "; charset=utf-8" });
  res.end(fs.readFileSync(absolute));
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({headless:true});
  const base = "http://127.0.0.1:" + server.address().port;
  for (const [width, height] of [[390,844],[768,1024],[1280,900]]) {
    const page = await browser.newPage({viewport:{width,height}});
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
        }};
        window.openPlaceCard = async place => {
          const el = document.getElementById("pcFrontCardFlip");
          document.getElementById("placeCard").dataset.currentPlaceId = place.id;
          el.dataset.currentPlaceId = place.id;
          el.classList.remove("is-flipped", "has-quiz-card");
          document.getElementById("pcQuizCardContent").hidden = true;
          document.getElementById("pcTitle").textContent = place.name;
          document.getElementById("pcFrontImage").style.objectFit =
            place.imageComposition?.portraitFit === "cover" ? "cover" : "";
          return true;
        };
      });
      await page.addScriptTag({url:"/js/ui/place-card-quizcards-patch.js"});
      await page.addScriptTag({content:"const tUI = (_key, fallback) => fallback;\n" + bindSource});
      await page.evaluate(() => {
        // Neutral graphic only for interaction testing; front photo provenance is checked above.
        document.getElementById("pcFrontImage").src =
          "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="#708090"/></svg>');
        bindPlaceCardQuizFlip(document.getElementById("pcFrontCardFlip"),
          document.getElementById("pcQuizCardImage"));
      });
      for (const place of places) {
        await page.evaluate(async data => window.openPlaceCard(data), place);
        await page.waitForFunction(name => {
          const content = document.getElementById("pcQuizCardContent");
          return !content.hidden && content.querySelector(".pc-rendered-quiz-card")?.textContent.includes(name);
        }, place.name);
        const flip = page.locator("#pcFrontCardFlip");
        assert.equal(await page.locator("#pcFrontImage").evaluate(img => img.style.objectFit), "cover");
        assert.equal(await flip.evaluate(el=>el.classList.contains("has-quiz-card")), true);
        assert.match(await page.locator("#pcQuizCardContent").textContent(), new RegExp(place.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
        await flip.click();
        assert.equal(await flip.evaluate(el=>el.classList.contains("is-flipped")), true);
        await page.locator("#pcQuizExpandBtn").click();
        assert.equal(await page.locator("#pcQuizExpanded").evaluate(el=>el.hidden), false);
        assert.equal(await page.locator("#pcQuizExpandedContent").getAttribute("data-mode"), "rendered");
        await page.keyboard.press("Escape");
        assert.equal(await page.locator("#pcQuizExpanded").evaluate(el=>el.hidden), true);
        await flip.focus();
        await page.keyboard.press("Enter");
        assert.equal(await flip.evaluate(el=>el.classList.contains("is-flipped")), false);
        await page.keyboard.press("Space");
        assert.equal(await flip.evaluate(el=>el.classList.contains("is-flipped")), true);
        console.log(place.id + " QuizCard flip/expand/keyboard OK at " + width + "px");
      }
      assert.deepEqual(errors, [], "JS console errors at " + width + "px");
    } finally {
      await page.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
