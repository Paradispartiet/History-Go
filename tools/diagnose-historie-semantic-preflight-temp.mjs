#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const sorted = (values) => [...values].sort();

const pensum = read('data/fag/historie/historiepensum_canonical_v4_5.json');
const emners = list(read('data/fag/historie/emner_historie_canonical_v4_5.json'));
const mappings = list(read('data/fag/historie/emnemapping_historie_canonical_v4_5.json'));
const fagkart = read('data/fag/historie/fagkart_historie_canonical_v4_5.json');
const theories = list(read('data/fag/historie/theory_objects_historie_canonical_v5_5.json'));
const editorial = read('data/fag/historie/editorial_theory_overrides_historie_v1.json');

const emneById = new Map(emners.map((row) => [row.emne_id, row]));
const mappingByEmne = new Map(mappings.map((row) => [row.emne_id, row]));
const theoryByHook = new Map(theories.map((row) => [row.source_hook_id, row]));
const hookById = new Map();
for (const category of list(fagkart.categories)) {
  for (const hook of list(category.topic_hooks)) {
    assert.ok(!hookById.has(hook.id), `duplicate hook ${hook.id}`);
    hookById.set(hook.id, hook);
  }
}

const blueprintRows = list(editorial.source_blueprint_files).flatMap((file) =>
  list(read(file)).map((row) => ({ ...row, blueprint_file: file }))
);
const resolvedLegacyIds = new Set(list(editorial.resolved_legacy_question_surface_ids).map((row) => row.legacy_emne_id));
const activeBlueprintRows = blueprintRows.filter((row) => emneById.has(row.emne_id));
const mode = process.argv[2];

if (mode === 'policy') {
  assert.equal(editorial?.policy?.semantic_identity_source, 'emner_historie_canonical_v4_5.primary_theory_hooks[0]');
  assert.equal(editorial?.policy?.editorial_hooks_do_not_redefine_semantic_identity, true);
  assert.equal(editorial?.policy?.editorial_hooks_may_repeat, true);
  assert.equal(emners.length, 230);
  assert.equal(emneById.size, 230);
  assert.equal(mappingByEmne.size, 230);
  assert.equal(list(editorial.source_blueprint_files).length, 3);
  console.log('PASS policy/inventory');
} else if (mode === 'primary') {
  const primaryKeys = [];
  for (const emne of emners) {
    const primary = list(emne.primary_theory_hooks);
    assert.equal(primary.length, 1, `${emne.emne_id}: primary count ${primary.length}`);
    const hookId = primary[0];
    primaryKeys.push(hookId);
    const hook = hookById.get(hookId);
    assert.ok(hook, `${emne.emne_id}: missing primary hook ${hookId}`);
    assert.ok(list(hook.emne_ids).includes(emne.emne_id), `${emne.emne_id}: primary hook ${hookId} missing canonical association`);
    assert.ok(theoryByHook.has(hookId), `${emne.emne_id}: primary theory missing ${hookId}`);
    const primaryMappings = list(mappingByEmne.get(emne.emne_id)?.mappings).filter((row) => row.mapping_tier === 'primary').map((row) => row.topic_hook);
    assert.ok(primaryMappings.includes(hookId), `${emne.emne_id}: primary mapping missing ${hookId}`);
  }
  assert.equal(new Set(primaryKeys).size, 230);
  console.log('PASS primary semantic keys 230/230');
} else if (mode === 'secondary') {
  for (const emne of emners) {
    const primary = list(emne.primary_theory_hooks)[0];
    const secondaryMappings = list(mappingByEmne.get(emne.emne_id)?.mappings).filter((row) => row.mapping_tier === 'secondary').map((row) => row.topic_hook);
    for (const hookId of list(emne.secondary_theory_hooks)) {
      assert.notEqual(hookId, primary, `${emne.emne_id}: secondary equals primary ${hookId}`);
      assert.ok(hookById.has(hookId), `${emne.emne_id}: missing secondary hook ${hookId}`);
      assert.ok(theoryByHook.has(hookId), `${emne.emne_id}: missing secondary theory ${hookId}`);
      assert.ok(secondaryMappings.includes(hookId), `${emne.emne_id}: secondary mapping missing ${hookId}`);
    }
  }
  console.log('PASS secondary mapping lanes');
} else if (mode === 'legacy') {
  const observed = new Set();
  const unresolved = [];
  for (const row of blueprintRows) {
    if (emneById.has(row.emne_id)) continue;
    if (resolvedLegacyIds.has(row.emne_id)) observed.add(row.emne_id);
    else unresolved.push(`${row.blueprint_file}:${row.emne_id}`);
  }
  assert.deepEqual(unresolved, []);
  assert.deepEqual(sorted(observed), sorted(resolvedLegacyIds));
  assert.equal(resolvedLegacyIds.size, 7);
  console.log('PASS legacy partition 7/7');
} else if (mode === 'active-unique') {
  assert.equal(new Set(activeBlueprintRows.map((row) => row.emne_id)).size, activeBlueprintRows.length);
  console.log(`PASS active blueprint uniqueness ${activeBlueprintRows.length}`);
} else if (mode === 'blueprint-file') {
  const needle = process.argv[3];
  const rows = activeBlueprintRows.filter((row) => row.blueprint_file.includes(needle));
  assert.ok(rows.length > 0, `no active rows for ${needle}`);
  for (const row of rows) {
    assert.ok(row.primary_hook_id, `${row.emne_id}: missing editorial primary hook`);
    for (const hookId of unique([row.primary_hook_id, row.secondary_hook_id])) {
      assert.ok(hookById.has(hookId), `${row.emne_id}: editorial hook missing ${hookId}`);
      assert.ok(theoryByHook.has(hookId), `${row.emne_id}: editorial theory missing ${hookId}`);
    }
  }
  console.log(`PASS ${needle} editorial hooks ${rows.length}`);
} else if (mode === 'overrides') {
  const overrides = list(editorial.overrides);
  assert.equal(new Set(overrides.map((row) => row.emne_id)).size, overrides.length);
  const activeIds = new Set(activeBlueprintRows.map((row) => row.emne_id));
  for (const row of overrides) {
    assert.ok(emneById.has(row.emne_id), `${row.emne_id}: override noncanonical`);
    assert.ok(!activeIds.has(row.emne_id), `${row.emne_id}: blueprint/override overlap`);
    assert.ok(row.editorial_primary_hook_id, `${row.emne_id}: missing override primary`);
    for (const hookId of unique([row.editorial_primary_hook_id, row.editorial_secondary_hook_id])) {
      assert.ok(hookById.has(hookId), `${row.emne_id}: override hook missing ${hookId}`);
      assert.ok(theoryByHook.has(hookId), `${row.emne_id}: override theory missing ${hookId}`);
    }
  }
  assert.equal(overrides.length, 7);
  console.log('PASS overrides 7/7');
} else if (mode === 'coverage') {
  const curatedDomains = new Set(['his_byhistorie_stedsendring','his_industri_arbeid_sosialhistorie','his_velferd_rett_hverdagsliv']);
  const expected = new Set(list(pensum.domains).filter((domain) => curatedDomains.has(domain.domain_id)).flatMap((domain) => list(domain.emne_ids)));
  const covered = new Set([...activeBlueprintRows.map((row) => row.emne_id), ...list(editorial.overrides).map((row) => row.emne_id)]);
  assert.equal(expected.size, 30);
  assert.deepEqual(sorted(covered), sorted(expected));
  console.log(`PASS curated coverage ${covered.size}/30`);
} else {
  throw new Error(`unknown diagnostic mode ${mode}`);
}
