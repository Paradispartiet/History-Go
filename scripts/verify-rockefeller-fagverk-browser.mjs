#!/usr/bin/env node
// Rockefeller v1: real browser QA for the curated Place-owned Fagverk page.
// Uses localhost's documented CI login bypass; production authentication remains unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const placeId = 'rockefeller';
const root = process.cwd();
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const place = read('data/places/musikk/oslo/places_musikk/rockefeller.json');
const runtime = read('data/runtime/place-open/rockefeller.json');
const registry = read('data/fagverk/fagverk_registry.json');
assert.equal(place.id, placeId);
assert.equal(place.fagverk?.status, 'curated');
assert.equal(registry.placeLinks[placeId]?.field, 'fagverk');
assert.deepEqual(runtime.place?.fagverk, place.fagverk, 'Runtime Fagverk must match canonical data');

const mime = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'};
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  const absolute = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    res.writeHead(404); res.end('Not found'); return;
  }
  res.writeHead(200, {'Content-Type':mime[path.extname(absolute).toLowerCase()] || 'application/octet-stream'});
  res.end(fs.readFileSync(absolute));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const output = path.join(root, 'artifacts/rockefeller-v1-browser');
fs.mkdirSync(output, { recursive: true });
let browser;
const results = [];
try {
  browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_BIN || undefined, args:['--no-sandbox','--disable-dev-shm-usage']});
  for (const profile of [
    {name:'desktop', viewport:{width:1440,height:1000}},
    {name:'mobile', viewport:{width:390,height:844}, isMobile:true, hasTouch:true}
  ]) {
    const context = await browser.newContext({viewport:profile.viewport,isMobile:!!profile.isMobile,hasTouch:!!profile.hasTouch});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error?.stack || error)));
    try {
      await page.goto(base + '/fagverk-sted.html?place=rockefeller', {waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(() => {
        const content = document.getElementById('fagverkPlaceContent');
        const error = document.getElementById('fagverkPlaceError');
        return content?.hidden === false || error?.hidden === false;
      }, null, {timeout:90000});
      const snapshot = await page.evaluate(() => {
        const q = selector => document.querySelector(selector);
        const image = q('#fagverkPlaceImage');
        return {
          placeId:document.body.dataset.placeId,
          title:q('#fagverkPlaceTitle')?.textContent?.trim() || '',
          status:q('#fagverkPlaceCoverageStatus')?.textContent?.trim() || '',
          lead:q('#fagverkPlaceLead')?.textContent?.trim() || '',
          articleCount:document.querySelectorAll('#fagverkPlaceArticle > p').length,
          lenses:document.querySelectorAll('#fagverkPlaceLenses a').length,
          questions:document.querySelectorAll('#fagverkPlaceQuestions li').length,
          traces:document.querySelectorAll('#fagverkPlaceTraces article').length,
          chapters:document.querySelectorAll('#fagverkPlaceChapters a').length,
          sources:document.querySelectorAll('#fagverkPlaceSources a[href^="http"]').length,
          unfinished:q('#fagverkPlaceUnfinished')?.hidden === false,
          image:{hidden:image?.hidden,complete:image?.complete,naturalWidth:image?.naturalWidth},
          error:q('#fagverkPlaceError')?.textContent?.trim() || '',
          horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),
          authVerified:document.documentElement.classList.contains('hg-auth-verified'),
        };
      });
      fs.writeFileSync(path.join(output, profile.name + '-fagverk.json'), JSON.stringify({snapshot, errors},null,2)+'\n');
      await page.screenshot({path:path.join(output, profile.name + '-fagverk.png'),fullPage:true});
      assert.equal(snapshot.error,'',snapshot.error);
      assert.equal(snapshot.placeId,placeId);
      assert.match(snapshot.title,/Rockefeller/i);
      assert.equal(snapshot.status,'Kuratert stedsfagverk');
      assert.ok(snapshot.lead.length>=70,'Curated Fagverk introduction missing');
      assert.ok(snapshot.articleCount>=3,'Three unique historical Fagverk sections must render');
      assert.ok(snapshot.lenses>=3,'Canonical music lenses must resolve');
      assert.ok(snapshot.questions>=4,'Historical questions must render');
      assert.ok(snapshot.traces>=2,'Source-bound local observations must render');
      assert.ok(snapshot.chapters>=2,'Canonical music chapters must resolve');
      assert.ok(snapshot.sources>=4,'Source links must be visible');
      assert.equal(snapshot.unfinished,false,'Curated Fagverk must not render unfinished fallback');
      assert.equal(snapshot.image.hidden,false,'Place image must be visible');
      assert.ok(snapshot.image.complete && snapshot.image.naturalWidth>0,'Place image must load');
      assert.ok(snapshot.horizontalOverflow<=4,'Mobile/desktop horizontal overflow');
      assert.equal(snapshot.authVerified,true,'Local CI authentication bypass must be active');
      assert.deepEqual(errors,[],'Fagverk must not throw browser errors');
      results.push({profile:profile.name,passed:true,snapshot});
      console.log('PASS: Rockefeller curated Fagverk browser — '+profile.name);

      // The independent Fagverk check alone is not enough to approve PlaceCard v1.
      // Check the actual image surfaces, People collection and QuizCard flip.
      await page.goto(base + '/index.html?hgTest=1#/place/rockefeller', {waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(() => window.__HG_APP_READY__ === true &&
        window.__HG_ROUTER_STARTED__ === true &&
        document.getElementById('placeCard')?.dataset.currentPlaceId === 'rockefeller', null, {timeout:90000});
      await page.waitForFunction(() => {
        const img = document.getElementById('pcFrontImage');
        const header = document.getElementById('pcHeaderImage');
        const people = document.getElementById('pcPeopleIcon');
        const flip = document.getElementById('pcFrontCardFlip');
        const quiz = document.getElementById('pcQuizCardContent');
        return img?.complete && img.naturalWidth > 0
          && header?.complete && header.naturalWidth > 0
          && Number(people?.dataset.collectionItemCount || 0) >= 3
          && people.hidden === false
          && flip?.classList.contains('has-quiz-card')
          && quiz?.hidden === false && (quiz.textContent || '').trim().length > 20;
      }, null, {timeout:90000});
      const placeCard = await page.evaluate(() => {
        const q = selector => document.querySelector(selector);
        const image = selector => {
          const el = q(selector);
          return {src:el?.getAttribute('src') || '',complete:el?.complete,naturalWidth:el?.naturalWidth};
        };
        const people = q('#pcPeopleIcon');
        const quiz = q('#pcQuizCardContent');
        const card = q('#placeCard');
        return {
          placeId:card?.dataset.currentPlaceId,
          title:q('#pcTitle')?.textContent?.trim() || '',
          header:image('#pcHeaderImage'),
          portrait:image('#pcFrontImage'),
          peopleCount:Number(people?.dataset.collectionItemCount || 0),
          peopleVisible:people?.hidden === false && people?.getAttribute('aria-hidden') !== 'true',
          quizReady:q('#pcFrontCardFlip')?.classList.contains('has-quiz-card') === true,
          quizTextLength:(quiz?.textContent || '').trim().length,
          horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth)
        };
      });
      assert.equal(placeCard.placeId,placeId);
      assert.match(placeCard.title,/Rockefeller/);
      assert.ok(placeCard.header.naturalWidth>0,'Hero must load its licensed location image');
      assert.ok(placeCard.portrait.naturalWidth>0,'Portrait must load its separately encoded licensed image');
      assert.ok(placeCard.peopleCount>=3 && placeCard.peopleVisible,'Three existing People must be visible in PlaceCard');
      assert.ok(placeCard.quizReady && placeCard.quizTextLength>20,'QuizCard content must actually load');
      assert.ok(placeCard.horizontalOverflow<=4,'PlaceCard must not overflow horizontally');
      await page.screenshot({path:path.join(output,profile.name+'-placecard.png'),fullPage:true});
      await page.locator('#pcFrontCardFlip').click({timeout:15000});
      await page.waitForFunction(() => document.getElementById('pcFrontCardFlip')?.classList.contains('is-flipped')===true, null, {timeout:10000});
      const backFace=await page.locator('.pc-card-face-back').evaluate(el => ({
        visibility:getComputedStyle(el).visibility,
        text:(el.textContent || '').trim()
      }));
      assert.equal(backFace.visibility,'visible','QuizCard reverse must be visible after flip');
      assert.ok(backFace.text.length>20,'QuizCard reverse must contain rendered questions');
      await page.screenshot({path:path.join(output,profile.name+'-quizcard-flipped.png'),fullPage:true});
      results.at(-1).placeCard={...placeCard,quizCardFlipped:true};
      console.log('PASS: Rockefeller PlaceCard hero, portrait, People and QuizCard flip — '+profile.name);
    } finally { await context.close(); }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(results,null,2)+'\n');
