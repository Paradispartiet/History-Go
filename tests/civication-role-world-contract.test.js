const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
const referenceIdentity = (entry) => ({
  category: entry.category,
  role_scope: entry.role_scope,
  status: entry.status
});

const scenePolicy = json('data/Civication/scenePipelinePolicyV1.json');
assert.equal(scenePolicy.compiled_scene_registry_contract.completed_phase, '4H-D');
assert.notEqual(scenePolicy.compiled_scene_registry_contract.next_phase, '4H-D');
assert.equal(scenePolicy.semantic_playthrough_gate.status, 'complete_and_blocking');
assert.equal(scenePolicy.semantic_playthrough_gate.test, 'tests/civication-semantic-playthrough-gate.test.js');
assert.equal(scenePolicy.compiled_scene_registry_contract.legacy_fallback_policy.role_storylet_runtime_fallback_allowed, false);
assert.equal(scenePolicy.compiled_scene_registry_contract.legacy_fallback_policy.jobbmails_runtime_gameplay_allowed, false);

const policy = json('data/Civication/roleWorldPolicy.json');
const authoringChecklist = json('data/Civication/roleWorldAuthoringChecklist.json');
const themeBank = json('data/Civication/roleWorldThemeBank.json');
const index = json('data/Civication/roleWorlds/index.json');
const schema = json('data/Civication/roleWorldV1.schema.json');

assert.equal(policy.runtime_boundary.new_runtime_allowed, false);
assert.equal(policy.runtime_boundary.new_parallel_scene_format_allowed, false);
assert.equal(policy.career_status_boundary.not_equivalent_to, 'role_world_complete');
assert.equal(policy.authoring_guide, 'docs/CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md');
assert.equal(policy.authoring_checklist, 'data/Civication/roleWorldAuthoringChecklist.json');
assert.deepEqual(policy.first_reference_world, {
  category: 'naeringsliv',
  role_scope: 'ekspeditor',
  status: 'role_world_complete'
});
assert.deepEqual(policy.second_reference_world, index.second_reference_world);
assert.equal(policy.second_reference_world.status, 'role_world_complete');
assert.ok(String(policy.second_reference_world.role_scope || '').trim());
assert.notEqual(policy.second_reference_world.role_scope, policy.first_reference_world.role_scope);
assert.deepEqual(policy.third_reference_world, index.third_reference_world);
assert.equal(policy.third_reference_world.status, 'role_world_complete');
assert.equal(policy.third_reference_world.category, 'by');
assert.equal(policy.third_reference_world.role_scope, 'by_radgiver_plan');
assert.deepEqual(policy.fourth_reference_world, index.fourth_reference_world);
assert.equal(policy.fourth_reference_world.status, 'role_world_complete');
assert.equal(policy.fourth_reference_world.category, 'naeringsliv');
assert.equal(policy.fourth_reference_world.role_scope, 'controller');
assert.deepEqual(policy.fifth_reference_world, index.fifth_reference_world);
assert.equal(policy.fifth_reference_world.category, 'sport');
assert.equal(policy.fifth_reference_world.role_scope, 'sport_utover');
assert.equal(policy.fifth_reference_world.status, 'role_world_complete');
assert.equal(policy.reference_wave_complete, true);
assert.equal(policy.next_reference_world, null);
assert.equal(policy.season_contract.days, 14);
assert.deepEqual(policy.season_contract.day_phases, ['morning', 'lunch', 'afternoon', 'evening']);
assert.equal(policy.season_contract.required_unique_coverage_slots_for_complete, 56);
assert.equal(policy.season_contract.coverage_is_dramaturgical_not_decision_quota, true);
assert.equal(policy.thread_contract.primary_thread_beats_min, 5);
assert.equal(policy.thread_contract.primary_thread_beats_max, 10);
assert.equal(policy.materialization.raw_mailfamilies_runtime_fallback_allowed, false);
assert.equal(policy.materialization.role_storylet_runtime_fallback_allowed, false);
assert.equal(policy.materialization.jobbmails_runtime_fallback_allowed, false);

assert.equal(authoringChecklist.schema, 'civication_role_world_authoring_checklist_v1');
assert.equal(authoringChecklist.policy, 'data/Civication/roleWorldPolicy.json');
assert.equal(authoringChecklist.reference_world, 'data/Civication/roleWorlds/naeringsliv/ekspeditor.json');
assert.ok(Array.isArray(authoringChecklist.reference_worlds));
for (const entry of index.roles) assert.ok(authoringChecklist.reference_worlds.includes(entry.path));
assert.equal(authoringChecklist.principles.new_runtime_forbidden, true);
assert.equal(authoringChecklist.principles.new_parallel_scene_format_forbidden, true);
assert.equal(authoringChecklist.principles.reuse_before_rewrite, true);
assert.equal(authoringChecklist.principles.reference_world_structure_may_be_reused, true);
assert.equal(authoringChecklist.principles.reference_world_content_may_be_copied, false);
assert.deepEqual(authoringChecklist.next_reference_world, policy.next_reference_world);
assert.deepEqual(
  authoringChecklist.workflow.map((step) => step.id),
  ['lock_scope', 'inventory_sources', 'write_world_bible', 'design_season_grid', 'design_threads', 'design_aftermath', 'materialize_existing_pipeline', 'register_and_audit', 'clean_and_merge']
);
for (const step of authoringChecklist.workflow) {
  assert.ok(String(step.title || '').trim(), `Authoring step ${step.id} must have title`);
  assert.ok(Array.isArray(step.required) && step.required.length > 0, `Authoring step ${step.id} must have requirements`);
}
assert.ok(authoringChecklist.minimum_role_specific_quality_gate.length >= 5);

assert.equal(themeBank.copyright_and_runtime_guard.editorial_only, true);
assert.equal(themeBank.copyright_and_runtime_guard.runtime_state_allowed, false);
assert.equal(themeBank.copyright_and_runtime_guard.scene_id_allowed, false);
assert.equal(themeBank.copyright_and_runtime_guard.copy_plot_allowed, false);
assert.equal(themeBank.copyright_and_runtime_guard.copy_character_allowed, false);
assert.equal(themeBank.copyright_and_runtime_guard.copy_dialogue_allowed, false);
assert.equal(themeBank.copyright_and_runtime_guard.reconstruct_specific_scene_allowed, false);
assert.ok(themeBank.themes.length >= 12);
const themeIds = new Set(themeBank.themes.map((entry) => entry.id));
assert.equal(themeIds.size, themeBank.themes.length);
for (const [profile, ids] of Object.entries(themeBank.reference_profiles || {})) {
  assert.ok(Array.isArray(ids) && ids.length > 0, `${profile}: theme reference profile must not be empty`);
  for (const id of ids) assert.ok(themeIds.has(id), `${profile}: unknown reference theme ${id}`);
}

assert.equal(schema.properties.schema.const, 'civication_role_world_v1');
for (const required of ['season', 'primary_threads', 'private_aftermath', 'delayed_consequences']) {
  assert.ok(schema.required.includes(required));
}

const requiredNpcFields = new Set(policy.npc_required_fields);
const validPhases = new Set(policy.season_contract.day_phases);
const allowedBeatTypes = new Set(policy.season_contract.allowed_beat_types);

for (const entry of index.roles || []) {
  assert.ok(entry.path, 'Role World index entry must have path');
  const world = json(entry.path);
  assert.equal(world.schema, 'civication_role_world_v1');
  assert.equal(world.version, 1);
  assert.equal(world.category, entry.category);
  assert.equal(world.role_scope, entry.role_scope);
  assert.equal(world.status, entry.status);
  assert.ok(policy.role_world_statuses.includes(world.status));

  for (const themeId of world.theme_ids || []) assert.ok(themeIds.has(themeId), `Unknown Role World theme: ${themeId}`);
  for (const npc of world.recurring_people_archetypes || []) {
    for (const field of requiredNpcFields) assert.ok(String(npc[field] || '').trim(), `${entry.path}: NPC ${npc.id || '?'} missing ${field}`);
  }

  if (world.status !== 'role_world_complete') continue;
  assert.equal(world.season.days, 14);
  assert.deepEqual(world.season.day_phases, policy.season_contract.day_phases);
  assert.equal(world.season.coverage.length, 56, `${entry.path}: complete Role World must have 56 coverage beats`);

  const coverageKeys = new Set();
  for (const beat of world.season.coverage) {
    assert.ok(Number.isInteger(beat.day) && beat.day >= 1 && beat.day <= 14);
    assert.ok(validPhases.has(beat.phase));
    assert.ok(allowedBeatTypes.has(beat.beat_type));
    assert.ok(String(beat.summary || '').trim());
    assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length > 0);
    const key = `${beat.day}/${beat.phase}`;
    assert.ok(!coverageKeys.has(key), `${entry.path}: duplicate day/phase ${key}`);
    coverageKeys.add(key);
  }
  for (let day = 1; day <= 14; day += 1) {
    for (const phase of policy.season_contract.day_phases) assert.ok(coverageKeys.has(`${day}/${phase}`), `${entry.path}: missing ${day}/${phase}`);
  }

  assert.ok(Array.isArray(world.primary_threads) && world.primary_threads.length > 0);
  for (const thread of world.primary_threads) {
    assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, `${entry.path}: primary thread ${thread.id} must have 5–10 beat refs`);
    for (const beatRef of thread.beat_refs) assert.ok(coverageKeys.has(beatRef), `${entry.path}: primary thread ${thread.id} references missing beat ${beatRef}`);
  }
  assert.ok(Array.isArray(world.private_aftermath) && world.private_aftermath.length > 0);
  assert.ok(Array.isArray(world.delayed_consequences) && world.delayed_consequences.length > 0);
  assert.equal(world.materialization.no_new_runtime, true);
  assert.ok(Array.isArray(world.materialization.source_refs) && world.materialization.source_refs.length > 0);
}

const roleWorldDoc = read('docs/CIVICATION_ROLE_WORLD_STANDARD.md');
const authoringGuide = read('docs/CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md');
const careerDoc = read('docs/CIVICATION_CAREER_GAMEPLAY_CONTRACT.md');
const sceneDoc = read('data/Civication/SCENE_PIPELINE_V1.md');
const roleMailDoc = read('data/Civication/README-mailsystem-og-rolemodels.md');

assert.match(roleWorldDoc, /reference_complete.*ikke.*Role World/is);
assert.match(roleWorldDoc, /14 dager/is);
assert.match(roleWorldDoc, /56 dramaturgiske/is);
assert.match(roleWorldDoc, /5–10/is);
assert.match(roleWorldDoc, /ingen ny runtime/is);
assert.match(roleWorldDoc, /Reference wave complete/i);
assert.match(roleWorldDoc, /CIVICATION_ROLE_WORLD_AUTHORING_GUIDE\.md/);
assert.match(authoringGuide, /reuse before rewrite/is);
assert.match(authoringGuide, /56 beats/is);
assert.match(authoringGuide, /provenance/is);
assert.match(authoringGuide, /Reference wave complete/i);
assert.match(authoringGuide, /SHA-låst merge/is);
assert.match(careerDoc, /reference_complete.*ikke.*fylt rolleverden/is);
assert.match(sceneDoc, /4H-D fullført/);
assert.doesNotMatch(sceneDoc, /Neste 4H-D/);
assert.match(roleMailDoc, /Mail er delivery/);
assert.doesNotMatch(roleMailDoc, /Dette er autoritativ jobbmailflyt/);

const completeWorlds = index.roles.filter((entry) => entry.status === 'role_world_complete');
assert.ok(completeWorlds.length >= 5, 'The completed five-world reference wave must remain intact');
const referenceWorlds = completeWorlds.slice(0, 5);
assert.deepEqual(referenceIdentity(referenceWorlds[0]), {
  category: 'naeringsliv',
  role_scope: 'ekspeditor',
  status: 'role_world_complete'
}, 'Ekspeditor must remain the first completed Role World');
assert.deepEqual(referenceIdentity(referenceWorlds[0]), index.first_reference_world);
assert.deepEqual(referenceIdentity(referenceWorlds[1]), index.second_reference_world);
assert.deepEqual(referenceIdentity(referenceWorlds[2]), {
  category: 'by',
  role_scope: 'by_radgiver_plan',
  status: 'role_world_complete'
}, 'By-rådgiver must be the third completed Role World');
assert.deepEqual(referenceIdentity(referenceWorlds[2]), index.third_reference_world);
assert.deepEqual(referenceIdentity(referenceWorlds[3]), {
  category: 'naeringsliv',
  role_scope: 'controller',
  status: 'role_world_complete'
}, 'Controller must be the fourth completed Role World');
assert.deepEqual(referenceIdentity(referenceWorlds[3]), index.fourth_reference_world);
assert.deepEqual(referenceIdentity(referenceWorlds[4]), {
  category: 'sport',
  role_scope: 'sport_utover',
  status: 'role_world_complete'
}, 'Sport-utøver must be the fifth completed Role World');
assert.deepEqual(referenceIdentity(referenceWorlds[4]), index.fifth_reference_world);
assert.deepEqual(referenceIdentity(completeWorlds[5]), {
  category: 'media',
  role_scope: 'media_redaksjon',
  status: 'role_world_complete'
}, 'Journalism must remain the fourth structurally different pilot after the five-world proof wave');
assert.deepEqual(referenceIdentity(completeWorlds[5]), referenceIdentity(index.fourth_structural_pilot));

console.log('Civication Role World contract: OK');
