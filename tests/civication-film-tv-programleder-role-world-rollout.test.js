#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const ROLE = 'programleder';
const KEY = 'film_tv/programleder';
const OBJECT = 'film_tv_program_live_interview_case_001';
const THREAD = 'film_tv_program_live_interview_realism_001';
const WORLD_PATH = 'data/Civication/roleWorlds/film_tv/programleder.json';
const TYPES = ['job','people','story','knowledge','micro','conflict','event','followup','consequence'];
const EXPECTED_THEMES = ['public_attention','professional_culture','emotional_labor','social_mask','shame_reputation','loyalty_up_down','care_vs_efficiency','public_private_leakage'];
const EXPECTED_AUDIENCES = [
  'manager:ingrid_redaksjonsleder_program',
  'professional:jonas_liveprodusent',
  'professional:amina_researcher_program',
  'professional:thea_gjestekoordinator',
  'team:film_tv_programredaksjon',
  'team:film_tv_programresearch',
  'team:film_tv_programstudio'
];

const world = read(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'film_tv');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.match(world.sociological_core.main_problem, /synlig|publikum|myndighet/i);
assert.deepEqual(world.theme_ids, EXPECTED_THEMES);
assert.equal(world.materialization.no_new_runtime, true);

const bank = read('data/Civication/roleWorldThemeBank.json');
const bankIds = new Set(bank.themes.map(theme => theme.id));
for (const theme of world.theme_ids) assert.ok(bankIds.has(theme), 'unknown theme ' + theme);
assert.deepEqual(bank.reference_profiles[KEY], EXPECTED_THEMES);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok(checklist.reference_worlds.includes(WORLD_PATH));
assert.equal(checklist.principles.new_runtime_forbidden, true);
assert.equal(checklist.principles.new_parallel_scene_format_forbidden, true);

const index = read('data/Civication/roleWorlds/index.json');
assert.equal(index.status, 'ten_role_worlds_materialized');
assert.equal(index.roles.filter(row => row.category === 'film_tv' && row.role_scope === ROLE).length, 1);
assert.equal(index.roles.find(row => row.category === 'film_tv' && row.role_scope === ROLE).status, 'role_world_complete');

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const beatRefs = new Set();
const summaries = new Set();
for (const beat of world.season.coverage) {
  const ref = beat.day + '/' + beat.phase;
  assert.ok(!beatRefs.has(ref), 'duplicate beat ' + ref);
  beatRefs.add(ref);
  assert.ok(beat.summary.length >= 180, ref + ' summary too shallow');
  assert.ok(!summaries.has(beat.summary), ref + ' summary must be unique');
  summaries.add(beat.summary);
  assert.ok(Array.isArray(beat.thread_ids) && beat.thread_ids.length >= 1);
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
}
for (let day = 1; day <= 14; day += 1) {
  for (const phase of world.season.day_phases) assert.ok(beatRefs.has(day + '/' + phase));
}
assert.equal(summaries.size, 56);

assert.ok(world.social_environments.length >= 7);
assert.equal(world.recurring_people_archetypes.length, 8);
const requiredPersonFields = ['id','social_function','class_position','status','power_over_player','wants','conceals','speech_style','teaches_player'];
for (const person of world.recurring_people_archetypes) {
  for (const field of requiredPersonFields) assert.ok(String(person[field] || '').length >= 15, person.id + '/' + field);
}
assert.equal(world.slow_axes.length, 8);
assert.ok(world.slow_axes.filter(axis => axis.runtime_binding === 'existing').length >= 6);
assert.ok(world.slow_axes.filter(axis => axis.runtime_binding === 'editorial_only_until_governed').length >= 2);

assert.equal(world.primary_threads.length, 5);
const threadIds = new Set(world.primary_threads.map(thread => thread.id));
for (const thread of world.primary_threads) {
  assert.ok(thread.relationship.length >= 100, thread.id + ' relationship too shallow');
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const ref of thread.beat_refs) assert.ok(beatRefs.has(ref), thread.id + ' invalid beat ' + ref);
}
for (const beat of world.season.coverage) {
  for (const threadId of beat.thread_ids) assert.ok(threadIds.has(threadId), 'unknown thread ' + threadId);
}

assert.equal(world.private_aftermath.length, 4);
assert.equal(world.delayed_consequences.length, 8);
const phaseOrder = new Map(world.season.day_phases.map((phase,index) => [phase,index]));
const ordinal = ref => {
  const [day,phase] = ref.split('/');
  assert.ok(phaseOrder.has(phase), 'invalid phase ' + phase);
  return (Number(day) - 1) * 4 + phaseOrder.get(phase);
};
for (const delayed of world.delayed_consequences) {
  assert.ok(beatRefs.has(delayed.setup_ref));
  assert.ok(beatRefs.has(delayed.return_ref));
  assert.ok(ordinal(delayed.return_ref) > ordinal(delayed.setup_ref), delayed.id + ' must return later');
  assert.ok(delayed.domains.length >= 2);
}

const catalogPaths = Object.fromEntries(TYPES.map(type => [
  type,
  'data/Civication/mailFamilies/film_tv/' + type + '/programleder_' + type + '.json'
]));
const mails = new Map();
for (const [type,file] of Object.entries(catalogPaths)) {
  const catalog = read(file);
  for (const mail of catalog.families.flatMap(family => family.mails || [])) {
    if (!mail.id.startsWith('film_tv_program_realism_')) continue;
    assert.equal(mail.mail_type, type);
    assert.equal(mail.role_scope, ROLE);
    assert.equal(mail.thread_key, THREAD);
    assert.equal(mail.planned_only, true);
    assert.equal(mail.repeatable, false);
    assert.ok(mail.work_context.object_ids.includes(OBJECT));
    assert.ok(mail.situation.length >= 3);
    assert.ok(mail.summary.length >= 150);
    assert.ok(mail.choices.length >= 2);
    for (const candidate of mail.choices) {
      assert.ok(candidate.feedback.length >= 80, mail.id + '/' + candidate.id + ' feedback');
      assert.ok(candidate.effects?.stats, mail.id + '/' + candidate.id + ' stats');
      assert.ok(candidate.effects?.work_object_ops?.length >= 1, mail.id + '/' + candidate.id + ' work object');
      assert.ok(candidate.effects?.social_standing_ops?.length >= 2, mail.id + '/' + candidate.id + ' standing');
    }
    assert.ok(!mails.has(mail.id), 'duplicate realism scene ' + mail.id);
    mails.set(mail.id, mail);
  }
}
assert.equal(mails.size, 9, 'Programleder rollout must materialize one realism scene for every canonical mail type');
assert.deepEqual(new Set([...mails.values()].map(mail => mail.mail_type)), new Set(TYPES));

const ids = {
  open:'film_tv_program_realism_live_interview_case_open_001',
  handoff:'film_tv_program_realism_guest_boundary_handoff_001',
  story:'film_tv_program_realism_guest_waiting_disclosure_001',
  knowledge:'film_tv_program_realism_history_go_bang_hansen_waiting_001',
  micro:'film_tv_program_realism_fact_card_rework_001',
  conflict:'film_tv_program_realism_editorial_premise_rework_001',
  event:'film_tv_program_realism_live_gap_event_001',
  followup:'film_tv_program_realism_reuse_boundary_handoff_001',
  close:'film_tv_program_realism_live_interview_case_close_001'
};
for (const id of Object.values(ids)) assert.ok(mails.has(id), 'missing ' + id);
const open = mails.get(ids.open);
const handoff = mails.get(ids.handoff);
const story = mails.get(ids.story);
const knowledge = mails.get(ids.knowledge);
const micro = mails.get(ids.micro);
const conflict = mails.get(ids.conflict);
const event = mails.get(ids.event);
const followup = mails.get(ids.followup);
const close = mails.get(ids.close);

assert.ok(open.effects.work_object_ops.some(op => op.op === 'create' && op.work_object.work_object_id === OBJECT));
assert.equal(handoff.work_context.handoff_to_actor_id, 'thea_gjestekoordinator');
assert.ok(handoff.choices.every(candidate => candidate.effects.work_object_ops.some(op => op.op === 'transition' && op.to_status === 'waiting')));
assert.equal(story.work_context.waiting_for_actor_id, 'thea_gjestekoordinator');
assert.equal(story.work_context.rework_of_scene_id, handoff.id);
assert.equal(knowledge.work_context.waiting_for_actor_id, 'thea_gjestekoordinator');
assert.equal(knowledge.work_context.rework_of_scene_id, handoff.id);
assert.equal(knowledge.interaction_mode, 'task');
assert.equal(knowledge.task_contract.completion_rule, 'history_go_payload_completed');
assert.deepEqual(knowledge.task_contract.evidence_refs, ['data/people/film_tv/oslo/people_film_tv_oslo.json']);
assert.equal(knowledge.task_payload.person_id, 'pal_bang_hansen');
assert.equal(knowledge.task_payload.completion_mode, 'read_profile');
assert.equal(micro.work_context.rework_of_scene_id, knowledge.id);
assert.ok(micro.choices.every(candidate => candidate.effects.work_object_ops.some(op => op.to_phase === 'brief_rework_after_guest_confirmation')));
assert.equal(conflict.work_context.rework_of_scene_id, micro.id);
assert.equal(event.work_context.rework_of_scene_id, conflict.id);
assert.equal(event.work_context.handoff_to_actor_id, 'jonas_liveprodusent');
assert.equal(followup.work_context.rework_of_scene_id, event.id);
assert.equal(followup.work_context.handoff_to_actor_id, 'thea_gjestekoordinator');
assert.equal(close.work_context.rework_of_scene_id, followup.id);
assert.ok(close.choices.every(candidate => candidate.effects.work_object_ops.some(op => op.op === 'transition' && op.to_status === 'completed')));

const audiences = new Set();
for (const mail of mails.values()) {
  for (const candidate of mail.choices) {
    for (const op of candidate.effects.social_standing_ops || []) audiences.add(op.audience_id);
  }
}
for (const audience of EXPECTED_AUDIENCES) assert.ok(audiences.has(audience), 'missing situated audience ' + audience);

const rules = new Map(close.authority_context.authority_rules.map(rule => [rule.action_id, rule.authority]));
assert.equal(rules.get('recommend_interview_readiness'), 'influence_only');
assert.equal(rules.get('recommend_interview_premise'), 'influence_only');
assert.equal(rules.get('approve_editorial_premise'), 'approval_required');
assert.equal(rules.get('approve_publication'), 'approval_required');
assert.equal(rules.get('release_live_rundown'), 'approval_required');
assert.equal(rules.get('expand_sensitive_guest_scope'), 'forbidden');
assert.equal(rules.get('operate_untrained_studio_system'), 'forbidden');
assert.equal(rules.get('promise_editorial_outcome'), 'forbidden');
assert.equal(close.choices[0].authority_action.action_id, 'recommend_interview_readiness');
assert.equal(close.choices[0].authority_action.intent, 'recommend');
assert.equal(close.choices[1].authority_action.action_id, 'approve_publication');

const provenanceUses = new Set();
for (const beat of world.season.coverage) for (const ref of beat.materialization_refs) provenanceUses.add(ref);
for (const aftermath of world.private_aftermath) for (const ref of aftermath.materialization_refs) provenanceUses.add(ref);
for (const ref of world.materialization.source_refs) provenanceUses.add(ref);
assert.equal(world.materialization.source_refs.length, 9);
for (const ref of provenanceUses) {
  const marker = ref.lastIndexOf('#');
  assert.ok(marker > 0, 'invalid provenance ' + ref);
  const file = ref.slice(0,marker);
  const id = ref.slice(marker + 1);
  assert.ok(fs.existsSync(path.join(ROOT,file)), 'missing provenance file ' + file);
  const catalog = read(file);
  assert.ok(catalog.families.flatMap(family => family.mails || []).some(mail => mail.id === id), 'missing provenance id ' + id);
}

const plan = read('data/Civication/mailPlans/film_tv/programleder_plan.json');
assert.equal(plan.sequence.length, 18);
assert.deepEqual(plan.sequence.slice(-9).map(step => step.type), TYPES);
assert.deepEqual(
  plan.sequence.slice(-9).map(step => step.allowed_families[0]),
  [...mails.values()].map(mail => mail.mail_family)
);

const registry = read('data/Civication/compiledSceneRegistryV1.json');
const roleRegistryIds = new Set(registry.role_index[KEY]);
assert.equal(roleRegistryIds.size, 18);
for (const id of Object.values(ids)) {
  assert.ok(roleRegistryIds.has(id), id + ' absent from role index');
  const entry = registry.entries.find(row => row.id === id);
  assert.ok(entry, id + ' absent from registry');
  assert.equal(entry.role_scope, ROLE);
  assert.equal(entry.compatibility_projection.role_scope, ROLE);
}
const compiledKnowledge = registry.entries.find(row => row.id === knowledge.id);
assert.equal(compiledKnowledge.scene.task_contract.task_id, 'film_tv_program_role_world_history_go_bang_hansen');
assert.equal(compiledKnowledge.compatibility_projection.task_payload.person_id, 'pal_bang_hansen');

const matrix = read('data/Civication/careerGameplayMatrix.json');
const matrixWorld = matrix.worlds.find(row => row.key === KEY);
assert.ok(matrixWorld);
assert.equal(matrixWorld.status, 'playable');
assert.equal(matrixWorld.audit.runtime_gate, true);
assert.ok(matrixWorld.artifacts.role_tests.includes('tests/civication-film-tv-programleder-role-world-rollout.test.js'));

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(!readiness.rollout_queue.some(row => row.key === KEY), 'completed role must leave rollout queue');
const readinessRole = readiness.roles.find(row => row.key === KEY);
assert.ok(readinessRole, 'completed role must remain classified by readiness');
assert.equal(readinessRole.runtime_gate, true, 'completed Programleder must keep its runtime gate');
assert.equal(readiness.gate.gate_pass, true, 'program-level readiness gate must remain green');
assert.notEqual(readiness.rollout_queue[0]?.key, KEY, 'completed role cannot return to rollout head');
assert.ok(readiness.summary.role_world_complete_or_pilot >= 11);

const sourceText = fs.readFileSync(path.join(ROOT,WORLD_PATH), 'utf8');
assert.ok(!/TODO|TBD|placeholder|lorem ipsum/i.test(sourceText));
console.log('PASS: Film/TV Programleder Role World materializes one persistent interview case with real waiting, handoff/rework, situated standing, bounded History Go context and explicit authority.');
