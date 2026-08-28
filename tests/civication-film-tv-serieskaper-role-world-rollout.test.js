'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));

const KEY = 'film_tv/serieskaper';
const WORLD_PATH = 'data/Civication/roleWorlds/film_tv/serieskaper.json';
const PLAN_PATH = 'data/Civication/mailPlans/film_tv/serieskaper_plan.json';
const TYPES = ['job','people','conflict','story','event','micro','knowledge','followup','consequence'];
const catalogPath = type => `data/Civication/mailFamilies/film_tv/${type}/serieskaper_${type}.json`;
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const parseRef = ref => { const [rel,id] = ref.split('#'); return {rel,id}; };
const parseBeat = ref => { const [day, phase] = ref.split('/'); return {day:Number(day),phase}; };
const beatOrder = ref => { const {day,phase}=parseBeat(ref); return day*10+({morning:1,lunch:2,afternoon:3,evening:4}[phase]||0); };

const expected = {
  job:['serieskaper_sesongrygg','film_tv_series_job_sesongrygg_001'],
  people:['serieskaper_episode_vs_bue','film_tv_series_people_bue_001'],
  conflict:['serieskaper_noteskonflikt','film_tv_series_conflict_notes_001'],
  story:['serieskaper_rollefravaer','film_tv_series_story_rollefravaer_001'],
  event:['serieskaper_location_bortfall','film_tv_series_event_location_001'],
  micro:['serieskaper_bibelkontinuitet','film_tv_series_micro_bibel_001'],
  knowledge:['serieskaper_filmforfatter_kontekst','film_tv_series_knowledge_skouen_001'],
  followup:['serieskaper_bueoppfolging','film_tv_series_followup_rollefravaer_001'],
  consequence:['serieskaper_finalegjeld','film_tv_series_consequence_finalegjeld_001']
};

const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'film_tv');
assert.equal(world.role_scope, 'serieskaper');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverageKeys = new Set(world.season.coverage.map(beat => `${beat.day}/${beat.phase}`));
assert.equal(coverageKeys.size, 56);
for (let day=1; day<=14; day+=1) for (const phase of world.season.day_phases) assert.ok(coverageKeys.has(`${day}/${phase}`));
assert.ok(world.recurring_people_archetypes.length >= 5);
assert.ok(world.slow_axes.length >= 8);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);
assert.equal(world.materialization.no_new_runtime, true);
assert.deepEqual(world.materialization.authored_dimensions, ['rhythm_waiting_handoff_rework','situated_reputation']);

const worldText = JSON.stringify(world);
assert.match(worldText, /vent|waiting/i, 'Serieskaper rollout must materially author waiting');
assert.match(worldText, /handoff/i, 'Serieskaper rollout must materially author handoff');
assert.match(worldText, /rework|omskriv/i, 'Serieskaper rollout must materially author rework');
assert.match(worldText, /omdømme|standing|tillit/i, 'Serieskaper rollout must materially author situated reputation');
const standingAxes = ['executive_standing','writers_room_standing','production_standing'];
for (const id of standingAxes) {
  const axis = world.slow_axes.find(row => row.id === id);
  assert.ok(axis, `Missing audience-specific standing axis ${id}`);
  assert.equal(axis.runtime_binding, 'editorial_only_until_governed');
}
assert.ok(world.slow_axes.some(row => row.id === 'handoff_reliability'));
assert.ok(world.slow_axes.some(row => row.id === 'rework_debt'));
assert.match(world.sociological_core.main_problem, /omdømme.*ikke.*global|globalt.*tall/i);
assert.match(world.sociological_core.main_problem, /myndighet/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'Serieskaper rollout must reuse exactly the existing 9/9 canonical mail scenes');
for (const type of TYPES) {
  const [familyId,mailId] = expected[type];
  const ref = `${catalogPath(type)}#${mailId}`;
  assert.ok(refs.includes(ref), `Missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'film_tv');
  assert.equal(doc.role_scope, 'serieskaper');
  assert.equal(doc.mail_type, type);
  const family = (doc.families || []).find(row => row.id === familyId);
  assert.ok(family, `Missing planned ${type} family ${familyId}`);
  const scene = (family.mails || []).find(row => row.id === mailId);
  assert.ok(scene, `Missing planned ${type} scene ${mailId}`);
  assert.equal(scene.role_scope, 'serieskaper');
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
assert.equal(plan.sequence.length, 9, 'Serieskaper keeps the exact existing 9-step plan');
assert.deepEqual(plan.sequence.map(step => step.type), TYPES);
assert.deepEqual(plan.sequence.map(step => step.allowed_families[0]), TYPES.map(type => expected[type][0]));
assert.ok(plan.sequence.every(step => Array.isArray(step.fallback_types) && step.fallback_types.length === 0));

const roleModel = readJson('data/Civication/roleModels/film_tv/serieskaper.json');
for (const boundary of [
  'overstyre_produksjons_sikkerhets_eller_rettighetsrammer',
  'love_forlengelse_bestilling_eller_budsjett',
  'tilegne_seg_andres_kreditering_eller_opphavsrett',
  'behandle_kreativt_eierskap_som_uinnskrenket_personalmakt',
  'bruke_historiske_filmskapere_som_fasit_for_moderne_serieskaping'
]) assert.ok((roleModel.authority_boundaries?.cannot || []).includes(boundary), `Missing Serieskaper authority boundary ${boundary}`);
const grammar = readJson('data/Civication/workGrammars/film_tv/serieskaper.json');
assert.ok((grammar.authority_boundary?.must_escalate_when || []).length >= 5);
assert.ok((grammar.authority_boundary?.may_not || []).includes('bruke_historiske_filmskapere_som_fiktive_radgivere_eller_normativ_fasit'));
for (const type of TYPES) for (const scene of flattenMails(readJson(catalogPath(type)))) for (const option of scene.choices || []) assert.equal(option.authority_action, undefined, `${scene.id}: rollout must not manufacture authority actions`);

const knowledge = flattenMails(readJson(catalogPath('knowledge'))).find(row => row.id === expected.knowledge[1]);
assert.equal(knowledge.task_payload?.task_kind, 'history_go_person');
assert.equal(knowledge.task_payload?.person_id, 'arne_skouen');
assert.equal(knowledge.task_payload?.completion_mode, 'read_profile');
assert.equal(knowledge.task_contract?.completion_rule, 'history_go_payload_completed');
assert.match(knowledge.summary, /filmhistorisk/i);
assert.match(knowledge.summary, /moderne serieforfatterskap/i);

const story = flattenMails(readJson(catalogPath('story'))).find(row => row.id === expected.story[1]);
const followup = flattenMails(readJson(catalogPath('followup'))).find(row => row.id === expected.followup[1]);
assert.equal(story.thread_key, followup.thread_key, 'role-absence handoff must return through the existing thread');
const job = flattenMails(readJson(catalogPath('job'))).find(row => row.id === expected.job[1]);
const micro = flattenMails(readJson(catalogPath('micro'))).find(row => row.id === expected.micro[1]);
const consequence = flattenMails(readJson(catalogPath('consequence'))).find(row => row.id === expected.consequence[1]);
assert.equal(job.thread_key, micro.thread_key);
assert.equal(job.thread_key, consequence.thread_key);

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'film_tv' && row.role_scope === 'serieskaper' && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_FILM_TV_SERIESKAPER_ROLE_WORLD_ROLLOUT.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);
for (const type of TYPES) {
  const family = career.artifacts?.mail_families?.[type];
  assert.equal(family?.path, catalogPath(type));
  assert.ok(Number(family?.count || 0) >= 1);
}

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 17);
assert.ok(readiness.summary?.rollout_queue_roles <= 68);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: film_tv/serieskaper');
assert.equal(readiness.rollout_queue?.[0]?.key, 'litteratur/redaksjonsmedarbeider');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Film/TV Serieskaper Role World rollout closes waiting/handoff/rework and situated-reputation debt fail-closed');
