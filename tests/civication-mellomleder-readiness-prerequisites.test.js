const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const KEY = 'naeringsliv/mellomleder';
const ROLE = 'mellomleder';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/kapitalforvalter.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/mellomleder_people.json';
const JOB_PATH = 'data/Civication/mailFamilies/naeringsliv/job/mellomleder_job.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/mellomleder_plan.json';
const CAPITAL_GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_finans_og_kapitalforvaltning.json';
const LEADERSHIP_GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_virksomhetsledelse.json';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/mellomleder.json';
const FAMILY_ID = 'mellomleder_profesjonelle_arbeidsrelasjoner';
const REMAINING = ['situated', 'reputation'].join('_');
const ACTOR_IDS = [
  'ingrid_omradesjef_mellomleder',
  'mads_sidestilt_leder_mellomleder',
  'rana_teamkoordinator_mellomleder',
  'thomas_medarbeider_oppfolging_mellomleder'
];
const MAIL_IDS = [
  'mellomleder_people_ingrid_rapport_001',
  'mellomleder_people_mads_styringspolitikk_001',
  'mellomleder_people_rana_kapasitet_001',
  'mellomleder_people_thomas_oppfolging_001'
];
const WORKPLACES = [
  'analyse_og_rapporteringsflate',
  'strategi_og_beslutningsrom',
  'drift_og_kapasitetsgjennomgang',
  'risiko_og_oppfolgingsbord'
];
const SOURCE_REFS = [
  `${JOB_PATH}#job_mellomleder_week1_first_monday_report`,
  `${JOB_PATH}#job_mellomleder_week2_numbers_become_politics`,
  `${JOB_PATH}#job_mellomleder_week1_peace_below_speed_above`,
  `${JOB_PATH}#job_mellomleder_week2_thomas_followup_aftershock`
];

const sourceFirst = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_NAERINGSLIV_MELLOMLEDER_PREREQUISITES_SOURCE_FIRST.md'), 'utf8');
assert.match(sourceFirst, /not Role World completion/i);
assert.ok(sourceFirst.includes(REMAINING));
assert.match(sourceFirst, /fictional: true/);
assert.match(sourceFirst, /canonical_person_ref: null/);
assert.match(sourceFirst, /steps 1–20|1–20/i);
assert.match(sourceFirst, /not inserted into the canonical mail plan/i);
assert.match(sourceFirst, /candidate_when_shared_work_is_real/);
assert.match(sourceFirst, /16,679 commits behind/);
assert.match(sourceFirst, /privacy|personnel/i);

const model = read(MODEL_PATH);
assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, 'kapitalforvalter');
assert.equal(model.role_id, 'naeringsliv_kapitalforvalter');
assert.deepEqual(model.work_life.workplaces, WORKPLACES);
assert.deepEqual(model.related_places.map((place) => place.id), WORKPLACES);
assert.deepEqual(model.related_people.map((actor) => actor.id), ACTOR_IDS);
assert.equal(model.related_people.length, 4);
for (const [index, actor] of model.related_people.entries()) {
  assert.equal(actor.fictional, true);
  assert.equal(actor.fictional_scenario_actor, true);
  assert.equal(actor.canonical_person_ref, null);
  assert.ok(String(actor.name || '').length >= 3);
  assert.ok(String(actor.role || '').length >= 12);
  assert.ok(String(actor.function || '').length >= 190, `${actor.id}: work function too shallow`);
  assert.ok(String(actor.authority_relation || '').length >= 190, `${actor.id}: authority relation too shallow`);
  assert.deepEqual(actor.mail_family_refs, [FAMILY_ID]);
  assert.deepEqual(actor.workplace_ids, [WORKPLACES[index]]);
  assert.deepEqual(actor.source_scene_refs, [SOURCE_REFS[index]]);
}

const capitalGrammar = read(CAPITAL_GRAMMAR_PATH);
assert.deepEqual(capitalGrammar.work_loops, [
  'mandat -> data -> analyse -> risiko -> anbefaling/handling -> rapportering',
  'markedshendelse -> eksponering -> scenario -> mandat -> tiltak -> oppfølging'
]);
assert.deepEqual(capitalGrammar.authority_boundary.may_not, [
  'love avkastning',
  'handle utenfor mandat',
  'skjule interessekonflikter',
  'late som personlig Badge-status er virksomhetskonsesjon'
]);
const leadershipGrammar = read(LEADERSHIP_GRAMMAR_PATH);
assert.deepEqual(leadershipGrammar.work_loops, [
  'mandat -> strategi -> ressursvalg -> gjennomføring -> resultat -> styreoppfølging',
  'risiko -> scenario -> beslutningsnivå -> tiltak -> kommunikasjon -> læring'
]);
assert.deepEqual(leadershipGrammar.authority_boundary.may_not, [
  'behandle eierskap som ledermandat',
  'sette selskapsorganer til side',
  'skjule vesentlig risiko',
  'bruke virksomhetsmidler privat'
]);

const people = read(PEOPLE_PATH);
assert.equal(people.category, 'naeringsliv');
assert.equal(people.role_scope, ROLE);
assert.equal(people.mail_type, 'people');
const families = people.families.filter((family) => family.id === FAMILY_ID);
assert.equal(families.length, 1);
const family = families[0];
assert.deepEqual(family.fictional_scenario_actors, ACTOR_IDS);
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
  assert.equal(Object.hasOwn(mail, 'work_context'), false);
  assert.ok(String(mail.summary || '').length >= 250, `${mail.id}: summary too shallow`);
  assert.ok(Array.isArray(mail.situation) && mail.situation.length === 3);
  assert.ok(Array.isArray(mail.choices) && mail.choices.length === 2);
  for (const choice of mail.choices) {
    assert.ok(String(choice.reply || '').length >= 80, `${mail.id}/${choice.id}: reply too shallow`);
    assert.ok(String(choice.feedback || '').length >= 180, `${mail.id}/${choice.id}: feedback too shallow`);
    assert.ok(choice.effects?.stats && Object.keys(choice.effects.stats).length >= 3);
  }
}

for (const ref of SOURCE_REFS) {
  const [rel, id] = ref.split('#');
  const catalog = read(rel);
  const mails = (catalog.families || []).flatMap((sourceFamily) => sourceFamily.mails || []);
  assert.ok(mails.some((mail) => mail.id === id), `missing canonical source ${ref}`);
}

const plan = read(PLAN_PATH);
assert.equal(plan.id, 'mellomleder_naeringsliv_v2');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 25);
for (let i = 0; i < 20; i += 1) {
  assert.equal(plan.sequence[i].step, i + 1);
  assert.equal(plan.sequence[i].type, i % 2 === 0 ? 'job' : 'people');
  assert.deepEqual(plan.sequence[i].fallback_types, []);
}
assert.deepEqual(plan.sequence.slice(20).map((step) => step.type), ['conflict', 'people', 'job', 'story', 'event']);
assert.ok(plan.sequence.every((step) => !(step.allowed_families || []).includes(FAMILY_ID)));

const basePeople = read('data/Civication/people/naeringsliv/mellomleder_people_base.json');
assert.deepEqual(basePeople.people.map((person) => person.id), ['kari_drift', 'ali_system', 'lise_fag', 'jonas_ambisjon', 'solveig_rapport', 'farid_gulv']);

const matrix = read('data/Civication/careerGameplayMatrix.json');
const career = matrix.worlds.find((row) => row.key === KEY);
assert.equal(career.status, 'playable');
for (const component of ['day_one', 'workday_loop', 'people', 'places', 'mail', 'knowledge', 'authority']) {
  assert.equal(career.audit.components[component].level, 'complete', `${component} must remain complete`);
}
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((row) => row.key === KEY);
assert.equal(ready.classification, 'rollout_ready');
assert.equal(ready.dimensions.people_places_integrity.status, 'foundation_ready');
assert.equal(ready.cross_role.need, 'candidate_when_shared_work_is_real');
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);

const roleWorldIndex = read('data/Civication/roleWorlds/index.json');
const roleWorldEntry = (roleWorldIndex.roles || []).find((row) => row.category === 'naeringsliv' && row.role_scope === ROLE);
const worldExists = exists(WORLD_PATH);
if (!worldExists) {
  assert.equal(ready.dimensions[REMAINING].status, 'needs_role_authored_work');
  assert.deepEqual(ready.authored_work_required, [REMAINING]);
  assert.equal(ready.already_reference_or_pilot, false);
  assert.ok((readiness.rollout_queue || []).some((row) => row.key === KEY && row.classification === 'rollout_ready'));
  assert.ok((readiness.first_wave_candidates || []).some((row) => row.key === KEY));
  assert.equal(roleWorldEntry, undefined);
} else {
  const world = read(WORLD_PATH);
  assert.equal(world.status, 'role_world_complete');
  assert.deepEqual(ready.authored_work_required, []);
  assert.equal(ready.already_reference_or_pilot, true);
  assert.deepEqual(roleWorldEntry, { category: 'naeringsliv', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH });
}

const registry = read('data/Civication/compiledSceneRegistryV1.json');
for (const [index, id] of MAIL_IDS.entries()) {
  const entry = registry.entries.find((row) => row.id === id);
  assert.ok(entry, `${id}: must compile into Scene Pipeline`);
  assert.equal(entry.role_scope, ROLE);
  assert.equal(entry.compatibility_projection?.role_scope, ROLE);
  assert.equal(entry.compatibility_projection?.person_id, ACTOR_IDS[index]);
  assert.equal(entry.compatibility_projection?.place_id, WORKPLACES[index]);
}

const scenarioPeople = fs.readFileSync(path.join(ROOT, 'data/Civication/scenarioPeople/generated/naeringsliv.json'), 'utf8');
for (const id of ACTOR_IDS) assert.ok(!scenarioPeople.includes(id), `${id}: fictional actor must not enter factual Scenario People`);

console.log(worldExists
  ? 'PASS: Mellomleder prerequisites remain strict after Role World completion.'
  : 'PASS: Mellomleder professional People/Places prerequisites close entry debt while leaving the remaining realism dimension for the dedicated Role World rollout.');
