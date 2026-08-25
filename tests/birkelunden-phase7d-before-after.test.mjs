import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));
const sha256 = value => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

const place = readJson('data/places/by/oslo/places/birkelunden.json');
const placeCard = read('js/ui/place-card.js');
const popupTabs = read('js/ui/place-popup-tabs.js');
const forNa = place.for_na;

assert.ok(forNa, 'Birkelunden skal ha canonical for_na');
assert.equal(forNa.title, 'Birkelunden ca. 1930 og 2013');
assert.match(forNa.beforeImageLabel, /ca\. 1930/);
assert.match(forNa.nowImageLabel, /2013/);

assert.equal(forNa.beforeImage, 'https://ems.dimu.org/image/012sB3HjP2a4?dimension=1200x1200');
assert.equal(forNa.beforeImageMeta?.sourcePage, 'https://oslobilder.no/OMU/OB.Z02741');
assert.equal(forNa.beforeImageMeta?.objectId, 'OB.Z02741');
assert.equal(forNa.beforeImageMeta?.author, 'Mittet & Co');
assert.equal(forNa.beforeImageMeta?.credit, 'Mittet & Co / Oslo Museum (OB.Z02741)');
assert.equal(forNa.beforeImageMeta?.license, 'Creative Commons 3.0');
assert.equal(forNa.beforeImageMeta?.date, 'ca. 1930');
assert.equal(forNa.beforeImageMeta?.verified, true);

assert.equal(forNa.nowImage, 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Birkelunden_fountain_and_music_pavilion.jpg');
assert.equal(forNa.nowImageMeta?.sourcePage, 'https://commons.wikimedia.org/wiki/File:Birkelunden_fountain_and_music_pavilion.jpg');
assert.equal(forNa.nowImageMeta?.author, 'Carsten R D');
assert.equal(forNa.nowImageMeta?.credit, 'Carsten R D / Wikimedia Commons');
assert.equal(forNa.nowImageMeta?.license, 'CC BY-SA 4.0');
assert.equal(forNa.nowImageMeta?.date, '2013-10-13');
assert.equal(forNa.nowImageMeta?.cameraLocation, '59.926374, 10.760091');
assert.equal(forNa.nowImageMeta?.verified, true);

for (const field of ['before', 'now', 'change']) {
  assert.ok(String(forNa[field] || '').length >= 350, `for_na.${field} skal være substansiell og kildeavgrenset`);
}
assert.match(forNa.before, /selve Birkelunden/);
assert.match(forNa.before, /musikkpaviljong/);
assert.match(forNa.before, /lekeplass/);
assert.match(forNa.now, /samme Otto Hald-bygningen fra 1926/);
assert.match(forNa.now, /2013/);
assert.match(forNa.now, /ikke fremstilles som en dokumentasjon av parkens nøyaktige tilstand i 2026/);
assert.match(forNa.change, /både kontinuitet og endring/);
assert.match(forNa.change, /ikke som selvstendig bevis/);

assert.ok(Array.isArray(forNa.lookFor));
assert.equal(forNa.lookFor.length, 3);
assert.ok(forNa.lookFor.some(item => /musikkpaviljongen fra 1926/.test(item)));
assert.ok(forNa.lookFor.some(item => /vannområdet/.test(item)));
assert.ok(forNa.lookFor.some(item => /trær, benker, lekeutstyr/.test(item)));

assert.ok(Array.isArray(forNa.sources));
assert.equal(forNa.sources.length, 4);
assert.ok(forNa.sources.every(url => /^https:\/\//.test(url)), 'Før/etter-kilder skal være inspectable HTTPS-lenker');
assert.ok(forNa.sources.includes('https://oslobilder.no/OMU/OB.Z02741'));
assert.ok(forNa.sources.includes('https://commons.wikimedia.org/wiki/File:Birkelunden_fountain_and_music_pavilion.jpg'));

const allText = JSON.stringify(forNa);
for (const proxy of ['Paulus kirke', 'Grünerløkka skole']) {
  assert.doesNotMatch(allText, new RegExp(`${proxy}.*primær|primær.*${proxy}`, 'i'), `${proxy} skal ikke brukes som stedfortreder for parken`);
}

assert.equal(sha256(place.desc), 'ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe');
assert.equal(sha256(place.popupDesc), '670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7');
assert.equal(place.spatial_profile?.area_m2, 16300);

assert.match(placeCard, /function renderPlaceCardForNa/);
assert.match(placeCard, /renderPlaceCardForNa\(currentPlace \|\| place\)/);
assert.match(popupTabs, /beforeImageMeta/);
assert.match(popupTabs, /nowImageMeta/);
assert.match(popupTabs, /Bildekilde ↗/);

console.log('Birkelunden phase 7D before-after regression: PASS');
