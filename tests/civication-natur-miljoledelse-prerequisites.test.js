const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const KEY = 'natur/natur_miljoledelse';
const ROLE = 'natur_miljoledelse';
const MODEL = 'data/Civication/roleModels/natur/natur_miljoledelse.json';
const GRAMMAR = 'data/Civication/workGrammars/natur/natur_miljoledelse.json';
const PLAN = 'data/Civication/mailPlans/natur/natur_miljoledelse_plan.json';
const WORLD = 'data/Civication/roleWorlds/natur/natur_miljoledelse.json';
const SOURCE = 'reports/CIVICATION_NATUR_MILJOLEDELSE_PREREQUISITES_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'mandat_maal_risiko_kapasitet_prioritering_ansvar_avvik_tiltak_og_oppfolgingslogg';
const ACTORS = [
  'eva_fag_og_kvalitetsleder_natur_miljoledelse',
  'jonas_okonomi_og_kapasitetscontroller_natur_miljoledelse',
  'amina_miljorisiko_og_avviksansvarlig_natur_miljoledelse',
  'tor_hr_og_lederstotte_natur_miljoledelse'
];
const PLACES = [
  'ledergruppe_mandat_og_maalbord_natur',
  'budsjett_kapasitet_og_portefoljeflate_natur',
  'miljorisiko_avvik_og_tiltaksrom_natur',
  'bemanning_delegering_og_oppfolgingsrom_natur'
];
const POLICY = {
  'Naturvernleder':{policy:'appointment_required',qualification_ids:['employer_appointment']},
  'Miljøsjef':{policy:'appointment_required',qualification_ids:['employer_appointment']},
  'Miljødirektør':{policy:'appointment_required',qualification_ids:['employer_appointment']}
};
const LOOPS = [
  'mål -> risiko -> kapasitet -> prioritering -> ansvar -> oppfølging -> læring',
  'avvik -> alvorlighetsgrad -> tiltak -> kommunikasjon -> kontroll -> lukking'
];
const WAITING = ['faglig_risikovurdering','budsjett_eller_okonomiavklaring','bemanning_eller_kompetansedekning','juridisk_eller_compliance_avklaring','toppledelsesbeslutning','tiltaksgjennomforing','etterkontroll_eller_nye_data'];

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
assert.match(grammar.persistent_work_object_contract.handoff_rule, /arbeidsgivermandat|beslutningseier/i);
assert.match(grammar.rhythm_contract.loop, /waiting|venting/i);
assert.deepEqual(grammar.rhythm_contract.waiting_states, WAITING);
assert.match(grammar.rhythm_contract.rework_rule, /risiko|budsjett|bemanning|kompetanse|avvik|mandat/i);
assert.equal(grammar.day_one_contract.entry, 'career_offer_policy_by_title');
assert.equal(grammar.day_one_contract.first_object, PERSISTENT);
assert.deepEqual(grammar.day_one_contract.entry_policy_by_title, POLICY);
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, TYPES);
assert.equal(grammar.mail_generation_contract.no_generic_fallback, true);

const overlay = read('data/Civication/badgeCareerContracts/natur.json');
const offers = Object.fromEntries(overlay.tiers.filter((t) => t.career_offer?.role_scope === ROLE).map((t) => [t.label, t.career_offer]));
for (const title of Object.keys(POLICY)) {
  assert.equal(offers[title].policy, 'appointment_required', title);
  assert.deepEqual(offers[title].qualification_ids, ['employer_appointment'], title);
}

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.id, 'natur_miljoledelse_foundation_v1');
assert.equal(plan.category, 'natur');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 16);
assert.deepEqual(plan.sequence.map((s) => s.type), ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job']);
for (const [i, step] of plan.sequence.entries()) {
  assert.equal(step.step, i + 1);
  assert.deepEqual(step.fallback_types, []);
  assert.equal(step.allowed_families.length, 1);
  assert.match(step.step_goal, /arbeidsgivermandat/i);
  assert.match(step.step_goal, /miljørisiko/i);
  assert.match(step.step_goal, /oppfølging|etterkontroll/i);
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
assert.equal(ready.cross_role.need, 'candidate_when_shared_work_is_real');
assert.equal(readiness.rollout_queue.some((row) => row.key === KEY && row.classification === 'rollout_ready'), !worldComplete);
assert.equal(readiness.gate.gate_pass, true);

const scenarioPeople = read('data/Civication/scenarioPeople/generated/natur.json');
const factualPeople = new Set(Object.values(scenarioPeople.people_pool || {}).flat().map((person) => person.person_id));
for (const id of ACTORS) assert.ok(!factualPeople.has(id), `${id}: fictional actor entered factual Scenario People`);

const boundary = JSON.stringify({model,grammar}).toLowerCase();
for (const term of ['employer_appointment','history go','natur-badge','arbeidsgivermandat','miljørisiko','budsjett','kapasitet','bemanning','delegasjon','avvik','etterkontroll','statsråd']) {
  assert.ok(boundary.includes(term), term);
}
const source = fs.readFileSync(path.join(ROOT, SOURCE), 'utf8');
for (const term of [/not Role World completion/i,/Naturvernleder.*appointment_required/i,/Miljøsjef.*appointment_required/i,/Miljødirektør.*appointment_required/i,/15 source mails/i,/candidate_when_shared_work_is_real/i,/History Go/i,/No new runtime/i,/employer appointment/i,/environmental risk/i]) {
  assert.match(source, term);
}

if (/situated[_ -]?(reputation|standing|audience)/i.test(fs.readFileSync(__filename, 'utf8'))) {
  throw new Error('Focused prerequisite test self-signals the reserved audience-standing heuristic');
}

console.log('PASS: Natur Miljøledelse foundation is playable and rollout-ready while the reserved Role World audience layer remains unmaterialized.');
