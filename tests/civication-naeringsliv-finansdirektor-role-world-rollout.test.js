'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));

const KEY = 'naeringsliv/finansdirektor';
const OBJECT = 'naeringsliv_finansdirektor_refinancing_case_001';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/finansdirektor.json';
const TYPES = ['job','people','story','knowledge','micro','conflict','event','followup','consequence'];
const PREFIX = 'naeringsliv_finansdirektor_realism_';
const catalogPath = type => `data/Civication/mailFamilies/naeringsliv/${type}/finansdirektor_${type}.json`;
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
assert.equal(world.role_scope, 'finansdirektor');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverageKeys = new Set(world.season.coverage.map(beat => `${beat.day}/${beat.phase}`));
assert.equal(coverageKeys.size, 56, 'Finance Director world needs 56 unique day/phase beats');
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
  for (const ref of beat.materialization_refs) assert.ok(refs.has(ref), `${beat.day}/${beat.phase}: source ref must be in world provenance`);
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

const open = mail('job', PREFIX+'refinancing_case_open_001');
const bank = mail('people', PREFIX+'bank_handoff_wait_001');
const rework = mail('event', PREFIX+'rate_covenant_rework_001');
const board = mail('followup', PREFIX+'board_handoff_wait_001');
const aftermath = mail('consequence', PREFIX+'board_aftermath_001');
for (const [name,row] of Object.entries({open,bank,rework,board,aftermath})) assert.ok(row, `Missing new Finance Director rollout scene ${name}`);

const createOp = (open.effects?.work_object_ops || []).find(op => op.op === 'create');
assert.equal(createOp?.work_object?.work_object_id, OBJECT);
assert.equal(createOp?.work_object?.kind, 'refinancing_capital_case');
assert.equal(createOp?.work_object?.status, 'in_progress');
for (const row of [open,bank,rework,board,aftermath]) assert.deepEqual(row.work_context?.object_ids, [OBJECT], `${row.id}: same persistent object required`);
assert.equal(bank.work_context.handoff_to_actor_id, 'bankkontakt');
assert.equal(bank.work_context.waiting_for_actor_id, 'bankkontakt');
assert.equal(bank.work_context.rework_of_scene_id, open.id);
assert.ok(allChoiceOps(bank).some(op => op.op === 'transition' && op.to_status === 'waiting' && op.to_phase === 'awaiting_bank_credit_review'));
assert.equal(rework.work_context.rework_of_scene_id, bank.id);
assert.ok(allChoiceOps(rework).some(op => op.op === 'transition' && op.to_status === 'in_progress' && op.to_phase === 'rate_and_covenant_rework'));
assert.equal(board.work_context.handoff_to_actor_id, 'styreleder');
assert.equal(board.work_context.waiting_for_actor_id, 'styreleder');
assert.equal(board.work_context.rework_of_scene_id, rework.id);
assert.ok(allChoiceOps(board).some(op => op.op === 'transition' && op.to_status === 'waiting' && op.to_phase === 'awaiting_board_decision'));
assert.equal(aftermath.work_context.rework_of_scene_id, board.id);
assert.ok(allChoiceOps(aftermath).some(op => op.op === 'transition' && op.to_status === 'closed' && op.to_phase === 'board_decision_recorded'));

const standings = [open,bank,rework,board,aftermath].flatMap(allStanding);
assert.ok(standings.length >= 10, 'Finance Director rollout needs repeated audience-specific standing effects');
for (const op of standings) {
  assert.match(op.audience_id, /^(manager|professional):[a-z0-9_-]+$/);
  assert.ok(String(op.reason || '').length >= 70, `${op.event_id}: standing reason must be explanatory`);
}
for (const audience of ['manager:nora_daglig_leder','professional:bankkontakt','professional:styreleder']) assert.ok(standings.some(op => op.audience_id === audience), `Missing situated standing audience ${audience}`);
for (const row of [open,bank,rework,board,aftermath]) for (const option of row.choices || []) assert.equal(option.authority_action, undefined, `${row.id}: standing/work flow must not manufacture authority actions`);

const grammar = readJson('data/Civication/workGrammars/naeringsliv/finansdirektor.json');
assert.ok((grammar.authority_boundary?.may || []).some(text => /forhandle|anbefal/i.test(text)), 'Finance Director must retain negotiation/recommendation authority');
assert.ok((grammar.authority_boundary?.may_not || []).some(text => /signere|love finansiering|kapitalforpliktelser/i.test(text)), 'Binding-capital authority boundary must remain explicit');
assert.ok((grammar.authority_boundary?.may_not || []).some(text => /fullmakt/i.test(text)), 'Necessary mandate must remain explicit');

const plan = readJson('data/Civication/mailPlans/naeringsliv/finansdirektor_plan.json');
assert.equal(plan.sequence.length, 13, 'Finance Director rollout extends the existing 8-step plan to 13');
assert.deepEqual(plan.sequence.slice(-5).map(step => step.type), ['job','people','event','followup','consequence']);
assert.deepEqual(plan.sequence.slice(-5).map(step => step.allowed_families[0]), [
  'role_world_rollout_finansdirektor_case_open','role_world_rollout_finansdirektor_bank_handoff','role_world_rollout_finansdirektor_rate_rework','role_world_rollout_finansdirektor_board_wait','role_world_rollout_finansdirektor_board_aftermath'
]);

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'naeringsliv' && row.role_scope === 'finansdirektor' && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_NAERINGSLIV_FINANSDIREKTOR_ROLE_WORLD_ROLLOUT.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career, 'Career matrix must retain Finance Director');
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
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 14, 'Finance Director must increase completed/pilot count');
assert.ok(readiness.summary?.rollout_queue_roles <= 71, 'Finance Director must leave the controlled rollout queue');
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY), 'Finance Director must be removed from rollout queue');
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: naeringsliv/finansdirektor');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot, 'Finance Director readiness row must recognize registered Role World');

console.log('✓ Næringsliv Finansdirektør Role World rollout contract is complete and fail-closed');
