import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import { chromium, webkit } from "playwright";
import sharp from "sharp";

// Exercise the shipping flip handler and stylesheet, rather than duplicating their behavior.
const source = fs.readFileSync("js/ui/place-card.js", "utf8");
const begin = source.indexOf("function bindPlaceCardQuizFlip(");
const end = source.indexOf("\nfunction setPlaceCardQuizImage(", begin);
assert.ok(begin >= 0 && end > begin, "canonical flip binding is available");
const bindSource = source.slice(begin, end);
const html = `<!doctype html><html lang="nb"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/css/placeCard.css">
<style>body{margin:16px;background:#333}#pcFrontCardFlip{width:240px;max-width:none}</style>
</head><body class="hg-app">
<div id="pcFrontCardFlip" class="pc-frontcard has-quiz-card" role="button" tabindex="0">
  <div class="pc-card-flip-inner">
    <div class="pc-card-face pc-card-face-front">
      <img id="pcFrontImage" alt="Front image">
    </div>
    <div class="pc-card-face pc-card-face-back">
      <div id="pcQuizCardBack" class="pc-quiz-card-back" style="background:rgb(16, 150, 90)">
        <img id="pcQuizCardImage" class="pc-quiz-card-image" alt="Legacy QuizCard">
        <div id="pcQuizCardContent" class="pc-quiz-card-content" hidden>
          <div class="pc-rendered-quiz-card"><h3>Quizkortets bakside</h3></div>
        </div>
      </div>
    </div>
  </div>
</div></body></html>`;
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  if (pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
  } else if (pathname === "/css/placeCard.css") {
    res.writeHead(200, { "content-type": "text/css; charset=utf-8" });
    res.end(fs.readFileSync("css/placeCard.css"));
  } else {
    res.writeHead(404);
    res.end("not found");
  }
});

const solid = color => "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="${color}"/></svg>`
);
const frontUrl = solid("#ed2020");
const backUrl = solid("#10965a");

async function sampledColor(locator) {
  const buffer = await locator.screenshot({ animations: "disabled" });
  const { data, info } = await sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const x = Math.floor(info.width * .83), y = Math.floor(info.height * .80);
  const offset = (y * info.width + x) * info.channels;
  return [...data.subarray(offset, offset + 3)];
}
const isRed = ([r,g,b]) => r > 160 && g < 90 && b < 90;
const isGreen = ([r,g,b]) => r < 90 && g > 120 && b < 140;

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
try {
  for (const [engine, browserType] of [["chromium", chromium], ["webkit", webkit]]) {
    const browser = await browserType.launch({ headless: true });
    try {
      for (const width of [390, 768]) {
        for (const mode of ["rendered", "image"]) {
          const page = await browser.newPage({ viewport: { width, height: 1024 } });
          try {
            await page.goto("http://127.0.0.1:" + server.address().port + "/");
            await page.evaluate(({ frontUrl, backUrl, mode }) => {
              document.getElementById("pcFrontImage").src = frontUrl;
              const img = document.getElementById("pcQuizCardImage");
              const content = document.getElementById("pcQuizCardContent");
              if (mode === "rendered") {
                img.hidden = true;
                img.style.display = "none";
                content.hidden = false;
              } else {
                img.src = backUrl;
                content.hidden = true;
              }
            }, { frontUrl, backUrl, mode });
            await page.addScriptTag({ content: "const tUI = (_key, fallback) => fallback;\n" + bindSource +
              "\nbindPlaceCardQuizFlip(document.getElementById('pcFrontCardFlip'), document.getElementById('pcQuizCardImage'));" });
            await page.waitForFunction(() => document.getElementById("pcFrontImage").naturalWidth > 0);
            const card = page.locator("#pcFrontCardFlip");
            const faces = async () => page.evaluate(() => {
              const front = document.querySelector(".pc-card-face-front");
              const back = document.querySelector(".pc-card-face-back");
              return { front: getComputedStyle(front).visibility, back: getComputedStyle(back).visibility };
            });
            assert.deepEqual(await faces(), { front: "visible", back: "hidden" },
              engine + " " + width + " " + mode + " should conceal the inactive back");
            assert.ok(isRed(await sampledColor(card)), engine + " initial front should be visible");
            await card.click();
            assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), true);
            assert.deepEqual(await faces(), { front: "hidden", back: "visible" },
              engine + " " + width + " " + mode + " should conceal the front after flip");
            assert.ok(isGreen(await sampledColor(card)),
              engine + " " + width + " " + mode + " shows the QuizCard rather than a mirrored front image");
            await card.press("Enter");
            assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), false);
            assert.ok(isRed(await sampledColor(card)), engine + " should return to front on keyboard flip");
            await card.evaluate(el => el.classList.remove("has-quiz-card"));
            await card.click();
            assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), false,
              "cannot flip cards without a resolved QuizCard");
            console.log("QuizCard visible both faces", engine, width, mode);
          } finally {
            await page.close();
          }
        }
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise(resolve => server.close(resolve));
}
