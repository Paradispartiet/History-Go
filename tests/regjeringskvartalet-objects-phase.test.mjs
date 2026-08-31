import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const placePath = 'data/places/politikk/oslo/places_politikk/regjeringskvartalet.json';
const placeBuffer = fs.readFileSync(placePath);
const place = JSON.parse(placeBuffer.toString('utf8'));
const context = JSON.parse(fs.readFileSync('data/quiz/production_context/politikk/regjeringskvartalet.json', 'utf8'));
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');
const runtime = fs.readFileSync('js/ui/place-rounds-visual-collections.js', 'utf8');
const objects = Array.isArray(place.objects) ? place.objects : [];
const byId = new Map(objects.map(object => [object.id, object]));

test('Regjeringskvartalet har to sterke, fysiske og stedsspesifikke Objects', () => {
  assert.deepEqual([...byId.keys()].sort(), [
    'regjeringskvartalet_fiskerne',
    'regjeringskvartalet_grass_roots_square'
  ]);
  assert.equal(new Set(objects.map(object => object.title)).size, 2);
  for (const object of objects) {
    assert.equal(object.physicalObject, true, object.id);
    assert.equal(object.placeSpecific, true, object.id);
    assert.ok(object.desc.length >= 150, object.id);
    assert.ok(object.whereToFind.length >= 80, object.id);
    assert.ok(object.placeSpecificReason.length >= 100, object.id);
    assert.ok(object.source_urls.length >= 2, object.id);
    assert.ok(object.source_urls.every(url => url.startsWith('https://')), object.id);
  }
});

test('Objektene beholder dokumentert identitet og dagens plassering', () => {
  const fiskerne = byId.get('regjeringskvartalet_fiskerne');
  assert.match(fiskerne.desc, /Carl Nesjar.*Pablo Picasso/);
  assert.match(fiskerne.desc, /Y-blokka.*A-blokka/);
  assert.match(fiskerne.whereToFind, /A-blokkas fasade.*Einar Gerhardsens plass/);
  assert.ok(fiskerne.source_urls.includes('https://koro.no/hoytidelig-apning-av-regjeringskvartalet/'));

  const grass = byId.get('regjeringskvartalet_grass_roots_square');
  assert.match(grass.desc, /50 000.*bronsefigurer.*400 variasjoner/);
  assert.match(grass.desc, /7–15 centimeter/);
  assert.match(grass.whereToFind, /Einar Gerhardsens plass.*steinhellene/);
  assert.ok(grass.source_urls.includes('https://sebastia.koro.no/en/entry/grass_root_square-en/'));
});

test('Commons-foto har full attribusjon og ærlig tids- og stedsgrense', () => {
  for (const object of objects) {
    assert.match(object.image, /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\//);
    assert.equal(object.cardImage, object.image);
    assert.equal(object.imageMeta.source, 'manual_commons');
    assert.match(object.imageMeta.sourceUrl, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(object.imageMeta.author.length >= 3);
    assert.match(object.imageMeta.credit, /Wikimedia Commons/);
    assert.match(object.imageMeta.license, /^CC BY-SA 3\.0/);
    assert.match(object.imageMeta.licenseUrl, /^https:\/\/creativecommons\.org\/licenses\/by-sa\/3\.0/);
    assert.equal(object.imageMeta.verified, true);
    assert.equal(object.imageMeta.verifiedAt, '2026-08-02');
    assert.match(object.imageMeta.representationScope, /tidligere|tidligere plassering/);
    assert.doesNotMatch(object.imageMeta.representationScope, /dagens plassering dokumenteres av fotografiet/i);
  }
});

test('Objects-rundingen støtter eksterne bilde-URL-er uten runtimeendring', () => {
  assert.match(runtime, /item\.imageCard \|\| item\.cardImage \|\| item\.image/);
  assert.match(runtime, /\[place\?\.objects,\s*["']objects["']\]/);
  assert.match(runtime, /const preview\s*=\s*items\.find\(item => item\.image\)/);
  assert.match(runtime, /<img src="/);
});

test('Holdback beskytter mot svake eller feilkategoriserte Objects', () => {
  assert.equal(objects.some(object => /Måken|En opprettholdelse/.test(object.title)), false);
  assert.equal(objects.some(object => /Høyblokka|A-blokka|departement|22\. juli-senteret/i.test(object.title)), false);
  assert.match(report, /«Måken» holdes tilbake.*publikumsadgang/s);
  assert.match(report, /«En opprettholdelse» holdes tilbake.*BONO/s);
  assert.match(report, /Hele bygg, 22\. juli-senteret, departementer, kunstnere og abstrakte sikkerhetstiltak er ikke Objects/);
});

test('Canonical place og deterministisk Quiz-kontekst er synkronisert', () => {
  const target = context.source_files.target;
  assert.equal(target.path, placePath);
  assert.equal(target.bytes, placeBuffer.byteLength);
  assert.equal(target.sha256, createHash('sha256').update(placeBuffer).digest('hex'));
  assert.equal(target.bytes, 28118);
  assert.equal(target.sha256, '9e763ff92cf5d1bb9f1aff6e314389796c016078a4b189397336d219137c3514');
});

test('Fasekortet lukker Mer, åpner Objects og peker bare videre til Brands', () => {
  assert.match(report, /\| 8 \| Mer \| \*\*GODKJENT – PR #4671, merge `5effd690c06502b68a5870ca2bc089459fac56b9`\*\* \|/);
  assert.match(report, /\| Objects \| PASS – fase 11 \|/);
  assert.match(report, /\| 11 \| Objects \| \*\*GODKJENT – PR #4672, merge `1b8b277cc70b4a26f332091194de667d1a32da53`\*\* \|/);
  assert.match(report, /\| 12 \| Brands \| \*\*GODKJENT – PR #4673, merge `f4e078f06422747dd6f1ee34985d9c5752bcb3b6`\*\* \|/);
  assert.match(report, /\| 13 \| Badges, fagverk, alle åtte popupfaner, rundinger og full UI-\/produksjonsaudit \| \*\*(?:KLAR FOR REVIEW – FULL UI-\/PRODUKSJONSAUDIT PASS|GODKJENT – PR #[0-9]+, merge `[0-9a-f]{40}`)\*\* \|/);
});
