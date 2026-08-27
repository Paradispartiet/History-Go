'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));

const KEY = 'naeringsliv/finansanalytiker';
const OBJECT = 'naeringsliv_finansanalytiker_investment_case_001';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/finansanalytiker.json';
const TYPES = ['job','people','story','knowledge','micro','conflict','event','followup','consequence'];
const PREFIX = 'naeringsliv_finansanalytiker_realism_';
const catalogPath = type => `data/Civication/mailFamilies/naeringsliv/${type}/finansanalytiker_${type}.json`;
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const mail = (type, id) => flattenMails(readJson(catalogPath(type))).find(row => row.id === id);
const allChoiceOps = row => (row.choices || []).flatMap(choice => choice.effects?.work_object_ops || []);
const allStanding = row => (row.choices || []).flatMap(choice => choice.effects?.social_standing_ops || []);
const parseBeat = ref => { const [day, phase] = ref.split('/'); return {day:Number(day),phase}; };
const beatOrder = ref => { const {day,phase}=parseBeat(ref); return day*10+({morning:1,lunch:2,afternoon:3,evening:4}[phase]||0); };

const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'naeringsliv');
assert.equal(world.role_scope, 'finansanalytiker');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverageKeys = new Set(world.season.coverage.map(beat => `${beat.day}/${beat.phase}`));
assert.equal(coverageKeys.size, 56, 'Finance world needs 56 unique day/phase beats');
for (let day=1; day<=14; day+=1) for (const phase of world.season.day_phases) assert.ok(coverageKeys.has(`${day}/${phase}`));
assert.ok(world.recurring_people_archetypes.length >= 5);
assert.ok(world.slow_axes.length >= 6);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 4);
assert.ok(world.delayed_consequences.length >= 5);
assert.equal(world.materialization.no_new_runtime, true);

const refs = new Set(world.materialization.source_refs || []);
for (const type of TYPES) assert.ok([...refs].some(ref => ref.startsWith(`${catalogPath(type)}#`)), `Role World provenance must include ${type}`);
for (const ref of refs) {
  const [rel, id] = ref.split('#');
  assert.ok(rel && id, `Invalid materialization ref ${ref}`);
  assert.ok(exists(rel), `Missing materialization file ${rel}`);
  const doc = readJson(rel);
  assert.ok(flattenMails(doc).some(row => row.id === id), `Missing materialization id ${ref}`);
}
for (const beat of world.season.coverage) {
  assert.ok(beat.summary.length >= 100, `${beat.day}/${beat.phase} summary must remain substantive`);
  assert.ok(beat.materialization_refs.length >= 1);
  for (const ref of beat.materialization_refs) assert.ok(refs.has(ref), `${beat.day}/${beat.phase}: source ref must be in world materialization provenance`);
}
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const ref of thread.beat_refs) assert.ok(coverageKeys.has(ref), `${thread.id}: unknown beat ${ref}`);
}
for (const delayed of world.delayed_consequences) {
  assert.ok(coverageKeys.has(delayed.setup_ref));
  assert.ok(coverageKeys.has(delayed.return_ref));
  assert.ok(beatOrder(delayed.return_ref) > beatOrder(delayed.setup_ref), `${delayed.id}: return must be later than setup`);
}

const open = mail('job', PREFIX+'investment_case_open_001');
const handoff = mail('people', PREFIX+'senior_handoff_wait_001');
const market = mail('event', PREFIX+'market_rework_001');
const committee = mail('followup', PREFIX+'committee_wait_001');
const aftermath = mail('consequence', PREFIX+'committee_aftermath_001');
for (const [name,row] of Object.entries({open,handoff,market,committee,aftermath})) assert.ok(row, `Missing new finance rollout scene ${name}`);

const createOp = (open.effects?.work_object_ops || []).find(op => op.op === 'create');
assert.equal(createOp?.work_object?.work_object_id, OBJECT);
assert.equal(createOp?.work_object?.kind, 'investment_analysis_case');
assert.equal(createOp?.work_object?.status, 'in_progress');
for (const row of [open,handoff,market,committee,aftermath]) assert.deepEqual(row.work_context?.object_ids, [OBJECT], `${row.id}: same persistent object required`);
assert.equal(handoff.work_context.handoff_to_actor_id, 'theo_senioranalytiker');
assert.equal(handoff.work_context.waiting_for_actor_id, 'theo_senioranalytiker');
assert.equal(handoff.work_context.rework_of_scene_id, open.id);
assert.ok(allChoiceOps(handoff).some(op => op.op === 'transition' && op.to_status === 'waiting' && op.to_phase === 'awaiting_senior_review'));
assert.equal(market.work_context.rework_of_scene_id, handoff.id);
assert.ok(allChoiceOps(market).some(op => op.op === 'transition' && op.to_status === 'in_progress' && op.to_phase === 'market_rework'));
assert.equal(committee.work_context.handoff_to_actor_id, 'investeringskomite');
assert.equal(committee.work_context.waiting_for_actor_id, 'investeringskomite');
assert.equal(committee.work_context.rework_of_scene_id, market.id);
assert.ok(allChoiceOps(committee).some(op => op.op === 'transition' && op.to_status === 'waiting' && op.to_phase === 'awaiting_investment_committee'));
assert.equal(aftermath.work_context.rework_of_scene_id, committee.id);
assert.ok(allChoiceOps(aftermath).some(op => op.op === 'transition' && op.to_status === 'closed' && op.to_phase === 'decision_recorded'));

const standings = [open,handoff,market,committee,aftermath].flatMap(allStanding);
assert.ok(standings.length >= 10, 'Finance rollout needs repeated audience-specific standing effects');
for (const op of standings) {
  assert.match(op.audience_id, /^(manager|professional):[a-z0-9_-]+$/);
  assert.ok(String(op.reason || '').length >= 70, `${op.event_id}: standing reason must be explanatory`);
}
for (const audience of ['manager:elin_portefoljeansvarlig','professional:theo_senioranalytiker','professional:investeringskomite']) {
  assert.ok(standings.some(op => op.audience_id === audience), `Missing situated standing audience ${audience}`);
}
for (const row of [open,handoff,market,committee,aftermath]) for (const option of row.choices || []) assert.equal(option.authority_action, undefined, `${row.id}: standing/work flow must not manufacture authority actions`);

const grammar = readJson('data/Civication/workGrammars/naeringsliv/finansanalytiker.json');
assert.ok((grammar.authority_boundary?.may || []).some(text => /anbefaling/i.test(text)));
assert.ok((grammar.authority_boundary?.may_not || []).some(text => /godkjenne investeringer|flytte kapital/i.test(text)), 'Investment/capital authority boundary must remain explicit');
assert.ok((grammar.authority_boundary?.may_not || []).some(text => /investeringskomit|porteføljeansvarlig/i.test(text)), 'Decision-organ override must remain forbidden');

const plan = readJson('data/Civication/mailPlans/naeringsliv/finansanalytiker_plan.json');
assert.equal(plan.sequence.length, 13, 'Finance rollout extends the existing 8-step plan to 13');
assert.deepEqual(plan.sequence.slice(-5).map(step => step.type), ['job','people','event','followup','consequence']);
assert.deepEqual(plan.sequence.slice(-5).map(step => step.allowed_families[0]), [
  'role_world_rollout_finansanalytiker_case_open',
  'role_world_rollout_finansanalytiker_senior_handoff',
  'role_world_rollout_finansanalytiker_market_rework',
  'role_world_rollout_finansanalytiker_committee_wait',
  'role_world_rollout_finansanalytiker_committee_aftermath'
]);

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'naeringsliv' && row.role_scope === 'finansanalytiker' && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_NAERINGSLIV_FINANSANALYTIKER_ROLE_WORLD_ROLLOUT.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career, 'Career matrix must retain Finance analyst');
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);
assert.equal(career.audit?.components?.mail?.level, 'complete');
for (const type of TYPES) {
  const family = career.artifacts?.mail_families?.[type];
  assert.equal(family?.path, catalogPath(type), `${type}: career matrix path`);
  assert.ok(Number(family?.count || 0) >= 1, `${type}: career matrix mail count`);
}

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 13, 'Finance must increase completed/pilot count');
assert.ok(readiness.summary?.rollout_queue_roles <= 72, 'Finance must leave the controlled rollout queue');
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY), 'Finance must be removed from rollout queue');
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: naeringsliv/finansanalytiker');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessFinance = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessFinance?.already_reference_or_pilot, 'Finance readiness row must recognize registered Role World');

console.log('✓ Næringsliv Finansanalytiker Role World rollout contract is complete and fail-closed');
