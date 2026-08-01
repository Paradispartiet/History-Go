import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const leksikonPath = 'data/leksikon/places/oslo/politikk/leksikon_oslo_tinghus.json';
const articles = readJson(leksikonPath);
const news = articles.filter(article => article.place_id === 'tinghuset' && article.type === 'news_note');
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const styles = fs.readFileSync('css/place-popup-tabs.css', 'utf8');
const report = fs.readFileSync('reports/place-production/tinghuset-politikk-v1.md', 'utf8');

test('Oslo tinghus has three dated, place-specific news notes', () => {
  assert.equal(news.length, 3);
  assert.equal(new Set(news.map(item => item.id)).size, 3);
  assert.ok(news.every(item => item.category === 'nyere_notis'));
  assert.ok(news.every(item => item.year === 2025));
  assert.ok(news.every(item => item.source_checked_at === '2026-08-01'));
  assert.ok(news.every(item => item.classification?.source_quality === 'official_primary'));
});
test('Each note preserves its factual and inferential boundary', () => {
  const byId = new Map(news.map(item => [item.id, item]));
  const security = byId.get('tinghuset_nyhet_sikkerhetskontroll_2025');
  assert.match(security.popupDesc, /137 953 personer/);
  assert.match(security.wikiText.join(' '), /172 ulovlige gjenstander/);
  assert.match(security.wikiText.join(' '), /beviser ikke alene effekten/);

  const pilot = byId.get('tinghuset_nyhet_normert_rettsmotetid_2025');
  assert.match(pilot.popupDesc, /mars 2025/);
  assert.match(pilot.wikiText.join(' '), /midtveisevalueres høsten 2026/);
  assert.match(pilot.wikiText.join(' '), /ikke at prosjektet allerede har/);

  const capacity = byId.get('tinghuset_nyhet_kapasitet_2025');
  assert.match(capacity.popupDesc, /90-dagersmålet/);
  assert.match(capacity.wikiText.join(' '), /uten nye dommer- eller saksbehandlerressurser/);
  assert.match(capacity.wikiText.join(' '), /ikke kvaliteten i enkeltavgjørelser/);
});

test('News sources are official HTTPS pages and stay in the News surface', () => {
  for (const item of news) {
    assert.equal(item.sources.length, 1);
    assert.match(item.sources[0].url, /^https:\/\/www\.domstol\.no\//);
    assert.match(item.sources[0].label, /^Oslo tingrett/);
    assert.equal(item.externalLinks, undefined);
  }
  assert.match(runtime, /function newsCards\(items\)/);
  assert.match(runtime, /list\(item\?\.sources\)\[0\]/);
  assert.match(runtime, /class="hg-place-news-source"/);
  assert.match(runtime, /rel="noopener noreferrer"/);
  assert.match(styles, /\.hg-place-tab-card \.hg-place-news-source/);
});

test('News remains complete while the Reading phase advances', () => {
  assert.match(report, /\| Nyheter \| PASS – fase 5 \|/);
  assert.match(report, /\| Lesespor \| PASS – fase 6 \|/);
  assert.match(report, /\| Kilder \| Ikke startet \|/);
  assert.match(report, /Status for samlet sted: \*\*under sanering – ikke produksjonsklart\*\*/);
});
