const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const targets = [
  {
    id: 'anne_marit_jacobsen',
    file: 'data/people/litteratur/oslo/nationaltheatret/anne_marit_jacobsen.json',
    living: true,
    places: ['nationaltheatret', 'oslo_nye_teater_hovedscenen', 'det_norske_teatret', 'nrk_huset_marienlyst'],
    works: ['Lilli Valentin', 'Jo fortere jeg går, jo mindre er jeg'],
  },
  {
    id: 'anneke_von_der_lippe',
    file: 'data/people/litteratur/oslo/nationaltheatret/anneke_von_der_lippe.json',
    living: true,
    places: ['nationaltheatret', 'det_norske_teatret', 'nrk_huset_marienlyst'],
    works: ['Salka Valka', 'Et dukkehjem', 'Øyevitne'],
  },
  {
    id: 'anton_ronneberg',
    file: 'data/people/litteratur/oslo/nationaltheatret/anton_ronneberg.json',
    living: false,
    places: ['nationaltheatret'],
    works: ['Nationaltheatret gjennom femti år', 'Ti års fjernsynsteater'],
  },
  {
    id: 'arild_brinchmann',
    file: 'data/people/litteratur/oslo/nationaltheatret/arild_brinchmann.json',
    living: false,
    places: ['nationaltheatret', 'nrk_huset_marienlyst', 'det_norske_teatret'],
    works: ['Hvem er redd for Virginia Woolf?', 'Et spill om pugg', 'Natten er dagens mor'],
  },
];

function readPerson(relative) {
  const parsed = JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
  assert.equal(Array.isArray(parsed), true, `${relative} must contain an array`);
  assert.equal(parsed.length, 1, `${relative} must contain exactly one person`);
  return parsed[0];
}

test('Nationaltheatret ensemble and leadership profiles satisfy people-popup V2', () => {
  for (const target of targets) {
    const person = readPerson(target.file);
    assert.equal(person.id, target.id);
    assert.equal(person.placeId, 'nationaltheatret');
    assert.equal(person.category, 'litteratur');
    assert.match(person.birth_date, /^\d{4}-\d{2}-\d{2}$/);
    if (target.living) {
      assert.equal(Object.hasOwn(person, 'death_date'), false);
    } else {
      assert.match(person.death_date, /^\d{4}-\d{2}-\d{2}$/);
    }
    assert.ok(person.active_place.length >= 12);
    assert.ok(person.kindLabel.length >= 20);
    assert.ok(person.desc.length >= 100);
    assert.ok(person.popupDesc.split('\n\n').length >= 3);
    assert.ok(person.popupDesc.length >= 700);
    assert.ok(Array.isArray(person.education) && person.education.length >= 3);
    assert.ok(Array.isArray(person.materials) && person.materials.length >= 6);
    assert.ok(Array.isArray(person.themes) && person.themes.length >= 6);
    assert.ok(Array.isArray(person.works) && person.works.length >= 10);
    assert.ok(person.works.every((entry) => entry.id && entry.title && entry.year && entry.material && entry.place && entry.summary));
    assert.ok(Array.isArray(person.externalLinks) && person.externalLinks.length >= 4);
    assert.ok(person.externalLinks.every((entry) => entry.type === 'source' && entry.url.startsWith('https://') && entry.verifiedAt === '2026-07-27'));
    assert.ok(Array.isArray(person.source_urls) && person.source_urls.length >= 4);
    assert.deepEqual(person.places, target.places);
    assert.equal(person.image, '');
    assert.equal(person.cardImage, '');
    assert.equal(person.verifiedAt, '2026-07-27');

    for (const title of target.works) {
      assert.ok(person.works.some((entry) => entry.title === title), `${person.id} missing ${title}`);
    }
  }
});

test('batch keeps four unique canonical identities', () => {
  const ids = targets.map((target) => readPerson(target.file).id);
  assert.equal(new Set(ids).size, 4);
});
