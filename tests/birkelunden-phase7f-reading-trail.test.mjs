import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));
const sha256 = value => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

const readingPath = 'data/lesespor/oslo/birkelunden/lesespor_oslo_by.json';
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
assert.equal(data.items.length, 3);
assert.deepEqual(data.items.map(item => item.id), [
  'lesespor_birkelunden_byleksikon_001',
  'lesespor_birkelunden_riksantikvaren_001',
  'lesespor_birkelunden_pensjonistforbundet_001'
]);

for (const item of data.items) {
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

const byleksikon = data.items[0];
assert.equal(byleksikon.publication, 'Oslo byleksikon');
assert.equal(byleksikon.type, 'leksikonartikkel');
assert.equal(byleksikon.url, 'https://oslobyleksikon.no/side/Birkelunden');
assert.match(byleksikon.popupDesc, /1860-årene/);
assert.match(byleksikon.popupDesc, /1916–20/);
assert.match(byleksikon.popupDesc, /parkens egen fysiske flate/);

const riksantikvaren = data.items[1];
assert.equal(riksantikvaren.author, 'Synne Vik Torsdottir');
assert.equal(riksantikvaren.publication, 'Riksantikvaren');
assert.equal(riksantikvaren.type, 'fagartikkel');
assert.equal(riksantikvaren.source_quality, 'recognized');
assert.equal(riksantikvaren.url, 'https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/');
assert.match(riksantikvaren.popupDesc, /16,3 dekar/);
assert.match(riksantikvaren.popupDesc, /større fredet kulturmiljø/);

const pension = data.items[2];
assert.equal(pension.publication, 'Pensjonistforbundet');
assert.equal(pension.type, 'organisasjonshistorie');
assert.equal(pension.source_quality, 'recognized');
assert.equal(pension.url, 'https://www.pensjonistforbundet.no/om-oss/var-historie');
assert.match(pension.popupDesc, /Jack Johnsen/);
assert.match(pension.popupDesc, /Venner i Bjerkelunden/);
assert.match(pension.popupDesc, /1937/);

const manifestEntry = 'oslo/birkelunden/lesespor_oslo_by.json';
assert.equal(manifest.files.filter(file => file === manifestEntry).length, 1);
const byIndex = manifest.files.indexOf('oslo/lesespor_oslo_by.json');
assert.equal(manifest.files[byIndex + 1], manifestEntry);
assert.ok(!manifest.files.includes('oslo/lesespor_oslo_birkelunden.json'));

assert.match(runtime, /list\(item\?\.place_ids\)\.map\(text\)\.includes\(placeId\)/);
assert.match(runtime, /paywall.*subscription.*subscriber.*abonnement.*betalingsmur.*krever abonnement/s);
assert.match(runtime, /Ingen åpne Lesespor for dette stedet ennå/);
assert.match(runtime, /Les teksten ↗/);

assert.match(audit, /Ingen eksisterende manifest-lastet Lesespor-post eide Birkelunden/);
assert.match(audit, /Oslo byleksikon[\s\S]*Publisert/);
assert.match(audit, /Riksantikvaren[\s\S]*Publisert/);
assert.match(audit, /Pensjonistforbundet[\s\S]*Publisert/);
assert.match(audit, /Store norske leksikon[\s\S]*Holdt tilbake/);
assert.match(audit, /Artikkeltekst kopieres ikke/);
assert.match(audit, /Automatiske tester[\s\S]*beviser ikke alene/);
assert.match(audit, /oslo\/birkelunden\/lesespor_oslo_by\.json/);

assert.match(workcard, /7F Lesespor \| \*\*KLAR FOR REVIEW \/ CI\*\*/);
assert.match(workcard, /7G Kilder \| \*\*NESTE/);
assert.match(workcard, /lesespor_birkelunden_byleksikon_001/);
assert.match(workcard, /lesespor_birkelunden_riksantikvaren_001/);
assert.match(workcard, /lesespor_birkelunden_pensjonistforbundet_001/);
assert.match(workcard, /oslo\/birkelunden\/lesespor_oslo_by\.json/);

assert.equal(sha256(place.desc), 'ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe');
assert.equal(sha256(place.popupDesc), '670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7');
assert.equal(place.spatial_profile?.area_m2, 16300);

console.log('Birkelunden phase 7F reading trail regression: PASS');
