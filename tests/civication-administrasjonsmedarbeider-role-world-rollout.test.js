const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const KEY = 'naeringsliv/administrasjonsmedarbeider';
const ROLE = 'administrasjonsmedarbeider';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/administrasjonsmedarbeider.json';

assert.ok(exists(WORLD_PATH), 'Administrasjonsmedarbeider Role World must be materialized');
const world = read(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'naeringsliv');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');

const plan = read('data/Civication/mailPlans/naeringsliv/administrasjonsmedarbeider_plan.json');
assert.equal(plan.id, 'administrasjonsmedarbeider_naeringsliv_v1');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 20, 'existing two-week plan must remain 20 steps');
for (let i = 0; i < plan.sequence.length; i += 1) {
  assert.equal(plan.sequence[i].step, i + 1);
  assert.equal(plan.sequence[i].type, i % 2 === 0 ? 'job' : 'people');
  assert.deepEqual(plan.sequence[i].fallback_types, []);
}

const model = read('data/Civication/roleModels/naeringsliv/okonomi_og_administrasjonsmedarbeider.json');
assert.equal(model.role_scope, 'okonomi_og_administrasjonsmedarbeider');
assert.equal(model.related_people.length, 4);
assert.deepEqual(model.related_people.map((p) => p.id), [
  'nora_administrasjonskoordinator',
  'marius_regnskapsmedarbeider_admin',
  'lea_innkjopskoordinator_admin',
  'eirik_driftskontakt_admin'
]);
assert.equal(model.related_places.length, 4);
assert.ok(model.authority_boundary.may_not.includes('godkjenne uten fullmakt'));
assert.ok(model.authority_boundary.may_not.includes('presentere antakelser som dokumenterte fakta'));

const grammar = read('data/Civication/workGrammars/naeringsliv/naeringsliv_administrasjon_og_okonomistyring.json');
assert.deepEqual(grammar.work_loops, [
  'grunnlag -> kontroll -> registrering -> analyse -> rapport -> oppfølging',
  'avvik -> datakilde -> årsak -> konsekvens -> tiltak -> dokumentasjon'
]);
assert.ok(grammar.authority_boundary.may_not.includes('godkjenne uten fullmakt'));

const expectedSourceRefs = [
  'data/Civication/mailFamilies/naeringsliv/job/administrasjonsmedarbeider_job.json#job_administrasjonsmedarbeider_week1_voucher_without_owner',
  'data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json#administrasjonsmedarbeider_people_nora_handoff_001',
  'data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json#administrasjonsmedarbeider_people_marius_documentation_001',
  'data/Civication/mailFamilies/naeringsliv/conflict/administrasjonsmedarbeider_conflict.json#conflict_administrasjonsmedarbeider_close_without_owner',
  'data/Civication/mailFamilies/naeringsliv/story/administrasjonsmedarbeider_story.json#story_administrasjonsmedarbeider_which_version_became_truth',
  'data/Civication/mailFamilies/naeringsliv/event/administrasjonsmedarbeider_event.json#event_administrasjonsmedarbeider_system_down_before_deadline',
  'data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json#personal_administrasjonsmedarbeider_week1_receipts_at_home'
];
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.existing_rhythm_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);
assert.deepEqual(world.materialization.source_refs, expectedSourceRefs);

for (const ref of expectedSourceRefs) {
  const [rel, id] = ref.split('#');
  const catalog = read(rel);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  assert.ok(mails.some((mail) => mail.id === id), `missing canonical source ${ref}`);
}

assert.equal(world.situated_reputation_model.global_score_allowed, false);
const expectedAudiences = [
  'administrative_coordination',
  'accounting_economy',
  'procurement',
  'operations',
  'office_leadership',
  'audit_downstream_control',
  'private_relations'
];
assert.deepEqual(world.situated_reputation_model.audiences.map((a) => a.id), expectedAudiences);
for (const audience of world.situated_reputation_model.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.match(audience.cannot_grant, /(ikke|kan ikke|cannot)/i);
}
assert.match(world.situated_reputation_model.authority_separation, /godkjenningsfullmakt|godkjenning/i);
assert.match(world.situated_reputation_model.authority_separation, /antakelser/i);

assert.equal(world.cross_role_link.status, 'not_required_for_rollout');
assert.equal(world.cross_role_link.materialized, false);
assert.equal(world.cross_role_link.new_runtime, false);
assert.equal('companion' in world.cross_role_link, false);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning', 'lunch', 'afternoon', 'evening']);
assert.equal(world.season.coverage.length, 56);
const beatKeys = new Set(world.season.coverage.map((beat) => `${beat.day}/${beat.phase}`));
assert.equal(beatKeys.size, 56);
for (let day = 1; day <= 14; day += 1) {
  for (const phase of world.season.day_phases) assert.ok(beatKeys.has(`${day}/${phase}`));
}
for (const beat of world.season.coverage) {
  assert.ok(String(beat.summary || '').includes('Standing'));
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length === 1);
  assert.ok(expectedSourceRefs.includes(beat.materialization_refs[0]));
}
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const beatRef of thread.beat_refs) assert.ok(beatKeys.has(beatRef));
}
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 4);
assert.ok(world.delayed_consequences.length >= 5);

assert.deepEqual(world.existing_work_continuity.work_loops, grammar.work_loops);
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.match(world.existing_work_continuity.rule, /20-stegs|20 steg/i);

const index = read('data/Civication/roleWorlds/index.json');
const indexEntry = index.roles.find((entry) => entry.category === 'naeringsliv' && entry.role_scope === ROLE);
assert.deepEqual(indexEntry, { category: 'naeringsliv', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH });
assert.match(index.status, /_role_worlds_materialized$/);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok(checklist.reference_worlds.includes(WORLD_PATH));
const themeBank = read('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles[KEY], world.theme_ids);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(!(readiness.rollout_queue || []).some((row) => row.key === KEY), 'completed Role World must leave rollout queue');
assert.ok(readiness.summary.role_world_complete_or_pilot >= 36);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);

console.log('Civication Administrasjonsmedarbeider Role World rollout: OK');
