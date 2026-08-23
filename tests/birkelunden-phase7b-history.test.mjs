import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));

const place = readJson('data/places/by/oslo/places/birkelunden.json');
const popupRuntime = read('js/ui/place-popup-v2.js');
const tabsRuntime = read('js/ui/place-popup-tabs.js');
const manifest = readJson('data/leksikon/manifest.json');
const canonicalLeksikonPath = 'data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json';
const canonicalArticle = readJson(canonicalLeksikonPath);

const layers = place.history_layers || [];
assert.equal(layers.length, 4, 'Birkelunden skal beholde fire canonical history_layers');
assert.deepEqual(layers.map(row => row.id), [
  'birkelunden_parken_blir_til',
  'birkelunden_aktivitetspark',
  'birkelunden_moter_og_minnespor',
  'birkelunden_kulturmiljo'
]);
assert.deepEqual(layers.map(row => row.sort_order), [10, 20, 30, 40]);
for (const row of layers) {
  assert.ok(String(row.period || '').trim(), `${row.id} må ha periode`);
  assert.ok(String(row.title || '').trim(), `${row.id} må ha tittel`);
  assert.ok(String(row.summary || '').trim().length >= 100, `${row.id} må ha substansielt sammendrag`);
}

const historyText = layers.map(row => `${row.period} ${row.title} ${row.summary}`).join(' ');
for (const marker of ['1860', '1882', '1916', '1926', '1955', '1996', '2006']) {
  assert.ok(historyText.includes(marker), `Historie-lagene må representere temporal-/historie-markøren ${marker}`);
}
assert.match(layers[2].title, /Navn/);
assert.match(layers[2].summary, /Bjerkelunden/);
assert.match(layers[2].summary, /Birkelunden kom tilbake i 1955/);
assert.equal(place.temporal_profile?.official_bjerkelunden_name_period, '1926–1955');

assert.equal(canonicalArticle.place_id, 'birkelunden');
assert.equal(canonicalArticle.suppress_untitled_legacy_articles, true);
assert.deepEqual(canonicalArticle.chronology, [], 'Birkelunden skal ikke få parallell Leksikon chronology i 7B');

const ownedArticles = [];
for (const file of manifest.files || []) {
  if (!fs.existsSync(file)) continue;
  const value = readJson(file);
  const rows = Array.isArray(value) ? value : [value];
  for (const row of rows) {
    if (String(row?.place_id || row?.placeId || '') === 'birkelunden') ownedArticles.push({ file, row });
  }
}
const main = ownedArticles.find(({ row }) => String(row?.title || row?.name || '').trim().toLowerCase() === 'birkelunden');
assert.ok(main, 'Birkelunden må ha navngitt canonical Leksikon-owner');
assert.equal(main.file, canonicalLeksikonPath);
const visibleArticles = main.row.suppress_untitled_legacy_articles === true
  ? ownedArticles.filter(({ row }) => row === main.row || Boolean(String(row?.title || row?.name || row?.label || '').trim()))
  : ownedArticles;
assert.equal(
  visibleArticles.some(({ row }) => row !== main.row && Array.isArray(row?.chronology) && row.chronology.length),
  false,
  'legacy chronology skal ikke være synlig ved siden av canonical history_layers'
);

assert.match(popupRuntime, /function renderHistoryTimeline\(place\)/, 'popup-v2 må ha canonical history renderer');
assert.match(popupRuntime, /const layers = list\(place\?\.history_layers\)/, 'history renderer må lese canonical history_layers');
assert.match(popupRuntime, /hg-place-history-section/, 'history renderer må merke seksjonen for tabs-runtime');
assert.match(popupRuntime, /\$\{renderHistoryTimeline\(place\)\}/, 'history renderer må være koblet til popup-body');
assert.match(tabsRuntime, /node\.classList\.contains\("hg-place-history-section"\).*tabs\.panels\.history\.appendChild\(node\)/s, 'tabs-runtime må flytte history-seksjonen til Historie-fanen');
assert.match(tabsRuntime, /visibleArticlesForPopup\(articles, main\)/, 'legacy-suppression skal brukes før Historie-ekstraartikler bygges');
assert.doesNotMatch(popupRuntime, /function renderTemporalSection\(/, '7B skal ikke introdusere parallell temporal renderer');

console.log('Birkelunden phase 7B history regression: PASS');
