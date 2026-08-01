import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const path = 'data/lesespor/oslo/lesespor_oslo_politikk.json';
const document = readJson(path);
const rows = document.items.filter(item => item.place_ids?.includes('tinghuset'));
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const report = fs.readFileSync('reports/place-production/tinghuset-politikk-v1.md', 'utf8');

test('Oslo tinghus has four complementary canonical reading tracks', () => {
  assert.equal(document.schema, 'history_go_lesespor_v1');
  assert.equal(document.city, 'oslo');
  assert.equal(document.category, 'politikk');
  assert.equal(rows.length, 4);
  assert.equal(new Set(rows.map(item => item.id)).size, 4);
  assert.deepEqual(new Set(rows.map(item => item.id)), new Set([
    'lesespor_tinghuset_domstolene_001',
    'lesespor_tinghuset_kunst_001',
    'lesespor_tinghuset_rettssaken_001',
    'lesespor_tinghuset_nou_001'
  ]));
});

test('Reading tracks are open, link-only and explicitly place-linked', () => {
  const forbidden = ['article_body', 'fulltext', 'body', 'text', 'content'];
  for (const item of rows) {
    assert.equal(item.access, 'open');
    assert.equal(item.rights, 'link_only');
    assert.equal(item.curation_status, 'approved');
    assert.match(item.url, /^https:\/\//);
    assert.ok(item.relevance.length >= 80);
    assert.deepEqual(item.place_ids, ['tinghuset']);
    for (const field of forbidden) assert.equal(Object.hasOwn(item, field), false);
  }
});

test('The collection preserves known and unknown publication dates honestly', () => {
  const byId = new Map(rows.map(item => [item.id, item]));
  assert.equal(byId.get('lesespor_tinghuset_domstolene_001').year, 2017);
  assert.equal(byId.get('lesespor_tinghuset_domstolene_001').date, null);
  assert.equal(byId.get('lesespor_tinghuset_kunst_001').year, null);
  assert.equal(byId.get('lesespor_tinghuset_kunst_001').date, null);
  assert.equal(byId.get('lesespor_tinghuset_rettssaken_001').year, 2020);
  assert.equal(byId.get('lesespor_tinghuset_nou_001').date, '2014-10-28');
});

test('The existing Reading renderer filters by place and excludes paywalls', () => {
  assert.match(runtime, /function renderLesespor\(items, placeId\)/);
  assert.match(runtime, /list\(item\?\.place_ids\).*includes\(placeId\)/);
  assert.match(runtime, /paywall.*subscription.*subscriber.*abonnement.*betalingsmur.*krever abonnement/);
  assert.match(runtime, /item\?\.relevance/);
  assert.match(runtime, /Les teksten ↗/);
  assert.match(runtime, /rel="noopener noreferrer"/);
});

test('Phase report marks Reading complete and keeps later phases open', () => {
  assert.match(report, /\| Lesespor \| PASS – fase 6 \|/);
  assert.match(report, /\| Kilder \| Ikke startet \|/);
  assert.match(report, /\| Mer \| Ikke startet \|/);
  assert.match(report, /Status for samlet sted: \*\*under sanering – ikke produksjonsklart\*\*/);
});
