const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const CATEGORY = 'kunst';
const ROLE = 'kunst_konservering_og_samling';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const SOURCE = 'reports/CIVICATION_KUNST_KONSERVERING_OG_SAMLING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'kunstverk_tilstands_material_behandlings_og_utlanslogg';
const EXPECTED_LOOPS = [
  'undersøk -> dokumenter -> risikovurder -> tiltak -> kontroll -> dokumenter resultat',
  'forespørsel -> tilstand -> miljøkrav -> transportkrav -> faglig anbefaling -> oppfølging'
];
const EXPECTED_AUTHORITY = {
  may: ['stanse risikofylt håndtering','sette faglige bevaringsvilkår','gjennomføre tiltak innen kompetanse og mandat'],
  may_not: ['utføre udokumenterte inngrep','endre verk av kosmetiske grunner alene','skjule skade eller usikkerhet','overstyre juridisk eierskap eller forsikringsbeslutninger']
};
const EXPECTED_POLICIES = {
  Konservator: {policy:'qualification_required', qualification_ids:['relevant_education_or_employer_qualification']},
  'Senior konservator': {policy:'appointment_required', qualification_ids:['relevant_education_or_employer_qualification','employer_appointment']}
};
const EXPECTED_THEMES = [
  'professional_culture','class_power','status_anxiety','bureaucratic_power','care_vs_efficiency',
  'invisible_work','shame_reputation','public_private_leakage','public_attention'
];
const EXPECTED_AUDIENCES = [
  'conservation_peers_and_material_specialists',
  'registrars_and_collection_stewards',
  'curators_and_exhibition_team',
  'lenders_insurers_and_transport_partners',
  'artists_estates_and_rightsholders',
  'mounting_security_and_museum_operations',
  'researchers_future_conservators_and_public',
  'private_relations'
];
const EXPECTED_PEOPLE = [
  'eva_senior_konservator_kunst_konservering_og_samling',
  'jonas_registrar_samlingsforvalter_kunst_konservering_og_samling',
  'samira_utlan_transport_klima_kunst_konservering_og_samling',
  'mikkel_utstillingsproduksjon_kunst_konservering_og_samling'
];
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});

assert.ok(exists(MODEL), 'role model missing');
assert.ok(exists(GRAMMAR), 'work grammar missing');
assert.ok(exists(PLAN), 'mail plan missing');
assert.ok(exists(WORLD), 'Kunst Konservering og samlingsbevaring Role World must exist');

const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
const world = read(WORLD);

assert.equal(model.schema, 'civication_role_model_v2');
assert.equal(model.role_scope, ROLE);
assert.equal(grammar.schema, 'civication_work_grammar_v2');
assert.equal(grammar.role_scope, ROLE);
assert.equal(plan.sequence.length, 16);
assert.deepEqual(grammar.work_loops, EXPECTED_LOOPS);
assert.equal(grammar.persistent_work_object_contract.id, PERSISTENT);
assert.deepEqual(grammar.authority_boundary, EXPECTED_AUTHORITY);
assert.equal(grammar.day_one_contract.entry, 'career_offer_policy_by_title');
assert.deepEqual(grammar.day_one_contract.entry_policy_by_title, EXPECTED_POLICIES);

assert.equal(model.related_people.length, 4);
assert.deepEqual(model.related_people.map((person) => person.id), EXPECTED_PEOPLE);
for (const person of model.related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
}

assert.equal(canonicalRefs.length, 15);
assert.equal(new Set(canonicalRefs).size, 15);
assert.deepEqual(world.materialization.source_refs, canonicalRefs);

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, CATEGORY);
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
for (const key of [
  'no_new_runtime','existing_plan_preserved','existing_role_model_preserved','existing_people_foundation_preserved',
  'existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved'
]) assert.equal(world.materialization[key], true, key);
assert.equal(world.materialization.cross_role_link_materialized, false);

assert.deepEqual(world.existing_work_continuity.work_loops, EXPECTED_LOOPS);
assert.equal(world.existing_work_continuity.persistent_work_object, PERSISTENT);
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.deepEqual(world.existing_work_continuity.waiting_states, grammar.rhythm_contract.waiting_states);
assert.equal(world.existing_work_continuity.handoff_rule, grammar.persistent_work_object_contract.handoff_rule);
assert.equal(world.existing_work_continuity.rework_rule, grammar.rhythm_contract.rework_rule);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
const validThemeIds = new Set(themeBank.themes.map((entry) => entry.id));
assert.deepEqual(world.theme_ids, EXPECTED_THEMES);
for (const id of world.theme_ids) assert.ok(validThemeIds.has(id), `unknown theme ${id}`);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
assert.deepEqual(rep.audiences.map((audience) => audience.id), EXPECTED_AUDIENCES);
assert.equal(new Set(rep.audiences.map((audience) => audience.standing_axis)).size, EXPECTED_AUDIENCES.length);
for (const audience of rep.audiences) {
  assert.equal(audience.cares_about.length, 2);
  assert.ok(audience.cannot_grant.length >= 100, audience.id);
  assert.match(audience.cannot_grant, /kan ikke|ikke gi/i);
}
assert.ok(rep.divergence_examples.length >= 6);
for (const term of [
  /global/i,/evidens/i,/qualification_required/i,/appointment_required/i,/employer_appointment/i,
  /deleg/i,/budsjett/i,/ansett|utnevn/i,/behandling/i,/forsikring/i,/transport/i,/eierskap/i,/History Go/i,/Badge/i
]) assert.match(rep.authority_separation, term);

assert.equal(world.slow_axes.length, 9);
assert.equal(new Set(world.slow_axes.map((axis) => axis.id)).size, 9);
for (const axis of world.slow_axes) assert.equal(axis.runtime_binding, 'editorial_only_until_governed');

assert.equal(world.history_go_affordance.badge_id, 'kunst');
assert.ok(canonicalRefs.includes(world.history_go_affordance.source_ref));
assert.ok(world.history_go_affordance.better_question.length >= 350);
assert.match(world.history_go_affordance.better_question, /kunsthistor|material|kilde/i);
for (const term of [
  /kan ikke/i,/qualification_required/i,/appointment_required/i,/employer_appointment/i,/ansett|utnevn/i,
  /deleg/i,/budsjett/i,/behandling/i,/diagnostiser|materialtilstand/i,/forsikring/i,/transport/i,/eierskap/i,/Badge/i
]) assert.match(world.history_go_affordance.authority_boundary, term);

assert.equal(world.cross_role_proof.status, 'not_materialized_no_shared_work_object');
assert.equal(world.cross_role_proof.shared_work_object_found, false);
assert.equal(world.cross_role_proof.required_for_rollout, false);
assert.equal(world.cross_role_proof.new_runtime, false);
assert.match(world.cross_role_proof.rule, /not_required_for_rollout/i);
assert.match(world.cross_role_proof.rule, /reelt delt|shared work object/i);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const beatKeys = new Set(world.season.coverage.map((beat) => `${beat.day}/${beat.phase}`));
assert.equal(beatKeys.size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.summary)).size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.standing_consequence)).size, 56);
const expectedBeatType = {morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'};
const useCounts = new Map(canonicalRefs.map((ref) => [ref, 0]));
for (let day = 1; day <= 14; day += 1) {
  const dayBeats = world.season.coverage.filter((beat) => beat.day === day);
  assert.equal(dayBeats.length, 4, `day ${day} must have four beats`);
  assert.deepEqual(new Set(dayBeats.map((beat) => beat.phase)), new Set(['morning','lunch','afternoon','evening']));
}
for (const beat of world.season.coverage) {
  assert.equal(beat.beat_type, expectedBeatType[beat.phase]);
  assert.ok(beat.summary.length >= 650, `${beat.day}/${beat.phase}: summary ${beat.summary.length}`);
  assert.ok(beat.standing_consequence.length >= 520, `${beat.day}/${beat.phase}: standing ${beat.standing_consequence.length}`);
  assert.ok(EXPECTED_AUDIENCES.includes(beat.standing_audience));
  assert.equal(beat.materialization_refs.length, 1);
  assert.ok(canonicalRefs.includes(beat.materialization_refs[0]));
  useCounts.set(beat.materialization_refs[0], useCounts.get(beat.materialization_refs[0]) + 1);
}
for (const [ref, count] of useCounts) assert.ok(count >= 3, `${ref} underused: ${count}`);

assert.equal(world.primary_threads.length, 7);
for (const thread of world.primary_threads) {
  assert.ok(thread.relationship.length >= 180, thread.id);
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, thread.id);
  assert.equal(new Set(thread.beat_refs).size, thread.beat_refs.length, thread.id);
  assert.ok(new Set(thread.beat_refs.map((ref) => ref.split('/')[0])).size >= 3, thread.id);
  for (const ref of thread.beat_refs) assert.ok(beatKeys.has(ref), `${thread.id}: ${ref}`);
}

assert.ok(world.private_aftermath.length >= 5);
for (const aftermath of world.private_aftermath) {
  assert.ok(aftermath.description.length >= 180, aftermath.id);
  for (const ref of aftermath.materialization_refs) assert.ok(canonicalRefs.includes(ref), `${aftermath.id}: ${ref}`);
}

assert.ok(world.delayed_consequences.length >= 8);
assert.equal(new Set(world.delayed_consequences.map((entry) => entry.id)).size, world.delayed_consequences.length);
const order = (ref) => {
  const [day, phase] = ref.split('/');
  return Number(day) * 10 + ({morning:1,lunch:2,afternoon:3,evening:4}[phase] || 0);
};
for (const delayed of world.delayed_consequences) {
  assert.ok(beatKeys.has(delayed.setup_ref), delayed.id);
  assert.ok(beatKeys.has(delayed.return_ref), delayed.id);
  assert.ok(order(delayed.return_ref) > order(delayed.setup_ref), delayed.id);
  assert.ok(delayed.domains.length >= 2, delayed.id);
}

const index = read('data/Civication/roleWorlds/index.json');
const indexMatches = index.roles.filter((entry) => entry.category === CATEGORY && entry.role_scope === ROLE);
assert.equal(indexMatches.length, 1);
assert.deepEqual(indexMatches[0], {category:CATEGORY, role_scope:ROLE, status:'role_world_complete', path:WORLD});
const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
assert.equal(checklist.reference_worlds.filter((entry) => entry === WORLD).length, 1);
assert.deepEqual(themeBank.reference_profiles[KEY], world.theme_ids);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((entry) => entry.key === KEY);
assert.ok(ready, 'readiness row missing');
assert.equal(ready.classification, 'rollout_ready');
assert.equal(ready.role_world_status, 'role_world_complete');
assert.ok(ready.already_reference_or_pilot);
assert.deepEqual(ready.authored_work_required, []);
assert.equal(ready.dimensions.situated_reputation.status, 'foundation_ready');
assert.ok(!(readiness.rollout_queue || []).some((entry) => entry.key === KEY));
assert.ok(readiness.summary.role_world_complete_or_pilot >= 61);
assert.ok(readiness.summary.rollout_queue_roles <= 24);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);

const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((entry) => entry.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);
assert.equal(career.audit.salary.rows.length, 2);
assert.deepEqual(career.audit.salary.rows.map((row) => [row.title,row.offer_policy]), [
  ['Konservator','qualification_required'],
  ['Senior konservator','appointment_required']
]);
for (const name of ['entry','day_one','workday_loop','people','places','mail','knowledge','consequences','performance','economy','progression','exit']) {
  assert.equal(career.audit.components[name].level, 'complete', name);
}

const source = fs.readFileSync(path.join(ROOT, SOURCE), 'utf8');
for (const term of [
  /Scope lock/i,/qualification_required/i,/appointment_required/i,/employer_appointment/i,/situated_reputation/i,
  /no global reputation score/i,/not_materialized_no_shared_work_object/i,/not_required_for_rollout/i,/History Go/i,
  /no new runtime/i,/Editorial uniqueness/i,/30\/30/
]) assert.match(source, term);

console.log('Civication Kunst Konservering og samlingsbevaring Role World rollout: OK');
