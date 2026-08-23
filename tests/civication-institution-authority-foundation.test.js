#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/Civication/sceneContractV1.schema.json'), 'utf8'));
const compilerPath = path.join(ROOT, 'scripts/build-civication-scene-registry.mjs');
const workWorldFactory = require(path.join(ROOT, 'js/Civication/core/civicationWorkWorld.js'));
const authority = require(path.join(ROOT, 'js/Civication/core/civicationInstitutionAuthority.js'));
const dayConsequencesSource = fs.readFileSync(path.join(ROOT, 'js/Civication/systems/day/dayConsequences.js'), 'utf8');

assert.equal(schema.properties.authority_context.$ref, '#/$defs/authorityContext');
assert.equal(schema.$defs.choice.properties.authority_action.$ref, '#/$defs/authorityAction');
assert.equal(schema.$defs.authorityContext.additionalProperties, false);
assert.equal(schema.$defs.authorityRule.additionalProperties, false);
assert.equal(schema.$defs.authorityAction.additionalProperties, false);

function deepMerge(target, source) {
  const out = { ...(target || {}) };
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) out[key] = deepMerge(out[key] || {}, value);
    else out[key] = value;
  }
  return out;
}

function makeFakeState(initial = {}) {
  let state = JSON.parse(JSON.stringify(initial));
  return {
    getState() { return JSON.parse(JSON.stringify(state)); },
    setState(patch) {
      state = deepMerge(state, patch || {});
      return JSON.parse(JSON.stringify(state));
    },
    getActivePosition() { return { career_id: 'foundation', role_scope: 'foundation_role' }; },
    getMailBranchState() { return { preferred_types: [], preferred_families: [], flags: [] }; },
    setMailBranchState(next) { state.mail_branch_state = next; return next; },
    snapshot() { return JSON.parse(JSON.stringify(state)); }
  };
}

function authorityContext() {
  return {
    institution_id: 'foundation_institution',
    unit_id: 'foundation_unit',
    role_scope: 'foundation_role',
    reporting_line: ['foundation_leader'],
    peer_functions: ['foundation_peer'],
    external_counterparts: ['foundation_public'],
    goals_pressures: ['foundation_deadline_pressure'],
    approval_points: [{
      approval_id: 'release_approval',
      action_id: 'release_material',
      approver_actor_id: 'foundation_leader',
      approval_object_id: 'release_approval_case'
    }],
    authority_rules: [{
      action_id: 'release_material',
      authority: 'approval_required',
      approval_id: 'release_approval',
      escalation_id: 'release_escalation',
      requires_resources: ['review_capacity']
    }, {
      action_id: 'professional_recommendation',
      authority: 'influence_only',
      requires_resources: []
    }],
    resources: [{
      resource_id: 'review_capacity',
      baseline_state: 'available',
      resource_object_id: 'review_capacity_case'
    }],
    escalation_paths: [{
      escalation_id: 'release_escalation',
      action_id: 'release_material',
      target_actor_id: 'foundation_leader',
      escalation_object_id: 'release_escalation_case'
    }]
  };
}

function approvalCreateOp() {
  return {
    op: 'create',
    event_id: 'release_approval_requested',
    work_object: {
      work_object_id: 'release_approval_case',
      kind: 'approval',
      role_scope: 'foundation_role',
      institution_id: 'foundation_institution',
      title: 'Approval for release',
      status: 'pending',
      phase: 'manager_review',
      people_refs: ['foundation_leader'],
      place_refs: [],
      knowledge_refs: [],
      open_questions: [],
      flags: [],
      shared: true
    }
  };
}

async function proveCompilerContract() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'civi-authority-foundation-'));
  const sourceDir = path.join(tempRoot, 'data/Civication/mailFamilies/foundation/job');
  fs.mkdirSync(sourceDir, { recursive: true });
  const sourcePath = path.join(sourceDir, 'foundation_role_job.json');
  const catalog = {
    schema: 'civication_mail_family_catalog_v1',
    version: 1,
    category: 'foundation',
    role_scope: 'foundation_role',
    mail_type: 'job',
    families: [{
      id: 'foundation_authority_family',
      mails: [{
        id: 'foundation_authority_scene',
        subject: 'Authority boundary',
        summary: 'A professional decision needs a real approval path.',
        situation: ['You can prepare the professional basis, but a leader owns the formal release decision.'],
        work_context: {
          object_ids: ['foundation_case'],
          institution_id: 'foundation_institution'
        },
        authority_context: authorityContext(),
        choices: [{
          id: 'request_approval',
          label: 'Send to manager for approval',
          effect: 1,
          authority_action: { action_id: 'release_material', intent: 'request_approval' },
          effects: { work_object_ops: [approvalCreateOp()] }
        }, {
          id: 'recommend',
          label: 'Write the professional recommendation',
          effect: 1,
          authority_action: { action_id: 'professional_recommendation', intent: 'recommend' },
          effects: {}
        }]
      }]
    }]
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(catalog, null, 2)}\n`);
  const compiler = await import(`${pathToFileURL(compilerPath).href}?authority-foundation=${Date.now()}`);
  const registry = await compiler.compileRegistryFromRepo(tempRoot);
  assert.equal(registry.entries.length, 1);
  const entry = registry.entries[0];
  assert.deepEqual(entry.scene.authority_context, authorityContext());
  assert.deepEqual(entry.scene.choices[0].authority_action, { action_id: 'release_material', intent: 'request_approval' });
  assert.deepEqual(entry.compatibility_projection.authority_context, entry.scene.authority_context);
  assert.deepEqual(entry.compatibility_projection.choices[0].authority_action, entry.scene.choices[0].authority_action);

  const invalid = JSON.parse(JSON.stringify(catalog));
  invalid.families[0].mails[0].choices[0].effects.work_object_ops = [];
  fs.writeFileSync(sourcePath, `${JSON.stringify(invalid, null, 2)}\n`);
  await assert.rejects(
    () => compiler.compileRegistryFromRepo(tempRoot),
    /request_approval.*pending approval-work-object/i
  );
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

async function proveRuntimeGate() {
  const state = makeFakeState({ score: 7 });
  const workWorld = workWorldFactory.createAdapter(state);
  let handler = null;
  let middleware = null;
  let middlewarePriority = null;
  const fakeWindow = {
    CivicationState: state,
    CivicationWorkWorldFactory: workWorldFactory,
    CivicationWorkWorld: workWorld,
    CivicationInstitutionAuthority: authority,
    CivicationChoiceDirector: {
      registerHandler(name, fn) { if (name === 'dayConsequences') handler = fn; return true; },
      registerAnswerMiddleware(name, fn, priority) {
        if (name === 'institutionAuthority') { middleware = fn; middlewarePriority = priority; }
        return true;
      }
    },
    dispatchEvent() {}
  };
  const sandbox = {
    window: fakeWindow,
    document: { readyState: 'complete' },
    Event: function Event(type) { this.type = type; },
    console,
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(dayConsequencesSource, sandbox, { filename: 'dayConsequences.js' });
  assert.equal(typeof handler, 'function');
  assert.equal(typeof middleware, 'function');
  assert.equal(middlewarePriority, 25, 'authority must run after choice contract and before EventEngine commit');

  const eventObj = {
    id: 'runtime_authority_scene',
    authority_context: authorityContext(),
    choices: [{
      id: 'execute',
      authority_action: { action_id: 'release_material', intent: 'execute' },
      effects: {}
    }, {
      id: 'request',
      authority_action: { action_id: 'release_material', intent: 'request_approval' },
      effects: { work_object_ops: [approvalCreateOp()] }
    }, {
      id: 'wait',
      authority_action: { action_id: 'release_material', intent: 'wait' },
      effects: {}
    }]
  };

  let terminalCalls = 0;
  const blocked = await middleware({ eventObj, choiceId: 'execute' }, async () => {
    terminalCalls += 1;
    return { ok: true };
  });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, 'authority_blocked');
  assert.equal(blocked.authority.reason, 'approval_required');
  assert.equal(terminalCalls, 0, 'blocked authority choice must not reach EventEngine');

  const requestAllowed = await middleware({ eventObj, choiceId: 'request' }, async () => {
    terminalCalls += 1;
    return { ok: true };
  });
  assert.equal(requestAllowed.ok, true);
  assert.equal(requestAllowed.authority.reason, 'approval_request_allowed');
  assert.equal(terminalCalls, 1);

  const requestChoice = eventObj.choices.find((choice) => choice.id === 'request');
  const consequence = await handler({ eventObj, choice: requestChoice, result: { ok: true } });
  assert.equal(consequence.work_world.applied_count, 1);
  assert.equal(workWorld.getWorkObject('release_approval_case').status, 'pending');

  const waiting = await middleware({ eventObj, choiceId: 'wait' }, async () => ({ ok: true }));
  assert.equal(waiting.ok, true);
  assert.equal(waiting.authority.reason, 'waiting_for_approval');

  workWorld.transitionWorkObject('release_approval_case', {
    event_id: 'release_approval_granted',
    to_status: 'granted',
    to_phase: 'approved'
  });
  const executeAllowed = await middleware({ eventObj, choiceId: 'execute' }, async () => ({ ok: true }));
  assert.equal(executeAllowed.ok, true);
  assert.equal(executeAllowed.authority.reason, 'approval_granted');

  workWorld.createWorkObject({
    work_object_id: 'review_capacity_case',
    kind: 'capacity',
    role_scope: 'foundation_role',
    institution_id: 'foundation_institution',
    title: 'Review capacity',
    status: 'unavailable',
    phase: 'capacity',
    people_refs: [], place_refs: [], knowledge_refs: [], open_questions: [], flags: [], shared: true
  }, { event_id: 'review_capacity_unavailable' });
  const capacityBlocked = await middleware({ eventObj, choiceId: 'execute' }, async () => ({ ok: true }));
  assert.equal(capacityBlocked.ok, false);
  assert.equal(capacityBlocked.authority.reason, 'insufficient_capacity');
}

(async () => {
  await proveCompilerContract();
  await proveRuntimeGate();
  console.log('Civication institutional authority foundation: OK');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
