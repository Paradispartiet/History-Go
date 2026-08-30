const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const KEY = 'naeringsliv/lager_og_driftsmedarbeider';
const ROLE = 'lager_og_driftsmedarbeider';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json';
const JOB_PATH = 'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_logistikk_og_drift.json';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/lager_og_driftsmedarbeider.json';
const FAMILY_ID = 'lager_profesjonelle_arbeidsrelasjoner';
const REMAINING = ['situated', 'reputation'].join('_');
const ACTOR_IDS = [
  'ragnhild_driftsleder_lager',
  'pavel_erfaren_lagermedarbeider',
  'marius_okonomikontakt_lager',
  'helle_hms_og_skiftkontakt_lager'
];
const MAIL_IDS = [
  'lager_people_ragnhild_mottak_001',
  'lager_people_pavel_sporbarhet_001',
  'lager_people_marius_avstemming_001',
  'lager_people_helle_hms_handoff_001'
];
const WORKPLACES = [
  'varemottak_og_kollikontroll',
  'plukk_pakk_og_systemflate',
  'telling_og_avvikspunkt',
  'hms_og_overleveringsflate'
];
const SOURCE_REFS = [
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week1_receiving_almost_matched`,
  `${PEOPLE_PATH}#lager_people_snarvei_002`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week2_count_mismatch`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week2_near_miss_everyone_passed`
];

const sourceFirst = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_NAERINGSLIV_LAGER_OG_DRIFTSMEDARBEIDER_PREREQUISITES_SOURCE_FIRST.md'), 'utf8');
assert.match(sourceFirst, /not Role World completion/i);
assert.ok(sourceFirst.includes(REMAINING));
assert.match(sourceFirst, /fictional: true/);
assert.match(sourceFirst, /canonical_person_ref: null/);
assert.match(sourceFirst, /steps 1–20|1–20/i);
assert.match(sourceFirst, /not inserted into the canonical mail plan/i);
assert.match(sourceFirst, /not_required_for_rollout/);
assert.match(sourceFirst, /13,627 commits behind/);

const model = read(MODEL_PATH);
assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, ROLE);
assert.equal(model.role_id, 'naer_lager_og_driftsmedarbeider');
assert.deepEqual(model.work_life.workplaces, WORKPLACES);
assert.deepEqual(model.related_places.map((place) => place.id), WORKPLACES);
assert.deepEqual(model.related_people.map((actor) => actor.id), ACTOR_IDS);
assert.equal(model.related_people.length, 4);
for (const [index, actor] of model.related_people.entries()) {
  assert.equal(actor.fictional, true, `${actor.id}: Scenario People exclusion flag`);
  assert.equal(actor.fictional_scenario_actor, true, `${actor.id}: fictional scenario declaration`);
  assert.equal(actor.canonical_person_ref, null, `${actor.id}: cannot impersonate canonical History People`);
  assert.ok(String(actor.name || '').length >= 3, `${actor.id}: display name required`);
  assert.ok(String(actor.role || '').length >= 12, `${actor.id}: professional role required`);
  assert.ok(String(actor.function || '').length >= 180, `${actor.id}: work function too shallow`);
  assert.ok(String(actor.authority_relation || '').length >= 180, `${actor.id}: authority relation too shallow`);
  assert.deepEqual(actor.mail_family_refs, [FAMILY_ID]);
  assert.deepEqual(actor.workplace_ids, [WORKPLACES[index]]);
  assert.deepEqual(actor.source_scene_refs, [SOURCE_REFS[index]]);
}

const grammar = read(GRAMMAR_PATH);
assert.deepEqual(grammar.work_loops, [
  'mottak -> kontroll -> registrering -> lokasjon -> plukk -> utlevering',
  'avvik -> isolering -> telling/fakta -> korrigering -> godkjenning -> læring'
]);
assert.deepEqual(grammar.authority_boundary.may, [
  'håndtere varer innen rutine',
  'registrere avvik',
  'isolere usikkert gods'
]);
assert.deepEqual(grammar.authority_boundary.may_not, [
  'forfalske lagerstatus',
  'sende skadet gods uten avklaring',
  'omgå sikkerhetsrutiner',
  'skjule lageravvik'
]);

const people = read(PEOPLE_PATH);
assert.equal(people.category, 'naeringsliv');
assert.equal(people.role_scope, ROLE);
assert.equal(people.mail_type, 'people');
const professionalFamilies = people.families.filter((family) => family.id === FAMILY_ID);
assert.equal(professionalFamilies.length, 1, 'exactly one professional prerequisite family must exist');
const family = professionalFamilies[0];
assert.deepEqual(family.fictional_scenario_actors, ACTOR_IDS);
assert.equal(family.mails.length, 4);
assert.deepEqual(family.mails.map((mail) => mail.id), MAIL_IDS);
assert.deepEqual(family.mails.map((mail) => mail.actor_id), ACTOR_IDS);

for (const [index, mail] of family.mails.entries()) {
  assert.equal(mail.mail_type, 'people');
  assert.equal(mail.role_scope, ROLE);
  assert.equal(mail.channel, 'work');
  assert.equal(mail.messageChannel, 'work');
  assert.equal(mail.mail_class, 'professional_message');
  assert.equal(mail.repeatable, false);
  assert.equal(mail.person_id, mail.actor_id);
  assert.equal(mail.people_ref, mail.actor_id);
  assert.equal(mail.place_id, WORKPLACES[index]);
  assert.equal(mail.source_scene_ref, SOURCE_REFS[index]);
  assert.equal(Object.hasOwn(mail, 'work_context'), false, `${mail.id}: ordinary People scene must not fake persistent work_context`);
  assert.ok(String(mail.summary || '').length >= 240, `${mail.id}: summary too shallow`);
  assert.ok(Array.isArray(mail.situation) && mail.situation.length === 3, `${mail.id}: situation depth`);
  assert.ok(Array.isArray(mail.choices) && mail.choices.length === 2, `${mail.id}: two bounded choices required`);
  for (const choice of mail.choices) {
    assert.ok(String(choice.reply || '').length >= 80, `${mail.id}/${choice.id}: reply too shallow`);
    assert.ok(String(choice.feedback || '').length >= 180, `${mail.id}/${choice.id}: feedback too shallow`);
    assert.ok(choice.effects?.stats && Object.keys(choice.effects.stats).length >= 3, `${mail.id}/${choice.id}: effects required`);
  }
}

for (const ref of SOURCE_REFS) {
  const [rel, id] = ref.split('#');
  const catalog = read(rel);
  const mails = (catalog.families || []).flatMap((sourceFamily) => sourceFamily.mails || []);
  assert.ok(mails.some((mail) => mail.id === id), `missing exact canonical source ${ref}`);
}

const plan = read(PLAN_PATH);
assert.equal(plan.id, 'naeringsliv_lager_og_driftsmedarbeider_plan');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 20, 'existing Lager practice plan must remain exactly 20 steps');
for (let i = 0; i < 20; i += 1) {
  const step = plan.sequence[i];
  assert.equal(step.step, i + 1);
  assert.equal(step.type, i % 2 === 0 ? 'job' : 'people');
  assert.deepEqual(step.fallback_types, []);
  assert.ok(!(step.allowed_families || []).includes(FAMILY_ID), 'prerequisite family must not rewrite canonical progression');
}

const matrix = read('data/Civication/careerGameplayMatrix.json');
const career = matrix.worlds.find((row) => row.key === KEY);
assert.ok(career, 'Lager role must remain in Career Gameplay Matrix');
assert.equal(career.status, 'playable');
for (const component of ['day_one', 'workday_loop', 'people', 'places', 'mail', 'knowledge', 'authority']) {
  assert.equal(career.audit.components[component].level, 'complete', `${component} must be complete after prerequisite`);
}
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((row) => row.key === KEY);
assert.ok(ready, 'Lager readiness row required');
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
  assert.deepEqual(ready.authored_work_required, [REMAINING]);
  assert.equal(ready.already_reference_or_pilot, false);
  assert.ok((readiness.rollout_queue || []).some((row) => row.key === KEY && row.classification === 'rollout_ready'));
  assert.ok((readiness.first_wave_candidates || []).some((row) => row.key === KEY));
  assert.match(readiness.gate.next_required_pr, /Role World rollout:/);
  assert.match(readiness.gate.next_required_pr, /lager_og_driftsmedarbeider/);
  assert.equal(roleWorldEntry, undefined, 'prerequisite PR must not materialize a Role World');
} else {
  const world = read(WORLD_PATH);
  assert.equal(world.status, 'role_world_complete');
  assert.equal(ready.dimensions[REMAINING].status, 'foundation_ready');
  assert.deepEqual(ready.authored_work_required, []);
  assert.equal(ready.already_reference_or_pilot, true);
  assert.ok(!(readiness.rollout_queue || []).some((row) => row.key === KEY));
  assert.deepEqual(roleWorldEntry, { category: 'naeringsliv', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH });
}

const registry = read('data/Civication/compiledSceneRegistryV1.json');
for (const [index, id] of MAIL_IDS.entries()) {
  const entry = registry.entries.find((row) => row.id === id);
  assert.ok(entry, `${id}: professional People scene must compile into existing Scene Pipeline`);
  assert.equal(entry.role_scope, ROLE);
  assert.equal(entry.compatibility_projection?.role_scope, ROLE);
  assert.equal(entry.compatibility_projection?.person_id, ACTOR_IDS[index]);
  assert.equal(entry.compatibility_projection?.place_id, WORKPLACES[index]);
}

const scenarioPeople = fs.readFileSync(path.join(ROOT, 'data/Civication/scenarioPeople/generated/naeringsliv.json'), 'utf8');
for (const id of ACTOR_IDS) assert.ok(!scenarioPeople.includes(id), `${id}: fictional actor must not enter factual Scenario People assignments`);

console.log(roleWorldExists
  ? 'PASS: Lager prerequisite People/Places foundations remain strict after Role World completion.'
  : 'PASS: Lager typed fictional professional People close Career People/Places entry debt while leaving the deferred realism dimension for the later Role World rollout.');
