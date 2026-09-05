const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const ROLE = 'historie_forvaltning_og_radgivning';
const KEY = `historie/${ROLE}`;
const MODEL = `data/Civication/roleModels/historie/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/historie/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/historie/${ROLE}_plan.json`;
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const EXPECTED_LOOPS = [
  'problem -> mandat -> kilder -> alternativer -> vurdering -> råd -> dokumentasjon',
  'ny informasjon -> konsekvensanalyse -> revisjon -> kvalitetssikring -> nytt beslutningsgrunnlag'
];
const EXPECTED_MAY = ['utrede og gi råd innen mandat'];
const EXPECTED_MAY_NOT = ['fatte vedtak uten myndighet','skjule vesentlige motargumenter','forfalske sikkerhet','erstatte regelverk med preferanse'];

assert.ok(exists(MODEL) && exists(GRAMMAR) && exists(PLAN));
const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
assert.equal(model.schema, 'civication_role_model_v2');
assert.equal(model.category, 'historie');
assert.equal(model.role_scope, ROLE);
assert.equal(model.role_id, ROLE);
assert.equal(grammar.schema, 'civication_work_grammar_v2');
assert.deepEqual(grammar.work_loops, EXPECTED_LOOPS, 'canonical advisory loops drifted');
assert.deepEqual(grammar.authority_boundary?.may, EXPECTED_MAY, 'canonical advisory may-boundary drifted');
assert.deepEqual(grammar.authority_boundary?.may_not, EXPECTED_MAY_NOT, 'canonical advisory may_not-boundary drifted');
assert.equal(grammar.practice_stories?.length, 5);
assert.equal(grammar.quality_axes?.length, 6);

assert.equal(grammar.day_one_contract?.entry, 'direct');
assert.equal(grammar.day_one_contract?.first_object, 'saksgrunnlag_og_radgivningsspor');
assert.equal(grammar.persistent_work_object_contract?.id, 'saksgrunnlag_og_radgivningsspor');
assert.ok(grammar.persistent_work_object_contract?.states?.length >= 10);
assert.match(grammar.persistent_work_object_contract?.handoff_rule || '', /mandat|kilde|motargument|usikker|eier/i);
assert.ok(grammar.rhythm_contract?.waiting_states?.length >= 5);
assert.match(grammar.rhythm_contract?.loop || '', /waiting|venting/i);
assert.match(grammar.rhythm_contract?.rework_rule || '', /ny|korrigert|hjemmel|innspill|motargument/i);
assert.deepEqual(grammar.mail_generation_contract?.required_mail_types, TYPES);
assert.equal(grammar.mail_generation_contract?.no_generic_fallback, true);

assert.equal(model.related_people?.length, 4);
for (const person of model.related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
  assert.ok(person.function?.length >= 150);
  assert.ok(person.authority_relation?.length >= 150);
}
assert.equal(model.related_places?.length, 4);
assert.deepEqual(new Set(model.related_places.map((place) => place.id)), new Set([
  'saksinntak_og_mandatbord',
  'kilde_og_faktagrunnlag',
  'alternativ_og_motargumentflate',
  'kvalitet_og_beslutningshandoff'
]));
assert.ok(model.career_path?.entry_from?.length);
assert.ok(model.career_path?.progression_to?.length);
assert.ok(model.career_path?.possible_promotions?.length >= 3);
assert.ok(model.career_path?.possible_exits?.length >= 2);
assert.ok(model.required_knowledge?.skills?.length >= 6);
assert.equal(model.required_knowledge?.people_connections?.length, 4);
assert.equal(model.required_knowledge?.place_connections?.length, 4);

const gateText = JSON.stringify({model, grammar}).toLowerCase();
for (const term of ['direct','history go','badge','kildekritikk','mandat','hjemmel','motargument','etterprøv']) assert.ok(gateText.includes(term), `missing boundary term ${term}`);
for (const term of ['kan ikke fatte','kan ikke skape hjemmel','kan ikke gi delegert','kan ikke avgjøre']) assert.ok(gateText.includes(term), `missing authority boundary ${term}`);

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.category, 'historie');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 16);
assert.ok(plan.outcome_rules?.promoted && plan.outcome_rules?.fired && plan.outcome_rules?.stagnated);
for (const step of plan.sequence) {
  assert.ok(TYPES.includes(step.type));
  assert.deepEqual(step.fallback_types, []);
  assert.equal(step.allowed_families.length, 1);
}
assert.deepEqual(plan.sequence.map((step) => step.type), ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job']);

let totalMails = 0;
const counts = {};
for (const type of TYPES) {
  const rel = `data/Civication/mailFamilies/historie/${type}/${ROLE}_${type}.json`;
  assert.ok(exists(rel), rel);
  const catalog = read(rel);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1');
  assert.equal(catalog.category, 'historie');
  assert.equal(catalog.role_scope, ROLE);
  assert.equal(catalog.mail_type, type);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  counts[type] = mails.length;
  totalMails += mails.length;
  assert.ok(mails.length >= 1, `${type} must be populated`);
  for (const mail of mails) {
    assert.equal(mail.mail_type, type);
    assert.equal(mail.role_scope, ROLE);
    assert.ok(mail.people_ref && mail.place_id && mail.subject && mail.summary);
    assert.ok(mail.summary.length >= 300);
    assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3);
    assert.equal(mail.choices?.length, 2);
    assert.deepEqual(mail.choices.map((choice) => choice.id), ['A','B']);
    assert.ok(mail.choices[0].effect > 0 && mail.choices[1].effect < 0);
  }
}
assert.deepEqual(counts, {job:4,people:4,conflict:1,story:1,event:1,micro:1,followup:1,knowledge:1,consequence:1});
assert.equal(totalMails, 15);

const knowledge = read(`data/Civication/mailFamilies/historie/knowledge/${ROLE}_knowledge.json`);
const knowledgeText = JSON.stringify(knowledge).toLowerCase();
for (const term of ['history go','kildekritikk','institusjon','direct']) assert.ok(knowledgeText.includes(term));
for (const term of ['vedtak','hjemmel','delegert','avgjøre','autentiser']) assert.ok(knowledgeText.includes(term));

const manifest = read('data/Civication/roleModels/manifest.json');
assert.ok(manifest.files.includes(MODEL), 'aggregate advisory role model must be registered');
const career = read('data/Civication/careerGameplayMatrix.json');
const row = career.worlds.find((entry) => entry.key === KEY);
assert.ok(row, KEY);
assert.equal(row.status, 'playable');
assert.equal(row.audit.runtime_gate, true);
assert.deepEqual(row.audit.missing_components, []);
for (const name of ['entry','day_one','workday_loop','people','places','mail','knowledge','authority','consequences','performance','economy','progression','exit']) assert.equal(row.audit.components[name].level, 'complete', name);
assert.equal(row.audit.salary.rows.length, 5);
for (const salary of row.audit.salary.rows) assert.equal(salary.offer_policy, 'direct');
assert.ok(career.summary.runtime_gate_pass >= 58);
assert.ok(career.summary.statuses.playable >= 53);
assert.ok(career.summary.statuses.architecture_only <= 27);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((entry) => entry.key === KEY);
assert.ok(ready, KEY);
assert.equal(ready.classification, 'rollout_ready');
assert.ok((readiness.rollout_queue || []).some((entry) => entry.key === KEY) || ready.already_reference_or_pilot === true);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);

const source = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_HISTORIE_FORVALTNING_OG_RADGIVNING_PREREQUISITES_SOURCE_FIRST.md'), 'utf8');
assert.match(source, /Nine runtime gaps/i);
assert.match(source, /direct/);
assert.match(source, /Fifteen source mails/i);
assert.match(source, /not Role World completion/i);
console.log('Civication Historie Forvaltning og rådgivning prerequisites: OK');
