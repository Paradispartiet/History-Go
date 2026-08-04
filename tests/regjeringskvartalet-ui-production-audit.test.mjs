import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));

const place = readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
const registry = readJson('data/fagverk/fagverk_registry.json');
const quiz = readJson('data/quiz/politikk/regjeringskvartalet_sets.json');
const brandsByPlace = readJson('data/brands/brands_by_place.json');
const peopleManifest = readJson('data/people/manifest.json');
const people = peopleManifest.files.flatMap(file => {
  const value = readJson(`data/people/${file.slice('people/'.length)}`);
  return Array.isArray(value) ? value : Array.isArray(value.people) ? value.people : [value];
});
const linkedPeople = people.filter(person => person.placeId === 'regjeringskvartalet' || person.places?.includes('regjeringskvartalet'));
const report = read('reports/place-production/regjeringskvartalet-politikk-v1.md');
const appRuntime = read('js/app.js');
const popupRuntime = read('js/ui/place-popup-tabs.js');
const roundsRuntime = read('js/ui/place-rounds-visual-collections.js');
const popupCss = read('css/place-popup-tabs.css');

assert.equal(place.category, 'politikk');
assert.deepEqual(place.underbadge_ids, ['storting_og_regjering', 'politi_og_beredskap', 'velferd_og_institusjoner']);
assert.equal(quiz.production_context.profile, 'major_10x7');
assert.equal(quiz.sets.length, 10);
assert.equal(quiz.sets.flatMap(set => set.questions).length, 70);
assert.equal(brandsByPlace.regjeringskvartalet.length, 14);
assert.equal(linkedPeople.length, 22);

const storiesLoaderIndex = appRuntime.indexOf('loadScriptOnce("js/stories/stories_loader.js")');
const brandsLoaderIndex = appRuntime.indexOf('loadScriptOnce("js/brands/brands_loader.js")');
const placeCardLoaderIndex = appRuntime.indexOf('loadScriptOnce("js/ui/place-card.js")');
const brandsInitIndex = appRuntime.indexOf('safeRun("initBrandsBeforeAppReady"');
const appReadyIndex = appRuntime.indexOf('markAppReady();');
assert.ok(storiesLoaderIndex >= 0 && storiesLoaderIndex < placeCardLoaderIndex);
assert.ok(brandsLoaderIndex >= 0 && brandsLoaderIndex < placeCardLoaderIndex);
assert.ok(brandsInitIndex > brandsLoaderIndex && brandsInitIndex < appReadyIndex);

for (const [id, label] of [
  ['about', 'Om'], ['history', 'Historie'], ['stories', 'Fortellinger'],
  ['before-after', 'Før/etter'], ['news', 'Nyheter'], ['reading', 'Lesespor'],
  ['sources', 'Kilder'], ['more', 'Mer']
]) assert.ok(popupRuntime.includes(`["${id}", "${label}"]`));
for (const pattern of [
  /setAttribute\("role", "tablist"\)/,
  /setAttribute\("role", "tab"\)/,
  /setAttribute\("role", "tabpanel"\)/,
  /event\.key === "ArrowRight"/,
  /event\.key === "ArrowLeft"/,
  /event\.key === "Home"/,
  /event\.key === "End"/
]) assert.match(popupRuntime, pattern);
assert.match(popupCss, /overflow-x:\s*auto/);
assert.match(popupCss, /@media \(max-width: 720px\)/);
assert.match(popupCss, /\.hg-place-before-after-media\{[\s\S]*grid-template-columns:\s*1fr/);
assert.match(popupCss, /:focus-visible/);

assert.match(roundsRuntime, /politikk:\s+\["people", "spots", "details", "objects"\]/);
assert.match(roundsRuntime, /titleRow\.appendChild\(badge\)/);
assert.match(roundsRuntime, /fagverk-sted\.html\?place=/);
assert.doesNotMatch(roundsRuntime, /regjeringskvartalet/);
assert.doesNotMatch(roundsRuntime, /id:\s*["']civication["']/);

assert.equal(registry.placePage.route, 'fagverk-sted.html?place={placeId}');
assert.match(report, /Status: \*\*PRODUKSJONSKLAR – fase 17 PASS/);
assert.match(report, /10 sett × 7 spørsmål, 70 unike spørsmål/);
assert.match(report, /14 unike canonicale Brand-ID-er/);
assert.match(report, /22 unike koblinger til Regjeringskvartalet/);

const fixture = `<!doctype html><html lang="nb"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<base href="/"><link rel="stylesheet" href="/css/place-popup-tabs.css">
<style>*{box-sizing:border-box}body{margin:0;background:#05080e;color:white;font-family:system-ui}.hg-popup{width:min(920px,100vw);margin:auto}.hg-place-popup-body{padding:18px}</style>
</head><body class="hg-app"><div class="hg-popup place-popup-v2"><article class="hg-place-popup-v2"><div class="hg-place-popup-body"><section class="hg-place-hero"><h1>Regjeringskvartalet</h1><div class="hg-place-popup-text"><p>Canonical popupgrunnlag.</p></div></section></div></article></div>
<script>window.showPlacePopup=()=>{};window.showPlacePopup.__hgPlacePopupV2=true;window.PLACES=${JSON.stringify([place])};window.LEKSIKON_BY_PLACE={regjeringskvartalet:[]};window.LESESPOR=[];window.HGLeksikon={init:async()=>{}};window.DataHub={loadLesespor:async()=>window.LESESPOR};</script>
<script src="/js/stories/stories_loader.js"></script><script src="/js/brands/brands_loader.js"></script><script src="/js/ui/place-popup-tabs.js"></script>
<script>const storyInitA=window.HGStories.init();const storyInitB=window.HGStories.init();window.__singleFlight=storyInitA===storyInitB;Promise.all([storyInitA,storyInitB,window.HGBrands.init()]).then(()=>{window.__counts={stories:window.HGStories.getByPlace('regjeringskvartalet').length,brands:${JSON.stringify(brandsByPlace.regjeringskvartalet)}.filter(id=>window.HGBrands.getById(id)).length};window.HGPlacePopupTabs.decoratePopup(window.PLACES[0]);window.__auditReady=true;}).catch(error=>{window.__auditError=String(error&&error.stack||error);});</script>
</body></html>`;

const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp' };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === '/__audit__/regjeringskvartalet.html') {
    response.writeHead(200, { 'content-type': mime['.html'] }); response.end(fixture); return;
  }
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404); response.end('not found'); return;
  }
  response.writeHead(200, { 'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  response.end(fs.readFileSync(file));
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
let browser;
try {
  browser = await chromium.launch({ headless:true });
  const context = await browser.newContext({ viewport:{ width:1440, height:1000 } });
  const page = await context.newPage();
  await page.route('**/*', route => route.request().resourceType() === 'image'
    ? route.fulfill({ status:200, contentType:'image/png', body:png })
    : route.continue());
  await page.goto(`${base}/__audit__/regjeringskvartalet.html`, { waitUntil:'networkidle' });
  await page.waitForFunction(() => window.__auditReady === true);
  assert.deepEqual(await page.evaluate(() => window.__counts), { stories:3, brands:14 });
  assert.equal(await page.evaluate(() => window.__singleFlight), true);
  assert.deepEqual(await page.locator('[role="tab"]').allTextContents(), ['Om','Historie','Fortellinger','Før/etter','Nyheter','Lesespor','Kilder','Mer']);
  assert.equal(await page.locator('[role="tabpanel"]').count(), 8);
  for (const id of ['about','history','stories','before-after','news','reading','sources','more']) {
    await page.locator(`[data-place-tab="${id}"]`).click();
    assert.equal(await page.locator(`[data-place-tab="${id}"]`).getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator(`#hg-place-panel-${id}`).evaluate(panel => panel.hidden), false);
  }
  await page.locator('[data-place-tab="stories"]').click();
  await page.waitForSelector('#hg-place-panel-stories .hg-place-story-card');
  assert.equal(await page.locator('#hg-place-panel-stories .hg-place-story-card').count(), 3);
  await page.locator('[data-place-tab="about"]').focus();
  await page.keyboard.press('End');
  assert.equal(await page.locator('[data-place-tab="more"]').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Home');
  assert.equal(await page.locator('[data-place-tab="about"]').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-place-tab="history"]').getAttribute('aria-selected'), 'true');

  await page.setViewportSize({ width:390, height:844 });
  await page.reload({ waitUntil:'networkidle' });
  await page.waitForFunction(() => window.__auditReady === true);
  const tabSize = await page.locator('.hg-place-tabs').evaluate(element => ({ clientWidth:element.clientWidth, scrollWidth:element.scrollWidth }));
  assert.ok(tabSize.scrollWidth > tabSize.clientWidth);
  await page.locator('[data-place-tab="before-after"]').click();
  await page.waitForSelector('#hg-place-panel-before-after .hg-place-before-after-media');
  const columns = await page.locator('.hg-place-before-after-media').evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length);
  assert.equal(columns, 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), true);

  const fagverk = await context.newPage();
  await fagverk.route('**/*', route => route.request().resourceType() === 'image'
    ? route.fulfill({ status:200, contentType:'image/png', body:png })
    : route.continue());
  await fagverk.goto(`${base}/fagverk-sted.html?place=regjeringskvartalet`, { waitUntil:'networkidle' });
  await fagverk.waitForSelector('#fagverkPlaceContent:not([hidden])');
  await fagverk.waitForSelector('#fagverkPlaceBadgePath:not([hidden])');
  assert.equal((await fagverk.textContent('#fagverkPlaceTitle')).trim(), 'Regjeringskvartalet');
  await fagverk.waitForSelector('#fagverkPlaceBadgePath .fagverk-canonical-underbadges a');
  assert.equal(await fagverk.locator('#fagverkPlaceBadgePath .fagverk-canonical-underbadges a').count(), 3);
  assert.ok(await fagverk.locator('#fagverkPlaceLenses article').count() >= 4);
  assert.ok(await fagverk.locator('#fagverkPlaceQuestions li').count() >= 4);
  assert.ok(await fagverk.locator('#fagverkPlaceChapters a').count() >= 1);
  assert.ok(await fagverk.locator('#fagverkPlaceConcepts a, #fagverkPlaceConcepts span').count() >= 1);
  assert.ok(await fagverk.locator('#fagverkPlaceEmner a, #fagverkPlaceEmner span').count() >= 3);
  assert.ok(await fagverk.locator('#fagverkPlaceSources a').count() >= 10);
  assert.equal(await fagverk.locator('#fagverkPlaceImage').isVisible(), true);
  assert.ok(await fagverk.locator('#fagverkPlaceImage').evaluate(image => image.naturalWidth) > 0);
  const unsafeLinks = await fagverk.locator('#fagverkPlaceSources a').evaluateAll(links => links.filter(link => link.target !== '_blank' || !String(link.rel).includes('noopener') || !String(link.rel).includes('noreferrer')).length);
  assert.equal(unsafeLinks, 0);
  const visibleText = await fagverk.locator('body').innerText();
  for (const forbidden of ['reports/', 'tests/', 'data/quiz/production_context', 'data/coordinate-evidence']) assert.equal(visibleText.includes(forbidden), false);
  await fagverk.setViewportSize({ width:390, height:844 });
  await fagverk.reload({ waitUntil:'networkidle' });
  await fagverk.waitForSelector('#fagverkPlaceContent:not([hidden])');
  assert.equal(await fagverk.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), true);

  await context.close();
  console.log('Regjeringskvartalet category-round Chromium audit: PASS');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
