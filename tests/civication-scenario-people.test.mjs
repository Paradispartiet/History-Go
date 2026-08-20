import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const norm = (value) => String(value ?? '').trim().toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const people = read('data/Civication/historyPeople_index.json');
const roleManifest = read('data/Civication/roleModels/manifest.json');
const overrides = read('data/Civication/scenarioPeople/overrides.json');
const index = read('data/Civication/scenarioPeople_index.json');
const allPeople = Object.values(people.categories).flat();
const peopleById = new Map(allPeople.map((person) => [person.id, person]));
const peopleByName = new Map(allPeople.map((person) => [norm(person.name), person]));

test('scenario People index covers every canonical roleModel exactly once', () => {
  const expected = new Set(roleManifest.files.map((rel) => read(rel).role_id));
  const actual = new Set(Object.values(index.categories).flatMap((row) => row.roles));
  assert.equal(actual.size, expected.size);
  assert.deepEqual([...actual].sort(), [...expected].sort());
  assert.equal(index.summary.role_count, expected.size);
  assert.equal(index.summary.history_people_count, people.person_count);
});

test('every role contains all same-category People unless explicitly excluded', () => {
  for (const [category, meta] of Object.entries(index.categories)) {
    const generated = read(meta.file);
    const expectedCategoryIds = new Set((people.categories[category] ?? []).map((person) => person.id));
    for (const role of generated.roles) {
      const excluded = new Set(role.excluded_people.map((row) => row.person_id));
      const actualSameCategory = new Set([
        ...role.existing_place_people,
        ...role.existing_other_people
      ].filter((row) => row.person_category === category).map((row) => row.person_id));
      const expected = [...expectedCategoryIds].filter((id) => !excluded.has(id)).sort();
      assert.deepEqual([...actualSameCategory].sort(), expected, `${role.role_id} mangler same-category People`);
    }
  }
});

test('direct fit is only possible through explicit curated overrides', () => {
  const allowed = new Map(Object.entries(overrides.roles ?? {}).map(([roleId, row]) => [roleId, new Set(row.direct_person_ids ?? [])]));
  for (const meta of Object.values(index.categories)) {
    const generated = read(meta.file);
    for (const role of generated.roles) {
      for (const row of [...role.existing_place_people, ...role.existing_other_people]) {
        if (row.fit !== 'direct') continue;
        assert.ok(allowed.get(role.role_id)?.has(row.person_id), `${role.role_id}/${row.person_id} fikk direct uten kuratert override`);
      }
    }
  }
});

test('generated place links are read-only canonical People placeIds', () => {
  for (const meta of Object.values(index.categories)) {
    const generated = read(meta.file);
    for (const role of generated.roles) {
      for (const row of role.existing_place_people) {
        const person = peopleById.get(row.person_id);
        assert.ok(person, `ukjent person ${row.person_id}`);
        assert.equal(row.place_id, person.placeId, `${role.role_id}/${row.person_id} oppfant eller endret placeId`);
      }
    }
  }
});

test('missing candidates are genuinely absent from People at generation time', () => {
  for (const meta of Object.values(index.categories)) {
    const generated = read(meta.file);
    for (const candidate of generated.missing_people_candidates) {
      assert.equal(Boolean(candidate.id && peopleById.has(candidate.id)), false, `${candidate.name} finnes allerede på id`);
      assert.equal(peopleByName.has(norm(candidate.name)), false, `${candidate.name} finnes allerede på navn`);
      assert.equal(candidate.verification_required, true);
    }
  }
});

test('Nic Waal is never a direct psychologist-role example', () => {
  const psychology = read(index.categories.psykologi.file);
  const role = psychology.roles.find((row) => row.role_id === 'psykologi_psykolog');
  assert.ok(role);
  assert.ok(role.excluded_people.some((row) => row.person_id === 'nic_waal'));
  assert.equal([...role.existing_place_people, ...role.existing_other_people].some((row) => row.person_id === 'nic_waal'), false);
});
