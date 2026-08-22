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

function resolveRole(generated, role) {
  const rows = new Map();
  for (const row of generated.people_pool.existing_place_people) rows.set(row.person_id, { ...row, fit: 'contextual' });
  for (const row of generated.people_pool.existing_other_people) rows.set(row.person_id, { ...row, fit: 'contextual' });
  for (const row of generated.cross_category_existing_references) rows.set(row.person_id, { ...row, fit: 'strong' });
  for (const row of role.resolution.additional_existing_people) rows.set(row.person_id, { ...row, fit: 'strong' });
  for (const id of role.resolution.strong_person_ids) {
    const row = rows.get(id);
    if (row) row.fit = 'strong';
  }
  for (const id of role.resolution.direct_person_ids) {
    const row = rows.get(id);
    if (row) row.fit = 'direct';
  }
  const excluded = new Set(role.resolution.excluded_people.map((row) => row.person_id));
  for (const id of excluded) rows.delete(id);
  return [...rows.values()];
}

test('scenario People index covers every canonical role id exactly once', () => {
  const rawRoleIds = roleManifest.files.map((rel) => read(rel).role_id).filter(Boolean);
  const expected = new Set(rawRoleIds);
  const actualIds = Object.values(index.categories).flatMap((row) => row.roles);
  const actual = new Set(actualIds);
  assert.equal(actualIds.length, actual.size, 'generated index contains duplicate canonical role ids');
  assert.deepEqual([...actual].sort(), [...expected].sort());
  assert.equal(index.summary.role_model_file_count, rawRoleIds.length);
  assert.equal(index.summary.canonical_role_count, expected.size);
  assert.equal(index.summary.shadowed_role_model_count, rawRoleIds.length - expected.size);
  assert.equal(index.summary.history_people_count, people.person_count);
});

test('compact category pools resolve every same-category Person unless explicitly excluded', () => {
  for (const [category, meta] of Object.entries(index.categories)) {
    const generated = read(meta.file);
    assert.equal(generated.storage_model, 'category_pool_plus_role_deltas');
    const expectedCategoryIds = new Set((people.categories[category] ?? []).map((person) => person.id));
    for (const role of generated.roles) {
      assert.equal('existing_place_people' in role, false, `${role.role_id} duplicates category pool`);
      assert.equal('existing_other_people' in role, false, `${role.role_id} duplicates category pool`);
      const excluded = new Set(role.resolution.excluded_people.map((row) => row.person_id));
      const actualSameCategory = new Set(resolveRole(generated, role)
        .filter((row) => row.person_category === category)
        .map((row) => row.person_id));
      const expected = [...expectedCategoryIds].filter((id) => !excluded.has(id)).sort();
      assert.deepEqual([...actualSameCategory].sort(), expected, `${role.role_id} mangler same-category People`);
    }
  }
});

test('resolved counts equal deterministic resolution', () => {
  let total = 0;
  let direct = 0;
  let strong = 0;
  let contextual = 0;
  let place = 0;
  let other = 0;
  for (const meta of Object.values(index.categories)) {
    const generated = read(meta.file);
    for (const role of generated.roles) {
      const resolved = resolveRole(generated, role);
      const counts = {
        total: resolved.length,
        existing_place_people: resolved.filter((row) => Boolean(row.place_id)).length,
        existing_other_people: resolved.filter((row) => !row.place_id).length,
        direct: resolved.filter((row) => row.fit === 'direct').length,
        strong: resolved.filter((row) => row.fit === 'strong').length,
        contextual: resolved.filter((row) => row.fit === 'contextual').length
      };
      for (const [key, value] of Object.entries(counts)) assert.equal(role.resolved_counts[key], value, `${role.role_id}/${key}`);
      total += counts.total;
      direct += counts.direct;
      strong += counts.strong;
      contextual += counts.contextual;
      place += counts.existing_place_people;
      other += counts.existing_other_people;
    }
  }
  assert.equal(index.summary.resolved_assignment_count, total);
  assert.equal(index.summary.resolved_direct_assignment_count, direct);
  assert.equal(index.summary.resolved_strong_assignment_count, strong);
  assert.equal(index.summary.resolved_contextual_assignment_count, contextual);
  assert.equal(index.summary.resolved_existing_place_assignment_count, place);
  assert.equal(index.summary.resolved_existing_other_assignment_count, other);
});

test('direct fit is only possible through explicit curated overrides', () => {
  const allowed = new Map(Object.entries(overrides.roles ?? {}).map(([roleId, row]) => [roleId, new Set(row.direct_person_ids ?? [])]));
  for (const meta of Object.values(index.categories)) {
    const generated = read(meta.file);
    for (const role of generated.roles) {
      for (const id of role.resolution.direct_person_ids) {
        assert.ok(allowed.get(role.role_id)?.has(id), `${role.role_id}/${id} fikk direct uten kuratert override`);
      }
    }
  }
});

test('generated place links are read-only canonical People placeIds', () => {
  for (const meta of Object.values(index.categories)) {
    const generated = read(meta.file);
    const rows = [
      ...generated.people_pool.existing_place_people,
      ...generated.people_pool.existing_other_people,
      ...generated.cross_category_existing_references,
      ...generated.roles.flatMap((role) => role.resolution.additional_existing_people)
    ];
    for (const row of rows) {
      const person = peopleById.get(row.person_id);
      assert.ok(person, `ukjent person ${row.person_id}`);
      if ('place_id' in row) assert.equal(row.place_id, person.placeId, `${row.person_id} oppfant eller endret placeId`);
      else assert.equal(Boolean(person.placeId), false, `${row.person_id} mistet canonical placeId`);
    }
  }
});

test('missing candidates are absent from People and target valid canonical roles', () => {
  const canonicalRoles = new Set(Object.values(index.categories).flatMap((row) => row.roles));
  let count = 0;
  for (const meta of Object.values(index.categories)) {
    const generated = read(meta.file);
    for (const candidate of generated.missing_people_candidates) {
      count += 1;
      assert.equal(Boolean(candidate.id && peopleById.has(candidate.id)), false, `${candidate.name} finnes allerede på id`);
      assert.equal(peopleByName.has(norm(candidate.name)), false, `${candidate.name} finnes allerede på navn`);
      assert.equal(candidate.verification_required, true);
      assert.ok(candidate.sources.length > 0);
      assert.ok(candidate.reasons.length > 0);
      assert.ok(candidate.scenario_roles.length > 0);
      for (const roleId of candidate.scenario_roles) assert.ok(canonicalRoles.has(roleId), `${candidate.name} peker på ukjent rolle ${roleId}`);
    }
  }
  assert.equal(index.summary.missing_people_candidate_count, count);
});

test('Nic Waal is never a direct psychologist-role example', () => {
  const psychology = read(index.categories.psykologi.file);
  const role = psychology.roles.find((row) => row.role_id === 'psykologi_psykolog');
  assert.ok(role);
  assert.ok(role.resolution.excluded_people.some((row) => row.person_id === 'nic_waal'));
  assert.equal(resolveRole(psychology, role).some((row) => row.person_id === 'nic_waal'), false);
});
