#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const readText = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const standingFactory = require(path.join(root, 'js/Civication/core/civicationSocialStanding.js'));
const roleScope = ['by', 'radgiver', 'plan'].join('_');
const caseId = 'by_radgiver_lillebekk_plan_case_001';
const managerAudience = 'manager:elin_plansjef';
const teamAudience = 'team:lillebekk_planteam';
const sourceAudience = 'source:kilde_ellen';

function catalog(type) {
  return readJson(`data/Civication/mailFamilies/by/${type}/${roleScope}_${type}.json`);
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
    setState(patch) { state = merge(state, patch); return this.getState(); }
  };
}

const eventCatalog = catalog('event');
const followupCatalog = catalog('followup');
const tradeoff = mail(eventCatalog, 'by_radgiver_situated_reputation_tradeoff_001');
const teamFollowup = mail(followupCatalog, 'by_radgiver_situated_team_trust_followup_001');
const managerFollowup = mail(followupCatalog, 'by_radgiver_situated_manager_trust_followup_001');
for (const scene of [tradeoff, teamFollowup, managerFollowup]) assert(scene, 'situated-reputation pilot scene exists');

assert.equal(tradeoff.social_standing_context.reaction_audience_id, managerAudience);
assert.deepEqual(teamFollowup.social_standing_context.requirements, [
  { audience_id: teamAudience, min: 2 },
  { audience_id: managerAudience, max: -1 }
]);
assert.deepEqual(managerFollowup.social_standing_context.requirements, [
  { audience_id: managerAudience, min: 2 },
  { audience_id: teamAudience, max: -2 }
]);

function branch(choiceId) {
  const api = stateApi({ career: { reputation: 70 }, untouched: { sentinel: true } });
  const adapter = standingFactory.createAdapter(api);
  const choice = tradeoff.choices.find(candidate => candidate.id === choiceId);
  const result = adapter.applyOperations(choice.effects.social_standing_ops, {
    scene_id: tradeoff.id,
    choice_id: choiceId,
    at: '2026-08-24T14:00:00.000Z'
  });
  return { api, adapter, choice, result };
}

const teamBranch = branch('A');
assert.equal(teamBranch.adapter.getStanding(teamAudience), 3);
assert.equal(teamBranch.adapter.getStanding(managerAudience), -2);
assert.equal(teamBranch.api.getState().career.reputation, 70, 'situated standing must not rewrite legacy/global reputation');
assert.deepEqual(teamBranch.api.getState().untouched, { sentinel: true });
assert.equal(teamBranch.api.getState().social_standing.history.length, 2);
const repeated = teamBranch.adapter.applyOperations(teamBranch.choice.effects.social_standing_ops, {
  scene_id: tradeoff.id,
  choice_id: 'A',
  at: '2026-08-24T14:05:00.000Z'
});
assert(repeated.every(entry => entry.idempotent === true));
assert.equal(teamBranch.adapter.getStanding(teamAudience), 3, 'stable event IDs make replay idempotent');

const managerBranch = branch('B');
assert.equal(managerBranch.adapter.getStanding(managerAudience), 3);
assert.equal(managerBranch.adapter.getStanding(teamAudience), -3);
assert.equal(managerBranch.api.getState().career.reputation, 70);

const sourceApi = stateApi({ career: { reputation: 70 } });
const sourceAdapter = standingFactory.createAdapter(sourceApi);
sourceAdapter.applyOperations([
  { event_id: 'source_axis_proof', audience_id: sourceAudience, delta: 2, reason: 'kildetillit er situert' }
]);
assert.equal(sourceAdapter.getStanding(sourceAudience), 2, 'source relationships use the same bounded standing contract');
assert.equal(sourceApi.getState().career.reputation, 70, 'source standing cannot rewrite legacy/global reputation');

const teamCandidates = standingFactory.evaluateCandidates(
  [teamFollowup, managerFollowup],
  teamBranch.api.getState()
);
assert.deepEqual(teamCandidates.map(scene => scene.id), [teamFollowup.id]);
assert.equal(teamCandidates.__social_standing_blocked_count, 1);
const managerCandidates = standingFactory.evaluateCandidates(
  [teamFollowup, managerFollowup],
  managerBranch.api.getState()
);
assert.deepEqual(managerCandidates.map(scene => scene.id), [managerFollowup.id]);
assert.equal(managerCandidates.__social_standing_blocked_count, 1);

const invalidApi = stateApi({ career: { reputation: 70 } });
const invalidAdapter = standingFactory.createAdapter(invalidApi);
assert.throws(() => invalidAdapter.applyOperations([
  { event_id: 'bad_axis', audience_id: 'generic:everyone', delta: 2 }
]), /audience_id er ugyldig/);
assert.deepEqual(invalidApi.getState(), { career: { reputation: 70 } }, 'invalid authored axes fail before state mutation');

// Actual answer handler applies the additive operation through the canonical ChoiceDirector hook.
const consequenceHandlers = {};
const consequenceApi = stateApi({ career: { reputation: 70 } });
const consequenceWindow = {
  CivicationState: {
    ...consequenceApi,
    getActivePosition() { return { role_scope: roleScope, career_id: roleScope }; }
  },
  CivicationSocialStandingFactory: standingFactory,
  CivicationChoiceDirector: {
    registerHandler(name, fn) { consequenceHandlers[name] = fn; },
    registerAnswerMiddleware() {}
  },
  dispatchEvent() {},
  addEventListener() {}
};
vm.runInNewContext(readText('js/Civication/systems/day/dayConsequences.js'), {
  window: consequenceWindow,
  document: { readyState: 'complete', createElement() { return {}; }, head: { appendChild() {} }, documentElement: { appendChild() {} } },
  Event: class Event { constructor(type) { this.type = type; } },
  console,
  setTimeout,
  clearTimeout
});
assert.equal(typeof consequenceHandlers.dayConsequences, 'function');

(async () => {
  const applied = await consequenceHandlers.dayConsequences({
    eventObj: { id: 'standing_handler_proof', choices: [] },
    choice: {
      id: 'A',
      effects: {
        social_standing_ops: [
          { event_id: 'standing_handler_team_delta', audience_id: teamAudience, delta: 2, reason: 'proof' }
        ]
      }
    },
    result: { ok: true }
  });
  assert.equal(applied.social_standing.values[teamAudience], 2);
  assert.equal(consequenceApi.getState().career.reputation, 70);

  // Actual NPC reaction producer resolves the authored audience after consequences run.
  const reactionHandlers = {};
  let dispatched = null;
  const reactionWindow = {
    CivicationState: {
      getState() { return managerBranch.api.getState(); },
      getActivePosition() { return { career_id: roleScope }; }
    },
    CivicationSocialStandingFactory: standingFactory,
    CivicationPeopleEngine: {
      getAvailablePeople() { return [{ id: 'elin_plansjef', name: 'Elin', type: 'manager' }]; }
    },
    CivicationNpcCharacterThreads: { getActiveCharacters() { return []; } },
    CivicationChoiceDirector: { registerHandler(name, fn) { reactionHandlers[name] = fn; } },
    dispatchEvent(event) { dispatched = event; },
    addEventListener() {}
  };
  class CustomEvent {
    constructor(type, options) { this.type = type; this.detail = options.detail; }
  }
  vm.runInNewContext(readText('js/Civication/systems/day/dayNpcReactions.js'), {
    window: reactionWindow,
    document: { readyState: 'complete', addEventListener() {} },
    CustomEvent,
    Event: class Event { constructor(type) { this.type = type; } },
    console,
    Date,
    Math
  });
  const reaction = reactionHandlers.npcReactions({
    eventObj: {
      id: tradeoff.id,
      people_ref: 'elin_plansjef',
      subject: tradeoff.subject,
      mail_family: tradeoff.mail_family,
      social_standing_context: tradeoff.social_standing_context
    },
    choice: managerBranch.choice
  });
  assert.equal(reaction.situatedAudienceId, managerAudience);
  assert.equal(reaction.situatedStanding, 3);
  assert.equal(reaction.situatedStandingBand, 'trusted');
  assert.match(reaction.line, /konkrete relasjonen/);
  assert.equal(dispatched.detail.situatedStanding, 3);

  const schema = readJson('data/Civication/sceneContractV1.schema.json');
  assert(schema.$defs.effects.properties.social_standing_ops);
  assert(schema.$defs.socialStandingContext);
  assert(schema.$defs.socialStandingOp);

  const registry = readJson('data/Civication/compiledSceneRegistryV1.json');
  for (const scene of [tradeoff, teamFollowup, managerFollowup]) {
    const entry = registry.entries.find(candidate => candidate.id === scene.id);
    assert(entry, `${scene.id} compiled`);
    assert.deepEqual(entry.scene.social_standing_context, scene.social_standing_context);
    assert.deepEqual(entry.compatibility_projection.social_standing_context, scene.social_standing_context);
  }
  const compiledTradeoff = registry.entries.find(candidate => candidate.id === tradeoff.id);
  assert.deepEqual(
    compiledTradeoff.scene.choices.find(choice => choice.id === 'A').effects.social_standing_ops,
    teamBranch.choice.effects.social_standing_ops
  );
  assert.deepEqual(
    compiledTradeoff.compatibility_projection.choices.find(choice => choice.id === 'B').effects.social_standing_ops,
    managerBranch.choice.effects.social_standing_ops
  );

  const plan = readJson(`data/Civication/mailPlans/by/${roleScope}_plan.json`);
  assert.deepEqual(plan.sequence.slice(-3).map(step => [step.step, step.allowed_families[0]]), [
    [38, 'role_world_realism_situated_reputation'],
    [39, 'role_world_realism_situated_reputation_response'],
    [40, 'role_world_realism_authority']
  ]);
  const workdaySource = readText('js/Civication/systems/civicationWorkdayMailBuilder.js');
  const dailySource = readText('js/Civication/systems/civicationDailyMailBuilder.js');
  assert.match(workdaySource, /CivicationSocialStandingFactory/);
  assert.match(dailySource, /evaluateSocialStanding/);
  const loader = readText('js/Civication/civicationShellLoader.js');
  assert.equal((loader.match(/civicationSocialStanding\.js/g) || []).length, 2);

  console.log('✓ Situated reputation: bounded audience state → opposing manager/team trust → distinct later scenes → NPC reaction context, without authority or global-score leakage');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
