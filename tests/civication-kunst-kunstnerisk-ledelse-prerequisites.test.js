const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const KEY = 'kunst/kunst_kunstnerisk_ledelse';
const ROLE = 'kunst_kunstnerisk_ledelse';
const MODEL_PATH = 'data/Civication/roleModels/kunst/kunst_kunstnerisk_ledelse.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/kunst/kunst_kunstnerisk_ledelse.json';
const PLAN_PATH = 'data/Civication/mailPlans/kunst/kunst_kunstnerisk_ledelse_plan.json';
const REMAINING = ['situated', 'reputation'].join('_');
const TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const ACTORS = ['liv_institusjonsdirektor_kunstledelse', 'amina_seniorkurator_kunstledelse', 'eirik_produksjonsleder_kunstledelse', 'sara_kunstnerkontakt_kunstledelse'];
const PLACES = ['program_og_portefoljebord', 'faglig_vurderingsrom', 'budsjett_og_mandatspunkt', 'offentlig_begrunnelse_og_evaluering'];

const sourceFirst = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_KUNST_KUNSTNERISK_LEDELSE_PREREQUISITES_SOURCE_FIRST.md'), 'utf8');
assert.match(sourceFirst, /not Role World completion/i);
assert.match(sourceFirst, /appointment_required/);
assert.match(sourceFirst, /persistent editorial object/i);
assert.match(sourceFirst, /candidate_when_shared_work_is_real/);
assert.match(sourceFirst, /no new runtime/i);

const grammar = read(GRAMMAR_PATH);
assert.deepEqual(grammar.work_loops, [
  'mandat -> mål -> programvalg -> ressursprioritering -> gjennomforing -> evaluering',
  'forslag -> habilitet -> faglig vurdering -> budsjett -> beslutning -> offentlig begrunnelse'
]);
assert.deepEqual(grammar.authority_boundary.may, ['sette kunstnerisk retning innen mandat', 'prioritere programressurser', 'lede faglige prosesser']);
assert.deepEqual(grammar.authority_boundary.may_not, ['overstyre styre- eller direktørmyndighet', 'omgå habilitetskrav', 'bruke institusjonen til private interesser', 'diktere konserveringsinngrep uten faglig grunnlag']);
assert.deepEqual(grammar.actor_grammar.map((actor) => actor.id), ACTORS);
assert.deepEqual(grammar.place_grammar.map((place) => place.id), PLACES);
assert.equal(grammar.persistent_work_object_contract.id, 'kunstnerisk_programportefolje');
assert.match(grammar.rhythm_contract.loop, /waiting|venting/i);
assert.ok(grammar.knowledge_dependencies.some((row) => row.id === 'history_go_kunst_institusjon_og_kanon'));
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, TYPES);

const manifest = read('data/Civication/roleModels/manifest.json');
assert.equal(manifest.files.filter((rel) => rel === MODEL_PATH).length, 1);
const model = read(MODEL_PATH);
assert.equal(model.schema, 'civication_role_model_v2');
assert.equal(model.category, 'kunst');
assert.equal(model.role_scope, ROLE);
assert.equal(model.role_id, ROLE);
assert.deepEqual(model.work_life.workplaces, PLACES);
assert.deepEqual(model.related_places.map((place) => place.id), PLACES);
assert.deepEqual(model.related_people.map((person) => person.id), ACTORS);
for (const [index, person] of model.related_people.entries()) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
  assert.deepEqual(person.workplace_ids, [PLACES[index]]);
  assert.ok(person.function.length >= 180);
  assert.ok(person.authority_relation.length >= 180);
}
assert.ok(model.career_path.possible_promotions.length >= 2);
assert.ok(model.career_path.possible_exits.length >= 2);
assert.ok(model.required_knowledge.history_go_badges.includes('kunst'));

const plan = read(PLAN_PATH);
assert.equal(plan.id, 'kunst_kunstnerisk_ledelse_foundation_v1');
assert.equal(plan.category, 'kunst');
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
  const rel = `data/Civication/mailFamilies/kunst/${type}/${ROLE}_${type}.json`;
  const catalog = read(rel);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1');
  assert.equal(catalog.category, 'kunst');
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
      assert.ok(choice.reply.length >= 80);
      assert.ok(choice.feedback.length >= 160);
      assert.ok(Object.keys(choice.effects.stats).length >= 3);
    }
  }
}

const rolePack = read('data/Civication/rolePackIndex.json').roles.find((row) => row.category === 'kunst' && row.role_scope === ROLE);
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
assert.equal(ready.dimensions[REMAINING].status, 'needs_role_authored_work');
assert.deepEqual(ready.authored_work_required, [REMAINING]);
assert.equal(ready.cross_role.need, 'candidate_when_shared_work_is_real');
assert.ok(readiness.rollout_queue.some((row) => row.key === KEY && row.classification === 'rollout_ready'));
assert.equal(readiness.gate.gate_pass, true);

const scenarioPeople = read('data/Civication/scenarioPeople/generated/kunst.json');
const factualPeople = new Set(Object.values(scenarioPeople.people_pool || {}).flat().map((person) => person.person_id));
for (const id of ACTORS) assert.ok(!factualPeople.has(id), `${id}: fictional actor entered factual Scenario People`);

console.log('PASS: Kunstnerisk ledelse foundation is playable and rollout-ready while the final realism dimension remains dedicated to Role World authoring.');
