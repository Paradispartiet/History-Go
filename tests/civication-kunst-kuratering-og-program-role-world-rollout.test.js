const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const CATEGORY = 'kunst';
const ROLE = 'kunst_kuratering_og_program';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const SOURCE = 'reports/CIVICATION_KUNST_KURATERING_OG_PROGRAM_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'utstillingsprogram_research_utvalg_proveniens_rettighet_og_beslutningslogg';
const EXPECTED_LOOPS = [
  'spørsmål -> research -> utvalg -> begrunnelse -> kunstnerdialog -> produksjon -> publikumsrespons',
  'påstand -> kildekontroll -> tolkning -> motperspektiv -> tekst -> faglig kontroll'
];
const EXPECTED_AUTHORITY = {
  may: ['foreslå og begrunne utvalg','utvikle konsepter','forhandle faglige premisser innen mandat'],
  may_not: ['skjule interessekonflikter','garantere innkjøp eller salg uten fullmakt','endre proveniens uten dokumentasjon','framstille tolkning som ubestridt faktum']
};
const EXPECTED_POLICIES = {
  Kuratorassistent: {policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  Kurator: {policy:'appointment_required',qualification_ids:['employer_appointment']},
  'Senior kurator': {policy:'appointment_required',qualification_ids:['employer_appointment']}
};
const EXPECTED_THEMES = [
  'professional_culture','class_power','status_anxiety','bureaucratic_power','care_vs_efficiency',
  'invisible_work','shame_reputation','public_private_leakage','public_attention'
];
const EXPECTED_AUDIENCES = [
  'curatorial_peers_and_researchers',
  'registrars_provenance_and_rights',
  'artists_estates_and_lenders',
  'institutional_decision_owners',
  'editors_production_and_mediation',
  'publics_critics_and_communities',
  'future_researchers_and_program_memory',
  'private_relations'
];
const EXPECTED_PEOPLE = [
  'ingrid_senior_kurator_kunst_kuratering_og_program',
  'malik_proveniens_rettighet_kunst_kuratering_og_program',
  'sofia_kunstner_programdialog_kunst_kuratering_og_program',
  'henrik_tekst_formidling_produksjon_kunst_kuratering_og_program'
];
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});

assert.ok(exists(MODEL), 'role model missing');
assert.ok(exists(GRAMMAR), 'work grammar missing');
assert.ok(exists(PLAN), 'mail plan missing');
assert.ok(exists(WORLD), 'Kunst Kuratering og program Role World must exist');

const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
const world = read(WORLD);
const badge = read('data/badges/kunst.json');

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

const byLabel = Object.fromEntries(badge.tiers.map((entry) => [entry.label, entry]));
assert.equal(byLabel.Kuratorassistent.career_offer.policy, 'qualification_required');
assert.deepEqual(byLabel.Kuratorassistent.career_offer.qualification_ids, ['relevant_education_or_employer_qualification']);
assert.equal(byLabel.Kurator.life_position.id, 'kuratorpraksis');
assert.equal(byLabel.Kurator.life_position.employment_independent, true);
assert.equal(byLabel.Kurator.career_unlock.policy, 'appointment_required');
assert.deepEqual(byLabel.Kurator.career_unlock.qualification_ids, ['employer_appointment']);
assert.equal(byLabel['Senior kurator'].career_offer.policy, 'appointment_required');
assert.deepEqual(byLabel['Senior kurator'].career_offer.qualification_ids, ['employer_appointment']);
assert.notEqual(byLabel.Kurator.life_position, byLabel.Kurator.career_unlock);

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
  'existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved',
  'career_title_gates_preserved','kurator_life_position_split_preserved'
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
  /ansett|utnevn/i,/deleg/i,/budsjett/i,/innkjøp/i,/salg/i,/eierskap/i,/History Go/i,/Badge/i
]) assert.match(rep.authority_separation, term);
assert.match(rep.authority_separation, /kuratorpraksis/i);
assert.match(rep.authority_separation, /employment_independent/i);

assert.equal(world.slow_axes.length, 9);
assert.equal(new Set(world.slow_axes.map((axis) => axis.id)).size, 9);
for (const axis of world.slow_axes) assert.equal(axis.runtime_binding, 'editorial_only_until_governed');

assert.equal(world.history_go_affordance.badge_id, 'kunst');
assert.ok(canonicalRefs.includes(world.history_go_affordance.source_ref));
assert.ok(world.history_go_affordance.better_question.length >= 350);
assert.match(world.history_go_affordance.better_question, /kunsthistor|kilde|utstillingshistor/i);
for (const term of [
  /kan ikke/i,/proveniens/i,/attribusjon/i,/rettighet/i,/samtykke/i,/habilitet/i,/innkjøp/i,/salg/i,
  /eierskap/i,/delegasjon/i,/budsjett/i,/qualification_required/i,/appointment_required/i,/employer_appointment/i,/Badge/i
]) assert.match(world.history_go_affordance.authority_boundary, term);

assert.equal(world.cross_role_proof.status, 'not_materialized_no_shared_work_object');
assert.equal(world.cross_role_proof.shared_work_object_found, false);
assert.equal(world.cross_role_proof.required_for_rollout, false);
assert.equal(world.cross_role_proof.new_runtime, false);
assert.equal(world.cross_role_proof.candidate_when_shared_work_is_real, true);
assert.match(world.cross_role_proof.rule, /candidate_when_shared_work_is_real/i);
assert.match(world.cross_role_proof.rule, /reelt delt|shared work object/i);
assert.equal(world.materialization.cross_role_link_materialized, false);

assert.deepEqual(world.editorial_uniqueness.not_copy_of, [
  'kunst/kunst_kunstnerisk_ledelse','kunst/kunst_utstillingsproduksjon','kunst/kunst_konservering_og_samling'
]);
for (const term of [/research/i,/utvalg/i,/proveniens/i,/attribusjon/i,/rettighet/i,/habilitet/i,/kunstnerdialog/i,/korrigering/i]) {
  assert.match(world.editorial_uniqueness.rule, term);
}

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
assert.ok(readiness.summary.role_world_complete_or_pilot >= 62);
assert.ok(readiness.summary.rollout_queue_roles <= 23);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);
assert.equal(ready.cross_role.need, 'candidate_when_shared_work_is_real');

const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((entry) => entry.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);
assert.equal(career.audit.salary.rows.length, 3);
const actualPolicies = career.audit.salary.rows.map((row) => [row.title,row.offer_policy]).sort((a,b) => a[0].localeCompare(b[0], 'nb'));
const expectedPolicies = [
  ['Kuratorassistent','qualification_required'],
  ['Kurator','appointment_required'],
  ['Senior kurator','appointment_required']
].sort((a,b) => a[0].localeCompare(b[0], 'nb'));
assert.deepEqual(actualPolicies, expectedPolicies);
for (const name of ['entry','day_one','workday_loop','people','places','mail','knowledge','consequences','performance','economy','progression','exit']) {
  assert.equal(career.audit.components[name].level, 'complete', name);
}

const source = fs.readFileSync(path.join(ROOT, SOURCE), 'utf8');
for (const term of [
  /Scope lock/i,/qualification_required/i,/appointment_required/i,/employer_appointment/i,/kuratorpraksis/i,
  /employment-independent/i,/situated_reputation/i,/no global reputation score/i,
  /not_materialized_no_shared_work_object/i,/candidate_when_shared_work_is_real/i,/History Go/i,
  /no new runtime/i,/Editorial uniqueness/i,/15 canonical prerequisite mails/i,/30\/30/
]) assert.match(source, term);

console.log('Civication Kunst Kuratering og program Role World rollout: OK');
