import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const path = 'data/lesespor/oslo/lesespor_oslo_historie.json';
const document = readJson(path);
const rows = document.items.filter(item => item.place_ids?.includes('gamle_aker_kirke'));
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const report = fs.readFileSync('reports/place-production/gamle-aker-kirke-historie-v1.md', 'utf8');

test('Gamle Aker har tre komplementære canonicale Lesespor', () => {
  assert.equal(document.schema, 'history_go_lesespor_v1');
  assert.equal(document.city, 'oslo');
  assert.equal(document.category, 'historie');
  assert.equal(rows.length, 3);
  assert.deepEqual(new Set(rows.map(item => item.id)), new Set([
    'lesespor_gamle_aker_kirke_snl_001',
    'lesespor_gamle_aker_kirke_rehabilitering_001',
    'lesespor_gamle_aker_kirke_energi_001'
  ]));
  assert.deepEqual(new Set(rows.map(item => item.source_quality)), new Set([
    'canonical', 'recognized', 'institutional'
  ]));
});

test('Lesesporene er åpne, godkjente, link-only og eksplisitt stedskoblet', () => {
  const forbidden = ['article_body', 'fulltext', 'body', 'text', 'content'];
  for (const item of rows) {
    assert.equal(item.access, 'open');
    assert.equal(item.rights, 'link_only');
    assert.equal(item.curation_status, 'approved');
    assert.match(item.url, /^https:\/\//);
    assert.ok(item.relevance.length >= 120);
    assert.deepEqual(item.place_ids, ['gamle_aker_kirke']);
    assert.deepEqual(item.person_ids, []);
    for (const field of forbidden) assert.equal(Object.hasOwn(item, field), false);
  }
});

test('Kjente og ukjente publiseringsdatoer er lagret ærlig', () => {
  const byId = new Map(rows.map(item => [item.id, item]));
  assert.equal(byId.get('lesespor_gamle_aker_kirke_snl_001').date, '2025-09-04');
  assert.equal(byId.get('lesespor_gamle_aker_kirke_snl_001').year, 2025);
  assert.equal(byId.get('lesespor_gamle_aker_kirke_rehabilitering_001').date, '2024-08-02');
  assert.equal(byId.get('lesespor_gamle_aker_kirke_rehabilitering_001').year, 2024);
  assert.equal(byId.get('lesespor_gamle_aker_kirke_energi_001').date, null);
  assert.equal(byId.get('lesespor_gamle_aker_kirke_energi_001').year, null);
});

test('Eksisterende Lesespor-renderer filtrerer på sted og avviser betalingsmurer', () => {
  assert.match(runtime, /function renderLesespor\(items, placeId\)/);
  assert.match(runtime, /list\(item\?\.place_ids\).*includes\(placeId\)/);
  assert.match(runtime, /paywall.*subscription.*subscriber.*abonnement.*betalingsmur.*krever abonnement/);
  assert.match(runtime, /item\?\.relevance/);
  assert.match(runtime, /Les teksten ↗/);
  assert.match(runtime, /rel="noopener noreferrer"/);
});

test('Fasekortet bevarer godkjent Lesespor når senere faser går videre', () => {
  assert.match(report, /\| 5 \| Nyheter \| \*\*GODKJENT – PR #4656, merge `1ae7d30113134edc26394289a1afce0226f58246`\*\* \|/);
  assert.match(report, /\| 6 \| Lesespor \| \*\*GODKJENT – PR #4658, merge `c78cb05353bfb61eb68fef74ee9f115dfacc3a8b`\*\* \|/);
  assert.match(report, /\| 7 \| Brukerrettede Kilder \| \*\*GODKJENT – PR #5184, merge `31af12e8852cca6d7c2da2ef2e5fdab480a287c2`\*\* \|/);
  assert.match(report, /\| 8 \| Mer \| \*\*GODKJENT – PR #5186, merge `3bc252d347b3dd8561155bdbd49c354378401767`\*\* \|/);
  assert.match(report, /\| 9 \| Quizåpning 2 × 7 og Knowledge \| \*\*KLAR FOR REVIEW – 3 × 7, KNOWLEDGE-LINKET\*\* \|/);
  assert.match(report, /Ingen record er kopiert inn i Leksikon eller `externalLinks`/);
});
