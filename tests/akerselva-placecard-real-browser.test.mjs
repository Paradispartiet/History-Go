#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const place = JSON.parse(fs.readFileSync('data/places/by/oslo/places/akerselva.json', 'utf8'));
const translations = Object.fromEntries(['en', 'es', 'pt'].map(lang => [
  lang, JSON.parse(fs.readFileSync(`data/i18n/content/places/${lang}.json`, 'utf8')).akerselva
]));
assert.equal(place.id, 'akerselva');
assert.ok(place.image && place.image === place.cardImage);

const mime = {'.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript',
  '.json':'application/json', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png',
  '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2'};
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('bad path'); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, {'content-type':mime[path.extname(file).toLowerCase()] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

const base = `http://127.0.0.1:${server.address().port}`;
const output = path.join(root, 'artifacts', 'akerselva-placecard-browser');
fs.mkdirSync(output, {recursive:true});
const results = [];
let browser;
try {
  browser = await chromium.launch({headless:true,
    executablePath: process.env.CHROME_BIN || undefined,
    args:['--no-sandbox','--disable-dev-shm-usage']});
  for (const viewport of [{width:390,height:844,mobile:true}, {width:1440,height:960,mobile:false}]) {
    const tag = viewport.mobile ? 'mobile' : 'desktop';
    const errors = [];
    const context = await browser.newContext({
      viewport: {width:viewport.width,height:viewport.height},
      isMobile:viewport.mobile, hasTouch:viewport.mobile, locale:'nb-NO'
    });
    let page;
    try {
      await context.addInitScript(() => {
        localStorage.setItem('hg_onboarding_shown_v1', '1');
        localStorage.setItem('HG_TEST_MODE', '1');
        localStorage.setItem('hg_lang', 'nb');
      });
      page = await context.newPage();
      page.on('pageerror', error => errors.push(String(error.message)));
      await page.goto(base + '/index.html?hgTest=1#/place/akerselva',
        {waitUntil:'domcontentloaded',timeout:80000});
      await page.waitForFunction(() => window.__HG_APP_READY__ === true &&
        window.__HG_ROUTER_STARTED__ === true &&
        document.querySelector('#placeCard')?.dataset.currentPlaceId === 'akerselva' &&
        !!window.HG_I18N?.setLang, null, {timeout:85000});

      const readDesc = () => page.locator('#pcDesc').textContent();
      await page.waitForFunction(expected =>
        document.getElementById('pcDesc')?.textContent === expected, place.desc, {timeout:20000});
      assert.equal(await readDesc(), place.desc, tag + ': Norwegian description');

      const image = page.locator('#pcFrontImage');
      const header = page.locator('#pcHeaderImage');
      await page.waitForFunction(() => {
        const front = document.getElementById('pcFrontImage');
        const hero = document.getElementById('pcHeaderImage');
        return front?.complete && front.naturalWidth > 0 &&
          hero?.complete && hero.naturalWidth > 0;
      }, null, {timeout:60000});
      const media = await page.evaluate(() => {
        const front = document.getElementById('pcFrontImage');
        const hero = document.getElementById('pcHeaderImage');
        const bounds = el => {
          const b = el.getBoundingClientRect();
          return {width:b.width,height:b.height,left:b.left,right:b.right};
        };
        return {
          front: {src:front.currentSrc,fit:getComputedStyle(front).objectFit,
            width:front.naturalWidth,height:front.naturalHeight, box:bounds(front)},
          hero: {src:hero.currentSrc,fit:getComputedStyle(hero).objectFit,
            width:hero.naturalWidth,height:hero.naturalHeight,box:bounds(hero)}
        };
      });
      assert.equal(media.front.fit, 'contain', tag + ': photo must not be cropped on portrait card');
      assert.equal(media.hero.fit, 'cover', tag + ': landscape photo covers header');
      assert.equal(media.front.width, media.hero.width, tag + ': same source image');
      assert.ok(media.front.box.width > 0 && media.front.box.height > 0);
      assert.ok(media.hero.box.width > 0 && media.hero.box.height > 0);
      assert.ok(media.front.box.right > 0 && media.front.box.left < viewport.width);
      await page.locator('#placeCard').screenshot({path:path.join(output, tag+'-akerselva.png')});

      for (const lang of ['en','es','pt','nb']) {
        const expected = lang === 'nb' ? place : translations[lang];
        // Exercise the real languageSelect change handler, not just localizePlace().
        await page.evaluate(value => {
          const select = document.getElementById('languageSelect');
          if (!select) throw new Error('Missing header language switch');
          select.value = value;
          select.dispatchEvent(new Event('change', {bubbles:true}));
        }, lang);
        await page.waitForFunction(({lang,desc}) =>
          window.HG_I18N?.getLang() === lang &&
          document.getElementById('pcDesc')?.textContent === desc,
          {lang,desc:expected.desc}, {timeout:25000});
        assert.equal(await readDesc(), expected.desc, tag+'/'+lang+' displayed text');
        const localized = await page.evaluate(() =>
          window.HG_I18N.localizePlace(window.PLACES.find(p => p.id === 'akerselva')));
        assert.equal(localized.popupDesc, expected.popupDesc, tag+'/'+lang+' full article');
        assert.equal(await page.locator('#pcTitle').textContent(), 'Akerselva');
      }
      // The production People round must be visible and populated by the actual
      // source registry, not by a stubbed People fixture.
      await page.waitForFunction(() => {
        const el = document.getElementById('pcPeopleIcon');
        return el && el.hidden === false &&
          el.getAttribute('aria-hidden') !== 'true';
      }, null, {timeout:20000});
      const people = await page.evaluate(() => {
        const people = window.getPeopleForPlace?.('akerselva') || [];
        return people.map(person => ({id:person.id, name:person.name}));
      });
      const expectedPeople = JSON.parse(fs.readFileSync(
        'data/runtime/place-open/akerselva.json','utf8')).people;
      for (const person of expectedPeople) {
        assert.ok(people.some(item => item.id === person.id),
          tag + ': runtime People missing from actual app: ' + person.id);
      }
      await page.evaluate(() => {
        const original = window.showPlaceCardRoundPopup;
        window.showPlaceCardRoundPopup = payload => {
          window.__akerselvaPeoplePopup = payload;
          return original?.(payload);
        };
      });
      await page.locator('#pcPeopleIcon').click();
      await page.waitForFunction(() => window.__akerselvaPeoplePopup?.kind === 'people',
        null, {timeout:15000});
      assert.ok(await page.locator('#pcPeopleList [data-person]').count() >= expectedPeople.length,
        tag + ': person list did not render');
      const renderedPeople = await page.locator('#pcPeopleList').innerText();
      for (const person of expectedPeople) {
        assert.ok(renderedPeople.includes(person.name),
          tag + ': person absent from round popup: ' + person.name);
      }
      await page.screenshot({path:path.join(output,tag+'-akerselva-people.png')});

      // Read the real Fagverk page, not the JSON contract or a mock rendering.
      await page.goto(base + '/fagverk-sted.html?place=akerselva',
        {waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(() =>
        document.getElementById('fagverkPlaceContent')?.hidden === false,
        null, {timeout:45000});
      assert.equal((await page.locator('#fagverkPlaceTitle').textContent()).trim(), 'Akerselva');
      assert.match(await page.locator('#fagverkPlaceCoverageStatus').innerText(),
        /kuratert stedsfagverk/i);
      assert.equal(await page.locator('#fagverkPlaceUnfinished').isHidden(), true);
      assert.equal(await page.locator('#fagverkPlaceError').isHidden(), true);
      assert.equal(await page.locator('#fagverkPlaceArticle p').count(),place.fagverk.article.length);
      assert.equal(await page.locator('#fagverkPlaceLenses a').count(),place.fagverk.lenses.length);
      assert.equal(await page.locator('#fagverkPlaceQuestions li').count(),place.fagverk.guiding_questions.length);
      assert.equal(await page.locator('#fagverkPlaceSources a').count(),place.fagverk.source_urls.length);
      for (const paragraph of place.fagverk.article) {
        assert.ok((await page.locator('#fagverkPlaceArticle').innerText()).includes(paragraph));
      }
      await page.screenshot({path:path.join(output,tag+'-akerselva-fagverk.png'),fullPage:true});
      assert.deepEqual(errors, [], tag + ': browser errors');
      results.push({viewport:tag,status:'passed',languages:['nb','en','es','pt'],media});
      console.log('PASS Akerselva', tag, '4 languages, front image and header image');
    } catch (error) {
      results.push({viewport:tag,status:'failed',error:String(error.stack || error)});
      if (page) await page.screenshot({path:path.join(output,tag+'-failure.png'),
        fullPage:true,timeout:12000}).catch(() => {});
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results,null,2)+'\n');
}
const failures = results.filter(x => x.status !== 'passed');
assert.equal(failures.length, 0, failures.map(x => x.error).join('\n'));
