import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const place = JSON.parse(fs.readFileSync('data/places/by/oslo/places/torggata.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('reports/place-production/torggata-phase8d-structures-audit-v1.json', 'utf8'));
const roundsSource = fs.readFileSync('js/ui/place-rounds-visual-collections.js', 'utf8');
const workcard = fs.readFileSync('reports/place-production/torggata-workcard-current.md', 'utf8');
const expectedIds = ['torggata_eldorado_torggata_9', 'torggata_bad_torggata_16'];
const windows = new Set();
afterEach(() => { for (const w of windows) w.close(); windows.clear(); });

function runtime() {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="torggata"><div class="pc-body"><div class="pc-title-row"></div><div class="pc-icons-quad"></div></div></div></body>', { url: 'https://history-go.test/', runScripts: 'outside-only' });
  const w = dom.window;
  windows.add(w);
  w.PLACES = [place];
  w.eval(roundsSource);
  w.document.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true }));
  return w;
}

test('8D materializes only the source-grounded Torggata structures', () => {
  assert.ok(Array.isArray(place.structures));
  assert.deepEqual(place.structures.map(item => item.id), expectedIds);
  for (const item of place.structures) {
    assert.equal(item.kind, 'structure');
    assert.equal(item.placeSpecific, true);
    assert.ok(item.address.startsWith('Torggata '));
    assert.ok(item.desc.length > 40);
    assert.ok(Array.isArray(item.source_urls) && item.source_urls.length >= 2);
    assert.ok(item.source_urls.every(url => url.startsWith('https://')));
  }
});

test('8D does not duplicate venue identities as separate physical structures', () => {
  const labels = place.structures.map(item => item.title.toLowerCase());
  assert.equal(labels.some(label => label === 'rockefeller'), false);
  assert.equal(labels.some(label => label === 'john dee'), false);
  for (const name of ['Rockefeller', 'John Dee', 'Strøget', 'Torggata south/north subplaces']) {
    assert.ok(audit.held_back.some(item => item.candidate === name), name);
  }
  assert.match(audit.duplicate_rule, /one physical building/i);
  assert.match(audit.quota_policy, /No numeric target/);
});

test('category-four runtime switches Torggata from Images fallback to Structures', () => {
  const w = runtime();
  assert.equal(w.HGPlaceRounds.getFourth(place), 'structures');
  const items = Array.from(w.HGPlaceRounds.getItems(place, 'structures'));
  assert.deepEqual(items.map(item => item.id), expectedIds);
  assert.ok(items.every(item => item.sourceKind === 'structures'));
  const rounds = Array.from(w.HGPlaceRounds.get(place)).map(item => item.id);
  assert.deepEqual(rounds, ['people', 'objects', 'brands', 'structures']);
});

test('street-segment subplaces do not leak into the Structures collection', () => {
  const w = runtime();
  const ids = new Set(Array.from(w.HGPlaceRounds.getItems(place, 'structures')).map(item => item.id));
  assert.equal(ids.has('torggata_sor_stortorvet_youngstorget'), false);
  assert.equal(ids.has('torggata_nord_youngstorget_ankertorget'), false);
});

test('8D audit passes and workcard advances to 8E', () => {
  assert.equal(audit.result, 'PASS');
  assert.match(workcard, /\*\*8D Bygg og anlegg = GODKJENT\.\*\*/);
  assert.match(workcard, /PÅGÅR – 8E legacy rounds \+ slutt-UI/);
  assert.match(workcard, /Neste fase-8-del: \*\*8E legacy rounds \+ slutt-UI\*\*/);
});
