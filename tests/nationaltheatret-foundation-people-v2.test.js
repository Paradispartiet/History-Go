const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const TARGETS = [
  { id: 'henrik_bull', file: 'data/people/by/oslo/people_by_oslo.json' },
  { id: 'bjorn_bjornson', file: 'data/people/litteratur/oslo/nationaltheatret/bjorn_bjornson.json' },
  { id: 'johanne_dybwad', file: 'data/people/litteratur/oslo/nationaltheatret/johanne_dybwad.json' },
  { id: 'halfdan_christensen', file: 'data/people/litteratur/oslo/nationaltheatret/halfdan_christensen.json' },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function getPerson(target) {
  const data = readJson(target.file);
  return (Array.isArray(data) ? data : [data]).find((entry) => entry.id === target.id);
}

test('Nationaltheatret foundation batch uses four unique canonical identities', () => {
  const manifest = readJson('data/people/manifest.json');
  assert.equal(manifest.files.includes('people/litteratur/oslo/nationaltheatret/henrik_bull.json'), false);
  assert.equal(fs.existsSync(path.join(ROOT, 'data/people/litteratur/oslo/nationaltheatret/henrik_bull.json')), false);

  const targetIds = new Set(TARGETS.map((target) => target.id));
  const occurrences = new Map();
  for (const relative of manifest.files) {
    const data = readJson(path.join('data', relative));
    for (const person of Array.isArray(data) ? data : [data]) {
      if (!person || !targetIds.has(person.id)) continue;
      if (!occurrences.has(person.id)) occurrences.set(person.id, []);
      occurrences.get(person.id).push(relative);
    }
  }

  for (const target of TARGETS) {
    assert.deepEqual(occurrences.get(target.id), [target.file.replace(/^data\//, '')], target.id);
  }

  const allNames = [];
  for (const relative of manifest.files) {
    const data = readJson(path.join('data', relative));
    for (const person of Array.isArray(data) ? data : [data]) {
      if (person?.name === 'Henrik Bull') allNames.push({ id: person.id, file: relative });
    }
  }
  assert.deepEqual(allNames, [{ id: 'henrik_bull', file: 'people/by/oslo/people_by_oslo.json' }]);
});

test('foundation profiles satisfy the people-popup structure without forced factual fullness', () => {
  for (const target of TARGETS) {
    const person = getPerson(target);
    assert.ok(person, target.id);
    assert.equal(person.placeId, 'nationaltheatret');
    assert.ok(person.places.includes('nationaltheatret'));
    assert.match(person.birth_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(person.death_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(String(person.popupDesc).split(/\n\s*\n/).length >= 3);
    assert.ok(Array.isArray(person.education));
    assert.ok(Array.isArray(person.materials) && person.materials.length > 0);
    assert.ok(Array.isArray(person.themes) && person.themes.length > 0);
    assert.ok(Array.isArray(person.works) && person.works.length > 0);
    assert.ok(person.works.every((entry) => entry.id && entry.title && entry.year && entry.material && entry.place && entry.summary));
    assert.ok(Array.isArray(person.externalLinks) && person.externalLinks.length >= 4);
    assert.ok(person.externalLinks.every((source) => source.type === 'source' && /^https:\/\//.test(source.url) && source.verifiedAt === '2026-07-27'));
    assert.ok(Array.isArray(person.source_urls) && person.source_urls.length >= 4);
    assert.equal(person.verifiedAt, '2026-07-27');
  }
});

test('documented education is preserved exactly and career history is not used as padding', () => {
  const henrik = getPerson(TARGETS[0]);
  const bjorn = getPerson(TARGETS[1]);
  const johanne = getPerson(TARGETS[2]);
  const halfdan = getPerson(TARGETS[3]);

  assert.deepEqual(henrik.education, [
    'Hospitant ved Kristiania tekniske skole og elev ved Den kongelige Tegneskole, 1883–1884',
    'Arkitektutdannelse ved Königlich Technische Hochschule i Berlin, 1884–1887',
    'Studier ved Akademie der Künste i Berlin under Johannes Otzen, 1888',
  ]);
  assert.deepEqual(bjorn.education, ['Scenisk utdannelse i Wien']);
  assert.deepEqual(johanne.education, []);
  assert.deepEqual(halfdan.education, [
    'Middelskoleeksamen ved Aars og Voss skole',
    'Skolegang ved Kristiania Handelsgymnasium',
    'Studiereise til Danmark og Tyskland, 1894',
  ]);
});

test('foundation facts preserve the four documented Nationaltheatret links', () => {
  const henrik = getPerson(TARGETS[0]);
  const bjorn = getPerson(TARGETS[1]);
  const johanne = getPerson(TARGETS[2]);
  const halfdan = getPerson(TARGETS[3]);

  assert.ok(henrik.works.some((entry) => entry.title === 'Nationaltheatret' && entry.year === '1891–1899'));
  assert.ok(henrik.places.includes('historisk_museum'));
  assert.ok(henrik.places.includes('regjeringskvartalet'));
  assert.ok(henrik.places.includes('paulus_kirke'));

  assert.ok(bjorn.works.some((entry) => entry.title === 'Nationaltheatrets åpning' && entry.year === 1899));
  assert.ok(bjorn.works.some((entry) => entry.title === 'Andre sjefsperiode ved Nationaltheatret' && entry.year === '1923–1927'));

  assert.ok(johanne.works.some((entry) => entry.title === 'Medea' && entry.year === 1918));
  assert.ok(johanne.works.some((entry) => entry.title === 'Mor Aase i Peer Gynt' && entry.year === 1947));

  assert.ok(halfdan.works.some((entry) => entry.title === 'Agilulf den vise' && entry.year === 1910));
  assert.ok(halfdan.works.some((entry) => entry.title === 'Andre sjefsperiode ved Nationaltheatret' && entry.year === '1930–1933'));
  assert.ok(halfdan.works.some((entry) => entry.title === 'Fri Norsk Scene' && entry.year === '1944–1945'));
});

test('existing portrait policy is preserved', () => {
  const henrik = getPerson(TARGETS[0]);
  assert.equal(henrik.image, 'bilder/kort/people/henrik_bull.PNG');
  assert.equal(henrik.cardImage, 'bilder/kort/people/henrik_bull.PNG');
  for (const target of TARGETS.slice(1)) {
    const person = getPerson(target);
    assert.equal(person.image, '');
    assert.equal(person.cardImage, '');
    assert.ok(person.initials);
  }
});
