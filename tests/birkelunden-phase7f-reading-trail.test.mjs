import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));
const sha256 = value => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

const readingPath = 'data/lesespor/oslo/lesespor_oslo_by.json';
const data = readJson(readingPath);
const manifest = readJson('data/lesespor/manifest.json');
const runtime = read('js/ui/place-popup-tabs.js');
const audit = read('reports/place-production/birkelunden-phase7f-reading-trail-audit-v1.md');
const workcard = read('reports/place-production/birkelunden-workcard-current.md');
const place = readJson('data/places/by/oslo/places/birkelunden.json');

assert.equal(data.schema, 'history_go_lesespor_v1');
assert.equal(data.city, 'oslo');
assert.equal(data.category, 'by');
assert.equal(data.rights_policy?.default, 'link_only');
assert.ok(Array.isArray(data.items));

const news = data.items.filter(item => Array.isArray(item.place_ids) && item.place_ids.includes('birkelunden'));
assert.equal(news.length, 3, 'Canonical Oslo By Lesespor skal ha tre Birkelunden-spor');
assert.deepEqual(news.map(item => item.id), [
  'lesespor_birkelunden_byleksikon_001',
  'lesespor_birkelunden_riksantikvaren_001',
  'lesespor_birkelunden_pensjonistforbundet_001'
]);

for (const item of news) {
  assert.deepEqual(item.place_ids, ['birkelunden']);
  assert.equal(item.access, 'open');
  assert.equal(item.rights, 'link_only');
  assert.equal(item.source_quality, 'recognized');
  assert.equal(item.verifiedAt, '2026-08-23');
  assert.match(item.url, /^https:\/\//);
  assert.ok(String(item.popupDesc).length > 220);
  assert.ok(String(item.relevance).length > 100);
  assert.doesNotMatch(item.popupDesc, /Paulus kirke.*stedfortreder|Grünerløkka skole.*stedfortreder/i);
}

const byleksikon = news[0];
assert.equal(byleksikon.publication, 'Oslo byleksikon');
assert.equal(byleksikon.type, 'leksikonartikkel');
assert.equal(byleksikon.url, 'https://oslobyleksikon.no/side/Birkelunden');
assert.match(byleksikon.popupDesc, /1860-årene/);
assert.match(byleksikon.popupDesc, /1916–20/);
assert.match(byleksikon.popupDesc, /parkens egen fysiske flate/);

const riksantikvaren = news[1];
assert.equal(riksantikvaren.author, 'Synne Vik Torsdottir');
assert.equal(riksantikvaren.publication, 'Riksantikvaren');
assert.equal(riksantikvaren.type, 'fagartikkel');
assert.equal(riksantikvaren.source_quality, 'recognized');
assert.equal(riksantikvaren.url, 'https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/');
assert.match(riksantikvaren.popupDesc, /16,3 dekar/);
assert.match(riksantikvaren.popupDesc, /større fredet kulturmiljø/);

const pension = news[2];
assert.equal(pension.publication, 'Pensjonistforbundet');
assert.equal(pension.type, 'organisasjonshistorie');
assert.equal(pension.source_quality, 'recognized');
assert.equal(pension.url, 'https://www.pensjonistforbundet.no/om-oss/var-historie');
assert.match(pension.popupDesc, /Jack Johnsen/);
assert.match(pension.popupDesc, /Venner i Bjerkelunden/);
assert.match(pension.popupDesc, /1937/);

assert.equal(manifest.files.filter(file => file === 'oslo/lesespor_oslo_by.json').length, 1);
assert.ok(!manifest.files.some(file => /birkelunden/i.test(file)), 'Birkelunden skal ikke ha parallell Lesespor-manifestfil');

assert.match(runtime, /list\(item\?\.place_ids\)\.map\(text\)\.includes\(placeId\)/);
assert.match(runtime, /paywall.*subscription.*subscriber.*abonnement.*betalingsmur.*krever abonnement/s);
assert.match(runtime, /Ingen åpne Lesespor for dette stedet ennå/);
assert.match(runtime, /Les teksten ↗/);

assert.match(audit, /Ingen eksisterende manifest-lastet Lesespor-post eide Birkelunden/);
assert.match(audit, /data\/lesespor\/oslo\/lesespor_oslo_by\.json/);
assert.match(audit, /Oslo byleksikon[\s\S]*Publisert/);
assert.match(audit, /Riksantikvaren[\s\S]*Publisert/);
assert.match(audit, /Pensjonistforbundet[\s\S]*Publisert/);
assert.match(audit, /Store norske leksikon[\s\S]*Holdt tilbake/);
assert.match(audit, /Artikkeltekst kopieres ikke/);
assert.match(audit, /validator[\s\S]*canonical Oslo By-fil/i);
assert.match(audit, /Automatiske tester[\s\S]*beviser ikke alene/);

assert.match(workcard, /7F Lesespor \| \*\*KLAR FOR REVIEW \/ CI\*\*/);
assert.match(workcard, /7G Kilder \| \*\*NESTE/);
assert.match(workcard, /data\/lesespor\/oslo\/lesespor_oslo_by\.json/);
assert.match(workcard, /lesespor_birkelunden_byleksikon_001/);
assert.match(workcard, /lesespor_birkelunden_riksantikvaren_001/);
assert.match(workcard, /lesespor_birkelunden_pensjonistforbundet_001/);

assert.equal(sha256(place.desc), 'ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe');
assert.equal(sha256(place.popupDesc), '670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7');
assert.equal(place.spatial_profile?.area_m2, 16300);

console.log('Birkelunden phase 7F reading trail regression: PASS');
