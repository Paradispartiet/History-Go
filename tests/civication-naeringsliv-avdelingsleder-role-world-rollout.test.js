#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const ROLE = 'avdelingsleder';
const KEY = 'naeringsliv/avdelingsleder';
const OBJECT = 'naeringsliv_avdelingsleder_capacity_case_001';
const THREAD = 'naeringsliv_avdelingsleder_capacity_realism_001';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/avdelingsleder.json';
const PREFIX = 'naeringsliv_avdelingsleder_realism_';
const TYPES = ['job','people','story','knowledge','micro','conflict','event','followup','consequence'];
const EXPECTED_THEMES = ['professional_culture','emotional_labor','social_mask','shame_reputation','loyalty_up_down','care_vs_efficiency','status_anxiety','bureaucratic_power'];
const EXPECTED_AUDIENCES = [
  'manager:inger_overordnet_leder',
  'professional:rana_teamkoordinator',
  'professional:mads_sidestilt_avdelingsleder',
  'professional:oyvind_okonomicontroller',
  'team:avdelingsleder_team'
];
const catalogPath = type => `data/Civication/mailFamilies/naeringsliv/${type}/avdelingsleder_${type}.json`;

const world = read(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'naeringsliv');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.match(world.sociological_core.main_problem, /standing|myndighet|hverdagsmakt/i);
assert.deepEqual(world.theme_ids, EXPECTED_THEMES);
assert.equal(world.materialization.no_new_runtime, true);

const bank = read('data/Civication/roleWorldThemeBank.json');
const bankIds = new Set(bank.themes.map(theme => theme.id));
for (const theme of world.theme_ids) assert.ok(bankIds.has(theme), `unknown theme ${theme}`);
assert.deepEqual(bank.reference_profiles[KEY], EXPECTED_THEMES);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok(checklist.reference_worlds.includes(WORLD_PATH));
assert.equal(checklist.principles.new_runtime_forbidden, true);
assert.equal(checklist.principles.new_parallel_scene_format_forbidden, true);

const index = read('data/Civication/roleWorlds/index.json');
const indexRows = index.roles.filter(row => row.category === 'naeringsliv' && row.role_scope === ROLE);
assert.equal(indexRows.length, 1);
assert.equal(indexRows[0].status, 'role_world_complete');
assert.equal(indexRows[0].path, WORLD_PATH);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const beatRefs = new Set();
const summaries = new Set();
for (const beat of world.season.coverage) {
  const ref = `${beat.day}/${beat.phase}`;
  assert.ok(!beatRefs.has(ref), `duplicate beat ${ref}`);
  beatRefs.add(ref);
  assert.ok(beat.summary.length >= 220, `${ref} summary too shallow`);
  assert.ok(!summaries.has(beat.summary), `${ref} summary must be unique`);
  summaries.add(beat.summary);
  assert.ok(Array.isArray(beat.thread_ids) && beat.thread_ids.length >= 1);
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
}
for (let day = 1; day <= 14; day += 1) {
  for (const phase of world.season.day_phases) assert.ok(beatRefs.has(`${day}/${phase}`), `missing ${day}/${phase}`);
}
assert.equal(summaries.size, 56);

assert.ok(world.social_environments.length >= 7);
assert.equal(world.recurring_people_archetypes.length, 8);
const requiredPersonFields = ['id','social_function','class_position','status','power_over_player','wants','conceals','speech_style','teaches_player'];
for (const person of world.recurring_people_archetypes) {
  for (const field of requiredPersonFields) assert.ok(String(person[field] || '').length >= 15, `${person.id}/${field}`);
}
assert.equal(world.slow_axes.length, 8);
assert.ok(world.slow_axes.filter(axis => axis.runtime_binding === 'existing').length >= 6);
assert.ok(world.slow_axes.filter(axis => axis.runtime_binding === 'editorial_only_until_governed').length >= 2);

assert.equal(world.primary_threads.length, 5);
const threadIds = new Set(world.primary_threads.map(thread => thread.id));
for (const thread of world.primary_threads) {
  assert.ok(thread.relationship.length >= 120, `${thread.id} relationship too shallow`);
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const ref of thread.beat_refs) assert.ok(beatRefs.has(ref), `${thread.id} invalid beat ${ref}`);
}
for (const beat of world.season.coverage) {
  for (const threadId of beat.thread_ids) assert.ok(threadIds.has(threadId), `unknown thread ${threadId}`);
}
assert.equal(world.private_aftermath.length, 4);
assert.equal(world.delayed_consequences.length, 8);
const phaseOrder = new Map(world.season.day_phases.map((phase,index) => [phase,index]));
const ordinal = ref => {
  const [day,phase] = ref.split('/');
  assert.ok(phaseOrder.has(phase), `invalid phase ${phase}`);
  return (Number(day) - 1) * 4 + phaseOrder.get(phase);
};
for (const delayed of world.delayed_consequences) {
  assert.ok(beatRefs.has(delayed.setup_ref));
  assert.ok(beatRefs.has(delayed.return_ref));
  assert.ok(ordinal(delayed.return_ref) > ordinal(delayed.setup_ref), `${delayed.id} must return later`);
  assert.ok(delayed.domains.length >= 2);
}

const mails = new Map();
for (const type of TYPES) {
  const file = catalogPath(type);
  assert.ok(fs.existsSync(path.join(ROOT,file)), `missing canonical ${type} catalog`);
  const catalog = read(file);
  assert.equal(catalog.category, 'naeringsliv');
  assert.equal(catalog.role_scope, ROLE);
  for (const mail of (catalog.families || []).flatMap(family => family.mails || [])) {
    if (!mail.id.startsWith(PREFIX)) continue;
    assert.equal(mail.mail_type, type);
    assert.equal(mail.role_scope, ROLE);
    assert.equal(mail.thread_key, THREAD);
    assert.equal(mail.planned_only, true);
    assert.equal(mail.repeatable, false);
    assert.ok(mail.work_context.object_ids.includes(OBJECT));
    assert.equal(mail.work_context.institution_id, 'naeringsliv_operativ_enhet_001');
    assert.ok(mail.situation.length >= 3);
    assert.ok(mail.summary.length >= 180, `${mail.id} summary too shallow`);
    assert.ok(mail.choices.length >= 2);
    for (const candidate of mail.choices) {
      assert.ok(candidate.feedback.length >= 120, `${mail.id}/${candidate.id} feedback too shallow`);
      assert.ok(candidate.effects?.stats, `${mail.id}/${candidate.id} stats`);
      assert.ok(candidate.effects?.work_object_ops?.length >= 1, `${mail.id}/${candidate.id} work object op`);
      assert.ok(candidate.effects?.social_standing_ops?.length >= 2, `${mail.id}/${candidate.id} situated standing`);
      for (const op of candidate.effects.social_standing_ops) {
        assert.match(op.audience_id, /^(manager|professional|team):/);
        assert.equal(Object.prototype.hasOwnProperty.call(op, 'authority'), false, 'standing op must never grant authority');
        assert.ok(Math.abs(op.delta) >= 1);
        assert.ok(op.reason.length >= 70);
      }
    }
    assert.ok(!mails.has(mail.id), `duplicate rollout scene ${mail.id}`);
    mails.set(mail.id, mail);
  }
}
assert.equal(mails.size, 9, 'Avdelingsleder rollout must materialize one scene for every canonical mail type');
assert.deepEqual(new Set([...mails.values()].map(mail => mail.mail_type)), new Set(TYPES));

const ids = {
  open:PREFIX+'capacity_case_open_001',
  people:PREFIX+'team_handoff_001',
  story:PREFIX+'peer_reputation_split_001',
  knowledge:PREFIX+'history_go_workplace_context_001',
  micro:PREFIX+'standing_pulse_001',
  conflict:PREFIX+'reporting_conflict_001',
  event:PREFIX+'capacity_incident_001',
  followup:PREFIX+'resource_handoff_followup_001',
  close:PREFIX+'capacity_case_close_001'
};
for (const id of Object.values(ids)) assert.ok(mails.has(id), `missing ${id}`);
const open = mails.get(ids.open);
const people = mails.get(ids.people);
const knowledge = mails.get(ids.knowledge);
const event = mails.get(ids.event);
const followup = mails.get(ids.followup);
const close = mails.get(ids.close);

assert.ok(open.effects.work_object_ops.some(op => op.op === 'create' && op.work_object.work_object_id === OBJECT));
assert.equal(people.work_context.handoff_to_actor_id, 'rana_teamkoordinator');
assert.equal(people.work_context.waiting_for_actor_id, 'inger_overordnet_leder');
assert.ok(people.choices.every(candidate => candidate.effects.work_object_ops.some(op => op.to_status === 'waiting')));
assert.equal(knowledge.knowledge_context.authority_grant, false);
assert.equal(knowledge.knowledge_context.place_ref, 'lilleborg_fabrikker');
assert.ok(knowledge.knowledge_context.source_refs.includes('data/Civication/workGrammars/naeringsliv/naeringsliv_operativ_ledelse.json'));
assert.equal(event.work_context.handoff_to_actor_id, 'inger_overordnet_leder');
assert.equal(followup.work_context.handoff_to_actor_id, 'oyvind_okonomicontroller');
assert.ok(close.choices.every(candidate => candidate.effects.work_object_ops.some(op => op.op === 'transition' && op.to_status === 'completed')));

const audiences = new Set();
for (const mail of mails.values()) {
  for (const candidate of mail.choices) {
    for (const op of candidate.effects.social_standing_ops || []) audiences.add(op.audience_id);
  }
}
for (const audience of EXPECTED_AUDIENCES) assert.ok(audiences.has(audience), `missing situated audience ${audience}`);

const rules = new Map(close.authority_context.authority_rules.map(rule => [rule.action_id, rule.authority]));
assert.equal(rules.get('prioritize_work_within_mandate'), 'direct');
assert.equal(rules.get('allocate_daily_work'), 'direct');
assert.equal(rules.get('escalate_capacity_conflict'), 'direct');
assert.equal(rules.get('recommend_resource_adjustment'), 'influence_only');
assert.equal(rules.get('recommend_staffing_plan'), 'influence_only');
assert.equal(rules.get('approve_budget_exception'), 'approval_required');
assert.equal(rules.get('approve_headcount_change'), 'approval_required');
assert.equal(rules.get('approve_formal_personnel_measure'), 'approval_required');
assert.equal(rules.get('hide_safety_or_quality_incident'), 'forbidden');
assert.equal(rules.get('promise_resource_outcome'), 'forbidden');
assert.equal(rules.get('bypass_formal_personnel_process'), 'forbidden');
assert.equal(close.choices[0].authority_action.action_id, 'recommend_resource_adjustment');
assert.equal(close.choices[0].authority_action.intent, 'recommend');
assert.equal(close.choices[1].authority_action.action_id, 'approve_budget_exception');
assert.equal(close.choices[1].authority_action.intent, 'execute');
assert.equal(close.authority_context.escalation_paths.length, 1);
assert.equal(close.authority_context.escalation_paths[0].target_actor_id, 'inger_overordnet_leder');
assert.equal(close.authority_context.authority_rules.find(rule => rule.action_id === 'escalate_capacity_conflict').escalation_id, 'avdelingsleder_capacity_conflict_to_region');

const provenanceUses = new Set();
for (const beat of world.season.coverage) for (const ref of beat.materialization_refs) provenanceUses.add(ref);
for (const aftermath of world.private_aftermath) for (const ref of aftermath.materialization_refs) provenanceUses.add(ref);
for (const ref of world.materialization.source_refs) provenanceUses.add(ref);
assert.equal(world.materialization.source_refs.length, 9);
for (const ref of provenanceUses) {
  const marker = ref.lastIndexOf('#');
  assert.ok(marker > 0, `invalid provenance ${ref}`);
  const file = ref.slice(0,marker);
  const id = ref.slice(marker + 1);
  assert.ok(fs.existsSync(path.join(ROOT,file)), `missing provenance file ${file}`);
  const catalog = read(file);
  assert.ok(catalog.families.flatMap(family => family.mails || []).some(mail => mail.id === id), `missing provenance id ${id}`);
}

const plan = read('data/Civication/mailPlans/naeringsliv/avdelingsleder_plan.json');
assert.equal(plan.sequence.length, 36);
assert.deepEqual(plan.sequence.slice(-9).map(step => step.type), TYPES);
assert.deepEqual(plan.sequence.slice(-9).map(step => step.allowed_families[0]), [...mails.values()].map(mail => mail.mail_family));

const registry = read('data/Civication/compiledSceneRegistryV1.json');
const roleRegistryIds = new Set(registry.role_index[KEY] || []);
for (const id of Object.values(ids)) {
  assert.ok(roleRegistryIds.has(id), `${id} absent from role index`);
  const entry = registry.entries.find(row => row.id === id);
  assert.ok(entry, `${id} absent from registry`);
  assert.equal(entry.role_scope, ROLE);
  assert.equal(entry.compatibility_projection.role_scope, ROLE);
}

const matrix = read('data/Civication/careerGameplayMatrix.json');
const matrixWorld = matrix.worlds.find(row => row.key === KEY);
assert.ok(matrixWorld);
assert.equal(matrixWorld.status, 'playable');
assert.equal(matrixWorld.audit.runtime_gate, true);
assert.equal(matrixWorld.audit.components.mail.level, 'complete');
assert.match(matrixWorld.audit.components.mail.note, /9\/9/);
assert.ok(matrixWorld.artifacts.role_tests.includes('tests/civication-naeringsliv-avdelingsleder-role-world-rollout.test.js'));
for (const type of TYPES) assert.ok(matrixWorld.artifacts.mail_families[type]?.path, `matrix missing ${type} catalog`);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);
assert.ok(!readiness.rollout_queue.some(row => row.key === KEY), 'completed role must leave rollout queue');
assert.ok(!readiness.first_wave_candidates.some(row => row.key === KEY), 'completed role must leave first-wave candidates');
assert.ok(readiness.summary.role_world_complete_or_pilot >= 12);
assert.ok(readiness.summary.rollout_queue_roles <= 73);
assert.notEqual(readiness.gate.next_required_pr, 'Role World rollout: naeringsliv/avdelingsleder');

const grammar = read('data/Civication/workGrammars/naeringsliv/naeringsliv_operativ_ledelse.json');
assert.ok(grammar.authority_boundary.may.includes('prioritere drift innen fullmakt'));
assert.ok(grammar.authority_boundary.may.includes('fordele arbeid'));
assert.ok(grammar.authority_boundary.may_not.includes('ta beslutninger uten fullmakt'));

const sourceText = fs.readFileSync(path.join(ROOT,WORLD_PATH), 'utf8');
assert.ok(!/TODO|TBD|placeholder|lorem ipsum/i.test(sourceText));
console.log('PASS: Næringsliv Avdelingsleder Role World closes situated-reputation debt with audience-specific standing, a persistent capacity case and explicit authority boundaries.');
