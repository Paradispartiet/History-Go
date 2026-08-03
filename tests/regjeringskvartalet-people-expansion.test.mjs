import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const manifest = readJson('data/people/manifest.json');
const people = manifest.files.flatMap(file => {
  const value = readJson(`data/people/${file.slice('people/'.length)}`);
  return Array.isArray(value) ? value : Array.isArray(value.people) ? value.people : [value];
});
const linked = people.filter(person =>
  person.placeId === 'regjeringskvartalet' || person.places?.includes('regjeringskvartalet')
);
const byId = new Map(linked.map(person => [person.id, person]));
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-people-v2.md', 'utf8');

const expectedIds = [
  'alexandra_europa_perez_seoane',
  'carl_nesjar',
  'do_ho_suh',
  'einar_gerhardsen',
  'erling_viksjo',
  'gro_harlem_brundtland',
  'hannah_ryggen',
  'henrik_bull',
  'inger_sitter',
  'jard_bringedal',
  'jens_stoltenberg',
  'johan_nygaardsvold',
  'jumana_manna',
  'kai_fjell',
  'lena_fahre',
  'matias_faldbakken',
  'odd_tandberg',
  'odvar_nordli',
  'pablo_picasso',
  'per_borten',
  'sverre_jystad',
  'tore_haaland',
];

const expandedIds = [
  'alexandra_europa_perez_seoane',
  'do_ho_suh',
  'einar_gerhardsen',
  'gro_harlem_brundtland',
  'hannah_ryggen',
  'jard_bringedal',
  'johan_nygaardsvold',
  'jumana_manna',
  'lena_fahre',
  'matias_faldbakken',
];

test('Regjeringskvartalet has exactly 22 unique canonical People links', () => {
  assert.equal(linked.length, 22);
  assert.equal(byId.size, 22);
  assert.deepEqual([...byId.keys()].sort(), expectedIds);
  assert.equal(new Set(people.map(person => person.id)).size, people.length);
});

test('the ten expanded links are ready claim-backed People profiles', () => {
  for (const id of expandedIds) {
    const person = byId.get(id);
    assert.ok(person, id);
    assert.equal(person.profileStandard, 'people_profile_v1.0', id);
    assert.equal(person.profileStatus, 'ready_people_v1', id);
    assert.ok(person.places.includes('regjeringskvartalet'), id);
    assert.ok(person.popupDesc.length >= 100, id);
    assert.ok(person.source_urls?.length >= 1, id);
    assert.ok(person.source_urls.every(url => url.startsWith('https://')), id);
    assert.ok(person.claimsFile, id);
    assert.ok(fs.existsSync(person.claimsFile), id);
    const claims = readJson(person.claimsFile);
    assert.equal(claims.person_id, id);
    assert.equal(claims.completion.current_status, 'ready_people_v1', id);
    const placeClaimIds = claims.field_claim_map['places[regjeringskvartalet]'];
    assert.ok(placeClaimIds?.length >= 1, id);
    assert.ok(placeClaimIds.every(claimId =>
      claims.claims.some(claim => claim.id === claimId && claim.status === 'verified')
    ), id);
  }
});

test('the expansion broadens roles without adding a third architect', () => {
  const architects = linked.filter(person =>
    person.tags?.some(tag => ['arkitekt', 'arkitektur'].includes(tag))
  );
  assert.deepEqual(architects.map(person => person.id).sort(), ['erling_viksjo', 'henrik_bull']);

  assert.equal(expandedIds.filter(id => byId.get(id).category === 'politikk').length, 6);
  assert.equal(expandedIds.filter(id => byId.get(id).category === 'kunst').length, 4);
  assert.ok(byId.has('jard_bringedal'));
  assert.ok(byId.has('alexandra_europa_perez_seoane'));
  assert.ok(byId.has('lena_fahre'));
});

test('the production report records scope, evidence and editorial holdbacks', () => {
  assert.match(report, /12 til 22 canonicale personer/);
  assert.match(report, /fem eksisterende profiler/);
  assert.match(report, /fem nye profiler/);
  assert.match(report, /ingen dupliserte person-ID-er/);
  assert.match(report, /maksimalt to arkitekter/);
  assert.match(report, /Trygve Bratteli/);
  assert.match(report, /Kåre Willoch/);
  assert.match(report, /Vanessa Baird/);
  assert.match(report, /Otobong Nkanga/);
});
