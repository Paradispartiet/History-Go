#!/usr/bin/env node
// Full real-app quiz playthrough, including persisted progress and reward.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const placeId = process.argv[2];
assert.match(placeId || '', /^[a-z0-9_]+$/, 'Require a canonical place ID');
const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync('data/quiz/manifest.json', 'utf8'));
const entries = manifest.sets.filter(entry => entry.targetId === placeId);
assert.equal(entries.length, 1, 'Exactly one active quiz manifest target');
const quiz = JSON.parse(fs.readFileSync(entries[0].file, 'utf8'));
assert.equal(quiz.targetId, placeId);
const questions = quiz.sets.flatMap(set => set.questions);
assert.equal(new Set(questions.map(q => q.question)).size, questions.length);
questions.forEach(q => assert.equal(q.options[q.answerIndex], q.answer, q.id));
const mime = {'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'};
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end('Not found'); return;
  }
  res.writeHead(200, {'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream'});
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const output = path.join(root, 'artifacts', 'place-quiz', placeId);
fs.mkdirSync(output, {recursive:true});
const profiles = [
  {name:'desktop', viewport:{width:1440,height:1000}},
  {name:'mobile', viewport:{width:390,height:844}, isMobile:true, hasTouch:true}
];
let browser;
const reports = [];
try {
  browser = await chromium.launch({
    headless: true, executablePath: process.env.CHROME_BIN || undefined,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport:profile.viewport, isMobile:profile.isMobile||false, hasTouch:profile.hasTouch||false
    });
    await context.addInitScript(() => {
      localStorage.setItem('hg_onboarding_shown_v1','1');
      localStorage.setItem('HG_TEST_MODE','1');
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(String(err?.stack || err)));
    try {
      await page.goto(base + '/index.html?hgTest=1#/place/' + placeId, {waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(id => window.__HG_APP_READY__ === true &&
        window.__HG_ROUTER_STARTED__ === true &&
        document.querySelector('#placeCard')?.dataset.currentPlaceId === id,
        placeId,{timeout:90000});
      await page.waitForFunction(() => typeof window.QuizEngine?.getTargetSummary === 'function',null,{timeout:60000});
      const before = await page.evaluate(id => window.QuizEngine.getTargetSummary(id),placeId);
      assert.equal(before.mode,'sets');
      assert.equal(before.totalSets,quiz.sets.length);
      assert.equal(before.completedSets,0);
      const physicalBefore = await page.evaluate(id => Boolean(window.HGPhysicalVisits?.isVisited?.(id) || window.visited?.[id]),placeId);
      await page.evaluate(() => {
        window.__QA_UNLOCKS__ = [];
        window.addEventListener('hg:target-unlock',e => window.__QA_UNLOCKS__.push(e.detail));
        // Current product contract: digital quiz is independent of physical visits.
        window.TEST_MODE = false;
        window.QuizEngine.init({quizFeedbackMs:120});
      });
      await page.locator('#pcQuiz').click({timeout:20000});
      await page.waitForFunction(id => location.hash.startsWith('#/quiz/' + id),placeId,{timeout:15000});
      for (let si=0;si<quiz.sets.length;si++) {
        const set = quiz.sets[si];
        for (const [qi,q] of set.questions.entries()) {
          await page.waitForFunction(expected => document.querySelector('#quizQuestion')?.textContent?.trim() === expected,
            q.question,{timeout:20000});
          assert.equal(await page.locator('#quizChoices button').count(),q.options.length,set.set_id + ':' + qi);
          await page.locator('#quizChoices').getByRole('button',{name:q.answer,exact:true}).click({timeout:20000});
        }
        await page.waitForFunction(id => JSON.parse(localStorage.getItem('hg_quiz_sets_v1')||'{}')[id]?.completed === true,
          set.set_id,{timeout:20000});
        await page.locator('#quizSummaryPrimary').waitFor({state:'visible',timeout:20000});
        const status = await page.evaluate(id => window.QuizEngine.getTargetSummary(id),placeId);
        assert.equal(status.completedSets,si+1,'Each set advances progress once');
        if(si+1<quiz.sets.length) await page.locator('#quizSummaryPrimary').click();
      }
      await page.waitForFunction(id => (window.__QA_UNLOCKS__||[]).some(e => e.kind==='place'&&e.id===id),
        placeId,{timeout:20000});
      const after = await page.evaluate(async id => ({
        summary: await window.QuizEngine.getTargetSummary(id),
        physical: Boolean(window.HGPhysicalVisits?.isVisited?.(id)||window.visited?.[id]),
        learningEvents: (JSON.parse(localStorage.getItem('hg_learning_log_v1')||'[]')||[])
          .filter(e => e.parentTargetId===id&&e.type==='quiz_set_complete').length,
        placeUnlocks: (window.__QA_UNLOCKS__||[]).filter(e=>e.kind==='place'&&e.id===id).length
      }),placeId);
      assert.equal(after.summary.isComplete,true);
      assert.equal(after.summary.completedSets,quiz.sets.length);
      assert.equal(after.learningEvents,quiz.sets.length);
      assert.equal(after.placeUnlocks,1);
      assert.equal(after.physical,physicalBefore,'Quiz must never record a physical visit');
      reports.push({profile:profile.name,placeId,questions:questions.length,after,pageErrors:errors});
      await page.screenshot({path:path.join(output,profile.name+'-pass.png'),fullPage:true});
      console.log('PASS: '+placeId+' / '+profile.name+': '+questions.length+' questions, '+quiz.sets.length+' sets, reward and no physical visit write');
    } catch (err) {
      await page.screenshot({path:path.join(output,profile.name+'-failed.png'),fullPage:true}).catch(()=>{});
      fs.writeFileSync(path.join(output,profile.name+'-errors.json'),JSON.stringify({message:String(err),errors},null,2));
      throw err;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(reports,null,2)+'\n');
