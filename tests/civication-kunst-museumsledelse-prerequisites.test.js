const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const KEY = 'kunst/kunst_museumsledelse';
const ROLE = 'kunst_museumsledelse';
const MODEL = 'data/Civication/roleModels/kunst/kunst_museumsledelse.json';
const GRAMMAR = 'data/Civication/workGrammars/kunst/kunst_museumsledelse.json';
const PLAN = 'data/Civication/mailPlans/kunst/kunst_museumsledelse_plan.json';
const WORLD = 'data/Civication/roleWorlds/kunst/kunst_museumsledelse.json';
const SOURCE = 'reports/CIVICATION_KUNST_MUSEUMSLEDELSE_PREREQUISITES_SOURCE_FIRST.md';
const REMAINING = ['situated','reputation'].join('_');
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const ACTORS = [
  'anne_styreleder_kunst_museumsledelse',
  'omar_okonomi_hr_kunst_museumsledelse',
  'ida_samlings_beredskapsleder_kunst_museumsledelse',
  'marius_kunstnerisk_leder_kunst_museumsledelse'
];
const PLACES = [
  'direktor_og_ledergruppebord',
  'styre_eier_og_mandatspunkt',
  'budsjett_arbeidsgiver_og_prioriteringsrom',
  'samlingsrisiko_beredskap_og_offentlighetsrom'
];
const ACTOR_PLACES = [PLACES[1],PLACES[2],PLACES[3],PLACES[0]];
const PERSISTENT = 'institusjonsstrategi_budsjett_styre_risiko_arbeidsmiljo_og_beredskapslogg';
const LOOPS = [
  'mandat -> strategi -> budsjett -> gjennomforing -> rapportering -> evaluering',
  'hendelse -> sikre mennesker og samling -> etablere fakta -> beslutte -> informere -> etterkontroll'
];
const AUTHORITY = {
  may:['lede institusjonen innen mandat','fordele ressurser innen fullmakt','utøve arbeidsgiveransvar'],
  may_not:['sette styrets myndighet til side','bruke samling eller midler privat','overstyre dokumenterte faglige sikkerhetsgrenser uten grunnlag','skjule vesentlig risiko']
};

assert.ok(exists(MODEL) && exists(GRAMMAR) && exists(PLAN));
const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
const badge = read('data/badges/kunst.json');

assert.equal(model.schema, 'civication_role_model_v2');
assert.equal(model.category, 'kunst');
assert.equal(model.role_scope, ROLE);
assert.equal(model.role_id, ROLE);
assert.deepEqual(grammar.work_loops, LOOPS);
assert.deepEqual(grammar.authority_boundary, AUTHORITY);
assert.equal(grammar.persistent_work_object_contract.id, PERSISTENT);
assert.ok(grammar.persistent_work_object_contract.states.length >= 12);
assert.match(grammar.persistent_work_object_contract.handoff_rule, /mandat|risiko|styre|arbeidsmiljo/i);
assert.match(grammar.rhythm_contract.loop, /waiting|venting/i);
assert.ok(grammar.rhythm_contract.waiting_states.length >= 6);
assert.match(grammar.rhythm_contract.rework_rule, /budsjett|sikkerhet|arbeidsmiljo|styre/i);
assert.deepEqual(grammar.actor_grammar.map((actor) => actor.id), ACTORS);
assert.deepEqual(grammar.place_grammar.map((place) => place.id), PLACES);
assert.equal(grammar.day_one_contract.entry, 'career_offer_policy_by_title');
assert.deepEqual(grammar.day_one_contract.entry_policy_by_title, {Museumsdirektør:{policy:'appointment_required',qualification_ids:['employer_appointment']}});
assert.equal(grammar.day_one_contract.first_object, PERSISTENT);
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, TYPES);
assert.equal(grammar.mail_generation_contract.no_generic_fallback, true);

const tier = badge.tiers.find((entry) => entry.label === 'Museumsdirektør');
assert.equal(tier.career_offer.role_scope, ROLE);
assert.equal(tier.career_offer.policy, 'appointment_required');
assert.deepEqual(tier.career_offer.qualification_ids, ['employer_appointment']);
assert.equal(tier.career_offer.salary_tier, 3);

assert.deepEqual(model.work_life.workplaces, PLACES);
assert.deepEqual(model.related_places.map((place) => place.id), PLACES);
assert.deepEqual(model.related_people.map((person) => person.id), ACTORS);
for (const [index, person] of model.related_people.entries()) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
  assert.deepEqual(person.workplace_ids, [ACTOR_PLACES[index]]);
  assert.ok(person.function.length >= 220, person.id);
  assert.ok(person.authority_relation.length >= 220, person.id);
}
assert.ok(model.career_path.possible_promotions.length >= 2);
assert.ok(model.career_path.possible_exits.length >= 2);
assert.ok(model.required_knowledge.skills.length >= 8);
assert.deepEqual(model.required_knowledge.history_go_badges, ['kunst']);
assert.deepEqual(model.authority_boundary, AUTHORITY);

const boundary = JSON.stringify({model,grammar}).toLowerCase();
for (const term of ['employer_appointment','appointment_required','history go','kunst-badge','styre','deleg','budsjett','arbeidsgiver','arbeidsmiljo','samling','sikkerhet','beredskap','vesentlig risiko']) assert.ok(boundary.includes(term), term);

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.id, 'kunst_museumsledelse_foundation_v1');
assert.equal(plan.category, 'kunst');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 16);
assert.deepEqual(plan.sequence.map((step) => step.type), ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job']);
for (const [index, step] of plan.sequence.entries()) {
  assert.equal(step.step, index + 1);
  assert.deepEqual(step.fallback_types, []);
  assert.equal(step.allowed_families.length, 1);
}
for (const key of ['promoted','fired','stagnated']) assert.ok(plan.outcome_rules[key]);

const expectedCounts = {job:4,people:4,conflict:1,story:1,event:1,micro:1,followup:1,knowledge:1,consequence:1};
let total = 0;
for (const type of TYPES) {
  const rel = `data/Civication/mailFamilies/kunst/${type}/${ROLE}_${type}.json`;
  const catalog = read(rel);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1');
  assert.equal(catalog.category, 'kunst');
  assert.equal(catalog.role_scope, ROLE);
  assert.equal(catalog.mail_type, type);
  const mails = catalog.families.flatMap((family) => family.mails || []);
  assert.equal(mails.length, expectedCounts[type], `${type}: wrong mail count`);
  total += mails.length;
  for (const mail of mails) {
    assert.equal(mail.mail_type, type);
    assert.equal(mail.role_scope, ROLE);
    assert.ok(mail.summary.length >= 500, `${mail.id}: summary ${mail.summary.length}`);
    assert.equal(mail.situation.length, 3);
    assert.equal(mail.choices.length, 2);
    for (const choice of mail.choices) {
      assert.ok(choice.reply.length >= 220, `${mail.id}/${choice.id}: reply ${choice.reply.length}`);
      assert.ok(choice.feedback.length >= 300, `${mail.id}/${choice.id}: feedback ${choice.feedback.length}`);
      assert.ok(Object.keys(choice.effects.stats).length >= 4);
    }
  }
}
assert.equal(total, 15);

const manifest = read('data/Civication/roleModels/manifest.json');
assert.equal(manifest.files.filter((rel) => rel === MODEL).length, 1);

const rolePack = read('data/Civication/rolePackIndex.json').roles.find((row) => row.category === 'kunst' && row.role_scope === ROLE);
assert.ok(rolePack, 'role pack row missing');
assert.equal(rolePack.status, 'complete_reference_v2');

const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((row) => row.key === KEY);
assert.ok(career, 'career row missing');
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);
assert.equal(career.audit.salary.rows.length, 1);
assert.deepEqual(career.audit.salary.rows.map((row) => [row.title,row.offer_policy]), [['Museumsdirektør','appointment_required']]);
for (const component of ['entry','day_one','workday_loop','people','places','mail','knowledge','quality_axes','authority','consequences','performance','economy','progression','exit']) {
  assert.equal(career.audit.components[component].level, 'complete', `${component} must be complete`);
}

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((row) => row.key === KEY);
assert.ok(ready, 'readiness row missing');
assert.equal(ready.classification, 'rollout_ready');
assert.equal(ready.dimensions.people_places_integrity.status, 'foundation_ready');
assert.equal(ready.dimensions.persistent_work_object.status, 'foundation_ready');
assert.equal(ready.dimensions.rhythm_waiting_handoff_rework.status, 'foundation_ready');
assert.equal(ready.dimensions.history_go_affordance.status, 'foundation_ready');
const roleWorldComplete = exists(WORLD);
assert.equal(ready.dimensions[REMAINING].status, roleWorldComplete ? 'foundation_ready' : 'needs_role_authored_work');
assert.deepEqual(ready.authored_work_required, roleWorldComplete ? [] : [REMAINING]);
assert.equal(ready.cross_role.need, 'not_required_for_rollout');
assert.equal(readiness.rollout_queue.some((row) => row.key === KEY && row.classification === 'rollout_ready'), !roleWorldComplete);
assert.equal(readiness.gate.gate_pass, true);

const scenarioPeople = read('data/Civication/scenarioPeople/generated/kunst.json');
const factualPeople = new Set(Object.values(scenarioPeople.people_pool || {}).flat().map((person) => person.person_id));
for (const id of ACTORS) assert.ok(!factualPeople.has(id), `${id}: fictional actor entered factual Scenario People`);

const source = fs.readFileSync(path.join(ROOT, SOURCE), 'utf8');
for (const term of [/not Role World completion/i,/appointment_required/i,/employer_appointment/i,/persistent editorial object/i,/not_required_for_rollout/i,/History Go/i,/no new runtime/i,/15 source mails/i]) assert.match(source, term);

console.log('PASS: Kunst Museumsledelse foundation is playable and rollout-ready while the final realism dimension remains dedicated to Role World authoring.');
