import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = fs.readFileSync(path.join(ROOT, 'js/ui/micro-place-card.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css/micro-place-card.css'), 'utf8');
const windows = new Set();

afterEach(() => {
  for (const window of windows) window.close();
  windows.clear();
});

function fixture() {
  const dom = new JSDOM(`<!doctype html><html><head></head><body class="hg-app"><div id="placeCard"><div class="pc-body"><div class="pc-title-row"><div id="pcBadgesIcon"></div></div><div class="pc-grid"><div class="pc-frontcard"></div><div class="pc-side-stack"><div class="pc-icons-quad"></div></div><div id="pcEventsBox" class="pc-events-quad"></div></div><div id="pcLesespor"></div></div></div><footer><button id="pcQuiz"></button><button id="pcObserve"></button></footer></body></html>`, {
    url: 'https://history-go.test/',
    runScripts: 'outside-only'
  });
  windows.add(dom.window);
  dom.window.requestAnimationFrame = callback => { callback(); return 1; };
  dom.window.openPlaceCard = async () => true;
  dom.window.eval(runtime);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded', { bubbles: true }));
  return dom.window;
}

function plaque(overrides = {}) {
  return {
    id: 'bla_skilt_test',
    name: 'Blått skilt: Test',
    category: 'historie',
    subcategory_id: 'bla_skilt',
    placeTier: 'micro',
    micro_place_profile: {
      schema: 'history_go_micro_place_profile_v1',
      kind: 'minneskilt',
      currentStatus: 'active',
      sourceUrl: 'https://example.test/plaque',
      sourceLocation: 'official listing',
      verifiedAt: '2026-08-26',
      quizMode: 'none'
    },
    image: 'https://upload.wikimedia.org/example-plaque.jpg',
    imageCredit: 'Photographer / Wikimedia Commons',
    imageLicense: 'CC BY-SA 4.0',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
    ...overrides
  };
}

test('Micro Place card renders plaque media only with complete provenance', () => {
  const window = fixture();
  const place = plaque();
  const media = window.HGMicroPlaceCard.governedMedia(place);
  assert.equal(media?.image, place.image);
  assert.equal(media?.sourceUrl, place.imageSourceUrl);
  assert.equal(media?.credit, place.imageCredit);
  assert.equal(media?.license, place.imageLicense);

  window.HGMicroPlaceCard.apply(place);
  const panel = window.document.getElementById('pcMicroIdentity');
  const figure = panel.querySelector('.pc-micro-media');
  assert.ok(figure);
  assert.equal(panel.classList.contains('has-governed-media'), true);
  assert.equal(figure.querySelector('img')?.getAttribute('src'), place.image);
  assert.equal(figure.querySelector('img')?.getAttribute('alt'), place.name);
  assert.equal(figure.querySelector('a')?.getAttribute('href'), place.imageSourceUrl);
  assert.match(figure.querySelector('figcaption')?.textContent || '', /Photographer \/ Wikimedia Commons · CC BY-SA 4\.0/);
});

test('Micro Place card fails closed when any image provenance field is missing', () => {
  const window = fixture();
  for (const key of ['imageCredit', 'imageLicense', 'imageSourceUrl']) {
    const place = plaque({ [key]: '' });
    assert.equal(window.HGMicroPlaceCard.governedMedia(place), null, key);
    window.HGMicroPlaceCard.apply(place);
    assert.equal(window.document.querySelector('.pc-micro-media'), null, key);
    assert.equal(window.document.getElementById('pcMicroIdentity').classList.contains('has-governed-media'), false, key);
  }
});

test('Micro Place media is removed when returning to a standard Place', () => {
  const window = fixture();
  window.HGMicroPlaceCard.apply(plaque());
  assert.ok(window.document.querySelector('.pc-micro-media'));
  window.HGMicroPlaceCard.apply({ id: 'standard', category: 'historie' });
  assert.equal(window.document.querySelector('.pc-micro-media'), null);
  assert.equal(window.document.getElementById('pcMicroIdentity').hidden, true);
});

test('Micro Place media stays compact on desktop and mobile', () => {
  assert.match(css, /max-width:520px/);
  assert.match(css, /\.pc-micro-media\{[\s\S]*height:142px/);
  assert.match(css, /@media\(max-width:520px\)[\s\S]*\.pc-micro-media\{height:118px\}/);
});
