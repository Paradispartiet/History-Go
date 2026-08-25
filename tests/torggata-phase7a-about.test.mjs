import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));

const manifest = readJson('data/leksikon/manifest.json');
const articlePath = 'data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json';
const article = readJson(articlePath);
const tabsRuntime = read('js/ui/place-popup-tabs.js');
const leksikonRuntime = read('js/leksikon/leksikon_loader.js');

assert.ok(manifest.files.includes(articlePath), 'Torggata-hovedartikkelen må være manifest-lastet');
assert.equal(article.place_id, 'torggata');
assert.equal(article.title, 'Torggata');
assert.equal(article.type, 'main');
assert.ok(Array.isArray(article.sources) && article.sources.length >= 2);
assert.ok(article.sources.every(source => String(source.url || '').startsWith('https://')));
assert.ok(Array.isArray(article.externalLinks) && article.externalLinks.length >= 2);
assert.ok(article.externalLinks.every(link => String(link.url || '').startsWith('https://')));
assert.ok(article.facts.length >= 2);
assert.ok(article.facts.every(fact => Array.isArray(fact.sources) && fact.sources.length));

assert.match(
  tabsRuntime,
  /rows\.find\(article => text\(article\?\.title \|\| article\?\.name\)\.toLowerCase\(\) === placeName\)/,
  'popup-tabs må prioritere leksikonartikkel som matcher canonical stedsnavn'
);
assert.match(
  leksikonRuntime,
  /const byPlaceName = rows\.find\([\s\S]*title === placeName[\s\S]*if \(byPlaceName\) return byPlaceName/,
  'Leksikonhuben må prioritere navnematchet hovedartikkel foran legacy fallback'
);

const legacyBatch = readJson('data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json');
const legacy = legacyBatch.find(row => row.place_id === 'torggata');
assert.ok(legacy, 'legacy Torggata-post beholdes foreløpig for sporbarhet');
assert.notEqual(article, legacy);
assert.equal(article.chronology.length, 6, 'sluttstatus skal bevare den kildebårne 7B-chronologyen');
assert.deepEqual(article.chronology.map(entry => entry.year), [1846, 1852, 1876, 1929, 1986, 2014]);

console.log('Torggata phase 7A about regression: PASS');
