import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));

const place = readJson('data/places/politikk/oslo/places_politikk/youngstorget.json');
const popupRuntime = read('js/ui/place-popup-v2.js');
const historyRuntime = read('js/ui/place-sheet/sections/history.ts');
const tabsRuntime = read('js/ui/place-popup-tabs.js');
const manifest = readJson('data/leksikon/manifest.json');

const layers = place.history_layers || [];
assert.equal(layers.length, 4, 'Youngstorget skal beholde fire canonical history_layers');
assert.deepEqual(layers.map(row => row.id), [
  'youngstorget_markedstorget',
  'youngstorget_arbeiderbevegelsen',
  'youngstorget_navn_og_minnespor',
  'youngstorget_omforming'
]);
assert.deepEqual(layers.map(row => row.sort_order), [10, 20, 30, 40]);
for (const row of layers) {
  assert.ok(String(row.period || '').trim(), `${row.id} må ha periode`);
  assert.ok(String(row.title || '').trim(), `${row.id} må ha tittel`);
  assert.ok(String(row.summary || '').trim().length >= 100, `${row.id} må ha substansielt sammendrag`);
}

const historyText = layers.map(row => `${row.period} ${row.title} ${row.summary}`).join(' ');
for (const year of [1846, 1852, 1890, 1951, 1958, 1996]) {
  assert.ok(historyText.includes(String(year)), `Historie-lagene må representere temporal-milepælen ${year}`);
}
assert.deepEqual(Object.values(place.temporal_profile || {}), [1846, 1852, 1890, 1951, 1958, 1996]);

assert.match(historyRuntime, /export function canonicalHistoryLayers\(/, 'Place Sheet må ha canonical history renderer');
assert.match(historyRuntime, /place\.history_layers/, 'shared history renderer må lese canonical history_layers');
assert.match(historyRuntime, /hg-place-history-section/, 'shared history renderer må bevare Historie-seksjonskontrakten');
assert.match(popupRuntime, /HGPlaceSheetSections\?\.history/, 'standalone popup må bruke shared History-renderer når den er tilgjengelig');
assert.match(popupRuntime, /suppressPlaceHistory/, 'Unified må kunne undertrykke popupens duplicate history_layers');
assert.match(tabsRuntime, /node\.classList\.contains\("hg-place-history-section"\).*tabs\.panels\.history\.appendChild\(node\)/s, 'tabs-runtime må fortsatt støtte standalone history-seksjonen i Historie-fanen');
assert.match(tabsRuntime, /const timeline = renderTimeline\(\[\.\.\.list\(main\?\.chronology\), \.\.\.extras\.flatMap\(article => list\(article\?\.chronology\)\)\]\)/, 'Leksikon chronology skal fortsatt ha egen eksplisitt eiervei');
assert.doesNotMatch(popupRuntime, /function renderTemporalSection\(/, '7B skal ikke introdusere parallell temporal renderer');

const ownedArticles = [];
for (const file of manifest.files || []) {
  if (!fs.existsSync(file)) continue;
  const value = readJson(file);
  const rows = Array.isArray(value) ? value : [value];
  for (const row of rows) {
    if (String(row?.place_id || row?.placeId || '') === 'youngstorget') ownedArticles.push({ file, row });
  }
}
assert.equal(ownedArticles.length, 0, 'Youngstorget skal ikke få en filler-Leksikonartikkel/chronology i fase 7B');

const sources = place.source_summary?.safe_sources || [];
assert.ok(sources.some(source => source.includes('Oslo kommune')));
assert.ok(sources.some(source => source.includes('Oslo byleksikon')));
assert.ok(sources.some(source => source.includes('Arbeiderbevegelsens arkiv')));

console.log('Youngstorget phase 7B history regression: PASS');
