import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import { chromium, webkit } from "playwright";
import sharp from "sharp";

// Exercise the shipping flip handler and stylesheet, rather than duplicating their behavior.
const source = fs.readFileSync("js/ui/place-card.js", "utf8");
const liveMarkup = fs.readFileSync("index.html", "utf8");
for (const id of ["pcQuizExpandBtn", "pcQuizExpanded", "pcQuizExpandedClose", "pcQuizExpandedContent"]) {
  assert.ok(liveMarkup.includes(`id="${id}"`), `production PlaceCard must contain ${id}`);
}
const begin = source.indexOf("function bindPlaceCardQuizFlip(");
const end = source.indexOf("\nfunction setPlaceCardQuizImage(", begin);
assert.ok(begin >= 0 && end > begin, "canonical flip binding is available");
const bindSource = source.slice(begin, end);
const html = `<!doctype html><html lang="nb"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/css/placeCard.css">
<style>body{margin:16px;background:#333}#pcFrontCardFlip{width:240px;max-width:none}</style>
</head><body class="hg-app">
<div id="placeCard" class="is-open"><h2 id="pcTitle">Teststed</h2>
<div id="pcFrontCardFlip" class="pc-frontcard has-quiz-card" role="button" tabindex="0">
  <div class="pc-card-flip-inner">
    <div class="pc-card-face pc-card-face-front">
      <img id="pcFrontImage" alt="Front image">
    </div>
    <div class="pc-card-face pc-card-face-back">
      <div id="pcQuizCardBack" class="pc-quiz-card-back" style="background:rgb(16, 150, 90)">
        <img id="pcQuizCardImage" class="pc-quiz-card-image" alt="Legacy QuizCard">
        <div id="pcQuizCardContent" class="pc-quiz-card-content" hidden>
          <div class="pc-rendered-quiz-card">
            <div class="pc-rendered-quiz-head"><div class="pc-rendered-quiz-kicker">Historiequiz</div>
              <h3>Quizkortets bakside</h3><p>60 spørsmål</p></div>
            <ol class="pc-rendered-quiz-list">
              ${Array.from({length:60}, (_,i)=>`<li>Historisk spørsmål ${i+1}
                <div class="pc-rendered-quiz-options"><span class="pc-rendered-quiz-option">
                  <span class="pc-rendered-quiz-option-label">A</span><span>Eksempelsvar</span>
                </span></div></li>`).join("")}
            </ol>
            <div class="pc-rendered-quiz-answer-key"><strong>Fasit:</strong> 1. A</div>
          </div>
        </div>
        <button id="pcQuizExpandBtn" class="pc-quiz-expand-btn" type="button" aria-label="Vis quizkort stort">⛶</button>
      </div>
    </div>
  </div>
</div>
<section id="pcQuizExpanded" class="pc-quiz-expanded" role="dialog" hidden>
  <div class="pc-quiz-expanded-toolbar"><strong id="pcQuizExpandedTitle">Quizkort</strong>
    <button id="pcQuizExpandedClose" class="pc-quiz-expanded-close" type="button">Lukk</button></div>
  <div id="pcQuizExpandedContent" class="pc-quiz-expanded-content"></div>
</section></div></body></html>`;
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
            if (mode === "rendered") {
              const theme = await page.locator(".pc-rendered-quiz-card").evaluate(el => ({
                background: getComputedStyle(el).backgroundImage,
                color: getComputedStyle(el).color,
                border: getComputedStyle(el).borderTopStyle
              }));
              assert.match(theme.background, /gradient/,
                engine + " rendered QuizCard uses the dark decorated surface");
              assert.equal(theme.color, "rgb(248, 250, 252)",
                engine + " rendered QuizCard uses readable near-white text");
              assert.equal(theme.border, "solid",
                engine + " rendered QuizCard has a decorative border");
              const compactFont = await card.evaluate(el => ({
                heading: parseFloat(getComputedStyle(el.querySelector(".pc-rendered-quiz-head h3")).fontSize),
                question: parseFloat(getComputedStyle(el.querySelector(".pc-rendered-quiz-list")).fontSize),
                option: parseFloat(getComputedStyle(el.querySelector(".pc-rendered-quiz-options")).fontSize),
                answer: parseFloat(getComputedStyle(el.querySelector(".pc-rendered-quiz-answer-key")).fontSize),
                scrolls: el.querySelector(".pc-quiz-card-content").scrollHeight > el.querySelector(".pc-quiz-card-content").clientHeight
              }));
              assert.ok(compactFont.heading >= 22 && compactFont.question >= 15 &&
                compactFont.option >= 14 && compactFont.answer >= 12,
                engine + " compact QuizCard has legible larger typography");
              assert.ok(compactFont.scrolls,
                engine + " compact QuizCard retains its internal scroll with larger text");
            } else {
              assert.ok(isGreen(await sampledColor(card)),
                engine + " image QuizCard retains its source artwork");
            }
            const expand = page.locator("#pcQuizExpandBtn");
            assert.equal(await expand.isVisible(), true,
              engine + " must show expand control in bottom right of QuizCard back");
            await expand.click();
            const fullView = page.locator("#pcQuizExpanded");
            assert.equal(await fullView.isVisible(), true, "expanded QuizCard is visible");
            assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")), true,
              "tapping expansion control must not flip the card to its front");
            const bounds = await page.evaluate(() => {
              const sheet = document.getElementById("placeCard").getBoundingClientRect();
              const overlay = document.getElementById("pcQuizExpanded").getBoundingClientRect();
              return {sheet:{left:sheet.left,top:sheet.top,right:sheet.right,bottom:sheet.bottom},
                overlay:{left:overlay.left,top:overlay.top,right:overlay.right,bottom:overlay.bottom}};
            });
            for (const edge of ["left","top","right","bottom"]) {
              assert.ok(Math.abs(bounds.sheet[edge]-bounds.overlay[edge]) <= 2,
                engine + " enlarged QuizCard must fill PlaceCard edge " + edge);
            }
            if (mode === "rendered") {
              assert.match(await page.locator("#pcQuizExpandedContent").innerText(), /Quizkortets bakside/);
              const expandedTheme = await page.locator("#pcQuizExpandedContent").evaluate(el => ({
                color: getComputedStyle(el).color,
                background: getComputedStyle(el).backgroundImage,
                border: getComputedStyle(el).borderTopWidth
              }));
              assert.equal(expandedTheme.color, "rgb(248, 250, 252)",
                "large rendered QuizCard has white lettering");
              assert.match(expandedTheme.background, /gradient/,
                "large rendered QuizCard uses a dark background");
              assert.equal(expandedTheme.border, "2px",
                "large rendered QuizCard has an outer frame");
              const expandedFont = await page.locator("#pcQuizExpandedContent").evaluate(el => ({
                heading: parseFloat(getComputedStyle(el.querySelector(".pc-rendered-quiz-head h3")).fontSize),
                question: parseFloat(getComputedStyle(el.querySelector(".pc-rendered-quiz-list")).fontSize),
                option: parseFloat(getComputedStyle(el.querySelector(".pc-rendered-quiz-options")).fontSize),
                answer: parseFloat(getComputedStyle(el.querySelector(".pc-rendered-quiz-answer-key")).fontSize)
              }));
              assert.ok(expandedFont.heading >= 27 && expandedFont.question >= 19 &&
                expandedFont.option >= 17 && expandedFont.answer >= 16,
                engine + " expanded QuizCard uses enlarged readable typography");
              const scrolling = await page.locator("#pcQuizExpandedContent").evaluate(el =>
                ({ scrollHeight:el.scrollHeight, clientHeight:el.clientHeight }));
              assert.ok(scrolling.scrollHeight > scrolling.clientHeight,
                "long QuizCard has an independently scrollable reading surface");
            } else {
              assert.equal(await page.locator("#pcQuizExpandedContent > img").count(),1,
                "image based QuizCard expands without replacing original source");
              await page.waitForFunction(() => document.querySelector("#pcQuizExpandedContent > img")?.naturalWidth > 0);
            }
            await page.keyboard.press("Escape");
            assert.equal(await fullView.isVisible(), false, "Escape closes enlarged QuizCard");
            assert.equal(await expand.evaluate(el => document.activeElement === el),true,
              "focus returns to expand control on close");
            await expand.click();
            await page.locator("#pcQuizExpandedClose").click();
            assert.equal(await fullView.isVisible(), false, "close button dismisses enlarged QuizCard");
            assert.equal(await card.evaluate(el => el.classList.contains("is-flipped")),true,
              "closing expanded view preserves the QuizCard side");
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
