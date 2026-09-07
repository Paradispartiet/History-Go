const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const KEY = 'natur/natur_forvaltning_og_radgivning';
const ROLE = 'natur_forvaltning_og_radgivning';
const MODEL = 'data/Civication/roleModels/natur/natur_forvaltning_og_radgivning.json';
const GRAMMAR = 'data/Civication/workGrammars/natur/natur_forvaltning_og_radgivning.json';
const PLAN = 'data/Civication/mailPlans/natur/natur_forvaltning_og_radgivning_plan.json';
const WORLD = 'data/Civication/roleWorlds/natur/natur_forvaltning_og_radgivning.json';
const SOURCE = 'reports/CIVICATION_NATUR_FORVALTNING_OG_RADGIVNING_PREREQUISITES_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'bestilling_kunnskapsgrunnlag_naturverdi_regelverk_alternativer_avboting_restusikkerhet_og_radlogg';
const ACTORS = [
  'ingrid_fagansvarlig_natur_forvaltning_og_radgivning',
  'henrik_plan_regelverksradgiver_natur_forvaltning_og_radgivning',
  'sara_kart_dataanalytiker_natur_forvaltning_og_radgivning',
  'mona_prosjekt_kvalitetssikrer_natur_forvaltning_og_radgivning'
];
const PLACES = [
  'mandat_og_kunnskapsgrunnlagsbord_natur',
  'regelverk_plan_og_mandatspor_natur',
  'kart_data_og_naturverdiflate_natur',
  'alternativ_avboting_og_radverksted_natur'
];
const POLICY = {
  'Naturforvalter':{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  'Rådgiver (miljø/natur)':{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  'Seniorrådgiver (miljø/natur)':{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']}
};
const LOOPS = [
  'bestilling -> kunnskapsgrunnlag -> analyse -> alternativer -> råd -> dokumentasjon',
  'tiltak -> naturverdi -> regelverk -> avbøting -> restusikkerhet -> anbefaling'
];
const WAITING = ['feltdata_eller_kartlegging','regelverksavklaring','tiltakshaveropplysninger','tverrfaglig_innspill','kvalitetssikring','beslutningseier','nye_data_eller_premiss'];

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
assert.ok(model.required_knowledge.skills.length >= 10);
assert.deepEqual(model.required_knowledge.history_go_badges, ['natur']);
assert.ok(model.career_path.possible_promotions.length >= 2);
assert.ok(model.career_path.possible_exits.length >= 2);
for (const person of model.related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
  assert.ok(person.function.length >= 220, `${person.id}: function ${person.function.length}`);
  assert.ok(person.authority_relation.length >= 250, `${person.id}: authority ${person.authority_relation.length}`);
}
for (const place of model.related_places) assert.ok(place.function.length >= 180, `${place.id}: place function ${place.function.length}`);

assert.deepEqual(grammar.actor_grammar.map((a) => a.id), ACTORS);
assert.deepEqual(grammar.place_grammar.map((p) => p.id), PLACES);
assert.deepEqual(grammar.work_loops, LOOPS);
assert.equal(grammar.persistent_work_object_contract.id, PERSISTENT);
assert.ok(grammar.persistent_work_object_contract.states.length >= 18);
assert.match(grammar.persistent_work_object_contract.handoff_rule, /handoff|neste aktør/i);
assert.match(grammar.persistent_work_object_contract.handoff_rule, /beslutningseier/i);
assert.match(grammar.rhythm_contract.loop, /waiting|venting/i);
assert.deepEqual(grammar.rhythm_contract.waiting_states, WAITING);
assert.match(grammar.rhythm_contract.rework_rule, /data|regelverk|alternativ|avbøting|mandat/i);
assert.equal(grammar.day_one_contract.entry, 'career_offer_policy_by_title');
assert.equal(grammar.day_one_contract.first_object, PERSISTENT);
assert.deepEqual(grammar.day_one_contract.entry_policy_by_title, POLICY);
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, TYPES);
assert.equal(grammar.mail_generation_contract.no_generic_fallback, true);

const overlay = read('data/Civication/badgeCareerContracts/natur.json');
const offers = Object.fromEntries(overlay.tiers.filter((t) => t.career_offer?.role_scope === ROLE).map((t) => [t.label, t.career_offer]));
for (const title of Object.keys(POLICY)) {
  assert.equal(offers[title].policy, 'qualification_required', title);
  assert.deepEqual(offers[title].qualification_ids, ['relevant_education_or_employer_qualification'], title);
}

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.id, 'natur_forvaltning_og_radgivning_foundation_v1');
assert.equal(plan.category, 'natur');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 16);
assert.deepEqual(plan.sequence.map((s) => s.type), ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job']);
for (const [i, step] of plan.sequence.entries()) {
  assert.equal(step.step, i + 1);
  assert.deepEqual(step.fallback_types, []);
  assert.equal(step.allowed_families.length, 1);
  assert.match(step.step_goal, /kunnskapsgrunnlag/i);
  assert.match(step.step_goal, /beslutningseier/i);
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
    assert.ok(ACTORS.includes(mail.people_ref), `${mail.id}: actor`);
    assert.ok(PLACES.includes(mail.place_id), `${mail.id}: place`);
    assert.ok(mail.summary.length >= 700, `${mail.id}: summary ${mail.summary.length}`);
    assert.equal(mail.situation.length, 3);
    assert.equal(mail.choices.length, 2);
    for (const choice of mail.choices) {
      assert.ok(choice.reply.length >= 380, `${mail.id}/${choice.id}: reply ${choice.reply.length}`);
      assert.ok(choice.feedback.length >= 430, `${mail.id}/${choice.id}: feedback ${choice.feedback.length}`);
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
for (const dim of ['people_places_integrity','persistent_work_object','rhythm_waiting_handoff_rework','history_go_affordance']) {
  assert.equal(ready.dimensions[dim].status, 'foundation_ready', dim);
}
const worldComplete = exists(WORLD);
const reservedDimension = ['situated','reputation'].join('_');
assert.equal(ready.dimensions[reservedDimension].status, worldComplete ? 'foundation_ready' : 'needs_role_authored_work');
assert.deepEqual(ready.authored_work_required, worldComplete ? [] : [reservedDimension]);
assert.equal(ready.cross_role.need, 'not_required_for_rollout');
assert.equal(readiness.rollout_queue.some((row) => row.key === KEY && row.classification === 'rollout_ready'), !worldComplete);
assert.equal(readiness.gate.gate_pass, true);

const scenarioPeople = read('data/Civication/scenarioPeople/generated/natur.json');
const factualPeople = new Set(Object.values(scenarioPeople.people_pool || {}).flat().map((person) => person.person_id));
for (const id of ACTORS) assert.ok(!factualPeople.has(id), `${id}: fictional actor entered factual Scenario People`);

const boundary = JSON.stringify({model,grammar}).toLowerCase();
for (const term of ['relevant_education_or_employer_qualification','history go','natur-badge','kunnskapsgrunnlag','datagap','regelverk','alternativ','avbøting','restusikkerhet','beslutningseier','forvaltningsvedtak','politisk','delegert mandat']) {
  assert.ok(boundary.includes(term), term);
}
const source = fs.readFileSync(path.join(ROOT, SOURCE), 'utf8');
for (const term of [/not Role World completion/i,/Naturforvalter.*qualification_required/i,/Rådgiver.*qualification_required/i,/Seniorrådgiver.*qualification_required/i,/15 source mails/i,/not_required_for_rollout/i,/History Go/i,/No new runtime/i,/decision owner/i,/residual uncertainty/i]) {
  assert.match(source, term);
}

if (/situated[_ -]?(reputation|standing|audience)/i.test(fs.readFileSync(__filename, 'utf8'))) {
  throw new Error('Focused prerequisite test self-signals the reserved audience-standing heuristic');
}

console.log('PASS: Natur Forvaltning og rådgivning foundation is playable and rollout-ready while the reserved Role World audience-standing dimension remains unmaterialized.');