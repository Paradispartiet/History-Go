import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const leksikonPath = 'data/leksikon/places/oslo/historie/leksikon_oslo_historie.json';
const articles = readJson(leksikonPath);
const news = articles.filter(article => article.place_id === 'gamle_aker_kirke' && article.type === 'news_note');
const mainArticle = articles.find(article => article.place_id === 'gamle_aker_kirke' && article.type !== 'news_note');
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const report = fs.readFileSync('reports/place-production/gamle-aker-kirke-historie-v1.md', 'utf8');

test('Gamle Aker har to daterte og stedsspesifikke Nyheter-notiser', () => {
  assert.equal(news.length, 2);
  assert.equal(new Set(news.map(item => item.id)).size, 2);
  assert.ok(news.every(item => item.place_id === 'gamle_aker_kirke'));
  assert.ok(news.every(item => item.category === 'nyere_notis'));
  assert.deepEqual(news.map(item => item.year), [2024, 2025]);
  assert.ok(news.every(item => item.source_checked_at === '2026-08-22'));
  assert.ok(news.every(item => item.classification?.source_quality === 'official_primary'));
  assert.ok(news.every(item => item.classification?.quiz_use === 'none'));
});

test('Hver notis bevarer grensen mellom dokumentert hendelse og kildekonflikt', () => {
  const byId = new Map(news.map(item => [item.id, item]));

  const reopening = byId.get('gamle_aker_nyhet_gjenapning_2024');
  assert.equal(reopening.date, '2024-05-26');
  assert.match(reopening.popupDesc, /26\. mai 2024/);
  assert.match(reopening.wikiText.join(' '), /arbeidene fortsatte ut august eller september 2024/);

  const font = byId.get('gamle_aker_nyhet_dopefontkopi_2025');
  assert.equal(font.date, '2025-10-12');
  assert.match(font.popupDesc, /brukskopi/);
  assert.match(font.wikiText.join(' '), /avgjør ikke om Thomas Blix laget originalen i 1715 eller 1725/);

});

test('Planlagt sluttfase eies bare av Historie-kronologien', () => {
  assert.equal(news.some(item => item.id === 'gamle_aker_nyhet_nodutgang_plan_2026'), false);
  const planned = mainArticle.chronology.find(item => item.id === 'chrono_gak_2026_2027');
  assert.ok(planned);
  assert.match(planned.period, /Planlagt sluttfase 2026–2027/);
  assert.match(planned.desc, /planlagt fra september 2026 til mars 2027/);
});

test('Nyheter bruker navngitte offisielle HTTPS-kilder og blir i riktig flate', () => {
  for (const item of news) {
    assert.ok(item.sources.length >= 1);
    assert.ok(item.sources.every(source => source.label.startsWith('St. Hanshaugen sokn')));
    assert.ok(item.sources.every(source => URL.canParse(source.url) && new URL(source.url).protocol === 'https:'));
    assert.ok(item.sources.every(source => new URL(source.url).hostname === 'www.kirken.no'));
    assert.equal(item.externalLinks, undefined);
  }
  assert.match(runtime, /function newsCards\(items\)/);
  assert.match(runtime, /list\(item\?\.sources\)\[0\]/);
  assert.match(runtime, /class="hg-place-news-source"/);
  assert.match(runtime, /rel="noopener noreferrer"/);
});

test('Fasekortet lukker Før/etter og holder senere popupfaser åpne', () => {
  assert.match(report, /\| 4 \| Før\/etter \| \*\*GODKJENT – PR #4654, merge `850c3b3332f857fb98593f36588bc46cfe6945eb`\*\* \|/);
  assert.match(report, /\| 5 \| Nyheter \| \*\*GODKJENT – PR #4656, merge `1ae7d30113134edc26394289a1afce0226f58246`\*\* \|/);
  assert.match(report, /\| 6 \| Lesespor \| \*\*GODKJENT – PR #4658, merge `c78cb05353bfb61eb68fef74ee9f115dfacc3a8b`\*\* \|/);
  assert.match(report, /sluttfasen 2026–2027 vises bare i Historie-kronologien/);
});
