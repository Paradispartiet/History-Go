const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const targets = [
  ['alfred_maurstad', 'data/people/litteratur/oslo/nationaltheatret/alfred_maurstad.json'],
  ['gerd_grieg', 'data/people/litteratur/oslo/nationaltheatret/gerd_grieg.json'],
  ['lillebil_ibsen', 'data/people/litteratur/oslo/nationaltheatret/lillebil_ibsen.json'],
  ['tore_segelcke', 'data/people/litteratur/oslo/nationaltheatret/tore_segelcke.json'],
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

test('Nationaltheatret star profiles satisfy the people-popup V2 contract', () => {
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
    assert.match(person.death_date, /^\d{4}-\d{2}-\d{2}$/);
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

test('Alfred Maurstad is one canonical identity across Nationaltheatret and Det Norske Teatret', () => {
  const alfred = readPerson(targets[0][1]);
  assert.deepEqual(alfred.places, ['nationaltheatret', 'det_norske_teatret']);
  assert.ok(alfred.tags.includes('hardingfele'));
  assert.ok(alfred.works.some((entry) => entry.title === 'Peer Gynt'));
  assert.ok(alfred.works.some((entry) => entry.title === 'Den stundesløse'));

  const duplicatePath = path.join(ROOT, 'data/people/musikk/oslo/det_norske_teatret/alfred_maurstad_det_norske_teatret.json');
  assert.equal(fs.existsSync(duplicatePath), false);

  const manifest = readJson('data/people/manifest.json');
  assert.equal(
    manifest.files.includes('people/musikk/oslo/det_norske_teatret/alfred_maurstad_det_norske_teatret.json'),
    false,
  );
});

test('place grounding preserves each profile’s documented theatre history', () => {
  const gerd = readPerson(targets[1][1]);
  const lillebil = readPerson(targets[2][1]);
  const tore = readPerson(targets[3][1]);

  assert.deepEqual(gerd.places, ['nationaltheatret']);
  assert.deepEqual(lillebil.places, ['nationaltheatret', 'centralteatret', 'oslo_nye_teater_hovedscenen']);
  assert.deepEqual(tore.places, ['nationaltheatret', 'det_norske_teatret']);

  assert.ok(gerd.works.some((entry) => entry.title === 'Paul Lange og Tora Parsberg'));
  assert.ok(lillebil.works.some((entry) => entry.title === 'Kjære løgnhals'));
  assert.ok(tore.works.some((entry) => entry.title === 'Et dukkehjem'));
});
