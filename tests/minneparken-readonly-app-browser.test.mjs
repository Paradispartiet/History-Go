#!/usr/bin/env node
// Partial acceptance for Minneparken's implemented text and Fagverk surfaces.
// Deliberately does NOT certify images, QuizCard, full quiz or v1/vFerdig.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const ID = 'minneparken_gamlebyen';
const place = JSON.parse(fs.readFileSync('data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11/minneparken_gamlebyen.json', 'utf8'));
const payload = JSON.parse(fs.readFileSync('data/runtime/place-open/' + ID + '.json', 'utf8')).place;
assert.equal(place.id, ID);
assert.equal(payload.id, ID);
assert.equal(payload.popupDesc, place.popupDesc);
assert.ok(place.fagverk?.article?.length >= 3);
assert.equal(place.fagverk?.status, 'curated');

const mime = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript',
  '.json':'application/json', '.css':'text/css', '.webp':'image/webp',
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml',
  '.woff2':'font/woff2' };
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('bad path'); return; }
  const file = path.resolve(ROOT, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404).end('not found'); return;
  }
  res.writeHead(200, { 'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const out = path.join(ROOT, 'artifacts', 'minneparken-readonly-browser');
fs.mkdirSync(out, { recursive: true });

let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  for (const { label, width, height, mobile } of [
    { label:'mobile', width:390, height:844, mobile:true },
    { label:'desktop', width:1440, height:960, mobile:false }
  ]) {
    const context = await browser.newContext({ viewport:{ width, height }, isMobile:mobile, hasTouch:mobile, locale:'nb-NO' });
    await context.addInitScript(() => {
      localStorage.setItem('hg_onboarding_shown_v1', '1');
      localStorage.setItem('HG_TEST_MODE', '1');
      localStorage.setItem('hg_lang', 'nb');
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(base + '/index.html?hgTest=1#/place/' + ID, { waitUntil:'domcontentloaded', timeout:90000 });
      await page.waitForFunction(id => window.__HG_APP_READY__ === true &&
        window.__HG_ROUTER_STARTED__ === true &&
        document.querySelector('#placeCard')?.dataset.currentPlaceId === id, ID, { timeout:90000 });
      await page.waitForFunction(desc => document.getElementById('pcDesc')?.textContent?.trim() === desc.trim(),
        place.desc, { timeout:30000 });
      const title = (await page.locator('#pcTitle').innerText()).trim();
      assert.match(title, /Minneparken/);
      const desc = (await page.locator('#pcDesc').innerText()).trim();
      assert.equal(desc, place.desc.trim());
      await page.locator('#placeCard').screenshot({ path:path.join(out, label + '-placecard.png') });
      await page.goto(base + '/fagverk-sted.html?place=' + ID,
        { waitUntil:'domcontentloaded', timeout:90000 });
      await page.waitForFunction(() => document.getElementById('fagverkPlaceContent')?.hidden === false,
        null, { timeout:45000 });
      assert.match((await page.locator('#fagverkPlaceTitle').innerText()), /Minneparken/);
      assert.equal(await page.locator('#fagverkPlaceArticle p').count(), place.fagverk.article.length);
      assert.equal(await page.locator('#fagverkPlaceLenses a').count(), place.fagverk.lenses.length);
      assert.equal(await page.locator('#fagverkPlaceUnfinished').isHidden(), true);
      assert.equal(await page.locator('#fagverkPlaceError').isHidden(), true);
      await page.screenshot({ path:path.join(out, label + '-fagverk.png'), fullPage:true });
      assert.deepEqual(errors, [], label + ': browser runtime errors');
      results.push({ label, status:'passed', title, articleParagraphs:place.fagverk.article.length });
      console.log('PASS Minneparken text / PlaceCard / Fagverk:', label);
    } catch (error) {
      const message = String(error?.stack || error);
      results.push({ label, status:'failed', message });
      console.error('FAIL Minneparken', label, message);
      await page.screenshot({ path:path.join(out, label + '-failure.png'), fullPage:true, timeout:12000 }).catch(() => {});
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ id:ID, scope:'text-and-Fagverk-only', results }, null, 2) + '\n');
}
assert.equal(results.length, 2);
assert.deepEqual(results.filter(x => x.status !== 'passed'), [], 'Incomplete Minneparken text/Fagverk browser QA');
