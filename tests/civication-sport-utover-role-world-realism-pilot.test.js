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
const rhythm = require(path.join(root, 'js/Civication/core/civicationWorkRhythm.js'));
const standingFactory = require(path.join(root, 'js/Civication/core/civicationSocialStanding.js'));

const roleScope = 'sport_utover';
const cycleId = 'sport_utover_microcycle_001';
const approvalId = 'sport_utover_readiness_approval_001';
const historyGoMailId = 'sport_utover_realism_knowledge_bislett_001';
const managerAudience = 'manager:trener_maja';
const professionalAudience = 'professional:fysio_elias';
const teamAudience = 'team:prestasjonstroppen';

function catalog(type) {
  return readJson(`data/Civication/mailFamilies/sport/${type}/sport_utover_${type}.json`);
}
function mail(data, id) {
  return data.families.flatMap(family => family.mails || []).find(entry => entry.id === id);
}
function stateApi(initial = {}) {
  let state = JSON.parse(JSON.stringify(initial));
  const merge = (left, right) => {
    const out = { ...(left || {}) };
    for (const [key, value] of Object.entries(right || {})) {
      out[key] = value && typeof value === 'object' && !Array.isArray(value)
        ? merge(out[key] || {}, value)
        : value;
    }
    return out;
  };
  return {
    getState() { return JSON.parse(JSON.stringify(state)); },
    setState(patch) { state = merge(state, patch || {}); return this.getState(); }
  };
}
function applyScene(workAdapter, standingAdapter, scene, choiceId, at) {
  const choice = scene.choices.find(candidate => candidate.id === choiceId);
  assert(choice, `${scene.id} choice ${choiceId}`);
  workAdapter.applyOperations(scene.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
  workAdapter.applyOperations(choice.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
  standingAdapter.applyOperations(choice.effects?.social_standing_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
  return choice;
}
function branch(bodyChoice) {
  const api = stateApi({ career: { reputation: 70 }, untouched: { sentinel: true } });
  const work = workWorldFactory.createAdapter(api);
  const standing = standingFactory.createAdapter(api);
  applyScene(work, standing, openCycle, 'A', '2026-08-24T08:00:00.000Z');
  applyScene(work, standing, bodySignal, bodyChoice, '2026-08-24T14:00:00.000Z');
  return { api, work, standing };
}

const openCycle = mail(catalog('job'), 'sport_utover_realism_microcycle_open_001');
const eventCatalog = catalog('event');
const bodySignal = mail(eventCatalog, 'sport_utover_realism_body_signal_001');
const finalDecision = mail(eventCatalog, 'sport_utover_realism_competition_decision_001');
const historyGo = mail(catalog('knowledge'), historyGoMailId);
const followupCatalog = catalog('followup');
const assessment = mail(followupCatalog, 'sport_utover_realism_assessment_grant_001');
const professionalFollowup = mail(followupCatalog, 'sport_utover_realism_professional_trust_followup_001');
const teamFollowup = mail(followupCatalog, 'sport_utover_realism_team_trust_followup_001');
const rebuild = mail(catalog('consequence'), 'sport_utover_realism_rebuild_microcycle_001');
const scenes = [openCycle, bodySignal, historyGo, assessment, rebuild, professionalFollowup, teamFollowup, finalDecision];
for (const scene of scenes) assert(scene, 'all sport realism pilot scenes exist');

// One persistent training cycle, not a renamed office case, owns the full vertical.
for (const scene of scenes) {
  assert.deepEqual(scene.work_context.object_ids, [cycleId]);
  assert.equal(scene.work_context.institution_id, 'fjordby_il_prestasjonsgruppe_001');
}
assert.equal(openCycle.effects.work_object_ops[0].work_object.kind, 'training_cycle');
assert.equal(openCycle.effects.work_object_ops[0].work_object.shared, false);
assert.equal(openCycle.effects.work_object_ops[0].work_object.confidentiality, 'utover_og_relevant_stotteapparat');
assert(openCycle.effects.work_object_ops[0].work_object.people_refs.includes('fysio_elias'));
assert(openCycle.effects.work_object_ops[0].work_object.place_refs.includes('bislett_stadion'));

// Canonical History Go evidence is real, while the fictional club remains only the pilot institution.
const bislett = readJson('data/places/sport/europa/norway/oslo_sport/bislett_stadion.json');
const bislettQuiz = readJson('data/quiz/sport/bislett_stadion_sets.json');
const measurementRegistry = readJson('data/fag/sport/measurement_registry_sport_v1.json');
assert.equal(bislett.id, 'bislett_stadion');
assert(Array.isArray(bislettQuiz.sets) && bislettQuiz.sets.length > 0);
assert.equal(measurementRegistry.subject_id, 'sport');
assert.equal(measurementRegistry.type, 'measurement_registry');
assert(measurementRegistry.measurements.length >= 15);
assert.equal(historyGo.interaction_mode, 'task');
assert.equal(historyGo.task_contract.completion_rule, 'history_go_payload_completed');
assert.equal(historyGo.task_payload.place_id, 'bislett_stadion');
assert.equal(historyGo.task_payload.return_context.role_scope, roleScope);
assert(historyGo.task_contract.evidence_refs.includes('data/fag/sport/measurement_registry_sport_v1.json'));

// Authority stays role-correct: the player may report, but cannot self-clear or self-select.
assert.equal(bodySignal.authority_context.role_scope, roleScope);
assert.equal(bodySignal.authority_context.reporting_line[0], 'trener_maja');
assert(bodySignal.authority_context.peer_functions.includes('fysio_elias'));
assert.equal(bodySignal.authority_context.resources[0].baseline_state, 'limited');
assert.equal(finalDecision.authority_context.approval_points[0].approval_object_id, approvalId);
const finalExecute = finalDecision.choices.find(choice => choice.id === 'A');
const emptyState = stateApi();
const emptyWork = workWorldFactory.createAdapter(emptyState);
assert.equal(authority.evaluate(finalDecision.authority_context, finalExecute.authority_action, { role_scope: roleScope, work_world: emptyWork }).reason, 'approval_required');

// Early reporting creates a real waiting/handoff state and opposing situated trust.
const early = branch('A');
assert.equal(early.work.getWorkObject(cycleId).status, 'awaiting_assessment');
assert.equal(early.work.getWorkObject(approvalId).status, 'pending');
assert.equal(early.standing.getStanding(professionalAudience), 3);
assert.equal(early.standing.getStanding(managerAudience), 2);
assert.equal(early.standing.getStanding(teamAudience), -1);
assert.equal(early.api.getState().career.reputation, 70);
assert.deepEqual(early.api.getState().untouched, { sentinel: true });
const waiting = rhythm.evaluateScene(historyGo, early.api.getState(), { day_index: 1, phase: 'evening' });
assert.equal(waiting.eligible, true);
assert.equal(waiting.state, 'waiting');
assert.equal(waiting.waiting_for_actor_id, 'fysio_elias');
assert.equal(rhythm.evaluateScene(bodySignal, early.api.getState()).handoff_to_actor_id, 'fysio_elias');

// Learning expands the later plan choice, but never grants medical or selection authority.
assert.deepEqual(affordance.availableChoices(rebuild, { getTaskByMailId() { return null; } }).map(choice => choice.id), ['A', 'B']);
const completedTask = {
  getTaskByMailId(id) {
    return id === historyGoMailId
      ? { mail_id: id, status: 'completed', history_go: { completed_at: '2026-08-24T18:00:00.000Z', correct: true }, result: { effect: 1 } }
      : null;
  }
};
assert.deepEqual(affordance.availableChoices(rebuild, completedTask).map(choice => choice.id), ['A', 'B', 'C']);
applyScene(early.work, early.standing, historyGo, 'A', '2026-08-24T18:00:00.000Z');
applyScene(early.work, early.standing, assessment, 'A', '2026-08-25T08:00:00.000Z');
assert.equal(early.work.getWorkObject(approvalId).status, 'granted');
assert.equal(early.work.getWorkObject(cycleId).phase, 'restitusjon_og_revidert_belastning');
const reworkReady = rhythm.evaluateScene(rebuild, early.api.getState(), { day_index: 2, phase: 'afternoon' });
assert.equal(reworkReady.eligible, true);
assert.equal(reworkReady.state, 'rework');
assert.equal(authority.evaluate(finalDecision.authority_context, finalExecute.authority_action, { role_scope: roleScope, work_world: early.work }).reason, 'approval_granted');
applyScene(early.work, early.standing, rebuild, 'C', '2026-08-25T14:00:00.000Z');
assert.equal(early.work.getWorkObject(cycleId).status, 'awaiting_competition');
assert(early.work.getWorkObject(cycleId).flags.includes('bislett_kunnskap_anvendt_uten_myndighetsglidning'));

// The two legitimate relational outcomes produce mutually exclusive later scenes.
const earlyCandidates = standingFactory.evaluateCandidates([professionalFollowup, teamFollowup], early.api.getState());
assert.deepEqual(earlyCandidates.map(scene => scene.id), [professionalFollowup.id]);
assert.equal(earlyCandidates.__social_standing_blocked_count, 1);
applyScene(early.work, early.standing, professionalFollowup, 'A', '2026-08-25T15:00:00.000Z');
assert(early.work.getWorkObject(cycleId).flags.includes('faglig_tillit_gir_tidlig_trenddeling'));

const late = branch('B');
assert.equal(late.standing.getStanding(teamAudience), 2);
assert.equal(late.standing.getStanding(managerAudience), -3);
assert.equal(late.standing.getStanding(professionalAudience), -2);
const lateCandidates = standingFactory.evaluateCandidates([professionalFollowup, teamFollowup], late.api.getState());
assert.deepEqual(lateCandidates.map(scene => scene.id), [teamFollowup.id]);
assert.equal(lateCandidates.__social_standing_blocked_count, 1);

// The semantic playthrough closes only after persistent approval and carries the full cross-day history.
applyScene(early.work, early.standing, finalDecision, 'A', '2026-08-27T14:00:00.000Z');
const closed = early.work.getWorkObject(cycleId);
assert.equal(closed.status, 'closed');
assert.equal(closed.outcome, 'konkurranseuke_fullfort_med_sporbart_belastnings_og_beslutningsspor');
assert(closed.history.length >= 11);

// Plan reachability, source→registry parity and role-owned History Go place are permanent.
const plan = readJson('data/Civication/mailPlans/sport/sport_utover_plan.json');
assert.deepEqual(plan.sequence.slice(-7).map(step => [step.step, step.type, step.allowed_families[0]]), [
  [33, 'job', 'role_world_realism_sport_microcycle'],
  [34, 'event', 'role_world_realism_sport_load_decisions'],
  [35, 'knowledge', 'role_world_realism_sport_history_go'],
  [36, 'followup', 'role_world_realism_sport_assessment_return'],
  [37, 'consequence', 'role_world_realism_sport_rebuild_cycle'],
  [38, 'followup', 'role_world_realism_sport_situated_response'],
  [39, 'event', 'role_world_realism_sport_load_decisions']
]);
const registry = readJson('data/Civication/compiledSceneRegistryV1.json');
for (const scene of scenes) {
  const entry = registry.entries.find(candidate => candidate.id === scene.id);
  assert(entry, `${scene.id} compiled`);
  assert.deepEqual(entry.scene.work_context, scene.work_context);
  assert.deepEqual(entry.compatibility_projection.work_context, scene.work_context);
}
const compiledBody = registry.entries.find(entry => entry.id === bodySignal.id);
assert.deepEqual(compiledBody.scene.choices.find(choice => choice.id === 'A').effects.social_standing_ops, bodySignal.choices.find(choice => choice.id === 'A').effects.social_standing_ops);
const compiledRebuild = registry.entries.find(entry => entry.id === rebuild.id);
assert.deepEqual(compiledRebuild.scene.choices.find(choice => choice.id === 'C').affordance.history_go.task_mail_ids, [historyGoMailId]);
const compiledFinal = registry.entries.find(entry => entry.id === finalDecision.id);
assert.equal(compiledFinal.scene.choices.find(choice => choice.id === 'A').authority_action.intent, 'execute');
const model = readJson('data/Civication/roleModels/sport/profesjonell_utover.json');
assert(model.required_knowledge.place_connections.some(place => place.place_id === 'bislett_stadion'));
assert(model.related_places.some(place => place.id === 'bislett_stadion'));
assert.equal(Object.prototype.hasOwnProperty.call(early.api.getState(), 'employment_conditions'), false, 'pilot proves no new employment-state engine is needed');

console.log('✓ Sport-utøver Role World realism pilot: persistent microcycle → body signal/handoff → waiting + Bislett learning → assessed rework/recovery → situated trust → authorized competition decision');
