const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const KEY = 'naeringsliv/fagarbeider';
const ROLE = 'fagarbeider';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/fagarbeider.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/fagarbeider.json';
const FAMILY_ID = 'fagarbeider_profesjonelle_arbeidsrelasjoner';
const REMAINING = 'situated_reputation';
const ACTOR_IDS = [
  'rune_arbeidsleder_fagarbeider',
  'amir_erfaren_fagarbeider',
  'selma_kvalitetskontakt_fagarbeider',
  'liv_laerling_fagarbeider'
];
const MAIL_IDS = [
  'fagarbeider_people_rune_oppdrag_001',
  'fagarbeider_people_amir_standard_001',
  'fagarbeider_people_selma_avvik_001',
  'fagarbeider_people_liv_overlevering_001'
];
const WORKPLACES = [
  'oppdrags_og_befaringsflate',
  'fag_og_utstyrsplass',
  'kvalitets_og_avvikspunkt',
  'overleverings_og_opplaeringsflate'
];

const sourceFirst = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_NAERINGSLIV_FAGARBEIDER_PREREQUISITES_SOURCE_FIRST.md'), 'utf8');
assert.match(sourceFirst, /not Role World completion/i);
assert.match(sourceFirst, /situated_reputation/);
assert.match(sourceFirst, /fictional: true/);
assert.match(sourceFirst, /canonical_person_ref: null/);
assert.match(sourceFirst, /20-step|steps 1–20/i);
assert.match(sourceFirst, /not.*inserted into the canonical mail plan/i);

const model = read(MODEL_PATH);
assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, ROLE);
assert.equal(model.role_id, 'naeringsliv_fagarbeider');
assert.deepEqual(model.work_life.workplaces, WORKPLACES);
assert.deepEqual(model.related_places.map((place) => place.id), WORKPLACES);
assert.deepEqual(model.related_people.map((actor) => actor.id), ACTOR_IDS);
assert.equal(model.related_people.length, 4);
for (const actor of model.related_people) {
  assert.equal(actor.fictional, true, `${actor.id}: Scenario People exclusion flag`);
  assert.equal(actor.fictional_scenario_actor, true, `${actor.id}: fictional scenario declaration`);
  assert.equal(actor.canonical_person_ref, null, `${actor.id}: cannot impersonate canonical History People`);
  assert.ok(String(actor.name || '').length >= 3, `${actor.id}: display name required`);
  assert.ok(String(actor.role || '').length >= 8, `${actor.id}: professional role required`);
  assert.ok(String(actor.function || '').length >= 100, `${actor.id}: work function too shallow`);
  assert.ok(String(actor.authority_relation || '').length >= 110, `${actor.id}: authority relation too shallow`);
  assert.ok(Array.isArray(actor.mail_family_refs) && actor.mail_family_refs.includes(FAMILY_ID), `${actor.id}: professional People family binding required`);
  assert.ok(Array.isArray(actor.workplace_ids) && actor.workplace_ids.length >= 1, `${actor.id}: workplace binding required`);
  for (const placeId of actor.workplace_ids) assert.ok(WORKPLACES.includes(placeId), `${actor.id}: unknown workplace ${placeId}`);
}
assert.ok(model.authority_boundary.may.includes('stanse eget arbeid ved relevant risiko'));
for (const boundary of [
  'arbeide utenfor nødvendig kompetanse',
  'omgå sikkerhetssperrer eller påkrevde kontrollsteg',
  'selvgodkjenne alvorlige avvik uten rett kontrollfunksjon',
  'skjule feil for å beskytte tempo, kolleger eller egen status'
]) assert.ok(model.authority_boundary.may_not.includes(boundary), `missing authority boundary: ${boundary}`);

const people = read(PEOPLE_PATH);
assert.equal(people.category, 'naeringsliv');
assert.equal(people.role_scope, ROLE);
assert.equal(people.mail_type, 'people');
const professionalFamilies = people.families.filter((family) => family.id === FAMILY_ID);
assert.equal(professionalFamilies.length, 1, 'Exactly one professional prerequisite family must exist');
const family = professionalFamilies[0];
assert.deepEqual(family.fictional_scenario_actors, ACTOR_IDS);
assert.equal(family.mails.length, 4);
assert.deepEqual(family.mails.map((mail) => mail.id), MAIL_IDS);
assert.deepEqual(family.mails.map((mail) => mail.actor_id), ACTOR_IDS);
for (const mail of family.mails) {
  assert.equal(mail.mail_type, 'people');
  assert.equal(mail.role_scope, ROLE);
  assert.equal(mail.channel, 'work');
  assert.equal(mail.messageChannel, 'work');
  assert.equal(mail.mail_class, 'professional_message');
  assert.equal(mail.repeatable, false);
  assert.equal(mail.person_id, mail.actor_id);
  assert.equal(mail.people_ref, mail.actor_id);
  assert.ok(WORKPLACES.includes(mail.place_id), `${mail.id}: existing work surface required`);
  assert.ok(String(mail.summary || '').length >= 160, `${mail.id}: summary too shallow`);
  assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3, `${mail.id}: situation depth`);
  assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id}: choices required`);
  for (const choice of mail.choices) {
    assert.ok(String(choice.reply || '').length >= 25, `${mail.id}/${choice.id}: reply too shallow`);
    assert.ok(String(choice.feedback || '').length >= 90, `${mail.id}/${choice.id}: feedback too shallow`);
    assert.ok(choice.effects && Object.keys(choice.effects).length >= 1, `${mail.id}/${choice.id}: effects required`);
  }
}
for (const existingFamily of ['uformell_mentor', 'kollega_med_snarveier', 'taus_fagrespekt', 'ansvar_som_glir']) {
  assert.ok(people.families.some((family) => family.id === existingFamily), `existing People family lost: ${existingFamily}`);
}

const plan = read(PLAN_PATH);
assert.equal(plan.id, 'fagarbeider_naeringsliv_v3');
assert.equal(plan.role_scope, ROLE);
assert.ok(plan.sequence.length > 20, 'existing post-practice Fagarbeider arc must remain');
for (let i = 0; i < 20; i += 1) {
  const step = plan.sequence[i];
  assert.equal(step.step, i + 1);
  assert.equal(step.type, i % 2 === 0 ? 'job' : 'people');
  assert.deepEqual(step.fallback_types, []);
}
assert.equal(plan.sequence[20].step, 21);
assert.equal(plan.sequence[20].type, 'job');
assert.ok(plan.sequence.every((step) => !(step.allowed_families || []).includes(FAMILY_ID)), 'prerequisite family must not rewrite canonical progression');

const grammar = read('data/Civication/workGrammars/naeringsliv/naeringsliv_fag_og_produksjon.json');
assert.deepEqual(grammar.work_loops, [
  'ordre -> standard -> utførelse -> kontroll -> avvik -> overlevering',
  'feil -> sikring -> diagnose -> tiltak -> kontroll -> læring'
]);
assert.ok(grammar.authority_boundary.may_not.includes('selvgodkjenne alvorlige avvik uten rett kontroll'));

const jobSource = read('data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json');
const jobMails = jobSource.families.flatMap((item) => item.mails || []);
const firstInspection = jobMails.find((mail) => mail.id === 'job_fagarbeider_week1_first_inspection');
assert.ok(firstInspection, 'canonical first inspection source missing');
assert.match(JSON.stringify(firstInspection), /Rune/);
assert.match(JSON.stringify(firstInspection), /Amir/);

const matrix = read('data/Civication/careerGameplayMatrix.json');
const career = matrix.worlds.find((row) => row.key === KEY);
assert.ok(career, 'Fagarbeider must remain in Career Gameplay Matrix');
assert.equal(career.status, 'playable');
for (const component of ['day_one', 'workday_loop', 'people', 'places', 'mail', 'knowledge', 'authority']) {
  assert.equal(career.audit.components[component].level, 'complete', `${component} must be complete after prerequisite`);
}
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((row) => row.key === KEY);
assert.ok(ready, 'Fagarbeider readiness row required');
assert.equal(ready.classification, 'rollout_ready');
assert.equal(ready.runtime_gate, true);
assert.equal(ready.dimensions.people_places_integrity.status, 'foundation_ready');
assert.equal(ready.cross_role.need, 'not_required_for_rollout');
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);

const roleWorldIndex = read('data/Civication/roleWorlds/index.json');
const roleWorldEntry = (roleWorldIndex.roles || []).find((row) => row.category === 'naeringsliv' && row.role_scope === ROLE);
const roleWorldExists = exists(WORLD_PATH);
if (!roleWorldExists) {
  assert.equal(ready.dimensions[REMAINING].status, 'needs_role_authored_work');
  assert.deepEqual(ready.authored_work_required, [REMAINING], 'Only situated reputation may remain after prerequisites');
  assert.equal(ready.already_reference_or_pilot, false);
  assert.ok((readiness.rollout_queue || []).some((row) => row.key === KEY && row.classification === 'rollout_ready'));
  assert.ok((readiness.first_wave_candidates || []).some((row) => row.key === KEY));
  assert.match(readiness.gate.next_required_pr, /Role World rollout:/);
  assert.match(readiness.gate.next_required_pr, /fagarbeider/);
  assert.equal(roleWorldEntry, undefined, 'prerequisite PR must not materialize a Role World');
} else {
  const world = read(WORLD_PATH);
  assert.equal(world.status, 'role_world_complete');
  assert.equal(ready.dimensions[REMAINING].status, 'foundation_ready');
  assert.deepEqual(ready.authored_work_required, []);
  assert.equal(ready.already_reference_or_pilot, true);
  assert.ok(!(readiness.rollout_queue || []).some((row) => row.key === KEY));
  assert.ok(!(readiness.first_wave_candidates || []).some((row) => row.key === KEY));
  assert.deepEqual(roleWorldEntry, { category: 'naeringsliv', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH });
}

const registry = read('data/Civication/compiledSceneRegistryV1.json');
for (const id of MAIL_IDS) {
  const entry = registry.entries.find((row) => row.id === id);
  assert.ok(entry, `${id}: professional People scene must compile into existing Scene Pipeline`);
  assert.equal(entry.role_scope, ROLE);
  const mail = family.mails.find((row) => row.id === id);
  assert.equal(entry.compatibility_projection?.role_scope, ROLE);
  assert.equal(entry.compatibility_projection?.person_id, mail.actor_id);
  assert.equal(entry.compatibility_projection?.place_id, mail.place_id);
}

const scenarioPeople = fs.readFileSync(path.join(ROOT, 'data/Civication/scenarioPeople/generated/naeringsliv.json'), 'utf8');
for (const id of ACTOR_IDS) assert.ok(!scenarioPeople.includes(id), `${id}: fictional actor must not enter factual Scenario People assignments`);

console.log(roleWorldExists
  ? 'PASS: Fagarbeider prerequisite People/Places foundations remain strict after Role World completion.'
  : 'PASS: Fagarbeider typed fictional professional People close career People/Places entry debt while leaving situated reputation for the later Role World rollout.');
