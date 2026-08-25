#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const workWorldFactory = require(path.join(root, 'js/Civication/core/civicationWorkWorld.js'));
const authority = require(path.join(root, 'js/Civication/core/civicationInstitutionAuthority.js'));
const affordance = require(path.join(root, 'js/Civication/core/civicationChoiceAffordance.js'));

const roleScope = 'by_radgiver_plan';
const caseId = 'by_radgiver_lillebekk_plan_case_001';
const approvalId = 'by_radgiver_lillebekk_approval_001';
const knowledgeMailId = 'by_radgiver_realism_knowledge_radhus_001';

function catalog(type, suffix) {
  return readJson(`data/Civication/mailFamilies/by/${type}/by_radgiver_plan_${type}.json`);
}
function mail(data, id) {
  return data.families.flatMap(f => f.mails || []).find(m => m.id === id);
}
function makeState(initial = {}) {
  let state = JSON.parse(JSON.stringify(initial));
  const deepMerge = (target, patch) => {
    const out = { ...(target || {}) };
    for (const [key, value] of Object.entries(patch || {})) {
      if (value && typeof value === 'object' && !Array.isArray(value)) out[key] = deepMerge(out[key] || {}, value);
      else out[key] = value;
    }
    return out;
  };
  return {
    getState() { return JSON.parse(JSON.stringify(state)); },
    setState(patch) { state = deepMerge(state, patch || {}); return this.getState(); }
  };
}
function applyScene(adapter, scene, choiceId, at) {
  const choice = scene.choices.find(c => c.id === choiceId);
  assert(choice, `${scene.id} choice ${choiceId}`);
  adapter.applyOperations(scene.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
  adapter.applyOperations(choice.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
}

const jobCatalog = catalog('job', 'job');
const eventCatalog = catalog('event', 'event');
const knowledgeCatalog = catalog('knowledge', 'knowledge');
const followupCatalog = catalog('followup', 'followup');
const consequenceCatalog = catalog('consequence', 'consequence');

const openCase = mail(jobCatalog, 'by_radgiver_realism_case_open_001');
const requestApproval = mail(eventCatalog, 'by_radgiver_realism_approval_request_001');
const historyGo = mail(knowledgeCatalog, knowledgeMailId);
const managerGrant = mail(followupCatalog, 'by_radgiver_realism_approval_grant_001');
const returnToCase = mail(consequenceCatalog, 'by_radgiver_realism_return_to_case_001');
const formalSend = mail(eventCatalog, 'by_radgiver_realism_formal_send_001');
for (const scene of [openCase, requestApproval, historyGo, managerGrant, returnToCase, formalSend]) assert(scene, 'all realism pilot scenes exist');

// Same persistent case identity survives the whole vertical.
for (const scene of [openCase, requestApproval, historyGo, managerGrant, returnToCase, formalSend]) {
  assert.deepEqual(scene.work_context.object_ids, [caseId]);
  assert.equal(scene.work_context.institution_id, 'oslo_kommune_planavdeling_001');
}
assert.equal(openCase.effects.work_object_ops[0].work_object.work_object_id, caseId);
assert.equal(openCase.effects.work_object_ops[0].work_object.shared, true);
assert(openCase.effects.work_object_ops[0].work_object.people_refs.includes('hanne_beboer'));
assert(openCase.effects.work_object_ops[0].work_object.people_refs.includes('nora_planjuss'));

// Canonical History Go evidence is real and relevant to the institutional distinction being trained.
const radhus = readJson('data/places/politikk/oslo/places_politikk/oslo_radhus.json');
assert.equal(radhus.id, 'oslo_radhus');
assert(radhus.emne_ids.includes('em_pol_lokaldemokrati'));
assert(radhus.emne_ids.includes('em_pol_byrakrati_forvaltning'));
assert.equal(historyGo.interaction_mode, 'task');
assert.equal(historyGo.task_contract.completion_rule, 'history_go_payload_completed');
assert.equal(historyGo.task_payload.place_id, 'oslo_radhus');
assert.equal(historyGo.task_payload.return_context.role_scope, roleScope);
assert.deepEqual(historyGo.work_context.object_ids, [caseId]);

// Authority contract: recommendation is allowed, formal send is blocked before approval.
assert.equal(requestApproval.authority_context.role_scope, roleScope);
assert.equal(requestApproval.authority_context.reporting_line[0], 'elin_plansjef');
assert(requestApproval.authority_context.peer_functions.includes('nora_planjuss'));
assert(requestApproval.authority_context.external_counterparts.includes('ivar_utbygger'));
assert.equal(requestApproval.authority_context.resources[0].baseline_state, 'limited');
const requestChoice = requestApproval.choices.find(c => c.id === 'A');
assert.equal(requestChoice.authority_action.intent, 'request_approval');
assert.equal(requestChoice.effects.work_object_ops[0].work_object.work_object_id, approvalId);
assert.equal(requestChoice.effects.work_object_ops[0].work_object.status, 'pending');
const escalationChoice = requestApproval.choices.find(c => c.id === 'C');
assert.equal(escalationChoice.authority_action.intent, 'escalate');
assert.equal(escalationChoice.effects.work_object_ops[0].work_object.kind, 'escalation');
assert.equal(escalationChoice.effects.work_object_ops[0].work_object.status, 'open');

const state = makeState({ untouched: { sentinel: true } });
const adapter = workWorldFactory.createAdapter(state);
const executeChoice = formalSend.choices.find(c => c.id === 'A');
const blocked = authority.evaluate(formalSend.authority_context, executeChoice.authority_action, { role_scope: roleScope, work_world: adapter });
assert.equal(blocked.allowed, false);
assert.equal(blocked.reason, 'approval_required');

applyScene(adapter, openCase, 'A', '2026-08-23T08:00:00.000Z');
assert.equal(adapter.getWorkObject(caseId).phase, 'lokalkunnskap_og_teknisk_grunnlag');
applyScene(adapter, requestApproval, 'A', '2026-08-23T10:00:00.000Z');
assert.equal(adapter.getWorkObject(approvalId).status, 'pending');
assert.equal(adapter.getWorkObject(caseId).status, 'awaiting_approval');
const waiting = authority.evaluate(formalSend.authority_context, formalSend.choices.find(c => c.id === 'B').authority_action, { role_scope: roleScope, work_world: adapter });
assert.equal(waiting.allowed, true);
assert.equal(waiting.reason, 'waiting_for_approval');

// History Go learning expands choice space, but only after completion + correct professional application.
const learnedChoice = returnToCase.choices.find(c => c.id === 'C');
assert.deepEqual(learnedChoice.affordance.history_go.task_mail_ids, [knowledgeMailId]);
assert.equal(learnedChoice.effect, 2);
assert(Number(learnedChoice.effect) > Number(returnToCase.choices.find(c => c.id === 'A').effect));
const noTask = { getTaskByMailId() { return null; } };
assert.deepEqual(affordance.availableChoices(returnToCase, noTask).map(c => c.id), ['A', 'B']);
const evidenceOnly = { getTaskByMailId(id) { return id === knowledgeMailId ? { mail_id: id, status: 'open', history_go: { correct: true }, result: null } : null; } };
assert.deepEqual(affordance.availableChoices(returnToCase, evidenceOnly).map(c => c.id), ['A', 'B']);
const learnedTask = { getTaskByMailId(id) { return id === knowledgeMailId ? { mail_id: id, status: 'completed', history_go: { completed_at: '2026-08-23T13:00:00.000Z', correct: true }, result: { effect: 1 } } : null; } };
assert.deepEqual(affordance.availableChoices(returnToCase, learnedTask).map(c => c.id), ['A', 'B', 'C']);

applyScene(adapter, historyGo, 'A', '2026-08-23T13:00:00.000Z');
assert(adapter.getWorkObject(caseId).flags.includes('history_go_myndighetsgrense_anvendt'));
applyScene(adapter, managerGrant, 'A', '2026-08-24T08:00:00.000Z');
assert.equal(adapter.getWorkObject(approvalId).status, 'granted');
assert.equal(adapter.getWorkObject(caseId).status, 'awaiting_submission');
const allowed = authority.evaluate(formalSend.authority_context, executeChoice.authority_action, { role_scope: roleScope, work_world: adapter });
assert.equal(allowed.allowed, true);
assert.equal(allowed.reason, 'approval_granted');
assert.equal(allowed.capacity[0].state, 'limited');

applyScene(adapter, returnToCase, 'C', '2026-08-24T11:00:00.000Z');
const ready = adapter.getWorkObject(caseId);
assert.equal(ready.phase, 'kunnskapsforankret_beslutningsgrunnlag_med_eksplisitt_myndighetsgrense');
assert(ready.flags.includes('lov_fag_politikk_eksplisitt_adskilt'));
assert(!ready.flags.includes('politisk_grense_ikke_eksplisitt'));
applyScene(adapter, formalSend, 'A', '2026-08-24T15:00:00.000Z');
const closed = adapter.getWorkObject(caseId);
assert.equal(closed.status, 'closed');
assert.equal(closed.outcome, 'sendt_til_politisk_behandling_med_sporbart_administrativt_fagspor');
assert.ok(closed.history.length >= 12, 'one work case accumulates cross-scene history including rework/approval/knowledge/send');
assert.deepEqual(state.getState().untouched, { sentinel: true });

// Mail plan owns the actual gameplay ordering; the pilot is not an unreachable data demo.
const plan = readJson('data/Civication/mailPlans/by/by_radgiver_plan_plan.json');
const pilotFamilies = [
  'role_world_realism_lillebekk_case',
  'role_world_realism_authority',
  'role_world_realism_history_go',
  'role_world_realism_approval_followup',
  'role_world_realism_return_to_case'
];
const pilotSteps = plan.sequence.filter(row => (row.allowed_families || []).some(id => pilotFamilies.includes(id)));
assert.equal(pilotSteps.length, 6);
for (let i = 1; i < pilotSteps.length; i += 1) assert(pilotSteps[i - 1].step < pilotSteps[i].step);
assert.equal(pilotSteps[0].allowed_families[0], 'role_world_realism_lillebekk_case');
assert.equal(pilotSteps[1].allowed_families[0], 'role_world_realism_authority');
assert.equal(pilotSteps[2].allowed_families[0], 'role_world_realism_history_go');
assert.equal(pilotSteps[3].allowed_families[0], 'role_world_realism_approval_followup');
assert.equal(pilotSteps[4].allowed_families[0], 'role_world_realism_return_to_case');
assert.equal(pilotSteps[5].allowed_families[0], 'role_world_realism_authority');

// Registry parity proves all shared contracts survive compilation.
const registry = readJson('data/Civication/compiledSceneRegistryV1.json');
for (const scene of [openCase, requestApproval, historyGo, managerGrant, returnToCase, formalSend]) {
  const entry = registry.entries.find(row => row.id === scene.id);
  assert(entry, `${scene.id} compiled`);
  assert.deepEqual(entry.scene.work_context.object_ids, [caseId]);
  assert.deepEqual(entry.compatibility_projection.work_context.object_ids, [caseId]);
}
const compiledAuthority = registry.entries.find(row => row.id === requestApproval.id);
assert.equal(compiledAuthority.scene.authority_context.approval_points[0].approval_object_id, approvalId);
assert.equal(compiledAuthority.compatibility_projection.choices.find(c => c.id === 'A').authority_action.intent, 'request_approval');
const compiledLearning = registry.entries.find(row => row.id === historyGo.id);
assert.equal(compiledLearning.compatibility_projection.task_payload.place_id, 'oslo_radhus');
const compiledReturn = registry.entries.find(row => row.id === returnToCase.id);
assert.deepEqual(compiledReturn.scene.choices.find(c => c.id === 'C').affordance.history_go.task_mail_ids, [knowledgeMailId]);
const compiledSend = registry.entries.find(row => row.id === formalSend.id);
assert.equal(compiledSend.scene.choices.find(c => c.id === 'A').authority_action.intent, 'execute');

console.log('✓ By-rådgiver Role World realism pilot: persistent case → authority/approval → History Go learning → rework/grant → better choice → authorized political handoff');
