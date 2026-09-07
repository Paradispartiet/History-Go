const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const text = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const CATEGORY = 'natur';
const ROLE = 'natur_politisk_myndighet';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_NATUR_POLITISK_MYNDIGHET_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'utnevnelse_mandat_faggrunnlag_avveiing_hjemmel_beslutning_ansvar_og_oppfolgingslogg';
const LOOPS = [
  'faggrunnlag -> politiske alternativer -> avveiing -> hjemmel og mandat -> beslutning -> begrunnelse -> ansvar -> oppfølging',
  'krise -> fakta og usikkerhet -> juridisk og faglig ramme -> politisk handling -> offentlighet -> implementering -> etterkontroll'
];
const WAITING = [
  'oppdatert_faggrunnlag',
  'juridisk_hjemmelsavklaring',
  'budsjett_eller_finansavklaring',
  'regjeringssamordning',
  'stortingsbehandling',
  'forvaltningsmessig_implementering',
  'etterkontroll_eller_nye_data'
];
const POLICY = {
  'Statsråd (klima og miljø)': { policy: 'appointment_required', qualification_ids: ['public_office_appointment'] }
};
const THEMES = [
  'professional_culture','bureaucratic_power','loyalty_up_down','shame_reputation','public_attention',
  'status_anxiety','public_private_leakage','class_power','local_knowledge_vs_system'
];
const AUDIENCES = [
  'embetsverk_og_departementsledelse',
  'fagmiljo_og_kunnskapsgrunnlag',
  'regjeringssamordning_og_politiske_partnere',
  'juridisk_parlamentarisk_og_kontroll',
  'offentlighet_berorte_og_medier',
  'forvaltning_og_implementeringslinje',
  'private_relations'
];
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
const refs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});

for (const rel of [WORLD, MODEL, GRAMMAR, PLAN, SOURCE]) assert.ok(exists(rel), `${rel} missing`);
const world = read(WORLD), model = read(MODEL), grammar = read(GRAMMAR), plan = read(PLAN);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, CATEGORY);
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.deepEqual(world.theme_ids, THEMES);
assert.equal(plan.sequence.length, 16);
assert.deepEqual(grammar.work_loops, LOOPS);
assert.equal(grammar.persistent_work_object_contract.id, PERSISTENT);
assert.deepEqual(grammar.rhythm_contract.waiting_states, WAITING);
assert.deepEqual(grammar.day_one_contract.entry_policy_by_title, POLICY);
assert.equal(model.related_people.length, 4);
for (const p of model.related_people) {
  assert.equal(p.fictional, true);
  assert.equal(p.fictional_scenario_actor, true);
  assert.equal(p.canonical_person_ref, null);
}
assert.equal(refs.length, 15);
assert.equal(new Set(refs).size, 15);

assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
for (const key of [
  'no_new_runtime','existing_plan_preserved','existing_role_model_preserved','existing_people_foundation_preserved',
  'existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved','career_title_gates_preserved'
]) assert.equal(world.materialization[key], true, key);
assert.equal(world.materialization.cross_role_link_materialized, false);
assert.deepEqual(world.materialization.source_refs, refs);
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.deepEqual(world.existing_work_continuity.work_loops, LOOPS);
assert.equal(world.existing_work_continuity.persistent_work_object, PERSISTENT);
assert.deepEqual(world.existing_work_continuity.waiting_states, WAITING);
assert.equal(world.existing_work_continuity.handoff_rule, grammar.persistent_work_object_contract.handoff_rule);
assert.equal(world.existing_work_continuity.rework_rule, grammar.rhythm_contract.rework_rule);

const bank = read('data/Civication/roleWorldThemeBank.json');
const validThemes = new Set(bank.themes.map((x) => x.id));
for (const id of THEMES) assert.ok(validThemes.has(id), id);
assert.deepEqual(bank.reference_profiles[KEY], THEMES);
assert.equal(world.situated_reputation_model.global_score_allowed, false);
assert.deepEqual(world.situated_reputation_model.audiences.map((a) => a.id), AUDIENCES);
assert.equal(new Set(world.situated_reputation_model.audiences.map((a) => a.standing_axis)).size, AUDIENCES.length);
for (const a of world.situated_reputation_model.audiences) {
  assert.equal(a.cares_about.length, 2, a.id);
  assert.ok(a.cannot_grant.length >= 420, `${a.id}/${a.cannot_grant.length}`);
  for (const term of [/kan ikke/i,/public_office_appointment/i,/History Go/i,/Natur-badge/i,/evidens/i,/hjemmel|myndighet|beslutningseier/i]) {
    assert.match(a.cannot_grant, term, `${a.id}/${term}`);
  }
}
assert.ok(world.situated_reputation_model.divergence_examples.length >= 8);
for (const term of [/global/i,/Statsråd/i,/appointment_required/i,/public_office_appointment/i,/faggrunnlag/i,/hjemmel/i,/Storting/i,/History Go/i,/Natur-badge/i]) {
  assert.match(world.situated_reputation_model.authority_separation, term);
}
assert.equal(world.slow_axes.length, 9);
assert.equal(new Set(world.slow_axes.map((a) => a.id)).size, 9);
for (const a of world.slow_axes) assert.equal(a.runtime_binding, 'editorial_only_until_governed');
assert.ok(world.social_environments.length >= 8);
assert.equal(world.recurring_people_archetypes.length, 8);
for (const p of world.recurring_people_archetypes) {
  for (const field of ['id','social_function','class_position','status','power_over_player','wants','conceals','speech_style','teaches_player']) {
    assert.ok(String(p[field] || '').trim(), `${p.id}/${field}`);
  }
}

assert.equal(world.history_go_affordance.badge_id, 'natur');
assert.ok(refs.includes(world.history_go_affordance.source_ref));
assert.ok(world.history_go_affordance.better_question.length >= 700);
for (const term of [/kan ikke/i,/public_office_appointment/i,/feltdata/i,/utredning/i,/hjemmel/i,/budsjett/i,/regjeringsbeslutning/i,/Storting/i]) {
  assert.match(world.history_go_affordance.authority_boundary, term);
}
assert.equal(world.cross_role_proof.required_for_rollout, false);
assert.equal(world.cross_role_proof.shared_work_object_found, false);
assert.equal(world.cross_role_proof.new_runtime, false);
assert.equal(world.cross_role_proof.status, 'not_required_for_rollout');
assert.match(world.cross_role_proof.rule, /ingen cross-role-link/i);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const beatKeys = new Set(world.season.coverage.map((b) => `${b.day}/${b.phase}`));
assert.equal(beatKeys.size, 56);
assert.equal(new Set(world.season.coverage.map((b) => b.summary)).size, 56);
const phaseTypes = { morning:'task', lunch:'relationship', afternoon:'decision', evening:'private_consequence' };
const use = new Map(refs.map((r) => [r, 0]));
for (let day = 1; day <= 14; day += 1) {
  for (const phase of world.season.day_phases) assert.ok(beatKeys.has(`${day}/${phase}`));
}
for (const b of world.season.coverage) {
  assert.equal(b.beat_type, phaseTypes[b.phase]);
  assert.ok(b.summary.length >= 650, `${b.day}/${b.phase} summary=${b.summary.length}`);
  assert.ok(AUDIENCES.includes(b.standing_audience));
  assert.ok(b.standing_consequence.length >= 300, `${b.day}/${b.phase} standing=${b.standing_consequence.length}`);
  assert.equal(b.materialization_refs.length, 1);
  const ref = b.materialization_refs[0];
  assert.ok(refs.includes(ref), ref);
  use.set(ref, use.get(ref) + 1);
}
for (const [ref, count] of use) assert.ok(count >= 3, `${ref} underused=${count}`);
assert.equal(world.primary_threads.length, 7);
for (const thread of world.primary_threads) {
  assert.ok(thread.relationship.length >= 350, `${thread.id}/${thread.relationship.length}`);
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, thread.id);
  assert.ok(new Set(thread.beat_refs.map((r) => r.split('/')[0])).size >= 2, thread.id);
  for (const ref of thread.beat_refs) {
    assert.ok(beatKeys.has(ref), ref);
    const beat = world.season.coverage.find((x) => `${x.day}/${x.phase}` === ref);
    assert.ok((beat.thread_ids || []).includes(thread.id), `${thread.id}/${ref}`);
  }
}
assert.ok(world.private_aftermath.length >= 6);
for (const aftermath of world.private_aftermath) {
  assert.ok(aftermath.description.length >= 350, `${aftermath.id}/${aftermath.description.length}`);
  for (const ref of aftermath.materialization_refs) assert.ok(refs.includes(ref));
}
assert.ok(world.delayed_consequences.length >= 8);
const order = (ref) => {
  const [d,p] = ref.split('/');
  return Number(d) * 10 + ({morning:1,lunch:2,afternoon:3,evening:4}[p] || 0);
};
for (const delayed of world.delayed_consequences) {
  assert.ok(beatKeys.has(delayed.setup_ref));
  assert.ok(beatKeys.has(delayed.return_ref));
  assert.ok(order(delayed.return_ref) > order(delayed.setup_ref), delayed.id);
  assert.ok(delayed.domains.length >= 2, delayed.id);
}

const index = read('data/Civication/roleWorlds/index.json');
const rows = index.roles.filter((r) => r.category === CATEGORY && r.role_scope === ROLE);
assert.equal(rows.length, 1);
assert.deepEqual(rows[0], { category:CATEGORY, role_scope:ROLE, status:'role_world_complete', path:WORLD });
assert.match(index.status, /_role_worlds_materialized$/);
const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
assert.equal(checklist.reference_worlds.filter((x) => x === WORLD).length, 1);
const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((r) => r.key === KEY);
assert.ok(ready);
assert.equal(ready.classification, 'rollout_ready');
assert.equal(ready.role_world_status, 'role_world_complete');
assert.equal(ready.already_reference_or_pilot, true);
assert.deepEqual(ready.authored_work_required, []);
assert.ok(!(readiness.rollout_queue || []).some((r) => r.key === KEY));
assert.ok(readiness.summary.role_world_complete_or_pilot >= 69);
assert.ok(readiness.summary.rollout_queue_roles <= 16);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);
assert.equal(ready.cross_role.need, 'not_required_for_rollout');
const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((r) => r.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);
const policies = Object.fromEntries(career.audit.salary.rows.map((r) => [r.title, r.offer_policy]));
assert.equal(policies['Statsråd (klima og miljø)'], 'appointment_required');
const scenario = read('data/Civication/scenarioPeople/generated/natur.json');
const factual = new Set(Object.values(scenario.people_pool || {}).flat().map((p) => p.person_id));
for (const p of model.related_people) assert.ok(!factual.has(p.id), `${p.id} leaked into factual people pool`);
const source = text(SOURCE);
for (const term of [
  /Scope lock/i,/Statsråd.*appointment_required/i,/public_office_appointment/i,/situated_reputation/i,
  /no global reputation score/i,/not_required_for_rollout/i,/no cross-role link/i,/History Go/i,
  /No new runtime/i,/Editorial uniqueness/i,/15 canonical/i,/14 days.*4 phases.*56/i
]) assert.match(source, term);
console.log('Civication Natur Politisk myndighet Role World rollout: OK');
