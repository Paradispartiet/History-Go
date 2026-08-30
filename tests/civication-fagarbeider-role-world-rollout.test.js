const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const KEY = 'naeringsliv/fagarbeider';
const ROLE = 'fagarbeider';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/fagarbeider.json';

assert.ok(exists(WORLD_PATH), 'Fagarbeider Role World must be materialized');
const world = read(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'naeringsliv');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');

const plan = read('data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json');
assert.equal(plan.id, 'fagarbeider_naeringsliv_v3');
assert.equal(plan.role_scope, ROLE);
assert.ok(plan.sequence.length >= 20, 'existing Fagarbeider plan must retain at least the 20-step practice block');
for (let i = 0; i < 20; i += 1) {
  assert.equal(plan.sequence[i].step, i + 1);
  assert.equal(plan.sequence[i].type, i % 2 === 0 ? 'job' : 'people');
  assert.deepEqual(plan.sequence[i].fallback_types, []);
}

const model = read('data/Civication/roleModels/naeringsliv/fagarbeider.json');
assert.equal(model.role_scope, ROLE);
assert.deepEqual(model.related_people.map((p) => p.id), [
  'rune_arbeidsleder_fagarbeider',
  'amir_erfaren_fagarbeider',
  'selma_kvalitetskontakt_fagarbeider',
  'liv_laerling_fagarbeider'
]);
assert.deepEqual(model.work_life.workplaces, [
  'oppdrags_og_befaringsflate',
  'fag_og_utstyrsplass',
  'kvalitets_og_avvikspunkt',
  'overleverings_og_opplaeringsflate'
]);
assert.ok(model.authority_boundary.may.includes('stanse eget arbeid ved relevant risiko'));
assert.ok(model.authority_boundary.may_not.includes('arbeide utenfor nødvendig kompetanse'));
assert.ok(model.authority_boundary.may_not.includes('omgå sikkerhetssperrer eller påkrevde kontrollsteg'));
assert.ok(model.authority_boundary.may_not.includes('selvgodkjenne alvorlige avvik uten rett kontrollfunksjon'));

const grammar = read('data/Civication/workGrammars/naeringsliv/naeringsliv_fag_og_produksjon.json');
assert.deepEqual(grammar.work_loops, [
  'ordre -> standard -> utførelse -> kontroll -> avvik -> overlevering',
  'feil -> sikring -> diagnose -> tiltak -> kontroll -> læring'
]);
assert.ok(grammar.authority_boundary.may_not.includes('omgå sikkerhetssperrer'));
assert.ok(grammar.authority_boundary.may_not.includes('selvgodkjenne alvorlige avvik uten rett kontroll'));

const expectedSourceRefs = [
  'data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json#job_fagarbeider_week1_first_inspection',
  'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_rune_oppdrag_001',
  'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_amir_standard_001',
  'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_selma_avvik_001',
  'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_liv_overlevering_001',
  'data/Civication/mailFamilies/naeringsliv/conflict/fagarbeider_conflict.json#fagarbeider_conflict_integritet_early_001',
  'data/Civication/mailFamilies/naeringsliv/conflict/fagarbeider_conflict.json#fagarbeider_conflict_ansvar_intro_001',
  'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#personal_fagarbeider_week1_body_after_first_day'
];
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.existing_persistent_work_preserved, true);
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
  'work_leadership',
  'craft_peers',
  'quality_hms',
  'apprentices_learning',
  'downstream_handoff',
  'production_customer_pressure',
  'private_relations'
];
assert.deepEqual(world.situated_reputation_model.audiences.map((a) => a.id), expectedAudiences);
for (const audience of world.situated_reputation_model.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.match(audience.cannot_grant, /(ikke|kan ikke|cannot)/i);
}
assert.match(world.situated_reputation_model.authority_separation, /kompetanse|sikkerhet/i);
assert.match(world.situated_reputation_model.authority_separation, /myndighet|godkjenning/i);

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
assert.ok(world.primary_threads.length >= 5);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const beatRef of thread.beat_refs) assert.ok(beatKeys.has(beatRef));
}
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
assert.ok(readiness.summary.role_world_complete_or_pilot >= 37);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);

console.log('Civication Fagarbeider Role World rollout: OK');
