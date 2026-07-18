const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const runtimePath = path.join(__dirname, '..', 'js', 'ui', 'area-overview-v2.js');
const source = fs.readFileSync(runtimePath, 'utf8');

function fakeElement() {
  return {
    id: '',
    hidden: false,
    dataset: {},
    className: '',
    innerHTML: '',
    classList: { add() {}, remove() {} },
    setAttribute() {},
    appendChild() {},
    addEventListener() {},
    querySelector() { return null; },
    closest() { return null; },
    insertAdjacentElement() {}
  };
}

const document = {
  head: fakeElement(),
  body: fakeElement(),
  createElement() { return fakeElement(); },
  getElementById() { return null; },
  querySelector() { return null; },
  addEventListener() {}
};

const visited = new Set(['p1']);
const quiz = new Set(['p1', 'p3']);
const favorites = new Set(['p2']);

const window = {
  document,
  PLACES: [],
  CATEGORY_LIST: [],
  REL_BY_PLACE: {
    p1: [{ person: 'a' }, { person: 'b' }],
    p2: [],
    p3: [{ person: 'c' }]
  },
  HGProfileProgressReader: {
    getVisitedPlaceIds: () => visited,
    getCompletedQuizUnitIds: () => quiz,
    getFavoritePlaceIds: () => favorites
  },
  setInterval() { return 1; },
  clearInterval() {},
  requestAnimationFrame(fn) { fn(); }
};

const sandbox = {
  window,
  document,
  Element: function Element() {},
  MutationObserver: function MutationObserver() {},
  console,
  Math,
  Number,
  String,
  Set,
  Map
};

vm.runInNewContext(source, sandbox, { filename: runtimePath });

const api = window.HGAreaOverviewV2;
assert(api, 'HGAreaOverviewV2 skal eksponeres på window');

const center = { id: 'center', name: 'Center', lat: 60, lon: 10 };
const east = { place: { id: 'east', lat: 60, lon: 10.1 }, distanceKm: 5 };
const north = { place: { id: 'north', lat: 60.1, lon: 10 }, distanceKm: 11 };

const eastPoint = api.projectEntry(center, east, 20);
const northPoint = api.projectEntry(center, north, 20);
assert(eastPoint.x > 0 && Math.abs(eastPoint.y) < 0.01, 'øst skal projiseres til høyre');
assert(northPoint.y < 0 && Math.abs(northPoint.x) < 0.01, 'nord skal projiseres oppover');

const entries = [
  { place: { id: 'p1', name: 'A', category: 'historie', image: 'a.jpg', desc: 'Rik tekst', people: ['a'] }, distanceKm: 4 },
  { place: { id: 'p2', name: 'B', category: 'historie', image: 'b.jpg', desc: 'Rik tekst', works: ['x'] }, distanceKm: 2 },
  { place: { id: 'p3', name: 'C', category: 'natur', image: 'c.jpg', desc: 'Rik tekst' }, distanceKm: 7 },
  { place: { id: 'p4', name: 'D', category: 'sport' }, distanceKm: 1 }
];

const highlights = Array.from(api.rankHighlights(entries, 3), (entry) => entry.place.id);
assert.equal(highlights.length, 3, 'highlight-listen skal respektere limit');
assert(highlights.includes('p3'), 'første utvalgspass skal sikre kategorimangfold når mulig');

const progress = api.getProgress(entries);
assert.deepEqual(
  { total: progress.total, visited: progress.visited, quizCompleted: progress.quizCompleted, favorites: progress.favorites, percent: progress.percent },
  { total: 4, visited: 1, quizCompleted: 2, favorites: 1, percent: 25 },
  'områdeprogresjon skal lese eksisterende profilprogresjon uten å skrive ny state'
);

console.log('area-overview-v2-runtime.test.js: OK');
