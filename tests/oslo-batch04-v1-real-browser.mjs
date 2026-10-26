// Native app integration only: no substituted images, app functions or DataHub.
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const root = process.cwd();
const json = file => JSON.parse(fs.readFileSync(file, "utf8"));
const ids = ["grunnlovsbygget_bankplassen","akershus_kaier","oslo_mek","grensen_kjopesenter","vippetangen_fisketorg","frysja_industriomrade","norges_varemesse","bryn_industriomrade","gronlikaia","christiania_seildugsfabrik","sagene_skole","stortorget","norges_bank_bankplassen_4","gamle_trikkestallen","gamle_radhus","grev_wedels_plass","sofienbergparken"];
const shard = Number(process.argv[2]);
assert.ok(Number.isInteger(shard) && shard>=0 && shard<4,"Pass shard 0-3");
const selected = ids.filter((id,index)=>index%4===shard);
const files = ["data/quizcards/naeringsliv/topp10_naeringsliv_oslo_v1_batch02.json","data/quizcards/by/topp10_by_kort_batch8.json","data/quizcards/historie/topp10_historie_oslo_minimum_v1_batch4.json"];
const cards = files.flatMap(file=>json(file).cards).filter(card=>ids.includes(card.targetId));
assert.equal(ids.length,17);
assert.equal(cards.length,17);
const out = process.env.HG_QUIZCARD_OUT || "artifacts/oslo-batch04-v1-browser/shard-"+shard;
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
const report = {date:"2026-10-22", head:execFileSync("git", ["rev-parse","HEAD"], {encoding:"utf8"}).trim(),
  scope:"Oslo-bolk 04: actual PlaceCard, portrait image, 10-question QuizCard flip/reader, Fagverk at 390/1440 px and 503 fullquiz questions across the full four-shard matrix",
  photos_approved:0, v1_promoted:0, checks:[], errors:[]};
let browser;
try {
  browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN || undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  for (const width of [390,1440]) {
    const page = await browser.newPage({viewport:{width,height:width===390?844:1000},isMobile:width===390,hasTouch:width===390});
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
    for (const placeId of selected) {
      const row = {place_id:placeId};
      const entry = {id:row.place_id, width, pass:false};
      try {
        const card = cards.find(item=>item.targetId===row.place_id);
        assert.ok(card,row.place_id+": QuizCard is missing");
        const place = json("data/runtime/place-open/" + row.place_id + ".json").place;
        assert.notEqual(await page.evaluate(async place => await window.openPlaceCard(place), place), false);
        // Allow the existing progressive full-record/reading hydration to settle
        // before exercising a ready card (same contract as the native photo audit).
        await page.waitForTimeout(450);
        await page.waitForFunction(()=>document.querySelector('#pcFrontImage')?.complete && document.querySelector('#pcFrontImage')?.naturalWidth>0, null,{timeout:25000});
        const img = await page.locator('#pcFrontImage').evaluate(el=>({src:el.currentSrc||el.src,width:el.naturalWidth,height:el.naturalHeight}));
        assert.ok(img.width>0&&img.height>0,row.place_id+': portrait image not decoded');
        assert.ok(img.src.includes((place.frontImage||place.image).split('/').at(-1)),row.place_id+': unexpected portrait displayed');
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
        const fag = await browser.newPage({viewport:{width,height:width===390?844:1000},isMobile:width===390,hasTouch:width===390});
        try{
          await fag.goto("http://127.0.0.1:"+server.address().port+"/fagverk-sted.html?place="+row.place_id,{waitUntil:"domcontentloaded",timeout:75000});
          await fag.waitForFunction(()=>document.querySelector('#fagverkPlaceContent')?.hidden===false,null,{timeout:30000});
          assert.ok((await fag.locator('#fagverkPlaceTitle').innerText()).trim().length>3,row.place_id+": Fagverk title missing");
          assert.ok((await fag.locator('#fagverkPlaceQuestions li').count())>=4,row.place_id+": Fagverk questions missing");
          assert.ok((await fag.locator('#fagverkPlaceLenses a').count())>=3,row.place_id+": Fagverk lenses missing");
          assert.equal(await fag.locator('#fagverkPlaceError').isHidden(),true,row.place_id+": Fagverk error");
          entry.fagverk = true;
        }finally{await fag.close();}
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
  report.summary = {places:selected.length,checks:report.checks.length,passed:report.checks.filter(x=>x.pass).length,
    failed:report.checks.filter(x=>!x.pass).length,appErrors:report.errors.length};
  fs.writeFileSync(path.join(out,"report.json"), JSON.stringify(report,null,2)+"\n");
}
assert.equal(report.summary.checks,selected.length*2);
assert.equal(report.summary.failed,0);
assert.equal(report.summary.appErrors,0);
// Each canonical fullquiz is played through in the real app at both widths;
// the shared verifier also asserts earned set progress, the one-time unlock,
// and that a digital quiz cannot silently create a physical visit.
for(const id of selected){
  console.log("FULLQUIZ START",id);
  execFileSync(process.execPath,["scripts/verify-place-quiz-browser.mjs",id],{stdio:"inherit",env:process.env,timeout:12*60*1000});
  console.log("FULLQUIZ PASS",id);
}
