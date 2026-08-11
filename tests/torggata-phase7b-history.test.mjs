import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));

const article = readJson('data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json');
const legacyBatch = readJson('data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json');
const runtime = read('js/ui/place-popup-tabs.js');

assert.equal(article.place_id, 'torggata');
assert.equal(article.suppress_untitled_legacy_articles, true);
assert.deepEqual(article.chronology.map(row => row.year), [1846, 1852, 1876, 1929, 1986, 2014]);
assert.equal(new Set(article.chronology.map(row => row.id)).size, article.chronology.length);
for (const row of article.chronology) {
  assert.ok(row.title && row.desc, `chronology ${row.id} må være konkret`);
  assert.ok(Array.isArray(row.sources) && row.sources.length, `chronology ${row.id} må ha kilder`);
  assert.ok(row.sources.every(source => String(source.url || '').startsWith('https://')));
}

const legacy = legacyBatch.find(row => row.place_id === 'torggata');
assert.ok(legacy, 'legacy-posten skal fortsatt finnes fysisk for sporbarhet');
assert.equal(String(legacy.title || legacy.name || legacy.label || '').trim(), '');
assert.equal(Array.isArray(legacy.sources) ? legacy.sources.length : 0, 0);
assert.ok(legacy.chronology?.some(row => row.period === 'Senmodernitet'));

assert.match(runtime, /function visibleArticlesForPopup\(articles, main\)/);
assert.match(runtime, /main\?\.suppress_untitled_legacy_articles !== true/);
assert.match(runtime, /article === main \|\| Boolean\(text\(article\?\.title \|\| article\?\.name \|\| article\?\.label\)\)/);
assert.match(runtime, /const visibleArticles = visibleArticlesForPopup\(articles, main\)/);
assert.match(runtime, /const extras = visibleArticles\.filter\(article => article !== main\)/);
assert.match(runtime, /renderSources\(place, visibleArticles,/);

console.log('Torggata phase 7B history regression: PASS');
