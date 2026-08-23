import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));
const sha256 = value => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

const readingPath = 'data/lesespor/oslo/lesespor_oslo_by.json';
const data = readJson(readingPath);
const manifest = readJson('data/lesespor/manifest.json');
const place = readJson('data/places/by/oslo/places/birkelunden.json');
const production = readJson('data/places/production/birkelunden.json');
const runtime = read('js/ui/place-popup-tabs.js');
const audit = read('reports/place-production/birkelunden-phase7f-reading-trail-audit-v1.md');
const workcard = read('reports/place-production/birkelunden-workcard-current.md');

assert.equal(data.schema, 'history_go_lesespor_v1');
assert.equal(data.city, 'oslo');
assert.equal(data.category, 'by');
assert.equal(data.rights_policy.default, 'link_only');
assert.equal(data.generated_at, '2026-08-23T00:00:00+02:00');

const items = data.items.filter(item => item.place_ids?.includes('birkelunden'));
assert.equal(items.length, 3, '7F skal publisere tre åpne, direkte Birkelunden-lesespor');
assert.deepEqual(items.map(item => item.id), [
  'lesespor_birkelunden_riksantikvaren_001',
  'lesespor_birkelunden_byarkiv_2006_001',
  'lesespor_birkelunden_byleksikon_001'
]);

for (const item of items) {
  assert.deepEqual(item.place_ids, ['birkelunden'], `${item.id} skal bare eie Birkelunden`);
  assert.equal(item.access, 'open');
  assert.equal(item.rights, 'link_only');
  assert.equal(item.verifiedAt, '2026-08-23');
  assert.match(item.url, /^https:\/\//);
  assert.ok(['recognized', 'institutional'].includes(item.source_quality));
  assert.equal(item.curation_status, 'strong_candidate');
  assert.ok(String(item.popupDesc || '').length > 170, `${item.id} må ha substansiell lesesporbeskrivelse`);
  assert.ok(String(item.relevance || '').length > 80, `${item.id} må forklare faktisk leseverdi`);
  assert.doesNotMatch(
    `${item.popupDesc} ${item.relevance}`,
    /Paulus(?:'|’) plass|Paulus kirke|Grünerløkka skole|Olaf Ryes plass|Sofienbergparken/,
    'nabosteder skal ikke bære Birkelunden-lesesporet'
  );
}

const riksantikvaren = items[0];
assert.equal(riksantikvaren.title, 'Birkelunden – Murbyens hjerte');
assert.equal(riksantikvaren.author, 'Synne Vik Torsdottir');
assert.equal(riksantikvaren.publication, 'Riksantikvaren');
assert.equal(riksantikvaren.date, '2022-04-08');
assert.equal(riksantikvaren.source_quality, 'institutional');
assert.equal(riksantikvaren.url, 'https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/');
assert.match(riksantikvaren.popupDesc, /byplanlegging/);
assert.match(riksantikvaren.popupDesc, /større Birkelunden kulturmiljøet/);
assert.doesNotMatch(riksantikvaren.popupDesc, /første fredede|første freda|første.*kulturmiljø/i, 'held-back strong claim skal ikke restemples i vår beskrivelse');

const byarkiv = items[1];
assert.equal(byarkiv.author, 'Ellen Røsjø');
assert.equal(byarkiv.publication, 'Oslo Byarkiv – TOBIAS');
assert.equal(byarkiv.year, 2006);
assert.equal(byarkiv.type, 'tidsskriftartikkel');
assert.equal(byarkiv.source_quality, 'institutional');
assert.equal(byarkiv.url, 'https://www.oslo.kommune.no/OBA/tobias/tobiasartikler/pdf_arkiv/Tobias_2_3_2006.pdf');
assert.match(byarkiv.title, /distancerer Studenterlunden i Trivsel/);
assert.match(byarkiv.access_note, /42–45/);
assert.match(byarkiv.popupDesc, /arkivfotografier/);

const byleksikon = items[2];
assert.equal(byleksikon.title, 'Birkelunden');
assert.equal(byleksikon.publication, 'Oslo byleksikon');
assert.equal(byleksikon.type, 'leksikonartikkel');
assert.equal(byleksikon.source_quality, 'recognized');
assert.equal(byleksikon.url, 'https://oslobyleksikon.no/side/Birkelunden');
assert.match(byleksikon.popupDesc, /1860-årene/);
assert.match(byleksikon.relevance, /kortere oppslagslesning/);

assert.equal(manifest.files.filter(file => file === 'oslo/lesespor_oslo_by.json').length, 1);
assert.ok(!manifest.files.some(file => /birkelunden/i.test(file)), '7F skal ikke lage kontraktstridig place-spesialfil');

assert.match(runtime, /list\(item\?\.place_ids\)\.map\(text\)\.includes\(placeId\)/);
assert.match(runtime, /paywall.*subscription.*subscriber.*abonnement.*betalingsmur.*krever abonnement/);
assert.match(runtime, /Ingen åpne Lesespor for dette stedet ennå/);
assert.match(runtime, /hg-place-reading-list/);
assert.match(runtime, /Les teksten ↗/);

assert.equal(sha256(place.desc), production.textHashes.desc, '7F skal ikke endre fase-5 desc');
assert.equal(sha256(place.popupDesc), production.textHashes.popupDesc, '7F skal ikke endre fase-5 popupDesc');
assert.equal(place.spatial_profile.area_m2, 16300);

assert.match(audit, /Riksantikvaren/);
assert.match(audit, /Oslo Byarkiv/);
assert.match(audit, /Oslo byleksikon/);
assert.match(audit, /access: open/);
assert.match(audit, /link_only/);
assert.match(audit, /fulltekst/i);
assert.match(audit, /Oslohistorie[\s\S]*ikke valgt/);
assert.match(workcard, /7F Lesespor \| \*\*KLAR FOR REVIEW \/ CI\*\*/);

console.log('Birkelunden phase 7F reading trail regression: PASS');
