const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const KEY = 'historie/historie_fagledelse';
const ROLE = 'historie_fagledelse';
const MODEL_PATH = 'data/Civication/roleModels/historie/historie_fagledelse.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/historie/historie_fagledelse.json';
const PLAN_PATH = 'data/Civication/mailPlans/historie/historie_fagledelse_plan.json';
const WORLD_PATH = 'data/Civication/roleWorlds/historie/historie_fagledelse.json';
const REMAINING = ['situated', 'reputation'].join('_');
const TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const ACTORS = [
  'ingrid_avdelingsdirektor_historie_fagledelse',
  'marius_seniorhistoriker_historie_fagledelse',
  'nora_teamkoordinator_historie_fagledelse',
  'sander_kvalitetsradgiver_historie_fagledelse'
];
const WORKPLACES = [
  'prioriterings_og_kapasitetsbord',
  'faglig_metoderom',
  'handoff_og_leveranseflate',
  'kvalitets_og_avvikspunkt'
];
const PLACES = [
  'prioriterings_og_kapasitetsbord',
  'faglig_metoderom',
  'kvalitets_og_avvikspunkt',
  'handoff_og_leveranseflate'
];

const sourceFirst = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_HISTORIE_FAGLEDELSE_PREREQUISITES_SOURCE_FIRST.md'), 'utf8');
assert.match(sourceFirst, /not Role World completion/i);
assert.match(sourceFirst, /appointment_required/);
assert.match(sourceFirst, /persistent editorial object/i);
assert.match(sourceFirst, /candidate_when_shared_work_is_real/);
assert.match(sourceFirst, /no new runtime/i);

const grammar = read(GRAMMAR_PATH);
assert.deepEqual(grammar.work_loops, [
  'behov -> kapasitet -> prioritering -> fordeling -> oppfolging -> kvalitet -> justering',
  'avvik -> risiko -> ansvar -> tiltak -> dokumentasjon -> læring'
]);
assert.deepEqual(grammar.authority_boundary.may, ['lede og prioritere innen delegert ramme']);
assert.deepEqual(grammar.authority_boundary.may_not, [
  'overstyre lov eller delegasjon',
  'diktere faglige funn',
  'skjule kapasitetsrisiko',
  'late som lederrolle gir manglende fagkompetanse'
]);
assert.deepEqual(grammar.actor_grammar.map((actor) => actor.id), ACTORS);
assert.deepEqual(grammar.place_grammar.map((place) => place.id), PLACES);
assert.equal(grammar.persistent_work_object_contract.id, 'faglig_prioriterings_og_kvalitetslogg');
assert.match(grammar.rhythm_contract.loop, /waiting|venting/i);
assert.ok(grammar.rhythm_contract.waiting_states.length >= 4);
assert.ok(grammar.knowledge_dependencies.some((row) => row.id === 'history_go_historie_kildekritikk_og_historiografi'));
assert.equal(grammar.day_one_contract.entry, 'appointment_required');
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, TYPES);
assert.equal(grammar.mail_generation_contract.no_generic_fallback, true);

const manifest = read('data/Civication/roleModels/manifest.json');
assert.equal(manifest.files.filter((rel) => rel === MODEL_PATH).length, 1);
const model = read(MODEL_PATH);
assert.equal(model.schema, 'civication_role_model_v2');
assert.equal(model.category, 'historie');
assert.equal(model.role_scope, ROLE);
assert.equal(model.role_id, ROLE);
assert.deepEqual(model.work_life.workplaces, PLACES);
assert.deepEqual(model.related_places.map((place) => place.id), PLACES);
assert.deepEqual(model.related_people.map((person) => person.id), ACTORS);
for (const [index, person] of model.related_people.entries()) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
  assert.deepEqual(person.workplace_ids, [WORKPLACES[index]]);
  assert.ok(person.function.length >= 180, `${person.id}: shallow function`);
  assert.ok(person.authority_relation.length >= 180, `${person.id}: shallow authority relation`);
}
assert.ok(model.career_path.possible_promotions.length >= 2);
assert.ok(model.career_path.possible_exits.length >= 2);
assert.ok(model.required_knowledge.history_go_badges.includes('historie'));
assert.deepEqual(model.authority_boundary.may, grammar.authority_boundary.may);
assert.deepEqual(model.authority_boundary.may_not, grammar.authority_boundary.may_not);

const plan = read(PLAN_PATH);
assert.equal(plan.id, 'historie_fagledelse_foundation_v1');
assert.equal(plan.category, 'historie');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 16);
assert.deepEqual(plan.sequence.map((step) => step.type), ['job', 'people', 'knowledge', 'job', 'people', 'conflict', 'job', 'people', 'event', 'micro', 'job', 'people', 'followup', 'story', 'consequence', 'job']);
for (const [index, step] of plan.sequence.entries()) {
  assert.equal(step.step, index + 1);
  assert.deepEqual(step.fallback_types, []);
  assert.equal(step.allowed_families.length, 1);
}
for (const key of ['promoted', 'fired', 'stagnated']) assert.ok(plan.outcome_rules[key]);

const expectedCounts = { job: 4, people: 4, conflict: 1, story: 1, event: 1, micro: 1, followup: 1, knowledge: 1, consequence: 1 };
for (const type of TYPES) {
  const rel = `data/Civication/mailFamilies/historie/${type}/${ROLE}_${type}.json`;
  const catalog = read(rel);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1');
  assert.equal(catalog.category, 'historie');
  assert.equal(catalog.role_scope, ROLE);
  assert.equal(catalog.mail_type, type);
  const mails = catalog.families.flatMap((family) => family.mails || []);
  assert.equal(mails.length, expectedCounts[type], `${type}: wrong mail count`);
  for (const mail of mails) {
    assert.equal(mail.mail_type, type);
    assert.equal(mail.role_scope, ROLE);
    assert.ok(mail.summary.length >= 220, `${mail.id}: shallow summary`);
    assert.equal(mail.situation.length, 3);
    assert.equal(mail.choices.length, 2);
    for (const choice of mail.choices) {
      assert.ok(choice.reply.length >= 80, `${mail.id}/${choice.id}: shallow reply`);
      assert.ok(choice.feedback.length >= 160, `${mail.id}/${choice.id}: shallow feedback`);
      assert.ok(Object.keys(choice.effects.stats).length >= 3);
    }
  }
}

const rolePack = read('data/Civication/rolePackIndex.json').roles.find((row) => row.category === 'historie' && row.role_scope === ROLE);
assert.equal(rolePack.status, 'complete_reference_v2');

const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((row) => row.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
for (const component of ['entry', 'day_one', 'workday_loop', 'people', 'places', 'mail', 'knowledge', 'quality_axes', 'authority', 'consequences', 'performance', 'economy', 'progression', 'exit']) {
  assert.equal(career.audit.components[component].level, 'complete', `${component} must be complete`);
}
assert.deepEqual(career.audit.missing_components, []);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((row) => row.key === KEY);
assert.equal(ready.classification, 'rollout_ready');
assert.equal(ready.dimensions.people_places_integrity.status, 'foundation_ready');
assert.equal(ready.dimensions.persistent_work_object.status, 'foundation_ready');
assert.equal(ready.dimensions.rhythm_waiting_handoff_rework.status, 'foundation_ready');
assert.equal(ready.dimensions.history_go_affordance.status, 'foundation_ready');
const roleWorldComplete = fs.existsSync(path.join(ROOT, WORLD_PATH));
assert.equal(ready.dimensions[REMAINING].status, roleWorldComplete ? 'foundation_ready' : 'needs_role_authored_work');
assert.deepEqual(ready.authored_work_required, roleWorldComplete ? [] : [REMAINING]);
assert.equal(ready.cross_role.need, 'candidate_when_shared_work_is_real');
assert.equal(readiness.rollout_queue.some((row) => row.key === KEY && row.classification === 'rollout_ready'), !roleWorldComplete);
assert.equal(readiness.gate.gate_pass, true);

const scenarioPeople = read('data/Civication/scenarioPeople/generated/historie.json');
const factualPeople = new Set(Object.values(scenarioPeople.people_pool || {}).flat().map((person) => person.person_id));
for (const id of ACTORS) assert.ok(!factualPeople.has(id), `${id}: fictional actor entered factual Scenario People`);

console.log('PASS: Historie/Fagledelse foundation is playable and rollout-ready while the final realism dimension remains dedicated Role World debt.');
