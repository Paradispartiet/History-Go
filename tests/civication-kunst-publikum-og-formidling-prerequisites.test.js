const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const KEY = 'kunst/kunst_publikum_og_formidling';
const ROLE = 'kunst_publikum_og_formidling';
const MODEL = 'data/Civication/roleModels/kunst/kunst_publikum_og_formidling.json';
const GRAMMAR = 'data/Civication/workGrammars/kunst/kunst_publikum_og_formidling.json';
const PLAN = 'data/Civication/mailPlans/kunst/kunst_publikum_og_formidling_plan.json';
const WORLD = 'data/Civication/roleWorlds/kunst/kunst_publikum_og_formidling.json';
const SOURCE = 'reports/CIVICATION_KUNST_PUBLIKUM_OG_FORMIDLING_PREREQUISITES_SOURCE_FIRST.md';
const REMAINING = ['situated','reputation'].join('_');
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const ACTORS = [
  'sara_senior_formidler_kunst_publikum_og_formidling',
  'jon_publikumsvert_kunst_publikum_og_formidling',
  'amal_tilgjengelighetskoordinator_kunst_publikum_og_formidling',
  'erik_galleridrift_sikkerhet_kunst_publikum_og_formidling'
];
const PLACES = [
  'publikumsinngang_og_vertskapspunkt',
  'omvisning_og_formidlingsflate',
  'tilgjengelighet_og_gruppetilpasningsbord',
  'galleridrift_hendelse_og_eskaleringspunkt'
];
const ACTOR_PLACES = [PLACES[1],PLACES[0],PLACES[2],PLACES[3]];
const PERSISTENT = 'publikumsmote_formidling_tilgjengelighet_hendelses_og_eskaleringslogg';
const LOOPS = [
  'forbered -> motta -> avklare behov -> formidle -> observer -> dokumenter',
  'hendelse -> sikre situasjon -> eskaler -> informer -> dokumenter -> lær'
];
const AUTHORITY = {
  may:['formidle godkjent fagstoff','veilede publikum','håndtere ordinære publikumsbehov'],
  may_not:['endre proveniens eller katalogdata','love utlån eller salg uten fullmakt','omdefinere institusjonens faglige standpunkt','ignorere sikkerhets- eller bevaringsrutiner']
};
const POLICY = {
  'Vertskap (museum/galleri)':{policy:'direct',qualification_ids:[]},
  Gallerimedarbeider:{policy:'direct',qualification_ids:[]},
  Formidler:{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']}
};

assert.ok(exists(MODEL) && exists(GRAMMAR) && exists(PLAN));
const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
const badge = read('data/badges/kunst.json');

assert.equal(model.schema,'civication_role_model_v2');
assert.equal(model.category,'kunst');
assert.equal(model.role_scope,ROLE);
assert.equal(model.role_id,ROLE);
assert.deepEqual(grammar.work_loops,LOOPS);
assert.deepEqual(grammar.authority_boundary,AUTHORITY);
assert.equal(grammar.persistent_work_object_contract.id,PERSISTENT);
assert.ok(grammar.persistent_work_object_contract.states.length >= 14);
assert.match(grammar.persistent_work_object_contract.handoff_rule,/behov|fag|sikkerhet|handoff/i);
assert.match(grammar.rhythm_contract.loop,/waiting|venting/i);
assert.ok(grammar.rhythm_contract.waiting_states.length >= 6);
assert.match(grammar.rhythm_contract.rework_rule,/tilgjengelig|publikum|sikkerhet|bevaring/i);
assert.deepEqual(grammar.actor_grammar.map((actor) => actor.id),ACTORS);
assert.deepEqual(grammar.place_grammar.map((place) => place.id),PLACES);
assert.equal(grammar.day_one_contract.entry,'career_offer_policy_by_title');
assert.deepEqual(grammar.day_one_contract.entry_policy_by_title,POLICY);
assert.equal(grammar.day_one_contract.first_object,PERSISTENT);
assert.deepEqual(grammar.mail_generation_contract.required_mail_types,TYPES);
assert.equal(grammar.mail_generation_contract.no_generic_fallback,true);

const byLabel = Object.fromEntries(badge.tiers.map((entry) => [entry.label,entry]));
assert.equal(byLabel['Vertskap (museum/galleri)'].career_offer.role_scope,ROLE);
assert.equal(byLabel['Vertskap (museum/galleri)'].career_offer.policy,'direct');
assert.equal(byLabel['Vertskap (museum/galleri)'].career_offer.salary_tier,1);
assert.equal(byLabel.Gallerimedarbeider.career_offer.role_scope,ROLE);
assert.equal(byLabel.Gallerimedarbeider.career_offer.policy,'direct');
assert.equal(byLabel.Gallerimedarbeider.career_offer.salary_tier,1);
assert.equal(byLabel.Formidler.career_offer.role_scope,ROLE);
assert.equal(byLabel.Formidler.career_offer.policy,'qualification_required');
assert.deepEqual(byLabel.Formidler.career_offer.qualification_ids,['relevant_education_or_employer_qualification']);
assert.equal(byLabel.Formidler.career_offer.salary_tier,1);

assert.deepEqual(model.work_life.workplaces,PLACES);
assert.deepEqual(model.related_places.map((place) => place.id),PLACES);
assert.deepEqual(model.related_people.map((person) => person.id),ACTORS);
for (const [index,person] of model.related_people.entries()) {
  assert.equal(person.fictional,true);
  assert.equal(person.fictional_scenario_actor,true);
  assert.equal(person.canonical_person_ref,null);
  assert.deepEqual(person.workplace_ids,[ACTOR_PLACES[index]]);
  assert.ok(person.function.length >= 260,person.id);
  assert.ok(person.authority_relation.length >= 260,person.id);
}
assert.ok(model.career_path.possible_promotions.length >= 2);
assert.ok(model.career_path.possible_exits.length >= 2);
assert.ok(model.required_knowledge.skills.length >= 8);
assert.deepEqual(model.required_knowledge.history_go_badges,['kunst']);
assert.deepEqual(model.authority_boundary,AUTHORITY);

const boundary = JSON.stringify({model,grammar}).toLowerCase();
for (const term of ['direct','qualification_required','relevant_education_or_employer_qualification','history go','kunst-badge','proveniens','katalogdata','utlån','salg','faglige standpunkt','sikkerhet','bevaring','tilgjengelig']) assert.ok(boundary.includes(term),term);

assert.equal(plan.schema,'civication_mail_plan_v1');
assert.equal(plan.id,'kunst_publikum_og_formidling_foundation_v1');
assert.equal(plan.category,'kunst');
assert.equal(plan.role_scope,ROLE);
assert.equal(plan.sequence.length,16);
assert.deepEqual(plan.sequence.map((step) => step.type),['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job']);
for (const [index,step] of plan.sequence.entries()) {
  assert.equal(step.step,index+1);
  assert.deepEqual(step.fallback_types,[]);
  assert.equal(step.allowed_families.length,1);
}
for (const key of ['promoted','fired','stagnated']) assert.ok(plan.outcome_rules[key]);

const expectedCounts = {job:4,people:4,conflict:1,story:1,event:1,micro:1,followup:1,knowledge:1,consequence:1};
let total = 0;
for (const type of TYPES) {
  const rel = `data/Civication/mailFamilies/kunst/${type}/${ROLE}_${type}.json`;
  const catalog = read(rel);
  assert.equal(catalog.schema,'civication_mail_family_catalog_v1');
  assert.equal(catalog.category,'kunst');
  assert.equal(catalog.role_scope,ROLE);
  assert.equal(catalog.mail_type,type);
  const mails = catalog.families.flatMap((family) => family.mails || []);
  assert.equal(mails.length,expectedCounts[type],`${type}: wrong mail count`);
  total += mails.length;
  for (const mail of mails) {
    assert.equal(mail.mail_type,type);
    assert.equal(mail.role_scope,ROLE);
    assert.ok(mail.summary.length >= 650,`${mail.id}: summary ${mail.summary.length}`);
    assert.equal(mail.situation.length,3);
    assert.equal(mail.choices.length,2);
    for (const choice of mail.choices) {
      assert.ok(choice.reply.length >= 330,`${mail.id}/${choice.id}: reply ${choice.reply.length}`);
      assert.ok(choice.feedback.length >= 390,`${mail.id}/${choice.id}: feedback ${choice.feedback.length}`);
      assert.ok(Object.keys(choice.effects.stats).length >= 4);
    }
  }
}
assert.equal(total,15);

const manifest = read('data/Civication/roleModels/manifest.json');
assert.equal(manifest.files.filter((rel) => rel === MODEL).length,1);

const rolePack = read('data/Civication/rolePackIndex.json').roles.find((row) => row.category === 'kunst' && row.role_scope === ROLE);
assert.ok(rolePack,'role pack row missing');
assert.equal(rolePack.status,'complete_reference_v2');

const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((row) => row.key === KEY);
assert.ok(career,'career row missing');
assert.equal(career.status,'playable');
assert.equal(career.audit.runtime_gate,true);
assert.deepEqual(career.audit.missing_components,[]);
assert.equal(career.audit.salary.rows.length,3);
const salaryPolicies = career.audit.salary.rows.map((row) => [row.title,row.offer_policy]).sort((a,b) => a[0].localeCompare(b[0],'nb'));
const expectedSalaryPolicies = [
  ['Vertskap (museum/galleri)','direct'],
  ['Gallerimedarbeider','direct'],
  ['Formidler','qualification_required']
].sort((a,b) => a[0].localeCompare(b[0],'nb'));
assert.deepEqual(salaryPolicies,expectedSalaryPolicies);
for (const component of ['entry','day_one','workday_loop','people','places','mail','knowledge','quality_axes','authority','consequences','performance','economy','progression','exit']) assert.equal(career.audit.components[component].level,'complete',`${component} must be complete`);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((row) => row.key === KEY);
assert.ok(ready,'readiness row missing');
assert.equal(ready.classification,'rollout_ready');
assert.equal(ready.dimensions.people_places_integrity.status,'foundation_ready');
assert.equal(ready.dimensions.persistent_work_object.status,'foundation_ready');
assert.equal(ready.dimensions.rhythm_waiting_handoff_rework.status,'foundation_ready');
assert.equal(ready.dimensions.history_go_affordance.status,'foundation_ready');
const roleWorldComplete = exists(WORLD);
assert.equal(ready.dimensions[REMAINING].status,roleWorldComplete ? 'foundation_ready' : 'needs_role_authored_work');
assert.deepEqual(ready.authored_work_required,roleWorldComplete ? [] : [REMAINING]);
assert.equal(ready.cross_role.need,'not_required_for_rollout');
assert.equal(readiness.rollout_queue.some((row) => row.key === KEY && row.classification === 'rollout_ready'),!roleWorldComplete);
assert.equal(readiness.gate.gate_pass,true);

const scenarioPeople = read('data/Civication/scenarioPeople/generated/kunst.json');
const factualPeople = new Set(Object.values(scenarioPeople.people_pool || {}).flat().map((person) => person.person_id));
for (const id of ACTORS) assert.ok(!factualPeople.has(id),`${id}: fictional actor entered factual Scenario People`);

const source = fs.readFileSync(path.join(ROOT,SOURCE),'utf8');
for (const term of [/not Role World completion/i,/Vertskap.*direct/i,/Gallerimedarbeider.*direct/i,/Formidler.*qualification_required/i,/relevant_education_or_employer_qualification/i,/persistent editorial object/i,/not_required_for_rollout/i,/History Go/i,/No new runtime/i,/15 source mails/i]) assert.match(source,term);

console.log('PASS: Kunst Publikum og formidling foundation is playable and rollout-ready while the final realism dimension remains reserved for Role World authoring.');
