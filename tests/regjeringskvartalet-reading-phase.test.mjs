import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const path = 'data/lesespor/oslo/lesespor_oslo_politikk.json';
const document = readJson(path);
const rows = document.items.filter(item => item.place_ids?.includes('regjeringskvartalet'));
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');
const leksikon = fs.readFileSync('data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json', 'utf8');
const place = readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');

test('Regjeringskvartalet har fire komplementære canonicale Lesespor', () => {
  assert.equal(document.schema, 'history_go_lesespor_v1');
  assert.equal(document.city, 'oslo');
  assert.equal(document.category, 'politikk');
  assert.equal(document.generated_at, '2026-08-02T22:17:00+02:00');
  assert.equal(rows.length, 4);
  assert.deepEqual(new Set(rows.map(item => item.id)), new Set([
    'lesespor_regjeringskvartalet_historie_001',
    'lesespor_regjeringskvartalet_stortingsmelding_001',
    'lesespor_regjeringskvartalet_kunst_001',
    'lesespor_regjeringskvartalet_statsbygg_001'
  ]));
  assert.deepEqual(new Set(rows.map(item => item.type)), new Set([
    'fagartikkel', 'stortingsmelding', 'prosjektside', 'prosjektoversikt'
  ]));
});

test('Lesesporene er åpne, godkjente, link-only og eksplisitt stedskoblet', () => {
  const forbidden = ['article_body', 'fulltext', 'body', 'text', 'content'];
  for (const item of rows) {
    assert.equal(item.access, 'open');
    assert.equal(item.rights, 'link_only');
    assert.equal(item.curation_status, 'approved');
    assert.match(item.url, /^https:\/\//);
    assert.ok(item.relevance.length >= 140);
    assert.deepEqual(item.place_ids, ['regjeringskvartalet']);
    assert.deepEqual(item.person_ids, []);
    for (const field of forbidden) assert.equal(Object.hasOwn(item, field), false);
  }
  assert.deepEqual(new Set(rows.map(item => item.source_quality)), new Set(['canonical', 'institutional']));
});

test('Kjente og ukjente publiseringsdatoer er lagret ærlig', () => {
  const byId = new Map(rows.map(item => [item.id, item]));
  const history = byId.get('lesespor_regjeringskvartalet_historie_001');
  assert.equal(history.author, 'Christina Marwold');
  assert.equal(history.date, null);
  assert.equal(history.year, 2020);

  const policy = byId.get('lesespor_regjeringskvartalet_stortingsmelding_001');
  assert.equal(policy.date, '2019-04-10');
  assert.equal(policy.year, 2019);
  assert.equal(policy.author, 'Kommunal- og moderniseringsdepartementet');

  for (const id of ['lesespor_regjeringskvartalet_kunst_001', 'lesespor_regjeringskvartalet_statsbygg_001']) {
    assert.equal(byId.get(id).date, null);
    assert.equal(byId.get(id).year, null);
  }
});

test('Lesespor-recordene eies bare av Lesespor-flaten', () => {
  const ids = new Set(rows.map(item => item.id));
  const leksikonArticles = JSON.parse(leksikon);
  assert.equal(leksikonArticles.some(item => ids.has(item.id) || item.type === 'reading_trace'), false);
  const externalLinks = place.externalLinks ?? [];
  assert.equal(externalLinks.some(link => ids.has(link.id)), false);
  assert.match(report, /Ingen record er kopiert inn i Leksikon, canonical place-`externalLinks`, Nyheter, Quiz eller Knowledge/);
});

test('Eksisterende Lesespor-renderer filtrerer på sted og avviser betalingsmurer', () => {
  assert.match(runtime, /function renderLesespor\(items, placeId\)/);
  assert.match(runtime, /list\(item\?\.place_ids\).*includes\(placeId\)/);
  assert.match(runtime, /paywall.*subscription.*subscriber.*abonnement.*betalingsmur.*krever abonnement/);
  assert.match(runtime, /item\?\.relevance/);
  assert.match(runtime, /Les teksten ↗/);
  assert.match(runtime, /rel="noopener noreferrer"/);
});

test('Fasekortet lukker Nyheter, åpner Lesespor og peker bare videre til Kilder', () => {
  assert.match(report, /\| 5 \| Nyheter \| \*\*GODKJENT – PR #4668, merge `7cd5a0041e3f1bb4b312bc2b32ca5f8ae27df246`\*\* \|/);
  assert.match(report, /\| Lesespor \| PASS – fase 6 \|/);
  assert.match(report, /\| 6 \| Lesespor \| \*\*GODKJENT – PR #4669, merge `c68881578a5a56c6ae9b610f7c5132fc448297c3`\*\* \|/);
  assert.match(report, /\| 12 \| Brands \| \*\*KLAR FOR REVIEW – N\/A MED EVIDENS\*\* \|/);
  assert.match(report, /ikke produksjonsklart/);
});
