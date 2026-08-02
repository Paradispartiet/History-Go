import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const leksikonPath = 'data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json';
const articles = readJson(leksikonPath);
const news = articles.filter(article => article.place_id === 'regjeringskvartalet' && article.type === 'news_note');
const mainArticle = articles.find(article => article.id === 'regjeringskvartalet_hovedartikkel');
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');

test('Regjeringskvartalet har to daterte og stedsspesifikke Nyheter-notiser', () => {
  assert.equal(news.length, 2);
  assert.deepEqual(news.map(item => item.id), [
    'regjeringskvartalet_nyhet_g_blokka_forprosjekt_2026',
    'regjeringskvartalet_nyhet_kunstmarkering_2026'
  ]);
  assert.ok(news.every(item => item.category === 'nyere_notis'));
  assert.ok(news.every(item => item.year === 2026));
  assert.ok(news.every(item => item.source_checked_at === '2026-08-02'));
  assert.ok(news.every(item => item.classification?.source_quality === 'official_primary'));
  assert.ok(news.every(item => item.classification?.quiz_use === 'none'));
});

test('Notisene skiller pågående prosess fra gjennomført arrangement', () => {
  const byId = new Map(news.map(item => [item.id, item]));
  const gBlock = byId.get('regjeringskvartalet_nyhet_g_blokka_forprosjekt_2026');
  assert.equal(gBlock.date, '2026-01-29');
  assert.equal(gBlock.reporting_period, 'januar–desember 2026');
  assert.equal(gBlock.classification.temporal_status, 'ongoing');
  assert.match(gBlock.popupDesc, /140 millioner kroner/);
  assert.match(gBlock.wikiText.join(' '), /ikke at rehabiliteringen er vedtatt, startet eller ferdig/);

  const art = byId.get('regjeringskvartalet_nyhet_kunstmarkering_2026');
  assert.equal(art.date, '2026-06-06');
  assert.equal(art.reporting_period, 'juni 2026');
  assert.equal(art.classification.temporal_status, 'completed');
  assert.match(art.popupDesc, /Mer enn 600 mennesker/);
  assert.match(art.wikiText.join(' '), /over 300 kunstverk av bortimot 150 kunstnere/);
  assert.match(art.wikiText.join(' '), /ikke at hele kunstprogrammet eller alle senere byggetrinn/);
});

test('Åpningsdatoene forblir i chronology og dupliseres ikke som Nyheter', () => {
  assert.ok(mainArticle);
  assert.ok(mainArticle.chronology.some(item => item.id === 'chrono_rkv_2026_04'));
  assert.ok(mainArticle.chronology.some(item => item.id === 'chrono_rkv_2026_07'));
  assert.equal(news.some(item => ['2026-04-13', '2026-07-19', '2026-07-22'].includes(item.date)), false);
  assert.equal(news.some(item => /offisielt åpnet|minnestedet åpnet|22\. juli-senteret åpnet/i.test(item.title)), false);
});

test('Nyheter bruker navngitte offisielle HTTPS-kilder og eksisterende runtime', () => {
  const allowedHosts = new Set(['www.regjeringen.no', 'koro.no']);
  for (const item of news) {
    assert.equal(item.sources.length, 1);
    const source = item.sources[0];
    assert.ok(source.label);
    assert.ok(URL.canParse(source.url));
    assert.equal(new URL(source.url).protocol, 'https:');
    assert.ok(allowedHosts.has(new URL(source.url).hostname));
    assert.equal(item.externalLinks, undefined);
  }
  assert.match(news[0].sources[0].label, /Regjeringen\.no/);
  assert.match(news[1].sources[0].label, /KORO/);
  assert.match(runtime, /function newsCards\(items\)/);
  assert.match(runtime, /list\(item\?\.sources\)\[0\]/);
  assert.match(runtime, /class="hg-place-news-source"/);
  assert.match(runtime, /rel="noopener noreferrer"/);
});

test('Fasekortet bevarer Nyheter som godkjent når Lesespor åpnes', () => {
  assert.match(report, /\| 4 \| Før\/etter \| \*\*GODKJENT – PR #4667, merge `dd31ba5d7852eba372c82477e9fc40a5f563b5ca`\*\* \|/);
  assert.match(report, /\| Nyheter \| PASS – fase 5 \|/);
  assert.match(report, /\| 5 \| Nyheter \| \*\*GODKJENT – PR #4668, merge `7cd5a0041e3f1bb4b312bc2b32ca5f8ae27df246`\*\* \|/);
  assert.match(report, /\| 12 \| Brands \| \*\*GODKJENT – PR #4673, merge `f4e078f06422747dd6f1ee34985d9c5752bcb3b6`\*\* \|/);
  assert.match(report, /Åpningen av byggetrinn 1 den 13\. april.*ikke duplisert som nyhetskort/s);
  assert.match(report, /\| 13 \| Badges, fagverk, alle åtte popupfaner, rundinger og full UI-\/produksjonsaudit \| \*\*(?:KLAR FOR REVIEW – FULL UI-\/PRODUKSJONSAUDIT PASS|GODKJENT – PR #[0-9]+, merge `[0-9a-f]{40}`)\*\* \|/);
});
