'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));

const KEY = 'film_tv/regissor';
const WORLD_PATH = 'data/Civication/roleWorlds/film_tv/regissor.json';
const PLAN_PATH = 'data/Civication/mailPlans/film_tv/regissor_plan.json';
const TYPES = ['job','people','conflict','story','event','micro','knowledge','followup','consequence'];
const catalogPath = type => `data/Civication/mailFamilies/film_tv/${type}/regissor_${type}.json`;
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const parseRef = ref => { const [rel,id] = ref.split('#'); return {rel,id}; };
const parseBeat = ref => { const [day, phase] = ref.split('/'); return {day:Number(day),phase}; };
const beatOrder = ref => { const {day,phase}=parseBeat(ref); return day*10+({morning:1,lunch:2,afternoon:3,evening:4}[phase]||0); };

const expected = {
  job:['regissor_sceneplan','film_tv_regi_job_sceneplan_001'],
  people:['regissor_blocking_og_bilde','film_tv_regi_people_blocking_001'],
  conflict:['regissor_dekning_under_tid','film_tv_regi_conflict_dekning_001'],
  story:['regissor_medvirkendegrense','film_tv_regi_story_grense_001'],
  event:['regissor_lysfall','film_tv_regi_event_lysfall_001'],
  micro:['regissor_kontinuitetsstopp','film_tv_regi_micro_kontinuitet_001'],
  knowledge:['regissor_filmhistorisk_kontekst','film_tv_regi_knowledge_carlmar_001'],
  followup:['regissor_klippoppfolging','film_tv_regi_followup_klipp_001'],
  consequence:['regissor_manglende_dekning','film_tv_regi_consequence_dekning_001']
};

const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'film_tv');
assert.equal(world.role_scope, 'regissor');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverageKeys = new Set(world.season.coverage.map(beat => `${beat.day}/${beat.phase}`));
assert.equal(coverageKeys.size, 56);
for (let day=1; day<=14; day+=1) for (const phase of world.season.day_phases) assert.ok(coverageKeys.has(`${day}/${phase}`));
assert.ok(world.recurring_people_archetypes.length >= 5);
assert.ok(world.slow_axes.length >= 6);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 4);
assert.ok(world.delayed_consequences.length >= 5);
assert.equal(world.materialization.no_new_runtime, true);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'Regissør world-only rollout must use exactly the existing 9/9 canonical mail scenes');
for (const type of TYPES) {
  const [familyId,mailId] = expected[type];
  const ref = `${catalogPath(type)}#${mailId}`;
  assert.ok(refs.includes(ref), `Missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'film_tv');
  assert.equal(doc.role_scope, 'regissor');
  assert.equal(doc.mail_type, type);
  const family = (doc.families || []).find(row => row.id === familyId);
  assert.ok(family, `Missing planned ${type} family ${familyId}`);
  const scene = (family.mails || []).find(row => row.id === mailId);
  assert.ok(scene, `Missing planned ${type} scene ${mailId}`);
  assert.equal(scene.role_scope, 'regissor');
}
for (const ref of refs) {
  const {rel,id} = parseRef(ref);
  assert.ok(rel && id && exists(rel));
  assert.ok(flattenMails(readJson(rel)).some(row => row.id === id));
}
for (const beat of world.season.coverage) {
  assert.ok(beat.summary.length >= 100, `${beat.day}/${beat.phase}: summary must remain substantive`);
  assert.ok(beat.materialization_refs.length >= 1);
  for (const ref of beat.materialization_refs) assert.ok(refs.includes(ref));
}
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const ref of thread.beat_refs) assert.ok(coverageKeys.has(ref));
}
for (const delayed of world.delayed_consequences) {
  assert.ok(coverageKeys.has(delayed.setup_ref));
  assert.ok(coverageKeys.has(delayed.return_ref));
  assert.ok(beatOrder(delayed.return_ref) > beatOrder(delayed.setup_ref));
}

const plan = readJson(PLAN_PATH);
assert.equal(plan.sequence.length, 9, 'No authored debt means Regissør plan must remain exactly 9 steps');
assert.deepEqual(plan.sequence.map(step => step.type), TYPES);
assert.deepEqual(plan.sequence.map(step => step.allowed_families[0]), TYPES.map(type => expected[type][0]));

const roleModel = readJson('data/Civication/roleModels/film_tv/regissor.json');
assert.ok((roleModel.authority_boundaries?.cannot || []).includes('overstyre_sikkerhetsansvar_eller_stansekrav'));
assert.ok((roleModel.authority_boundaries?.cannot || []).includes('tilsidesette_samtykke_eller_avtalte_medvirkendegrenser'));
assert.ok((roleModel.authority_boundaries?.cannot || []).includes('endre_rettigheter_kontrakter_eller_budsjettfullmakter_uten_mandat'));
const grammar = readJson('data/Civication/workGrammars/film_tv/regissor.json');
assert.ok((grammar.authority_boundary?.must_escalate_when || []).includes('sikkerhetsopplegg_ikke_dekker_onsket_losning'));
assert.ok((grammar.authority_boundary?.must_escalate_when || []).includes('medvirkendegrense_eller_samtykke_endres'));
assert.ok((grammar.authority_boundary?.must_escalate_when || []).includes('ny_opptaksdag_eller_vesentlig_produksjonsomlegging_vurderes'));
for (const type of TYPES) for (const scene of flattenMails(readJson(catalogPath(type)))) for (const option of scene.choices || []) assert.equal(option.authority_action, undefined, `${scene.id}: world-only rollout must not manufacture authority actions`);

const knowledge = flattenMails(readJson(catalogPath('knowledge'))).find(row => row.id === expected.knowledge[1]);
assert.equal(knowledge.task_payload?.task_kind, 'history_go_person');
assert.equal(knowledge.task_payload?.person_id, 'edith_carlmar');
assert.equal(knowledge.task_payload?.completion_mode, 'read_profile');
assert.equal(knowledge.task_contract?.completion_rule, 'history_go_payload_completed');
assert.ok((knowledge.situation || []).some(text => /historisk kontekst/i.test(text) && /ikke/i.test(text)), 'History Go person must remain context, not normative authority');

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'film_tv' && row.role_scope === 'regissor' && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_FILM_TV_REGISSOR_ROLE_WORLD_ROLLOUT.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);
assert.equal(career.audit?.components?.mail?.level, 'complete');
for (const type of TYPES) {
  const family = career.artifacts?.mail_families?.[type];
  assert.equal(family?.path, catalogPath(type));
  assert.ok(Number(family?.count || 0) >= 1);
}

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 16);
assert.ok(readiness.summary?.rollout_queue_roles <= 69);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: film_tv/regissor');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Film/TV Regissør world-only Role World rollout is complete and fail-closed');
