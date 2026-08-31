import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { test } from 'node:test';
import { chromium } from 'playwright';

const root = process.cwd();
const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));

const place = readJson('data/places/historie/oslo/places_historie/gamle_aker_kirke.json');
const production = readJson('data/places/production/gamle_aker_kirke.json');
const historyProduction = readJson('data/places/historie-production/gamle_aker_kirke.json');
const placeIndex = readJson('data/places/places_index.json');
const leksikonRows = readJson('data/leksikon/places/oslo/historie/leksikon_oslo_historie.json')
  .filter(row => row.place_id === place.id);
const lesesporData = readJson('data/lesespor/oslo/lesespor_oslo_historie.json');
const lesespor = Array.isArray(lesesporData) ? lesesporData : lesesporData.items;
const peopleManifest = readJson('data/people/manifest.json');
const people = peopleManifest.files.flatMap(file => {
  const value = readJson(`data/${file}`);
  return Array.isArray(value) ? value : Array.isArray(value.people) ? value.people : [value];
});
const peopleHere = people.filter(person => [person.placeId, ...(person.places || [])].includes(place.id));
const relatedPlaces = placeIndex.filter(row => place.related_place_ids.includes(row.id));
const leksikonHtml = read('data/leksikon/places/oslo/historie/gamle_aker_kirke.html');
const workcard = read('reports/place-production/gamle-aker-kirke-historie-v1.md');
const audit = readJson('reports/place-production/gamle-aker-kirke-phase11-final-audit-v1.json');

test('phase 11 removes contradictory legacy seeds and keeps disputed object dating unresolved', () => {
  for (const key of ['safe_facts', 'wonderkammer_seed', 'people_relations_seed']) {
    assert.equal(Object.hasOwn(place, key), false, `${key} must not remain on the canonical place`);
  }
  assert.equal(place.history_layers.some(layer => /eldre trekirke|fylkeskirke/i.test(String(layer))), false);
  assert.deepEqual(place.objects.map(object => object.id), [
    'gamle_aker_kirke_dopefont',
    'gamle_aker_kirke_prekestol',
    'gamle_aker_kirke_nattverd_altertavle'
  ]);
  const objectCopy = place.objects.map(object => `${object.id} ${object.title} ${object.desc}`).join('\n');
  assert.doesNotMatch(objectCopy, /\b1715\b|\b1725\b/);
  assert.match(objectCopy, /kildene spriker/i);
  assert.doesNotMatch(leksikonHtml, /bygd rundt midten av 1100-tallet|ble laget av Thomas Blix i 1725/i);
  assert.match(leksikonHtml, /dateringsforslagene spenner fra omkring 1080 til omtrent 1180/i);
  assert.match(leksikonHtml, /Store norske leksikon oppgir 1715, mens Den norske kirke og Oslo byleksikon oppgir 1725/i);
});

test('all production contracts, phases and the final checklist close without blockers', () => {
  assert.equal(production.roundsReadiness.status, 'production_ready');
  assert.equal(production.roundsReadiness.auditFile, 'reports/place-production/gamle-aker-kirke-phase11-final-audit-v1.json');
  assert.equal(production.completion.currentStatus, 'current');
  assert.equal(historyProduction.status, 'ready');
  assert.ok(Object.values(historyProduction.gates).every(gate => gate.status === 'PASS'));
  assert.match(workcard, /Status: \*\*PRODUKSJONSKLAR – fase 11 PASS\*\*/);
  assert.doesNotMatch(workcard.split('## Faseplan')[1], /IKKE STARTET/);
  assert.equal(audit.status, 'PRODUCTION_READY');
  assert.equal(audit.blockers.length, 0);
  assert.equal(audit.popup_tabs.every(tab => ['PASS', 'N/A'].includes(tab.status)), true);
  assert.equal(audit.checklist.every(item => ['PASS', 'N/A', 'PASS_WITH_CONTENT_NA'].includes(item.status)), true);
  for (const value of Object.values(audit.quality_score.dimensions)) assert.ok(value >= 4);
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
});

test('the completed place has the intended rich local content counts and local images', () => {
  assert.equal(peopleHere.length, 4);
  assert.equal(place.objects.length, 3);
  assert.deepEqual(production.roundsReadiness.contentRoundIds, ['people', 'objects', 'brands', 'related']);
  assert.equal(production.roundsReadiness.brandIds.length, 2);
  assert.equal(place.related_place_ids.length, 4);
  assert.equal(place.underbadge_ids.length, 2);
  assert.equal(leksikonRows.find(row => row.id == null)?.chronology.length, 11);
  assert.equal(leksikonRows.filter(row => row.type === 'news_note').length, 2);
  assert.equal(lesespor.filter(item => item.place_ids?.includes(place.id)).length, 3);
  for (const file of [place.image, place.cardImage, place.for_na.beforeImage, place.for_na.nowImage, ...place.objects.map(object => object.image)]) {
    assert.equal(fs.existsSync(file), true, `missing local image ${file}`);
  }
});

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

const popupFixture = `<!doctype html>
<html lang="nb">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <base href="/">
  <link rel="stylesheet" href="/css/place-popup-tabs.css">
  <style>
    *{box-sizing:border-box}body{margin:0;background:#05080e;color:white;font-family:system-ui}
    .hg-popup{width:min(920px,100vw);margin:auto}.hg-place-popup-body{padding:18px}
  </style>
</head>
<body class="hg-app">
  <div class="hg-popup place-popup-v2">
    <article class="hg-place-popup-v2">
      <div class="hg-place-popup-body">
        <section class="hg-place-hero">
          <h1>${place.name}</h1>
          <div class="hg-place-popup-text">${place.popupDesc.split(/\n\s*\n/).map(value => `<p>${value}</p>`).join('')}</div>
        </section>
      </div>
    </article>
  </div>
  <div id="placeCard" data-current-place-id="${place.id}">
    <div class="pc-body">
      <div class="pc-title-row"><div id="pcBadgesIcon" class="pc-round"></div></div>
      <div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div></div>
      <div id="pcPeopleList"></div><div id="pcBrandsList"></div>
    </div>
  </div>
  <script>
    window.showPlacePopup = () => {};
    window.showPlacePopup.__hgPlacePopupV2 = true;
    window.PLACES = ${JSON.stringify([place, ...relatedPlaces])};
    window.LEKSIKON_BY_PLACE = { ${place.id}: ${JSON.stringify(leksikonRows)} };
    window.LESESPOR = ${JSON.stringify(lesespor)};
    window.HGLeksikon = { init: async () => {} };
    window.DataHub = { loadLesespor: async () => window.LESESPOR };
    window.getPeopleForPlace = id => ${JSON.stringify(peopleHere)}.filter(person => [person.placeId, ...(person.places || [])].includes(id));
  </script>
  <script src="/js/stories/stories_loader.js"></script>
  <script src="/js/brands/brands_loader.js"></script>
  <script src="/js/ui/place-rounds-visual-collections.js"></script>
  <script src="/js/ui/place-popup-tabs.js"></script>
  <script src="/js/ui/place-popup-direct-tabs.js"></script>
  <script>
    Promise.all([window.HGStories.init(), window.HGBrands.init()]).then(async () => {
      await window.HGPlaceRounds.apply(window.PLACES[0]);
      window.HGPlacePopupTabs.decoratePopup(window.PLACES[0]);
      window.__auditReady = true;
    }).catch(error => { window.__auditError = String(error && error.stack || error); });
  </script>
</body>
</html>`;

test('Chromium renders every popup tab, all four rounds and the fagverk page on desktop and mobile', async () => {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/__audit__/gamle-aker-kirke.html') {
      response.writeHead(200, { 'content-type': mime['.html'] });
      response.end(popupFixture);
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
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    || (fs.existsSync('/tmp/aha-playwright-browsers/chromium_headless_shell-1187/chrome-linux/headless_shell')
      ? '/tmp/aha-playwright-browsers/chromium_headless_shell-1187/chrome-linux/headless_shell'
      : undefined);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    await page.route('**/*', route => route.request().resourceType() === 'image'
      ? route.fulfill({ status: 200, contentType: 'image/png', body: png })
      : route.continue());
    await page.goto(`http://127.0.0.1:${port}/__audit__/gamle-aker-kirke.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__auditReady === true);

    assert.deepEqual(await page.locator('[role="tab"]').allTextContents(), [
      'Om', 'Historie', 'Fortellinger', 'Før/etter', 'Nyheter', 'Lesespor', 'Kilder',
      'Legg merke til', 'Betydning', 'Motpunkter', 'Språk'
    ]);
    assert.equal(await page.locator('[data-place-tab="more"]').count(), 0);
    assert.equal(await page.locator('[role="tabpanel"]').count(), 11);
    for (const id of ['about', 'history', 'stories', 'before-after', 'news', 'reading', 'sources', 'notice', 'meaning', 'counterpoints', 'language']) {
      await page.locator(`[data-place-tab="${id}"]`).click();
      assert.equal(await page.locator(`[data-place-tab="${id}"]`).getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator(`#hg-place-panel-${id}`).evaluate(panel => panel.hidden), false);
    }
    assert.equal(await page.locator('#hg-place-panel-history .hg-place-tab-timeline-item').count(), 11);
    assert.equal(await page.locator('#hg-place-panel-stories .hg-place-story-card').count(), 1);
    assert.equal(await page.locator('#hg-place-panel-before-after img').count(), 2);
    assert.equal(await page.locator('#hg-place-panel-news .hg-place-tab-card').count(), 2);
    assert.equal(await page.locator('#hg-place-panel-reading .hg-place-reading-card').count(), 3);
    assert.ok(await page.locator('#hg-place-panel-sources a').count() >= 7);
    assert.equal(await page.locator('#hg-place-panel-notice li').count(), 3);
    assert.equal(await page.locator('#hg-place-panel-meaning li').count(), 3);
    assert.equal(await page.locator('#hg-place-panel-counterpoints li').count(), 3);
    assert.equal(await page.locator('#hg-place-panel-language article, #hg-place-panel-language li').count() >= 5, true);
    await page.locator('[data-place-tab="about"]').focus();
    await page.keyboard.press('End');
    assert.equal(await page.locator('[data-place-tab="language"]').getAttribute('aria-selected'), 'true');
    await page.keyboard.press('Home');
    assert.equal(await page.locator('[data-place-tab="about"]').getAttribute('aria-selected'), 'true');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[data-place-tab="history"]').getAttribute('aria-selected'), 'true');
    if (process.env.GAK_CAPTURE_SCREENSHOTS === '1') {
      await page.locator('[data-place-tab="before-after"]').click();
      await page.screenshot({ path: '/tmp/gamle-aker-phase11-popup-desktop.png', fullPage: true });
    }

    assert.equal(await page.locator('.pc-icons-quad .pc-round:not([hidden])').count(), 4);
    assert.equal(await page.locator('#pcBadgesIcon').evaluate(node => node.parentElement.classList.contains('pc-title-row')), true);
    assert.deepEqual(await page.evaluate(() => window.HGPlaceRounds.get(window.PLACES[0]).map(round => round.id)), ['people', 'objects', 'brands', 'related']);
    assert.deepEqual(await page.evaluate(() => ({
      objects: window.HGPlaceRounds.getItems(window.PLACES[0], 'objects').length,
      related: window.HGPlaceRounds.getItems(window.PLACES[0], 'related').length,
      brands: window.HGBrands.getByPlace('gamle_aker_kirke').length,
      people: window.getPeopleForPlace('gamle_aker_kirke').length
    })), { objects: 3, related: 4, brands: 2, people: 4 });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__auditReady === true);
    const tabSize = await page.locator('.hg-place-tabs').evaluate(node => ({ clientWidth: node.clientWidth, scrollWidth: node.scrollWidth }));
    assert.ok(tabSize.scrollWidth > tabSize.clientWidth);
    await page.locator('[data-place-tab="before-after"]').click();
    const columns = await page.locator('.hg-place-before-after-media').evaluate(node => getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length);
    assert.equal(columns, 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), true);

    const fagverk = await context.newPage();
    await fagverk.route('**/*', route => route.request().resourceType() === 'image'
      ? route.fulfill({ status: 200, contentType: 'image/png', body: png })
      : route.continue());
    await fagverk.goto(`http://127.0.0.1:${port}/fagverk-sted.html?place=gamle_aker_kirke`, { waitUntil: 'networkidle' });
    await fagverk.waitForSelector('#fagverkPlaceContent:not([hidden])');
    assert.equal((await fagverk.textContent('#fagverkPlaceTitle')).trim(), 'Gamle Aker kirke');
    assert.match((await fagverk.textContent('#fagverkPlaceMeta')).trim(), /historie · 1150 · Akersbakken 26, 0172 Oslo/);
    assert.doesNotMatch((await fagverk.textContent('#fagverkPlaceMeta')).trim(), /\[object Object\]/);
    assert.equal(await fagverk.locator('#fagverkPlaceBadgePath .fagverk-canonical-underbadges a').count(), 2);
    assert.match((await fagverk.textContent('#fagverkPlaceCoverageStatus')).trim(), /under produksjon/);
    assert.equal(await fagverk.locator('#fagverkPlaceUnfinished').isVisible(), true);
    assert.equal(await fagverk.locator('#fagverkPlaceLenses a').count(), 0);
    assert.equal(await fagverk.locator('#fagverkPlaceQuestions li').count(), 0);
    assert.ok(await fagverk.locator('#fagverkPlaceChapters a').count() >= 1);
    assert.ok(await fagverk.locator('#fagverkPlaceEmner a').count() >= 3);
    assert.equal(await fagverk.locator('#fagverkPlaceSources a').count(), 0);
    assert.equal(await fagverk.locator('#fagverkPlaceImage').isVisible(), true);
    assert.ok(await fagverk.locator('#fagverkPlaceImage').evaluate(image => image.naturalWidth) > 0);
    if (process.env.GAK_CAPTURE_SCREENSHOTS === '1') {
      await fagverk.screenshot({ path: '/tmp/gamle-aker-phase11-fagverk-desktop.png', fullPage: true });
    }
    await fagverk.setViewportSize({ width: 390, height: 844 });
    await fagverk.reload({ waitUntil: 'networkidle' });
    await fagverk.waitForSelector('#fagverkPlaceContent:not([hidden])');
    assert.equal(await fagverk.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), true);
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
