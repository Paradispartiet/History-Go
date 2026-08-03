import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const read = file => fs.readFileSync(file, 'utf8');
const json = file => JSON.parse(read(file));
const placePath = 'data/places/politikk/oslo/places_politikk/regjeringskvartalet.json';
const place = json(placePath);
const indexedPlace = json('data/places/places_index.json').find(item => item.id === place.id);
const report = read('reports/place-production/regjeringskvartalet-politikk-v1.md');

function normalizeText(value) {
  return String(value || '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
}

function sourceHash(value) {
  const payload = {
    name: normalizeText(value.name),
    desc: normalizeText(value.desc),
    popupDesc: normalizeText(value.popupDesc || value.popupdesc)
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

function wordCount(value) {
  return normalizeText(value).split(/\s+/).filter(Boolean).length;
}

test('onsite-profilen har bare handlinger som faktisk passer Regjeringskvartalet', () => {
  const contract = json('data/categories/place_onsite_contract.json');
  const onsite = read('js/ui/place-onsite-surface.js');

  assert.deepEqual(contract.categoryPolicy.politikk, {
    events: 'always',
    'social-meet': 'always',
    'knowledge-meet': 'always',
    play: 'never'
  });
  for (const field of ['tasks_profile', 'training_profile', 'play_profile']) {
    assert.equal(Object.hasOwn(place, field), false, field);
  }
  for (const label of ['Events', 'Avtal å møtes', 'Kunnskapsmøte']) {
    assert.match(onsite, new RegExp(label));
  }
  assert.match(onsite, /Ingen aktuelle events/);
  assert.match(onsite, /contextType:"place", contextId:placeId/);
  assert.match(report, /\| Tasks \| N\/A \|/);
  assert.match(report, /\| Training \| N\/A \|/);
  assert.match(report, /\| Play \| N\/A \|/);
});

test('Observer, Notat og Rute bruker eksisterende eiere og gyldig observasjonslinse', () => {
  const card = read('js/ui/place-card.js');
  const lenses = json('data/observations/observations_by.json');

  assert.equal(lenses.subject_id, 'by');
  assert.ok(lenses.lenses.some(lens => lens.lens_id === 'by_byliv'));
  assert.match(card, /subject_id: "by"/);
  assert.match(card, /categoryId: String\(place\.categoryId \|\| place\.category \|\| "by"\)/);
  assert.match(card, /lensId: "by_byliv"/);
  assert.match(card, /window\.handlePlaceNote\(place\)/);
  assert.match(card, /window\.showNavRouteToPlace\(place\)/);
  assert.match(report, /historisk rute N\/A/);
});

test('relations og NextUp er canonicale uten parallelle place-felt', () => {
  const relations = json('data/relations_philanthropy.json');
  const rows = relations.filter(row => row.place === place.id);
  const card = read('js/ui/place-card.js');

  assert.equal(rows.length, 4);
  assert.equal(Object.hasOwn(place, 'related_place_ids'), false);
  assert.equal(Object.hasOwn(place, 'relations'), false);
  assert.match(card, /HGNavigator\.buildForPlace\(place/);
  assert.match(card, /new CustomEvent\("hg:mpNextUp"/);
  assert.match(report, /\| Curated relations \| PASS \| Fire kildebelagte relasjoner/);
});

test('canonicalt navn og dokumenterte aliaser finnes i det globale søket', () => {
  assert.deepEqual(place.aliases, ['RKV', 'Nytt regjeringskvartal']);
  assert.deepEqual(indexedPlace.aliases, place.aliases);

  const dom = new JSDOM('<input id="globalSearch"><div id="searchResults"></div>', {
    url: 'https://history-go.test/',
    runScripts: 'outside-only'
  });
  const { window } = dom;
  window.PLACES = [indexedPlace];
  window.PEOPLE = [];
  window.CATEGORY_LIST = [{ id: 'politikk', name: 'Politikk' }];
  window.eval(read('js/ui/search.js'));

  for (const query of ['Regjeringskvartalet', 'RKV', 'Nytt regjeringskvartal']) {
    const result = window.globalSearch(query);
    assert.deepEqual(result.places.map(item => item.id), [place.id], query);
  }
  dom.window.close();
});

test('Nearby viser canonicalt bilde og åpner canonical place-rute', () => {
  const dom = new JSDOM('<div id="nearbyList"></div>', {
    url: 'https://history-go.test/',
    runScripts: 'outside-only'
  });
  const { window } = dom;
  window.visited = {};
  window.HGNearbyPlaceSelector = {
    select: () => ({
      items: [{ ...place, _d: 25, _timeSortKey: 1958, _timeLabel: '1958', _epokeLabel: '', _isZeitgeist: false }],
      filterMode: 'all',
      sortMode: 'distance',
      badgeFilter: 'all',
      favoritesOnly: false,
      freshPlaceId: ''
    })
  };
  window.eval(read('dist/web/nearbyPlacesList.js'));
  window.HGNearbyPlacesList.render();

  const image = window.document.querySelector('.nearby-thumb');
  const item = window.document.querySelector('.nearby-item');
  assert.equal(image.getAttribute('src'), place.popupImage);
  assert.equal(window.document.querySelector('.nearby-title').textContent, place.name);
  item.click();
  assert.equal(window.location.hash, '#/place/regjeringskvartalet');
  dom.window.close();
});

test('alle brukte place-oversettelser er ferske og fullverdige', () => {
  const expectedHash = sourceHash(place);
  const sourceWords = wordCount(place.popupDesc);
  assert.equal(expectedHash, 'c0421036b6d22a2f');

  for (const lang of ['en', 'es', 'pt']) {
    const entry = json(`data/i18n/content/places/${lang}.json`)[place.id];
    assert.equal(entry._sourceHash, expectedHash, lang);
    assert.ok(wordCount(entry.desc) >= 35, `${lang}: desc`);
    assert.ok(wordCount(entry.popupDesc) / sourceWords >= 0.75, `${lang}: popup coverage`);
    assert.equal(entry.popupDesc.split(/\n\n/).length, 9, `${lang}: paragraphs`);
  }
});

test('fysisk besøk har synlig knapp og beholder quiz-separasjonen', async () => {
  const dom = new JSDOM('<button id="pcVisit">Registrer besøk</button><button id="pcClose"></button>', {
    url: 'https://history-go.test/',
    runScripts: 'outside-only'
  });
  const { window } = dom;
  window.TEST_MODE = true;
  window.visited = {};
  window.DataHub = {};
  window.HG_I18N = { t: (_key, fallback) => fallback };
  window.saveVisitedFromQuiz = id => { window.visited[String(id)] = true; };
  window.openPlaceCard = async () => undefined;
  window.eval(read('js/ui/place-card-quizcards-patch.js'));

  await window.openPlaceCard(place);
  const button = window.document.getElementById('pcVisit');
  assert.match(button.textContent, /Registrer besøk/);
  assert.equal(button.disabled, false);
  button.click();
  assert.equal(window.HGPhysicalVisits.isVisited(place.id), true);
  assert.match(button.textContent, /Besøkt/);
  assert.equal(window.saveVisitedFromQuiz(place.id), false);
  dom.window.close();
});

test('place-progress holder quiz og fysisk besøk som uavhengige akser', () => {
  const dom = new JSDOM('', { url: 'https://history-go.test/', runScripts: 'outside-only' });
  const { window } = dom;
  window.HGLearningLog = { getQuizHistory: () => [{ id: place.id }] };
  window.eval(read('js/progress/profileProgressReader.js'));

  let summary = window.HGProfileProgressReader.getPlaceProgressSummary(place.id, { category: 'politikk' });
  assert.equal(summary.status, 'quiz_completed');
  assert.equal(summary.nextAction, 'visit');

  window.localStorage.setItem('visited_places', JSON.stringify({ [place.id]: true }));
  summary = window.HGProfileProgressReader.getPlaceProgressSummary(place.id, { category: 'politikk' });
  assert.equal(summary.status, 'completed');
  assert.equal(summary.nextAction, 'completed');

  window.HGLearningLog = { getQuizHistory: () => [] };
  summary = window.HGProfileProgressReader.getPlaceProgressSummary(place.id, { category: 'politikk' });
  assert.equal(summary.status, 'visited');
  assert.equal(summary.nextAction, 'quiz');
  dom.window.close();
});

test('favoritt, profil og spillerstatus bruker eksisterende felleslag', () => {
  const card = read('js/ui/place-card.js');
  const nearby = read('js/ui/nearby-status-surface.js');
  const collection = read('js/profile-place-collection.js');
  const miniProfile = read('js/ui/mini-profile.js');

  assert.match(card, /document\.getElementById\("pcFavorite"\)/);
  assert.match(card, /HGFavoritePlaces/);
  assert.match(nearby, /HGProfileProgressReader/);
  assert.match(nearby, /Gjenstår: Registrer besøk/);
  assert.match(collection, /new Set\(\[\.\.\.getVisitedPlaceIds\(\), \.\.\.getQuizCollectedPlaceIds\(\)\]\)/);
  assert.match(collection, /place\.popupImage/);
  assert.match(miniProfile, /window\.location\.href = "profile\.html"/);
  assert.match(report, /\| People\/Object\/andre unlocks \| N\/A \|/);
  assert.match(report, /\| Badge\/merit\/Bronse–Sølv–Gull \| N\/A \|/);
});

test('fase 17 dokumenterer hele den tidligere åpne sjekklisten', () => {
  assert.match(report, /Status: \*\*PRODUKSJONSKLAR – fase 17 PASS/);
  for (const area of [
    'Events',
    'Avtal å møtes',
    'Kunnskapsmøte',
    'Observer',
    'Notat',
    'Rute',
    'NextUp',
    'Nearby',
    'Søk og alias',
    'i18n',
    'Offentlig hjemsted',
    'Fysisk besøk',
    'Quiz ↔ fysisk besøk',
    'Favoritt',
    'Place-progress og Next Action',
    'Profil / miniProfile',
    'Konsistent status',
    'QA'
  ]) {
    assert.match(report, new RegExp(`\\| ${area.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')} \\|`), area);
  }
});
