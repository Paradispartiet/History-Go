import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { test } from 'node:test';

const root = process.cwd();
const read = file => fs.readFileSync(file, 'utf8');
const json = file => JSON.parse(read(file));
const id = 'damstredet_telthusbakken';
const place = json('data/places/by/oslo/damstredet_telthusbakken/damstredet_telthusbakken.json');
const production = json('data/places/production/damstredet_telthusbakken.json');
const audit = json('reports/place-production/damstredet-telthusbakken-final-audit-v1.json');
const leksikon = json('data/leksikon/places/oslo/historie/leksikon_oslo_historie.json').filter(row => row.place_id === id);
const language = json('data/leksikon/sprak/places/europe/norway/oslo/damstredet_telthusbakken.json');
const stories = json('data/stories/stories_damstredet_telthusbakken.json');
const quizFiles = ['data/quiz/by/damstredet_telthusbakken_sets.json', 'data/quiz/historie/damstredet_telthusbakken_sets.json'];
const quizSets = quizFiles.flatMap(file => json(file).sets);
const questions = quizSets.flatMap(set => set.questions);
const peopleManifest = json('data/people/manifest.json');
const people = peopleManifest.files.flatMap(file => {
  const value = json(`data/${file}`);
  return Array.isArray(value) ? value : value.people || [value];
});
const peopleHere = people.filter(person => [person.placeId, ...(person.places || [])].includes(id));
const trailsRaw = json('data/lesespor/oslo/lesespor_oslo_historie.json');
const trails = (Array.isArray(trailsRaw) ? trailsRaw : trailsRaw.items).filter(item => item.place_ids?.includes(id));
const placeIndex = json('data/places/places_index.json');
const related = placeIndex.filter(row => place.related_place_ids.includes(row.id));

test('the place is one source-backed, privacy-aware local experience', () => {
  assert.equal(place.id, id);
  assert.deepEqual(place.rounds, ['people', 'nature', 'badges', 'leksikon', 'routes']);
  assert.match(place.popupDesc, /Billedhuggerdammen/);
  assert.match(place.popupDesc, /Sigurd Dickman/);
  assert.match(place.popupDesc, /Egebergløkka parsellhage/);
  assert.match(place.onsite_guidance.conduct, /boliggater/);
  assert.match(place.onsite_guidance.accessibility, /stigning/);
  assert.equal(place.research_notes.every(note => note.use_in_app === false), true);
  for (const legacy of ['safe_facts', 'wonderkammer_seed', 'people_relations_seed']) assert.equal(Object.hasOwn(place, legacy), false);
  assert.equal(place.externalLinks.length, 5);
  assert.equal(place.externalLinks.every(link => /^https:\/\//.test(link.url)), true);
});

test('all content rounds and learning surfaces meet the reviewed counts', () => {
  assert.equal(peopleHere.length, 5);
  assert.deepEqual(peopleHere.map(person => person.id).sort(), place.related_people_ids.toSorted());
  assert.equal(place.objects.length, 3);
  assert.equal(place.objects.every(object => object.physicalObject && object.placeSpecific && object.source_urls.length), true);
  assert.equal(place.related_place_ids.length, 4);
  assert.equal(place.nature_profile.themes.length, 5);
  assert.equal(leksikon.length, 1);
  assert.equal(leksikon[0].chronology.length, 12);
  assert.equal(language.entries.length, 4);
  assert.equal(stories.length, 3);
  assert.equal(trails.length, 3);
  assert.equal(quizSets.length, 7);
  assert.equal(questions.length, 44);
  assert.equal(questions.every(question => question.placeId === id), true);
});

test('production and quality gates close without blockers', () => {
  assert.equal(production.status, 'ready_v4_2');
  assert.equal(production.roundsReadiness.status, 'production_ready');
  assert.equal(production.completion.currentStatus, 'current');
  assert.equal(audit.status, 'PRODUCTION_READY');
  assert.deepEqual(audit.blockers, []);
  assert.equal(audit.checklist.every(row => row.status === 'PASS'), true);
  assert.equal(Object.values(audit.quality_score.dimensions).every(score => score >= 4), true);
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
});

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const fixture = `<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/"><link rel="stylesheet" href="/css/place-popup-tabs.css"></head><body class="hg-app"><div class="hg-popup place-popup-v2"><article class="hg-place-popup-v2"><div class="hg-place-popup-body"><section class="hg-place-hero"><h1>${place.name}</h1><div class="hg-place-popup-text">${place.popupDesc.split(/\n\s*\n/).map(value => `<p>${value}</p>`).join('')}</div></section></div></article></div><div id="placeCard" data-current-place-id="${id}"><div class="pc-body"><div class="pc-title-row"><div id="pcBadgesIcon" class="pc-round"></div></div><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div></div><div id="pcPeopleList"></div><div id="pcBrandsList"></div></div></div><script>window.showPlacePopup=()=>{};window.showPlacePopup.__hgPlacePopupV2=true;window.PLACES=${JSON.stringify([place, ...related])};window.LEKSIKON_BY_PLACE={${id}:${JSON.stringify(leksikon)}};window.LESESPOR=${JSON.stringify(trailsRaw)};window.HGLeksikon={init:async()=>{}};window.DataHub={loadLesespor:async()=>window.LESESPOR};window.getPeopleForPlace=placeId=>${JSON.stringify(peopleHere)}.filter(person=>[person.placeId,...(person.places||[])].includes(placeId));</script><script src="/js/stories/stories_loader.js"></script><script src="/js/brands/brands_loader.js"></script><script src="/js/ui/place-rounds-visual-collections.js"></script><script src="/js/ui/place-popup-tabs.js"></script><script src="/js/ui/place-popup-direct-tabs.js"></script><script>Promise.all([window.HGStories.init(),window.HGBrands.init()]).then(async()=>{await window.HGPlaceRounds.apply(window.PLACES[0]);window.HGPlacePopupTabs.decoratePopup(window.PLACES[0]);window.__ready=true}).catch(error=>window.__error=String(error&&error.stack||error));</script></body></html>`;

test('Chromium renders the rich popup and rounds on desktop and mobile', async t => {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    t.skip('playwright is not installed in this checkout; CI installs project dependencies');
    return;
  }
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/__audit__/damstredet.html') { response.writeHead(200, { 'content-type': mime['.html'] }); response.end(fixture); return; }
    const file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end('not found'); return; }
    response.writeHead(200, { 'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' }); response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/tmp/aha-playwright-browsers/chromium_headless_shell-1187/chrome-linux/headless_shell') ? '/tmp/aha-playwright-browsers/chromium_headless_shell-1187/chrome-linux/headless_shell' : undefined);
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`http://127.0.0.1:${server.address().port}/__audit__/damstredet.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__ready === true);
    assert.equal(await page.locator('[role="tab"]').count() >= 9, true);
    for (const tab of ['about', 'history', 'stories', 'reading', 'sources', 'notice', 'meaning', 'counterpoints', 'language']) {
      await page.locator(`[data-place-tab="${tab}"]`).click();
      assert.equal(await page.locator(`[data-place-tab="${tab}"]`).getAttribute('aria-selected'), 'true');
    }
    assert.equal(await page.locator('#hg-place-panel-history .hg-place-tab-timeline-item').count(), 12);
    assert.equal(await page.locator('#hg-place-panel-stories .hg-place-story-card').count(), 3);
    assert.equal(await page.locator('#hg-place-panel-reading .hg-place-reading-card').count(), 3);
    assert.equal(await page.locator('#hg-place-panel-language article, #hg-place-panel-language li').count() >= 4, true);
    assert.deepEqual(await page.evaluate(() => window.HGPlaceRounds.get(window.PLACES[0]).map(round => round.id)), ['people', 'objects', 'related']);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__ready === true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), true);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
