const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const TARGETS = [
  ['agnes_mowinckel', 'data/people/litteratur/oslo/nationaltheatret/agnes_mowinckel.json'],
  ['ragna_wettergreen', 'data/people/litteratur/oslo/nationaltheatret/ragna_wettergreen.json'],
  ['egil_eide', 'data/people/litteratur/oslo/nationaltheatret/egil_eide.json'],
  ['august_oddvar', 'data/people/litteratur/oslo/nationaltheatret/august_oddvar.json'],
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function person(relativePath) {
  const data = readJson(relativePath);
  assert.equal(Array.isArray(data), true);
  assert.equal(data.length, 1);
  return data[0];
}

test('Nationaltheatret ensemble batch has four unique canonical identities', () => {
  const manifest = readJson('data/people/manifest.json');
  const found = new Map();
  for (const relative of manifest.files) {
    const file = path.join('data', relative);
    const data = readJson(file);
    for (const entry of Array.isArray(data) ? data : [data]) {
      if (!entry || !TARGETS.some(([id]) => id === entry.id)) continue;
      assert.equal(found.has(entry.id), false, `duplicate canonical person: ${entry.id}`);
      found.set(entry.id, file);
    }
  }
  assert.deepEqual([...found.keys()].sort(), TARGETS.map(([id]) => id).sort());
  assert.equal(manifest.files.some((value) => value.includes('agnes_mowinckel_det_norske_teatret')), false);
  assert.equal(
    fs.existsSync(path.join(ROOT, 'data/people/musikk/oslo/det_norske_teatret/agnes_mowinckel_det_norske_teatret.json')),
    false,
  );
});

test('all four profiles satisfy the people-popup structure without invented fullness', () => {
  for (const [id, relativePath] of TARGETS) {
    const entry = person(relativePath);
    assert.equal(entry.id, id);
    assert.equal(entry.placeId, 'nationaltheatret');
    assert.equal(entry.category, 'litteratur');
    assert.ok(entry.places.includes('nationaltheatret'));
    assert.match(entry.birth_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(entry.death_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(entry.desc.trim().length > 0);
    assert.ok(entry.popupDesc.split(/\n\s*\n/).length >= 3);
    assert.ok(Array.isArray(entry.education));
    assert.ok(Array.isArray(entry.materials) && entry.materials.length > 0);
    assert.ok(Array.isArray(entry.themes) && entry.themes.length > 0);
    assert.ok(Array.isArray(entry.works) && entry.works.length > 0);
    assert.ok(entry.works.every((work) => work.id && work.title && work.year && work.material && work.place && work.summary));
    assert.ok(Array.isArray(entry.externalLinks) && entry.externalLinks.length >= 4);
    assert.ok(entry.externalLinks.every(
      (source) => source.type === 'source'
        && /^https:\/\//.test(source.url)
        && source.verifiedAt === '2026-07-27',
    ));
    assert.ok(Array.isArray(entry.source_urls) && entry.source_urls.length >= 4);
    assert.equal(entry.image, '');
    assert.equal(entry.cardImage, '');
    assert.equal(entry.verifiedAt, '2026-07-27');
  }
});

test('documented education is not padded with debut, employment or career practice', () => {
  const agnes = person(TARGETS[0][1]);
  const ragna = person(TARGETS[1][1]);
  const egil = person(TARGETS[2][1]);
  const august = person(TARGETS[3][1]);

  assert.deepEqual(agnes.education, [
    'Middelskole i Bergen',
    'Ett år ved Den kongelige Tegneskole i Kristiania',
  ]);
  assert.deepEqual(ragna.education, ['Teaterstudier og rollelesning hos Lucie Wolf']);
  assert.deepEqual(egil.education, ['Middelskoleeksamen i Haugesund']);
  assert.deepEqual(august.education, [
    'Typograflære i Kristiania',
    'Teaterskole hos Thora Lundh',
  ]);

  for (const entry of [agnes, ragna, egil, august]) {
    assert.equal(entry.education.some((item) => /debut|ansatt|ensemble|Nationaltheatret|arbeid i USA|Bjørn Bjørnson/i.test(item)), false);
  }
});

test('Agnes Mowinckel retains the three directly documented Oslo theatre anchors', () => {
  const entry = person(TARGETS[0][1]);
  assert.deepEqual(entry.places, ['nationaltheatret', 'det_norske_teatret', 'folketeateret']);
  assert.ok(entry.works.some((work) => work.title === 'Myrkemakti' && work.year === 1923));
  assert.ok(entry.works.some((work) => work.title === 'R.U.R.' && work.year === 1924));
  assert.ok(entry.works.some((work) => work.title === 'Tante Ulrikke' && work.year === 1952));
});
