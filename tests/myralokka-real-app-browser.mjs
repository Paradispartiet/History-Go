#!/usr/bin/env node
// Myraløkka: verify the real PlaceCard, QuizCard flip, active quiz and Fagverk
// with touch/mobile, iPad-sized WebKit and desktop Chromium. This is distinct
// from static JSON parity. Run from repo root with installed Playwright browsers.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, webkit } from 'playwright';

const root = process.cwd();
const id = 'myralokka';
const sourcePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/myralokka.json';
const quizPath = 'data/quiz/natur/myralokka_sets.json';
const quizCardPath = 'data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json';
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

const placeManifest = read('data/places/manifest.json');
const quizManifest = read('data/quiz/manifest.json');
const cardManifest = read('data/quizcards/natur/manifest.json');
const sourcePlace = read(sourcePath);
const runtime = read('data/runtime/place-open/' + id + '.json').place;
const quiz = read(quizPath);
const card = read(quizCardPath).cards.find(row => row.targetId === id);
const registry = read('data/fagverk/fagverk_registry.json');

assert.equal(sourcePlace.id, id);
assert.equal(runtime.id, id);
assert.ok(placeManifest.files.includes(sourcePath.replace(/^data\//, '')));
assert.ok(quizManifest.sets.some(row => row.targetId === id));
assert.ok(cardManifest.collections.includes('topp10_natur_akerselva_v1_batch02.json'));
assert.equal(registry.placeLinks[id].status, 'in_production');
assert.equal(runtime.fagverk.status, 'in_production');
assert.ok(sourcePlace.image && sourcePlace.frontImage && sourcePlace.cardImage);
assert.ok(fs.existsSync(path.join(root, sourcePlace.image)));
assert.ok(fs.existsSync(path.join(root, sourcePlace.frontImage)));
assert.ok(fs.existsSync(path.join(root, sourcePlace.cardImage)));
assert.equal(quiz.sets.length, 6);
const questions = quiz.sets.flatMap(set => set.questions);
assert.equal(questions.length, 42);
assert.equal(questions.filter(q => q.knowledge_link_status === 'linked').length, 40);
assert.equal(card.questions.length, 10);
const byId = new Map(questions.map(q => [q.id, q]));
for (const q of card.questions) {
  const source = byId.get(q.sourceQuestionId);
  assert.ok(source, 'QuizCard references a missing fullquiz question');
  assert.equal(source.knowledge_link_status, 'linked');
  assert.equal(q.question, source.question);
  assert.equal(q.answer, source.answer);
  assert.equal(q.answerIndex, source.answerIndex);
}

const mime = {
 '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json',
 '.css':'text/css', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2'
};
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, {'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const outDir = 'artifacts/myralokka-real-app';
fs.mkdirSync(outDir, {recursive:true});
const modes = [
  {name:'phone-390',engine:chromium,width:390,height:844,mobile:true,touch:true},
  {name:'ipad-webkit-834',engine:webkit,width:834,height:1112,mobile:true,touch:true},
  {name:'desktop-1440',engine:chromium,width:1440,height:1000,mobile:false,touch:false}
];
try {
  for (const mode of modes) {
    const browser = await mode.engine.launch({
      headless:true,
      ...(mode.engine === chromium ? {args:['--no-sandbox','--disable-dev-shm-usage']} : {})
    });
    const context = await browser.newContext({
      viewport:{width:mode.width,height:mode.height},
      isMobile:mode.mobile,hasTouch:mode.touch,locale:'nb-NO'
    });
    try {
      await context.addInitScript(() => {
        localStorage.setItem('hg_onboarding_shown_v1','1');
        localStorage.setItem('HG_TEST_MODE','1');
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.goto(base + '/index.html?hgTest=1#/place/' + id, {waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(id => window.__HG_APP_READY__ === true &&
        window.__HG_ROUTER_STARTED__ === true &&
        document.querySelector('#placeCard')?.dataset.currentPlaceId === id, id, {timeout:90000});
      await page.waitForFunction(() => document.querySelector('#pcFrontImage')?.complete &&
        document.querySelector('#pcFrontImage')?.naturalWidth > 0, null, {timeout:45000});
      const text = await page.locator('#placeCard').innerText();
      assert.ok(text.length > 120, id + ': PlaceCard lacks substantive text');
      await page.waitForFunction(() =>
        document.querySelector('#pcQuizCardContent .pc-rendered-quiz-card') &&
        document.querySelector('#pcFrontCardFlip')?.classList.contains('has-quiz-card'),
      null,{timeout:45000});
      const front = page.locator('#pcFrontCardFlip');
      const size = await front.boundingBox();
      assert.ok(size, 'PlaceCard flip not visible');
      const position = {x:22,y:Math.max(24,size.height-25)};
      await front.click({position,timeout:12000});
      await page.waitForFunction(() => document.querySelector('#pcFrontCardFlip')?.classList.contains('is-flipped'),
        null,{timeout:14000});
      assert.equal(await page.locator('#pcQuizCardContent li').count(),10,'QuizCard list not complete');
      await page.screenshot({path:`${outDir}/${mode.name}-flipped.png`});
      await page.locator('#pcQuizExpandBtn').click({timeout:12000});
      await page.locator('#pcQuizExpanded').waitFor({state:'visible',timeout:12000});
      assert.equal(await page.locator('#pcQuizExpandedContent li').count(),10,'Expanded QuizCard list incomplete');
      await page.locator('#pcQuizExpandedClose').click({timeout:12000});
      await front.click({position,timeout:12000});
      await page.locator('#pcQuiz').click({timeout:18000});
      await page.waitForFunction(id => location.hash.startsWith('#/quiz/' + id), id,{timeout:25000});
      await page.waitForFunction(() => document.querySelector('#quizChoices button:not(:disabled)'),null,{timeout:30000});
      const shown = (await page.locator('#quizQuestion').innerText()).trim();
      assert.ok(questions.some(q => q.question === shown), 'Quiz question not in canonical Myraløkka fullquiz: ' + shown);
      await page.screenshot({path:`${outDir}/${mode.name}-quiz.png`});
      await page.goto(base + '/fagverk-sted.html?place=' + id,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(() => document.querySelector('#fagverkPlaceContent')?.hidden === false,
        null,{timeout:45000});
      assert.match(await page.locator('#fagverkPlaceTitle').innerText(), /Myraløkka/u);
      // Draft Fagverk intentionally hides unapproved lessons; curated Fagverk must expose them.
      if (sourcePlace.fagverk.status === 'curated') {
        assert.ok((await page.locator('#fagverkPlaceLenses a').count()) >= 2,
          'Curated Fagverk must expose operational learning lenses');
      } else {
        assert.equal((await page.locator('#fagverkPlaceCoverageStatus').innerText()).trim(),
          'Fagverk under produksjon');
        assert.equal(await page.locator('#fagverkPlaceUnfinished').isVisible(), true,
          'Draft Fagverk must be transparently marked unfinished');
        assert.equal(await page.locator('#fagverkPlaceLensesSection').isVisible(), false,
          'Draft Fagverk must not display unapproved learning lenses');
        assert.ok((await page.locator('#fagverkPlaceEmner a').count()) >= 2,
          'Draft Fagverk must still expose documented emne navigation');
      }
      await page.screenshot({path:`${outDir}/${mode.name}-fagverk.png`});
      assert.deepEqual(errors,[],mode.name + ': page errors');
      console.log('PASS', mode.name, 'PlaceCard photo, QuizCard flip/expand, fullquiz route, Fagverk');
    } finally {
      await context.close();
      await browser.close();
    }
  }
} finally {
  await new Promise(resolve => server.close(resolve));
}
