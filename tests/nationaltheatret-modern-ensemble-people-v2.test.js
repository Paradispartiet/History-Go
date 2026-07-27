const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const targets = [
  ['anders_mordal', 'data/people/litteratur/oslo/nationaltheatret/anders_mordal.json'],
  ['andrine_saether', 'data/people/litteratur/oslo/nationaltheatret/andrine_saether.json'],
  ['anne_krigsvoll', 'data/people/litteratur/oslo/nationaltheatret/anne_krigsvoll.json'],
  ['anne_marie_ottersen', 'data/people/litteratur/oslo/nationaltheatret/anne_marie_ottersen.json'],
];

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
}

function readPerson(relative) {
  const data = readJson(relative);
  assert.equal(Array.isArray(data), true, `${relative} must contain an array`);
  assert.equal(data.length, 1, `${relative} must contain exactly one canonical person`);
  return data[0];
}

test('modern Nationaltheatret ensemble profiles satisfy the people-popup V2 contract', () => {
  const people = targets.map(([expectedId, relative]) => {
    const person = readPerson(relative);
    assert.equal(person.id, expectedId);
    return person;
  });

  assert.equal(new Set(people.map((person) => person.id)).size, 4);

  for (const person of people) {
    assert.equal(person.placeId, 'nationaltheatret');
    assert.equal(person.category, 'litteratur');
    assert.match(person.birth_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(person.birth_place.length >= 3);
    assert.ok(person.active_place.length >= 8);
    assert.ok(person.kindLabel.length >= 12);
    assert.ok(person.desc.length >= 90);
    assert.ok(person.popupDesc.split('\n\n').length >= 3);
    assert.ok(person.popupDesc.length >= 650);
    assert.ok(Array.isArray(person.education) && person.education.length >= 3);
    assert.ok(Array.isArray(person.materials) && person.materials.length >= 5);
    assert.ok(Array.isArray(person.themes) && person.themes.length >= 5);
    assert.ok(Array.isArray(person.works) && person.works.length >= 8);
    assert.ok(person.works.every((entry) => entry.id && entry.title && entry.year && entry.material && entry.place && entry.summary));
    assert.ok(Array.isArray(person.externalLinks) && person.externalLinks.length >= 4);
    assert.ok(person.externalLinks.every((entry) => entry.type === 'source' && entry.url.startsWith('https://') && entry.verifiedAt === '2026-07-27'));
    assert.ok(Array.isArray(person.source_urls) && person.source_urls.length >= 3);
    assert.ok(Array.isArray(person.places) && person.places.includes('nationaltheatret'));
    assert.equal(person.image, '');
    assert.equal(person.cardImage, '');
    assert.equal(person.verifiedAt, '2026-07-27');
  }
});

test('documented secondary theatre grounding is preserved', () => {
  const anders = readPerson(targets[0][1]);
  const andrine = readPerson(targets[1][1]);
  const krigsvoll = readPerson(targets[2][1]);
  const ottersen = readPerson(targets[3][1]);

  assert.deepEqual(anders.places, ['nationaltheatret']);
  assert.deepEqual(andrine.places, ['nationaltheatret']);
  assert.deepEqual(krigsvoll.places, ['nationaltheatret', 'oslo_nye_teater_hovedscenen']);
  assert.deepEqual(ottersen.places, ['nationaltheatret', 'oslo_nye_teater_hovedscenen', 'det_norske_teatret']);

  assert.ok(anders.works.some((entry) => entry.title === 'Ti liv! – Komilab nr. 3'));
  assert.ok(andrine.works.some((entry) => entry.title === 'Dødsvariasjonar'));
  assert.ok(krigsvoll.works.some((entry) => entry.title === 'Lykkedager'));
  assert.ok(ottersen.works.some((entry) => entry.title === 'Jenteloven'));
});

test('the batch does not introduce parallel canonical identities', () => {
  const manifest = readJson('data/people/manifest.json');
  const ids = targets.map(([id]) => id);

  for (const id of ids) {
    const matchingFiles = manifest.files.filter((entry) => entry.includes(`/${id}.json`));
    assert.equal(matchingFiles.length, 1, `${id} must be loaded from exactly one canonical file`);
  }
});
