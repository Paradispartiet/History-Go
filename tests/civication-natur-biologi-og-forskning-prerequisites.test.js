const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const KEY = 'natur/natur_biologi_og_forskning';
const ROLE = 'natur_biologi_og_forskning';
const MODEL = 'data/Civication/roleModels/natur/natur_biologi_og_forskning.json';
const GRAMMAR = 'data/Civication/workGrammars/natur/natur_biologi_og_forskning.json';
const PLAN = 'data/Civication/mailPlans/natur/natur_biologi_og_forskning_plan.json';
const WORLD = 'data/Civication/roleWorlds/natur/natur_biologi_og_forskning.json';
const SOURCE = 'reports/CIVICATION_NATUR_BIOLOGI_OG_FORSKNING_PREREQUISITES_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'forskningssporsmal_metode_prove_data_analyse_og_replikasjonslogg';
const ACTORS = [
  'ingrid_seniorforsker_natur_biologi_og_forskning',
  'marius_feltkoordinator_natur_biologi_og_forskning',
  'leila_laboratorieansvarlig_natur_biologi_og_forskning',
  'noah_statistiker_dataforvalter_natur_biologi_og_forskning'
];
const PLACES = [
  'feltstasjon_og_provetakingspunkt',
  'provemottak_og_laboratorieflate',
  'analyse_reproduserbarhet_og_databord',
  'metodemote_og_faglig_kvalitetssikring'
];

assert.ok(exists(MODEL) && exists(GRAMMAR) && exists(PLAN));
const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);

assert.equal(model.schema, 'civication_role_model_v2');
assert.equal(model.category, 'natur');
assert.equal(model.role_scope, ROLE);
assert.equal(model.role_id, ROLE);
assert.deepEqual(model.work_life.workplaces, PLACES);
assert.deepEqual(model.related_people.map((p) => p.id), ACTORS);
assert.deepEqual(model.related_places.map((p) => p.id), PLACES);
assert.ok(model.required_knowledge.skills.length >= 8);
assert.deepEqual(model.required_knowledge.history_go_badges, ['natur']);
assert.ok(model.career_path.possible_promotions.length >= 2);
assert.ok(model.career_path.possible_exits.length >= 2);
for (const person of model.related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
  assert.ok(person.function.length >= 220, person.id);
  assert.ok(person.authority_relation.length >= 250, person.id);
}

assert.deepEqual(grammar.actor_grammar.map((a) => a.id), ACTORS);
assert.deepEqual(grammar.place_grammar.map((p) => p.id), PLACES);
assert.equal(grammar.persistent_work_object_contract.id, PERSISTENT);
assert.ok(grammar.persistent_work_object_contract.states.length >= 14);
assert.match(grammar.persistent_work_object_contract.handoff_rule, /handoff|neste aktør/i);
assert.match(grammar.rhythm_contract.loop, /waiting|venting/i);
assert.ok(grammar.rhythm_contract.waiting_states.length >= 6);
assert.match(grammar.rhythm_contract.rework_rule, /replikasjon|data|metode/i);
assert.equal(grammar.day_one_contract.entry, 'career_offer_policy_by_title');
assert.equal(grammar.day_one_contract.first_object, PERSISTENT);
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, TYPES);
assert.equal(grammar.mail_generation_contract.no_generic_fallback, true);

const policy = grammar.day_one_contract.entry_policy_by_title;
assert.deepEqual(policy.Biolog, {policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']});
assert.deepEqual(policy['Økolog'], {policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']});
assert.deepEqual(policy['Forsker (miljø/natur)'], {policy:'qualification_required',qualification_ids:['academic_qualification_and_employment']});
assert.deepEqual(policy['Seniorforsker (miljø/natur)'], {policy:'qualification_required',qualification_ids:['academic_qualification_and_employment']});

const overlay = read('data/Civication/badgeCareerContracts/natur.json');
const offers = Object.fromEntries(overlay.tiers.filter((t) => t.career_offer?.role_scope === ROLE).map((t) => [t.label, t.career_offer]));
assert.equal(offers.Biolog.policy, 'qualification_required');
assert.deepEqual(offers.Biolog.qualification_ids, ['relevant_education_or_employer_qualification']);
assert.equal(offers['Økolog'].policy, 'qualification_required');
assert.deepEqual(offers['Forsker (miljø/natur)'].qualification_ids, ['academic_qualification_and_employment']);
assert.deepEqual(offers['Seniorforsker (miljø/natur)'].qualification_ids, ['academic_qualification_and_employment']);

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.id, 'natur_biologi_og_forskning_foundation_v1');
assert.equal(plan.category, 'natur');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 16);
assert.deepEqual(plan.sequence.map((s) => s.type), ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job']);
for (const [i, step] of plan.sequence.entries()) {
  assert.equal(step.step, i + 1);
  assert.deepEqual(step.fallback_types, []);
  assert.equal(step.allowed_families.length, 1);
}

const expectedCounts = {job:4,people:4,conflict:1,story:1,event:1,micro:1,followup:1,knowledge:1,consequence:1};
let total = 0;
for (const type of TYPES) {
  const catalog = read(`data/Civication/mailFamilies/natur/${type}/${ROLE}_${type}.json`);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1');
  assert.equal(catalog.category, 'natur');
  assert.equal(catalog.role_scope, ROLE);
  assert.equal(catalog.mail_type, type);
  const mails = catalog.families.flatMap((family) => family.mails || []);
  assert.equal(mails.length, expectedCounts[type], `${type}: wrong mail count`);
  total += mails.length;
  for (const mail of mails) {
    assert.equal(mail.mail_type, type);
    assert.equal(mail.role_scope, ROLE);
    assert.ok(mail.summary.length >= 650, `${mail.id}: summary ${mail.summary.length}`);
    assert.equal(mail.situation.length, 3);
    assert.equal(mail.choices.length, 2);
    for (const choice of mail.choices) {
      assert.ok(choice.reply.length >= 330, `${mail.id}/${choice.id}: reply ${choice.reply.length}`);
      assert.ok(choice.feedback.length >= 390, `${mail.id}/${choice.id}: feedback ${choice.feedback.length}`);
      assert.ok(Object.keys(choice.effects.stats).length >= 4);
    }
  }
}
assert.equal(total, 15);

const manifest = read('data/Civication/roleModels/manifest.json');
assert.equal(manifest.files.filter((rel) => rel === MODEL).length, 1);
const pack = read('data/Civication/rolePackIndex.json').roles.find((row) => row.category === 'natur' && row.role_scope === ROLE);
assert.ok(pack, 'role pack row missing');
assert.equal(pack.status, 'complete_reference_v2');

const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((row) => row.key === KEY);
assert.ok(career, 'career row missing');
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);
for (const component of ['entry','day_one','workday_loop','people','places','mail','knowledge','quality_axes','authority','consequences','performance','economy','progression','exit']) {
  assert.equal(career.audit.components[component].level, 'complete', `${component} must be complete`);
}

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((row) => row.key === KEY);
assert.ok(ready, 'readiness row missing');
assert.equal(ready.classification, 'rollout_ready');
for (const dim of ['people_places_integrity','persistent_work_object','rhythm_waiting_handoff_rework','history_go_affordance']) assert.equal(ready.dimensions[dim].status, 'foundation_ready', dim);
const worldComplete = exists(WORLD);
const boundedStandingDimensionId = ['situated', 'reputation'].join('_');
assert.equal(ready.dimensions[boundedStandingDimensionId].status, worldComplete ? 'foundation_ready' : 'needs_role_authored_work');
assert.deepEqual(ready.authored_work_required, worldComplete ? [] : [boundedStandingDimensionId]);
assert.equal(ready.cross_role.need, 'not_required_for_rollout');
assert.equal(readiness.rollout_queue.some((row) => row.key === KEY && row.classification === 'rollout_ready'), !worldComplete);
assert.equal(readiness.gate.gate_pass, true);

const scenarioPeople = read('data/Civication/scenarioPeople/generated/natur.json');
const factualPeople = new Set(Object.values(scenarioPeople.people_pool || {}).flat().map((person) => person.person_id));
for (const id of ACTORS) assert.ok(!factualPeople.has(id), `${id}: fictional actor entered factual Scenario People`);

const boundary = JSON.stringify({model,grammar}).toLowerCase();
for (const term of ['relevant_education_or_employer_qualification','academic_qualification_and_employment','history go','natur-badge','rådata','replikasjon','usikkerhet','negative','politisk','forvaltningsmyndighet']) assert.ok(boundary.includes(term), term);
const source = fs.readFileSync(path.join(ROOT, SOURCE), 'utf8');
for (const term of [/not Role World completion/i,/Biolog.*qualification_required/i,/Økolog.*qualification_required/i,/academic_qualification_and_employment/i,/15 source mails/i,/not_required_for_rollout/i,/History Go/i,/No new runtime/i]) assert.match(source, term);

console.log('PASS: Natur Biologi og forskning foundation is playable and rollout-ready while bounded audience standing remains reserved for Role World authoring.');
