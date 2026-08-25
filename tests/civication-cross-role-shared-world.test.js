'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const realism = read('data/Civication/roleWorldRealismMatrix.json');
const proof = realism.cross_role_shared_world_proof;
const workWorldFactory = require(path.join(ROOT, 'js/Civication/core/civicationWorkWorld.js'));
const rhythm = require(path.join(ROOT, 'js/Civication/core/civicationWorkRhythm.js'));
const authority = require(path.join(ROOT, 'js/Civication/core/civicationInstitutionAuthority.js'));

assert.ok(proof, 'Matrix must declare the cross-role proof');
assert.equal(proof.status, 'runtime_proven');
assert.equal(proof.owner.category, proof.second_role.category, 'pilot keeps both perspectives inside one institution/domain');
assert.notEqual(proof.owner.role_scope, proof.second_role.role_scope, 'proof requires two distinct canonical role scopes');
assert.ok(proof.work_object_id);
assert.ok(proof.institution_id);

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

function findMail(catalog, sceneId) {
  return (catalog.families || [])
    .flatMap(family => family.mails || [])
    .find(mail => mail.id === sceneId);
}

function applyScene(adapter, scene, choiceId, at) {
  const choice = scene.choices.find(candidate => candidate.id === choiceId);
  assert.ok(choice, `${scene.id}: missing choice ${choiceId}`);
  adapter.applyOperations(scene.effects?.work_object_ops || [], {
    scene_id: scene.id,
    choice_id: choiceId,
    at
  });
  adapter.applyOperations(choice.effects?.work_object_ops || [], {
    scene_id: scene.id,
    choice_id: choiceId,
    at
  });
}

const ownerCatalog = read(proof.source_refs.owner_catalog);
const secondCatalog = read(proof.source_refs.second_role_catalog);
const secondPlan = read(proof.source_refs.second_role_plan);
const ownerOpen = findMail(ownerCatalog, proof.scene_ids.owner_open);
const secondReview = findMail(secondCatalog, proof.scene_ids.second_role_review);
assert.ok(ownerOpen, 'owner opening scene must exist');
assert.ok(secondReview, 'second-role review scene must exist');
assert.equal(ownerOpen.role_scope, proof.owner.role_scope);
assert.equal(secondReview.role_scope, proof.second_role.role_scope);
assert.deepEqual(secondReview.work_context.object_ids, [proof.work_object_id]);
assert.equal(secondReview.work_context.institution_id, proof.institution_id);
assert.equal(secondReview.work_context.rework_of_scene_id, ownerOpen.id);
assert.ok(secondPlan.sequence.some(step => (step.allowed_families || []).includes(secondReview.mail_family)), 'second-role plan must route the shared scene');

const directChoices = proof.authority_contract.direct_choice_ids.map(id => secondReview.choices.find(choice => choice.id === id));
assert.ok(directChoices.every(Boolean), 'all direct cross-role choices must exist');
const forbiddenActionId = proof.authority_contract.forbidden_action_id;
const forbiddenRule = secondReview.authority_context.authority_rules.find(rule => rule.action_id === forbiddenActionId);
assert.ok(forbiddenRule, 'forbidden evidentiary-overwrite authority rule must exist');
assert.equal(forbiddenRule.authority, 'forbidden');
assert.ok(
  secondReview.choices.every(choice => choice.authority_action?.action_id !== forbiddenActionId),
  'a forbidden authority action must never be exposed as an executable authored choice'
);

for (const directChoice of directChoices) {
  const api = stateApi();
  const adapter = workWorldFactory.createAdapter(api);

  const beforeOwner = rhythm.evaluateScene(secondReview, api.getState(), { day_index: 1, phase: 'morning' });
  assert.equal(beforeOwner.eligible, false, 'second role cannot see a shared-case review before the owner created the case');
  assert.equal(beforeOwner.reason, 'rework_scene_missing');

  applyScene(adapter, ownerOpen, proof.owner_open_choice_id, '2026-08-25T06:00:00.000Z');
  const ownerObject = adapter.getWorkObject(proof.work_object_id);
  assert.ok(ownerObject, 'owner scene creates the persistent work object');
  assert.equal(ownerObject.role_scope, proof.owner.role_scope);
  assert.equal(ownerObject.shared, false, 'object starts role-owned and becomes shared only at the explicit cross-role handoff');

  const ready = rhythm.evaluateScene(secondReview, api.getState(), { day_index: 1, phase: 'morning' });
  assert.equal(ready.eligible, true, 'owner history makes the second-role perspective reachable');
  assert.equal(ready.state, 'rework');

  const allowed = authority.evaluate(secondReview.authority_context, directChoice.authority_action, {
    role_scope: proof.second_role.role_scope,
    work_world: adapter
  });
  assert.equal(allowed.allowed, true, `${directChoice.id}: second role has its authored direct authority`);
  assert.equal(allowed.reason, 'direct_authority');

  const leaked = authority.evaluate(secondReview.authority_context, directChoice.authority_action, {
    role_scope: proof.owner.role_scope,
    work_world: adapter
  });
  assert.equal(leaked.allowed, false, `${directChoice.id}: owner role must not inherit second-role authority`);
  assert.equal(leaked.reason, 'role_scope_mismatch');

  const forbidden = authority.evaluate(secondReview.authority_context, {
    action_id: forbiddenActionId,
    intent: 'execute'
  }, {
    role_scope: proof.second_role.role_scope,
    work_world: adapter
  });
  assert.equal(forbidden.allowed, false, 'even the leader role cannot convert hierarchy into evidentiary truth');
  assert.equal(forbidden.reason, 'forbidden_action');

  applyScene(adapter, secondReview, directChoice.id, '2026-08-25T07:00:00.000Z');
  const sharedObject = adapter.getWorkObject(proof.work_object_id);
  const world = adapter.getWorldState();
  assert.equal(sharedObject.shared, true, 'cross-role handoff marks the existing object shared');
  assert.equal(sharedObject.role_scope, proof.owner.role_scope, 'sharing must not rewrite canonical ownership');
  assert.ok(world.shared_object_ids.includes(proof.work_object_id), 'shared index exposes the same object across perspectives');
  assert.ok((world.role_object_ids[proof.owner.role_scope] || []).includes(proof.work_object_id), 'owner index remains intact');
  assert.ok(!(world.role_object_ids[proof.second_role.role_scope] || []).includes(proof.work_object_id), 'second role receives a lens, not ownership by mutation');

  const sceneHistory = new Set((sharedObject.history || []).map(event => event.scene_id).filter(Boolean));
  assert.ok(sceneHistory.has(ownerOpen.id), 'same object remembers the owner scene');
  assert.ok(sceneHistory.has(secondReview.id), 'same object remembers the second-role scene');
  assert.deepEqual(adapter.resolveWorkContext(secondReview.work_context).missing_object_ids, []);
}

const registry = read('data/Civication/compiledSceneRegistryV1.json');
for (const [sceneId, roleScope, sourcePath] of [
  [ownerOpen.id, proof.owner.role_scope, proof.source_refs.owner_catalog],
  [secondReview.id, proof.second_role.role_scope, proof.source_refs.second_role_catalog]
]) {
  const entry = registry.entries.find(candidate => candidate.id === sceneId);
  assert.ok(entry, `compiled registry missing ${sceneId}`);
  assert.equal(entry.role_scope, roleScope);
  assert.equal(entry.source_path, sourcePath);
  assert.equal(entry.scene.work_context?.institution_id, proof.institution_id);
}

assert.equal(realism.semantics.broad_rollout_allowed, false, 'cross-role proof does not silently open broad rollout');
assert.equal(realism.program_level_proofs.cross_role_links.status, 'runtime_proven');
assert.ok(realism.program_level_proofs.cross_role_links.evidence_refs.includes('tests/civication-cross-role-shared-world.test.js'));

console.log('PASS: one persistent work object is experienced by two role scopes with different authority and no ownership or privilege leakage.');
