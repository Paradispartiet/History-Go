import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const manifest = readJson('data/people/manifest.json');
const people = manifest.files.flatMap(file => {
  const value = readJson(`data/people/${file.slice('people/'.length)}`);
  return Array.isArray(value) ? value : Array.isArray(value.people) ? value.people : [value];
});
const tinghusetPeople = people.filter(person =>
  person.placeId === 'tinghuset' || person.places?.includes('tinghuset')
);
const byId = new Map(tinghusetPeople.map(person => [person.id, person]));
const report = fs.readFileSync('reports/place-production/tinghuset-politikk-v1.md', 'utf8');
const attributions = readJson('data/people/people_image_attributions.json');

const expectedIds = [
  'arne_lyng',
  'geir_lippestad',
  'inga_bejer_engh',
  'ingunn_skogholt',
  'nina_sundbye',
  'oivind_astein',
  'ole_lislerud',
  'svein_bolling',
  'svein_holden',
  'svein_strand',
  'vibeke_hein_baera',
  'wenche_elizabeth_arntzen',
  'yngve_svendsen'
];
const primaryFunctionIds = new Set([
  'arne_lyng',
  'geir_lippestad',
  'inga_bejer_engh',
  'svein_holden',
  'vibeke_hein_baera',
  'wenche_elizabeth_arntzen',
  'yngve_svendsen'
]);

test('Oslo tinghus has exactly 13 canonical People links with primary-function dominance', () => {
  assert.deepEqual([...byId.keys()].sort(), expectedIds);
  assert.equal(primaryFunctionIds.size, 7);
  assert.ok(primaryFunctionIds.size > tinghusetPeople.length - primaryFunctionIds.size);
  for (const id of primaryFunctionIds) assert.ok(byId.has(id), id);
});

test('all 13 People profiles are claim-backed and have distinct place-specific openings', () => {
  assert.equal(new Set(tinghusetPeople.map(person => person.popupDesc)).size, 13);
  for (const person of tinghusetPeople) {
    assert.equal(person.profileStandard, 'people_profile_v1.0', person.id);
    assert.equal(person.profileStatus, 'ready_people_v1', person.id);
    assert.ok(person.popupDesc.length >= 120, person.id);
    assert.ok(person.popupDesc.includes('Oslo tinghus') || person.popupDesc.includes('Oslo tingrett'), person.id);
    assert.ok(person.claimsFile, person.id);
    assert.ok(fs.existsSync(person.claimsFile), person.id);
    assert.ok(person.source_urls?.length >= 1, person.id);
    assert.ok(person.source_urls.every(url => url.startsWith('https://')), person.id);
  }
});

test('all 13 People have local full and card images with auditable rights metadata', () => {
  const attributed = new Set(attributions.map(row => `${row.personId}\0${row.file}`));
  for (const person of tinghusetPeople) {
    assert.match(person.image, /^bilder\/kort\/people\/.+\.(jpg|jpeg|png|webp)$/i, person.id);
    assert.match(person.cardImage, /^bilder\/kort\/people\/.+\.(jpg|jpeg|png|webp)$/i, person.id);
    assert.ok(fs.existsSync(person.image), person.id);
    assert.ok(fs.existsSync(person.cardImage), person.id);
    assert.ok(attributed.has(`${person.id}\0${person.image}`), person.id);
    assert.match(person.imageMeta.license, /^(CC0|CC BY-SA)/, person.id);
    assert.match(person.imageMeta.licenseUrl, /^https:\/\//, person.id);
    assert.ok(['wikimedia_commons', 'history_go_editorial_illustration'].includes(person.imageMeta.source), person.id);
    if (person.imageMeta.source === 'history_go_editorial_illustration') {
      assert.equal(person.imageMeta.mediaType, 'editorial_illustration', person.id);
      assert.equal(person.imageMeta.reviewStatus, 'identity_and_editorial_review_passed', person.id);
      assert.match(person.imageMeta.disclosure, /illustrasjon.*ikke fotografi/i, person.id);
      assert.match(person.imageMeta.referenceImage, /^https?:\/\//, person.id);
      assert.ok(person.imageMeta.identityReference.length >= 25, person.id);
    }
  }
  assert.equal(tinghusetPeople.filter(person => person.imageMeta.source === 'history_go_editorial_illustration').length, 11);
});

test('phase report marks People complete while Objects and Brands remain open', () => {
  assert.match(report, /Status: \*\*PASS – fase 10\*\*/);
  assert.match(report, /13 av 13 personer har lokalt bilde/);
  assert.match(report, /sju personer representerer tinghusets hovedfunksjon/);
  assert.match(report, /Objects- og Brands-rundingene fortsatt er åpne/);
  assert.match(report, /Status for samlet sted: \*\*under sanering – ikke produksjonsklart\*\*/);
});
