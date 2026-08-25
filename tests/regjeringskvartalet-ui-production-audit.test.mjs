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
const regjeringskvartaletPeople = people.filter(person => (
  person.placeId === 'regjeringskvartalet' || person.places?.includes('regjeringskvartalet')
));
const report = read('reports/place-production/regjeringskvartalet-politikk-v1.md');
const appRuntime = read('js/app.js');
const popupRuntime = read('js/ui/place-popup-tabs.js');
const directTabsRuntime = read('js/ui/place-popup-direct-tabs.js');
const collectionRouting = read('js/ui/place-collection-knowledge-routing.js');
const roundsRuntime = read('js/ui/place-rounds-visual-collections.js');
const popupCss = read('css/place-popup-tabs.css');
const fagverkHtml = read('fagverk-sted.html');
const fagverkRuntime = read('js/fagverk-sted.js');
const canonicalFagverk = read('js/fagverk-place-canonical-integration.js');

assert.deepEqual(place.underbadge_ids, [
  'storting_og_regjering',
  'politi_og_beredskap',
  'velferd_og_institusjoner'
]);
assert.equal(place.category, 'politikk');
assert.match(place.popupImage, /^https:\/\//);
assert.deepEqual(place.objects.map(item => item.id).sort(), [
  'regjeringskvartalet_fiskerne',
  'regjeringskvartalet_grass_roots_square'
]);
assert.equal(quiz.production_context.profile, 'major_10x7');
assert.equal(quiz.sets.length, 10);
const questions = quiz.sets.flatMap(set => set.questions);
assert.equal(questions.length, 70);
assert.equal(new Set(questions.map(question => question.id)).size, 70);
assert.equal(new Set(questions.map(question => question.primary_knowledge_unit_id)).size, 70);
assert.equal(brandsByPlace.regjeringskvartalet.length, 14);
assert.equal(new Set(brandsByPlace.regjeringskvartalet).size, 14);
assert.equal(regjeringskvartaletPeople.length, 22);
assert.equal(new Set(regjeringskvartaletPeople.map(person => person.id)).size, 22);

const storiesLoaderIndex = appRuntime.indexOf('loadScriptOnce("js/stories/stories_loader.js")');
const brandsLoaderIndex = appRuntime.indexOf('loadScriptOnce("js/brands/brands_loader.js")');
const placeCardLoaderIndex = appRuntime.indexOf('loadScriptOnce("js/ui/place-card.js")');
const brandsInitIndex = appRuntime.indexOf('safeRun("initBrandsBeforeAppReady"');
const appReadyIndex = appRuntime.indexOf('markAppReady();');
const routerStartIndex = appRuntime.indexOf('safeRun("HGAppRouter.start"');
assert.ok(storiesLoaderIndex >= 0, 'ekte appstart må laste Stories-loaderen');
assert.ok(brandsLoaderIndex >= 0, 'ekte appstart må laste Brands-loaderen');
assert.ok(storiesLoaderIndex < placeCardLoaderIndex, 'Stories må finnes før PlaceCard lastes');
assert.ok(brandsLoaderIndex < placeCardLoaderIndex, 'Brands må finnes før PlaceCard lastes');
assert.ok(brandsInitIndex > brandsLoaderIndex, 'Brands må initialiseres etter at loaderen finnes');
assert.ok(brandsInitIndex < appReadyIndex, 'Brands må være klare før appReady åpner brukerinteraksjon');
assert.ok(brandsInitIndex < routerStartIndex, 'Brands må være klare før routeren kan åpne første PlaceCard');
assert.match(appRuntime, /initBrandsBeforeAppReady[\s\S]*optional Brands data failed/);

const curated = registry.placeLinks.regjeringskvartalet;
assert.ok(curated.lenses.length >= 4);
assert.ok(curated.guidingQuestions.length >= 4);
assert.ok(curated.emneIds.length >= 6);
assert.equal(registry.placePage.route, 'fagverk-sted.html?place={placeId}');

for (const [id, label] of [
  ['about', 'Om'],
  ['history', 'Historie'],
  ['stories', 'Fortellinger'],
  ['before-after', 'Før/etter'],
  ['news', 'Nyheter'],
  ['reading', 'Lesespor'],
  ['sources', 'Kilder']
]) {
  assert.ok(popupRuntime.includes(`["${id}", "${label}"]`));
}
assert.match(popupRuntime, /setAttribute\("role", "tablist"\)/);
assert.match(popupRuntime, /setAttribute\("role", "tab"\)/);
assert.match(popupRuntime, /setAttribute\("role", "tabpanel"\)/);
assert.match(popupRuntime, /event\.key === "ArrowRight"/);
assert.match(popupRuntime, /event\.key === "ArrowLeft"/);
assert.match(popupRuntime, /event\.key === "Home"/);
assert.match(popupRuntime, /event\.key === "End"/);
assert.match(popupCss, /overflow-x:\s*auto/);
assert.match(popupCss, /flex-wrap:\s*nowrap/);
assert.match(popupCss, /white-space:\s*nowrap/);
assert.match(directTabsRuntime, /MORE_ID\s*=\s*"more"/);
assert.match(directTabsRuntime, /requiredTabs:\s*\["language"\]/);
assert.match(directTabsRuntime, /visibleOptionalTabs:\s*\[\]/);
assert.match(directTabsRuntime, /scrollIntoView/);
assert.match(collectionRouting, /objectsSupplement/);
assert.match(collectionRouting, /peopleSupplement/);
assert.match(popupCss, /@media \(max-width: 720px\)/);
assert.match(popupCss, /\.hg-place-before-after-media\{[\s\S]*grid-template-columns:\s*1fr/);
assert.match(popupCss, /:focus-visible/);

assert.match(roundsRuntime, /const GENERAL_BASE = Object\.freeze\(\["people", "objects", "brands"\]\)/);
assert.match(roundsRuntime, /politikk:\s*["']related["']/);
assert.match(roundsRuntime, /return normalizedFullGridIds\(place\)/);
assert.doesNotMatch(roundsRuntime, /id:\s*["']images["']/);
assert.doesNotMatch(roundsRuntime, /id:\s*["'](?:civication|works|details|spots)["']/);
assert.match(roundsRuntime, /titleRow\.appendChild\(badge\)/);
assert.match(roundsRuntime, /fagverk-sted\.html\?place=/);
assert.match(roundsRuntime, /item\.imageCard \|\| item\.cardImage \|\| item\.image/);
assert.doesNotMatch(roundsRuntime, /regjeringskvartalet/);

assert.match(fagverkHtml, /class="fagverk-skip-link"/);
assert.match(fagverkHtml, /name="viewport"/);
for (const id of [
  'fagverkPlaceImage',
  'fagverkPlaceBadgePath',
  'fagverkPlaceLenses',
  'fagverkPlaceQuestions',
  'fagverkPlaceChapters',
  'fagverkPlaceConcepts',
  'fagverkPlaceEmner',
  'fagverkPlaceSources'
]) {
  assert.match(fagverkHtml, new RegExp(`id="${id}"`));
}
assert.match(fagverkRuntime, /target="_blank" rel="noopener noreferrer"/);
assert.match(canonicalFagverk, /model\.underbadges/);
assert.match(canonicalFagverk, /model\.domains/);
assert.match(canonicalFagverk, /coverageById/);

const userVisible = JSON.stringify({
  popupImage: place.popupImage,
  externalLinks: place.externalLinks,
  source_summary: place.source_summary,
  for_na: place.for_na,
  objects: place.objects
});
for (const forbidden of [
  'reports/',
  'tests/',
  'data/quiz/production_context',
  'data/coordinate-evidence',
  'claims/'
]) {
  assert.equal(userVisible.includes(forbidden), false, forbidden);
}
const urls = userVisible.match(/https:\/\/[^"\\\s]+/g) || [];
assert.ok(urls.length >= 15);
assert.ok(urls.every(url => url.startsWith('https://')));

assert.match(report, /Status: \*\*PRODUKSJONSKLAR – fase 17 PASS/);
assert.match(report, /10 sett × 7 spørsmål, 70 unike spørsmål/);
assert.match(report, /14 unike canonicale Brand-ID-er/);
assert.match(report, /22 unike koblinger til Regjeringskvartalet/);
assert.match(report, /\| Badges\/fagverk \| PASS – fase 13 \|/);
assert.match(report, /\| 14 \| Quiz `major_10x7`.*PR #4680, merge `4f15fd4c20949366c023593b96dfa2308623ee5a`/);
assert.match(report, /\| 15b \| People V2 \| \*\*GODKJENT – PR #4681, merge `a91a0ee590d1c6994092234a5090ea99837cd15b`/);
assert.match(report, /\| 16 \| Ny samlet sluttkontroll på fersk `main` \| \*\*PASS/);
assert.match(
  report,
  /\| 12 \| Brands \| \*\*GODKJENT – PR #4673, merge `f4e078f06422747dd6f1ee34985d9c5752bcb3b6`\*\* \|/
);
assert.match(
  report,
  /\| 13 \| Badges, fagverk, alle åtte popupfaner, rundinger og full UI-\/produksjonsaudit \| \*\*(?:KLAR FOR REVIEW – FULL UI-\/PRODUKSJONSAUDIT PASS|GODKJENT – PR #[0-9]+, merge `[0-9a-f]{40}`)\*\* \|/
);

const fixture = `<!doctype html>
<html lang="nb">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <base href="/">
  <link rel="stylesheet" href="/css/place-popup-tabs.css">
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#05080e;color:white;font-family:system-ui}
    .hg-popup{width:min(920px,100vw);margin:auto}
    .hg-place-popup-body{padding:18px}
  </style>
</head>
<body class="hg-app">
  <div class="hg-popup place-popup-v2">
    <article class="hg-place-popup-v2">
      <div class="hg-place-popup-body">
        <section class="hg-place-hero">
          <h1>Regjeringskvartalet</h1>
          <div class="hg-place-popup-text"><p>Canonical popupgrunnlag.</p></div>
        </section>
        <section class="hg-place-relations-section"><h3>Relasjoner</h3><p>Canonical relasjon.</p></section>
        <section class="hg-place-knowledge-section"><h3>Kunnskap</h3><p>Canonical kunnskap.</p></section>
        <section class="hg-place-observations-section"><h3>Observasjoner</h3><p>Canonical observasjon.</p></section>
      </div>
    </article>
  </div>
  <script>
    window.showPlacePopup = () => {};
    window.showPlacePopup.__hgPlacePopupV2 = true;
    window.PLACES = ${JSON.stringify([place])};
    window.LEKSIKON_BY_PLACE = { regjeringskvartalet: [] };
    window.LESESPOR = [];
    window.HGLeksikon = { init: async () => {} };
    window.DataHub = { loadLesespor: async () => window.LESESPOR };
  </script>
  <script src="/js/stories/stories_loader.js"></script>
  <script src="/js/brands/brands_loader.js"></script>
  <script src="/js/ui/place-popup-tabs.js"></script>
  <script src="/js/ui/place-popup-direct-tabs.js"></script>
  <script>
    const storyInitA = window.HGStories.init();
    const storyInitB = window.HGStories.init();
    window.__storyInitSingleFlight = storyInitA === storyInitB;
    Promise.all([storyInitA, storyInitB, window.HGBrands.init()]).then(() => {
      window.__runtimeContentCounts = {
        stories: window.HGStories.getByPlace('regjeringskvartalet').length,
        brands: ${JSON.stringify(brandsByPlace.regjeringskvartalet)}
          .filter(id => window.HGBrands.getById(id)).length
      };
      window.HGPlacePopupTabs.decoratePopup(window.PLACES[0]);
      window.__auditReady = true;
    }).catch(error => {
      window.__auditError = String(error && error.stack || error);
    });
  </script>
</body>
</html>`;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === '/__audit__/regjeringskvartalet.html') {
    response.writeHead(200, { 'content-type': mime['.html'] });
    response.end(fixture);
    return;
  }
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404);
    response.end('not found');
    return;
  }
  response.writeHead(200, { 'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  response.end(fs.readFileSync(file));
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'image') {
      return route.fulfill({ status: 200, contentType: 'image/png', body: png });
    }
    return route.continue();
  });
  await page.goto(`${base}/__audit__/regjeringskvartalet.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__auditReady === true);
  await page.waitForSelector('[data-place-tab="language"]');

  assert.deepEqual(await page.evaluate(() => window.__runtimeContentCounts), {
    stories: 3,
    brands: 14
  });
  assert.equal(await page.evaluate(() => window.__storyInitSingleFlight), true);

  const tabLabels = await page.locator('[role="tab"]').allTextContents();
  assert.deepEqual(tabLabels, [
    'Om',
    'Historie',
    'Fortellinger',
    'Før/etter',
    'Nyheter',
    'Lesespor',
    'Kilder',
    'Språk'
  ]);
  assert.equal(await page.locator('[role="tabpanel"]').count(), 8);
  assert.equal(await page.locator('[data-place-tab="more"]').count(), 0);
  for (const removed of ['objects', 'notice', 'meaning', 'counterpoints', 'relations', 'knowledge', 'observations']) {
    assert.equal(await page.locator(`[data-place-tab="${removed}"]`).count(), 0);
  }

  assert.equal(await page.locator('#hg-place-panel-about .hg-place-knowledge-section').count(), 1);
  assert.equal(await page.locator('#hg-place-panel-about .hg-place-observations-section').count(), 1);
  assert.equal(await page.locator('.hg-place-relations-section').count(), 0);

  for (const id of ['about', 'history', 'stories', 'before-after', 'news', 'reading', 'sources', 'language']) {
    await page.locator(`[data-place-tab="${id}"]`).click();
    assert.equal(await page.locator(`[data-place-tab="${id}"]`).getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator(`#hg-place-panel-${id}`).evaluate(panel => panel.hidden), false);
  }

  await page.locator('[data-place-tab="stories"]').click();
  await page.waitForSelector('#hg-place-panel-stories .hg-place-story-card');
  assert.equal(await page.locator('#hg-place-panel-stories .hg-place-story-card').count(), 3);

  await page.locator('[data-place-tab="about"]').focus();
  await page.keyboard.press('End');
  assert.equal(await page.locator('[data-place-tab="language"]').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Home');
  assert.equal(await page.locator('[data-place-tab="about"]').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-place-tab="history"]').getAttribute('aria-selected'), 'true');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__auditReady === true);
  await page.waitForSelector('[data-place-tab="language"]');
  const mobileTabs = await page.locator('.hg-place-tabs').evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth
  }));
  assert.ok(mobileTabs.scrollWidth > mobileTabs.clientWidth);
  await page.locator('[data-place-tab="before-after"]').click();
  await page.waitForSelector('#hg-place-panel-before-after .hg-place-before-after-media');
  const mobileColumns = await page.locator('.hg-place-before-after-media').evaluate(element => (
    getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length
  ));
  assert.equal(mobileColumns, 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), true);

  const fagverk = await context.newPage();
  await fagverk.route('**/*', route => {
    if (route.request().resourceType() === 'image') {
      return route.fulfill({ status: 200, contentType: 'image/png', body: png });
    }
    return route.continue();
  });
  await fagverk.goto(`${base}/fagverk-sted.html?place=regjeringskvartalet`, { waitUntil: 'networkidle' });
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

  const unsafeLinks = await fagverk.locator('#fagverkPlaceSources a').evaluateAll(links => (
    links.filter(link => (
      link.target !== '_blank' ||
      !String(link.rel).includes('noopener') ||
      !String(link.rel).includes('noreferrer')
    )).length
  ));
  assert.equal(unsafeLinks, 0);

  const visibleText = await fagverk.locator('body').innerText();
  for (const forbidden of ['reports/', 'tests/', 'data/quiz/production_context', 'data/coordinate-evidence']) {
    assert.equal(visibleText.includes(forbidden), false);
  }

  await fagverk.setViewportSize({ width: 390, height: 844 });
  await fagverk.reload({ waitUntil: 'networkidle' });
  await fagverk.waitForSelector('#fagverkPlaceContent:not([hidden])');
  assert.equal(await fagverk.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), true);

  await context.close();
  console.log('Regjeringskvartalet owned-surface Chromium audit: PASS');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
