// Native app integration only: no substituted images, app functions or DataHub.
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const root = process.cwd();
const json = file => JSON.parse(fs.readFileSync(file, "utf8"));
const batch = json("data/places/production-tiers/v1-oslo-quizcards-20261019-batch03.json");
const out = process.env.HG_QUIZCARD_OUT || ".tmp/oslo-quizcards-batch03";
fs.mkdirSync(out, {recursive:true});
const types = {".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript",
  ".json":"application/json", ".css":"text/css", ".svg":"image/svg+xml",
  ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".wasm":"application/wasm"};
const server = http.createServer((request, response) => {
  const file = path.resolve(root, "." + decodeURIComponent(new URL(request.url, "http://localhost").pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404); response.end(); return;
  }
  response.writeHead(200, {"content-type":types[path.extname(file).toLowerCase()] || "application/octet-stream"});
  fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const report = {date:"2026-10-19", head:execFileSync("git", ["rev-parse","HEAD"], {encoding:"utf8"}).trim(),
  scope:"20 actual PlaceCards × 390/768 px; ten questions, correct title, pointer flip, expanded content, Escape and keyboard flip",
  photos_approved:0, v1_promoted:0, checks:[], errors:[]};
let browser;
try {
  browser = await chromium.launch({headless:true});
  for (const width of [390,768]) {
    const page = await browser.newPage({viewport:{width,height:width===390?844:1024}});
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://127.0.0.1:" + server.address().port + "/index.html", {waitUntil:"domcontentloaded"});
    // This is the app's actual welcome/readiness contract. The router may still
    // perform its initial hide after appReady alone.
    await page.waitForFunction(() => window.__HG_APP_READY__ === true && window.__HG_ROUTER_STARTED__ === true,
      null, {timeout:30000});
    await page.locator("#hgOnboardingModal .hg-onb-primary").click({timeout:2000})
      .catch(() => page.evaluate(() => window.HGOnboarding?.close?.()));
    await page.waitForTimeout(850);
    for (const row of batch.places) {
      const entry = {id:row.place_id, width, pass:false};
      try {
        const card = json(row.quizcard_file).cards.find(item => item.targetId===row.place_id);
        const place = json("data/runtime/place-open/" + row.place_id + ".json").place;
        assert.notEqual(await page.evaluate(async place => await window.openPlaceCard(place), place), false);
        // Allow the existing progressive full-record/reading hydration to settle
        // before exercising a ready card (same contract as the native photo audit).
        await page.waitForTimeout(450);
        await page.evaluate(() => document.querySelector("#hgOnboardingModal .hg-onb-close")?.click());
        await page.waitForFunction(title => {
          const node = document.querySelector("#pcQuizCardContent");
          return !node?.hidden && node?.querySelector("h3")?.textContent === title &&
            node.querySelectorAll(".pc-rendered-quiz-list > li").length === 10;
        }, card.title, {timeout:12000});
        await page.waitForTimeout(250);
        const flip = page.locator("#pcFrontCardFlip");
        assert.equal(await flip.evaluate(el => el.classList.contains("is-flipped")), false);
        await flip.scrollIntoViewIfNeeded();
        // A tall portrait can extend below the viewport. Select a visible point
        // that actually belongs to the card, then retain normal pointer checks.
        const point = await flip.evaluate(el => {
          const rect = el.getBoundingClientRect();
          for (const fraction of [.5,.75,.25,.9,.1]) {
            const y = Math.max(rect.top,0) + (Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0))*fraction;
            for (const x of [rect.left+20,rect.left+rect.width/2]) {
              const hit = document.elementFromPoint(x,y);
              if (hit && el.contains(hit)) return {x:x-rect.left,y:y-rect.top};
            }
          }
          return null;
        });
        assert.ok(point, "PlaceCard has no unobstructed pointer target");
        await flip.click({position:point});
        assert.equal(await flip.evaluate(el => el.classList.contains("is-flipped")), true);
        await page.locator("#pcQuizExpandBtn").click();
        const expanded = page.locator("#pcQuizExpanded");
        assert.equal(await expanded.evaluate(el => el.hidden), false);
        const questions = await page.locator("#pcQuizExpandedContent .pc-rendered-quiz-list > li").allTextContents();
        assert.equal(questions.length, 10);
        for (const [index,q] of card.questions.entries()) assert.ok(questions[index].includes(q.question), q.sourceQuestionId);
        const answerText = await page.locator("#pcQuizExpandedContent .pc-rendered-quiz-answer-key").textContent();
        for (const q of card.questions) assert.ok(answerText.includes(q.answer), q.sourceQuestionId + ": answer");
        await expanded.screenshot({path:path.join(out,row.place_id+"-"+width+".png")});
        await page.keyboard.press("Escape");
        assert.equal(await expanded.evaluate(el => el.hidden), true);
        await flip.focus(); await page.keyboard.press("Enter");
        assert.equal(await flip.evaluate(el => el.classList.contains("is-flipped")), false);
        await page.keyboard.press("Space");
        assert.equal(await flip.evaluate(el => el.classList.contains("is-flipped")), true);
        entry.pass = true;
      } catch (error) { entry.error = String(error.stack || error).slice(0,1800); }
      report.checks.push(entry);
      console.log("QUIZCARD", width, row.place_id, entry.pass ? "PASS" : entry.error);
    }
    report.errors.push(...errors.map(error => ({width,error})));
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  report.summary = {places:20,checks:report.checks.length,passed:report.checks.filter(x=>x.pass).length,
    failed:report.checks.filter(x=>!x.pass).length,appErrors:report.errors.length};
  fs.writeFileSync(path.join(out,"report.json"), JSON.stringify(report,null,2)+"\n");
}
assert.equal(report.summary.checks,40);
assert.equal(report.summary.failed,0);
assert.equal(report.summary.appErrors,0);
