'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const KEY = 'naeringsliv/okonomi_og_finanssjef';
const OBJECT = 'naeringsliv_okonomi_finanssjef_liquidity_case_001';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/okonomi_og_finanssjef.json';
const TYPES = ['job','people','story','knowledge','micro','conflict','event','followup','consequence'];
const PREFIX = 'naeringsliv_okonomi_finanssjef_realism_';
const catalogPath = type => `data/Civication/mailFamilies/naeringsliv/${type}/okonomi_og_finanssjef_${type}.json`;
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
assert.equal(world.role_scope, 'okonomi_og_finanssjef');
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
const refs = new Set(world.materialization.source_refs || []);
for (const type of TYPES) assert.ok([...refs].some(ref => ref.startsWith(`${catalogPath(type)}#`)), `Role World provenance must include ${type}`);
for (const ref of refs) {
  const [rel,id] = ref.split('#');
  assert.ok(rel && id && exists(rel), `Invalid or missing materialization ref ${ref}`);
  assert.ok(flattenMails(readJson(rel)).some(row => row.id === id), `Missing materialization id ${ref}`);
}
for (const beat of world.season.coverage) {
  assert.ok(beat.summary.length >= 100, `${beat.day}/${beat.phase} summary must remain substantive`);
  assert.ok(beat.materialization_refs.length >= 1);
  for (const ref of beat.materialization_refs) assert.ok(refs.has(ref));
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
const open = mail('job', PREFIX+'liquidity_case_open_001');
const handoff = mail('people', PREFIX+'controller_handoff_wait_001');
const rework = mail('event', PREFIX+'liquidity_rework_001');
const board = mail('followup', PREFIX+'board_handoff_wait_001');
const aftermath = mail('consequence', PREFIX+'board_aftermath_001');
for (const [name,row] of Object.entries({open,handoff,rework,board,aftermath})) assert.ok(row, `Missing new finance-manager rollout scene ${name}`);
const createOp = (open.effects?.work_object_ops || []).find(op => op.op === 'create');
assert.equal(createOp?.work_object?.work_object_id, OBJECT);
assert.equal(createOp?.work_object?.kind, 'liquidity_and_covenant_case');
assert.equal(createOp?.work_object?.status, 'in_progress');
for (const row of [open,handoff,rework,board,aftermath]) assert.deepEqual(row.work_context?.object_ids, [OBJECT]);
assert.equal(handoff.work_context.handoff_to_actor_id, 'ingrid_controller');
assert.equal(handoff.work_context.waiting_for_actor_id, 'ingrid_controller');
assert.equal(handoff.work_context.rework_of_scene_id, open.id);
assert.ok(allChoiceOps(handoff).some(op => op.op === 'transition' && op.to_status === 'waiting' && op.to_phase === 'awaiting_controller_review'));
assert.equal(rework.work_context.rework_of_scene_id, handoff.id);
assert.ok(allChoiceOps(rework).some(op => op.op === 'transition' && op.to_status === 'in_progress' && op.to_phase === 'liquidity_rework'));
assert.equal(board.work_context.handoff_to_actor_id, 'styreleder');
assert.equal(board.work_context.waiting_for_actor_id, 'styreleder');
assert.equal(board.work_context.rework_of_scene_id, rework.id);
assert.ok(allChoiceOps(board).some(op => op.op === 'transition' && op.to_status === 'waiting' && op.to_phase === 'awaiting_board_decision'));
assert.equal(aftermath.work_context.rework_of_scene_id, board.id);
assert.ok(allChoiceOps(aftermath).some(op => op.op === 'transition' && op.to_status === 'closed' && op.to_phase === 'decision_recorded'));
const standings = [open,handoff,rework,board,aftermath].flatMap(allStanding);
assert.ok(standings.length >= 10);
for (const op of standings) {
  assert.match(op.audience_id, /^(manager|professional):[a-z0-9_-]+$/);
  assert.ok(String(op.reason || '').length >= 70, `${op.event_id}: standing reason must be explanatory`);
}
for (const audience of ['manager:nora_daglig_leder','professional:ingrid_controller','professional:bankkontakt','professional:styreleder']) assert.ok(standings.some(op => op.audience_id === audience), `Missing standing audience ${audience}`);
for (const row of [open,handoff,rework,board,aftermath]) for (const option of row.choices || []) assert.equal(option.authority_action, undefined);
const grammar = readJson('data/Civication/workGrammars/naeringsliv/okonomi_og_finanssjef.json');
assert.ok((grammar.authority_boundary?.may || []).some(text => /prioritere og anbefale kapitalbruk/i.test(text)));
assert.ok((grammar.authority_boundary?.may_not || []).some(text => /godkjenne finansiering, investering eller kapitalbruk/i.test(text)));
assert.ok((grammar.authority_boundary?.may_not || []).some(text => /signere bank- eller eierforpliktelser/i.test(text)));
const plan = readJson('data/Civication/mailPlans/naeringsliv/okonomi_og_finanssjef_plan.json');
assert.equal(plan.sequence.length, 13);
assert.deepEqual(plan.sequence.slice(-5).map(step => step.type), ['job','people','event','followup','consequence']);
assert.deepEqual(plan.sequence.slice(-5).map(step => step.allowed_families[0]), [
  'role_world_rollout_okonomi_finanssjef_case_open',
  'role_world_rollout_okonomi_finanssjef_controller_handoff',
  'role_world_rollout_okonomi_finanssjef_liquidity_rework',
  'role_world_rollout_okonomi_finanssjef_board_wait',
  'role_world_rollout_okonomi_finanssjef_board_aftermath'
]);
const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'naeringsliv' && row.role_scope === 'okonomi_og_finanssjef' && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_NAERINGSLIV_OKONOMI_OG_FINANSSJEF_ROLE_WORLD_ROLLOUT.md'));
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);
assert.equal(career.audit?.components?.mail?.level, 'complete');
for (const type of TYPES) {
  const fam = career.artifacts?.mail_families?.[type];
  assert.equal(fam?.path, catalogPath(type));
  assert.ok(Number(fam?.count || 0) >= 1);
}
const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 15);
assert.ok(readiness.summary?.rollout_queue_roles <= 70);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: naeringsliv/okonomi_og_finanssjef');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const row = (readiness.roles || []).find(item => item.key === KEY);
assert.ok(row?.already_reference_or_pilot);
console.log('✓ Næringsliv Økonomi- og finanssjef Role World rollout contract is complete and fail-closed');
