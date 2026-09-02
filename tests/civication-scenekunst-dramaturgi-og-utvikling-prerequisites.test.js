const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const KEY = 'scenekunst/scenekunst_dramaturgi_og_utvikling';
const ROLE = 'scenekunst_dramaturgi_og_utvikling';
const MODEL = `data/Civication/roleModels/scenekunst/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/scenekunst/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/scenekunst/${ROLE}_plan.json`;
const TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const ACTORS = ['liv_dramatiker', 'samir_regissor', 'ingrid_researchansvarlig', 'maja_produksjonsleder'];
const PLACES = ['tekstlaboratorium_og_versjonsbord', 'provesal_og_observasjonsplass', 'research_og_kildeverksted', 'produksjonsmote_og_beslutningsrom'];

const grammar = read(GRAMMAR);
assert.equal(grammar.persistent_work_object_contract.id, 'dramaturgisk_arbeidsbok');
assert.match(grammar.rhythm_contract.loop, /waiting|venting/i);
assert.deepEqual(grammar.actor_grammar.map((actor) => actor.id), ACTORS);
assert.deepEqual(grammar.place_grammar.map((place) => place.id), PLACES);
assert.ok(grammar.knowledge_dependencies.some((dependency) => dependency.id === 'history_go_scenekunst_ibsen_tekst_scene_og_kontekst'));
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, TYPES);
assert.equal(grammar.day_one_contract.entry, 'appointment_required');
assert.match(grammar.authority_boundary.may_not.join(' '), /opphavsrettslig/);
assert.match(grammar.authority_boundary.may_not.join(' '), /regissorens/);

const manifest = read('data/Civication/roleModels/manifest.json');
assert.equal(manifest.files.filter((entry) => entry === MODEL).length, 1);
const model = read(MODEL);
assert.deepEqual(model.work_life.workplaces, PLACES);
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
assert.ok(model.required_knowledge.history_go_badges.includes('scenekunst'));

const plan = read(PLAN);
assert.equal(plan.id, 'scenekunst_dramaturgi_og_utvikling_foundation_v1');
assert.equal(plan.sequence.length, 16);
assert.deepEqual(plan.sequence.map((step) => step.type), ['job', 'people', 'knowledge', 'job', 'people', 'conflict', 'job', 'people', 'event', 'micro', 'job', 'people', 'followup', 'story', 'consequence', 'job']);
for (const [index, step] of plan.sequence.entries()) {
  assert.equal(step.step, index + 1);
  assert.deepEqual(step.fallback_types, []);
  assert.equal(step.allowed_families.length, 1);
}
for (const outcome of ['promoted', 'fired', 'stagnated']) assert.ok(plan.outcome_rules[outcome]);

const expectedCounts = { job: 4, people: 4, conflict: 1, story: 1, event: 1, micro: 1, followup: 1, knowledge: 1, consequence: 1 };
for (const type of TYPES) {
  const catalog = read(`data/Civication/mailFamilies/scenekunst/${type}/${ROLE}_${type}.json`);
  const mails = catalog.families.flatMap((family) => family.mails || []);
  assert.equal(catalog.mail_type, type);
  assert.equal(mails.length, expectedCounts[type]);
  for (const mail of mails) {
    assert.ok(mail.summary.length >= 250, `${mail.id}: summary`);
    assert.equal(mail.situation.length, 3);
    assert.equal(mail.choices.length, 2);
    for (const choice of mail.choices) {
      assert.ok(choice.reply.length >= 100, `${mail.id}/${choice.id}: reply`);
      assert.ok(choice.feedback.length >= 180, `${mail.id}/${choice.id}: feedback`);
      assert.ok(Object.keys(choice.effects.stats).length >= 3);
    }
  }
}

const knowledge = read(`data/Civication/mailFamilies/scenekunst/knowledge/${ROLE}_knowledge.json`).families[0].mails[0];
assert.equal(knowledge.place_id, 'nationaltheatret');
assert.equal(knowledge.task_payload.person_id, 'johanne_dybwad');
assert.equal(knowledge.task_contract.completion_rule, 'history_go_payload_completed');

const pack = read('data/Civication/rolePackIndex.json').roles.find((entry) => entry.category === 'scenekunst' && entry.role_scope === ROLE);
assert.equal(pack.status, 'complete_reference_v2');
const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((entry) => entry.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);
const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((entry) => entry.key === KEY);
assert.equal(ready.classification, 'rollout_ready');
assert.ok(['role_world_not_started', 'role_world_complete'].includes(ready.role_world_status));
for (const dimension of ['people_places_integrity', 'persistent_work_object', 'rhythm_waiting_handoff_rework', 'history_go_affordance', 'situated_reputation']) {
  assert.equal(ready.dimensions[dimension].status, 'foundation_ready', dimension);
}
assert.deepEqual(ready.authored_work_required, []);
assert.equal(ready.cross_role.need, 'not_required_for_rollout');
assert.equal(readiness.rollout_queue.some((entry) => entry.key === KEY), ready.role_world_status === 'role_world_not_started');
assert.equal(readiness.gate.gate_pass, true);

const scenarioPeople = read('data/Civication/scenarioPeople/generated/scenekunst.json');
const factualPeople = new Set(Object.values(scenarioPeople.people_pool || {}).flat().map((person) => person.person_id));
for (const id of ACTORS) assert.ok(!factualPeople.has(id));

const sourceFirst = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_SCENEKUNST_DRAMATURGI_OG_UTVIKLING_PREREQUISITES_SOURCE_FIRST.md'), 'utf8');
assert.match(sourceFirst, /not Role World completion/i);
assert.match(sourceFirst, /dramaturgisk_arbeidsbok/);
assert.match(sourceFirst, /not_required_for_rollout/);
assert.match(sourceFirst, /29\/30/);
console.log('Civication Scenekunst Dramaturgi og utvikling prerequisites: OK');
