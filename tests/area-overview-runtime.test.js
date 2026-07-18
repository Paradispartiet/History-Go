const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const runtimePath = path.join(__dirname, '..', 'js', 'ui', 'area-overview.js');
const source = fs.readFileSync(runtimePath, 'utf8');

function fakeElement() {
  return {
    id: '',
    hidden: false,
    dataset: {},
    className: '',
    innerHTML: '',
    style: {},
    classList: { add() {}, remove() {} },
    setAttribute() {},
    getAttribute() { return null; },
    appendChild() {},
    insertBefore() {},
    addEventListener() {},
    querySelector() { return null; },
    closest() { return null; },
    focus() {}
  };
}

const elements = new Map();
const body = fakeElement();
const head = fakeElement();

const document = {
  body,
  head,
  createElement() { return fakeElement(); },
  getElementById(id) { return elements.get(id) || null; },
  querySelector() { return null; },
  addEventListener() {}
};

const window = {
  document,
  PLACES: [],
  CATEGORY_LIST: [],
  setInterval() { return 1; },
  clearInterval() {},
  showToast() {}
};

const sandbox = {
  window,
  document,
  Element: function Element() {},
  console,
  Math,
  Number,
  String,
  Set,
  Map
};

vm.runInNewContext(source, sandbox, { filename: runtimePath });

const api = window.HGAreaOverview;
assert(api, 'HGAreaOverview skal eksponeres på window');
assert.deepEqual(Array.from(api.RADII_KM), [2, 5, 20, 50, 100], 'radiusvalgene skal være faste');

const center = { id: 'center', name: 'Center', lat: 59.0, lon: 10.0, category: 'historie' };
window.PLACES = [
  center,
  { id: 'near', name: 'Near', lat: 59.009, lon: 10.0, category: 'sport' },
  { id: 'farther', name: 'Farther', lat: 59.09, lon: 10.0, category: 'natur' },
  { id: 'hidden', name: 'Hidden', lat: 59.001, lon: 10.0, hidden: true },
  { id: 'stub', name: 'Stub', lat: 59.001, lon: 10.0, stub: true },
  { id: 'no_coords', name: 'No coords', category: 'kunst' },
  { id: 'too_far', name: 'Too far', lat: 61.0, lon: 10.0, category: 'by' }
];

const entries = api.buildDistanceIndex(center);
assert.deepEqual(
  Array.from(entries, (entry) => entry.place.id),
  ['near', 'farther'],
  'indeksen skal ekskludere sentrumsted, hidden, stub, manglende koordinater og steder over 100 km'
);
assert(entries[0].distanceKm < entries[1].distanceKm, 'resultater skal sorteres etter geografisk avstand');
assert(api.distanceKm(center, window.PLACES[1]) > 0, 'distanceKm skal beregne positiv luftlinjeavstand');
assert.equal(api.distanceKm(center, { id: 'bad' }), Infinity, 'ugyldige koordinater skal gi Infinity');

console.log('area-overview-runtime.test.js: OK');
