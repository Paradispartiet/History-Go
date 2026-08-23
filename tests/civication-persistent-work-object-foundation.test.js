const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const factory = require(path.join(ROOT, 'js/Civication/core/civicationWorkWorld.js'));
const schema = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data/Civication/workWorldStateV1.schema.json'), 'utf8')
);

assert.equal(factory.WORLD_SCHEMA, 'civication_work_world_state_v1');
assert.equal(factory.WORLD_VERSION, 1);
assert.equal(factory.OBJECT_SCHEMA, 'civication_work_object_v1');
assert.equal(factory.OBJECT_VERSION, 1);
assert.equal(factory.SCHEMA_PATH, 'data/Civication/workWorldStateV1.schema.json');
assert.equal(schema.properties.schema.const, factory.WORLD_SCHEMA);
assert.equal(schema.properties.version.const, 1);
assert.equal(schema.$defs.workObject.properties.schema.const, factory.OBJECT_SCHEMA);
for (const required of ['objects_by_id', 'active_object_ids', 'role_object_ids', 'shared_object_ids']) {
  assert.ok(schema.required.includes(required), `World schema must require ${required}`);
}
for (const required of [
  'work_object_id', 'kind', 'role_scope', 'title', 'status', 'phase',
  'opened_at', 'updated_at', 'people_refs', 'place_refs', 'knowledge_refs',
  'open_questions', 'flags', 'history'
]) {
  assert.ok(schema.$defs.workObject.required.includes(required), `Work object schema must require ${required}`);
}

function deepMerge(target, source) {
  const out = { ...(target || {}) };
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = deepMerge(out[key] || {}, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function makeFakeState(serializedInitial) {
  let serialized = serializedInitial;
  return {
    getState() {
      return JSON.parse(serialized);
    },
    setState(patch) {
      const next = deepMerge(JSON.parse(serialized), patch || {});
      serialized = JSON.stringify(next);
      return next;
    },
    snapshot() {
      return JSON.parse(serialized);
    },
    serialized() {
      return serialized;
    }
  };
}

const legacySave = {
  version: 1,
  score: 17,
  identity_tags: ['existing_identity'],
  mail_branch_state: {
    preferred_types: ['job'],
    preferred_families: [],
    flags: ['existing_flag']
  },
  career: {
    activeJob: 'foundation_legacy_job',
    reputation: 70,
    salaryModifier: 1
  }
};
const legacySerialized = JSON.stringify(legacySave);
const stateA = makeFakeState(legacySerialized);
const adapterA = factory.createAdapter(stateA);

// Reading an old save is migration-free and non-destructive.
assert.deepEqual(adapterA.getWorldState(), {
  schema: 'civication_work_world_state_v1',
  version: 1,
  objects_by_id: {},
  active_object_ids: [],
  role_object_ids: {},
  shared_object_ids: []
});
assert.equal(stateA.serialized(), legacySerialized, 'Read-only normalization must not rewrite an old save');
assert.equal(stateA.snapshot().score, 17);
assert.deepEqual(stateA.snapshot().identity_tags, ['existing_identity']);

// Artificial scene A creates the same work case later scenes will revisit.
const sceneA = {
  id: 'foundation_scene_a',
  effects: {
    work_object_ops: [{
      op: 'create',
      event_id: 'foundation_case_create',
      at: '2026-08-23T08:00:00Z',
      work_object: {
        work_object_id: 'foundation_case_001',
        kind: 'foundation_case_kind',
        role_scope: 'foundation_role',
        institution_id: 'foundation_institution',
        title: 'Persistent foundation case',
        status: 'open',
        phase: 'received',
        people_refs: ['foundation_actor'],
        place_refs: ['foundation_place'],
        knowledge_refs: ['foundation_knowledge'],
        open_questions: ['foundation_question'],
        flags: [],
        shared: false
      }
    }]
  }
};

const createdResults = adapterA.applyOperations(sceneA.effects.work_object_ops, {
  scene_id: sceneA.id,
  choice_id: 'A'
});
assert.equal(createdResults.length, 1);
const created = adapterA.getWorkObject('foundation_case_001');
assert.equal(created.work_object_id, 'foundation_case_001');
assert.equal(created.status, 'open');
assert.equal(created.phase, 'received');
assert.equal(created.institution_id, 'foundation_institution');
assert.deepEqual(created.people_refs, ['foundation_actor']);
assert.deepEqual(created.place_refs, ['foundation_place']);
assert.deepEqual(created.knowledge_refs, ['foundation_knowledge']);
assert.equal(created.history.length, 1);
assert.equal(created.history[0].id, 'foundation_case_create');
assert.equal(created.history[0].scene_id, 'foundation_scene_a');
assert.equal(created.history[0].choice_id, 'A');

let world = adapterA.getWorldState();
assert.deepEqual(world.active_object_ids, ['foundation_case_001']);
assert.deepEqual(world.role_object_ids.foundation_role, ['foundation_case_001']);
assert.deepEqual(world.shared_object_ids, []);
assert.equal(stateA.snapshot().score, 17, 'Work-world mutation must preserve unrelated Civication state');
assert.deepEqual(stateA.snapshot().mail_branch_state.flags, ['existing_flag']);

// An unrelated middle scene does not mutate the case.
const beforeMiddleScene = JSON.stringify(adapterA.getWorkObject('foundation_case_001'));
const middleScene = { id: 'foundation_middle_scene', effects: { score_delta: 1 } };
assert.equal(middleScene.id, 'foundation_middle_scene');
assert.equal(JSON.stringify(adapterA.getWorkObject('foundation_case_001')), beforeMiddleScene);

// Later scene B resolves exactly the same object and sees prior state.
const sceneB = {
  id: 'foundation_scene_b',
  work_context: {
    object_ids: ['foundation_case_001'],
    institution_id: 'foundation_institution',
    deadline_ref: 'foundation_deadline_001'
  }
};
const resolvedBeforeChoice = adapterA.resolveWorkContext(sceneB.work_context);
assert.deepEqual(resolvedBeforeChoice.object_ids, ['foundation_case_001']);
assert.deepEqual(resolvedBeforeChoice.missing_object_ids, []);
assert.equal(resolvedBeforeChoice.institution_id, 'foundation_institution');
assert.equal(resolvedBeforeChoice.objects[0].phase, 'received');
assert.equal(resolvedBeforeChoice.objects[0].history.length, 1);

// Player-like choice moves the same case into a later review phase.
const transitionOp = {
  op: 'transition',
  work_object_id: 'foundation_case_001',
  event_id: 'foundation_case_triage',
  at: '2026-08-23T11:00:00Z',
  to_status: 'in_progress',
  to_phase: 'foundation_review',
  note: 'Player-like choice moved the persistent case into review.'
};
adapterA.applyOperations([transitionOp], {
  scene_id: sceneB.id,
  choice_id: 'review_case'
});
let transitioned = adapterA.getWorkObject('foundation_case_001');
assert.equal(transitioned.status, 'in_progress');
assert.equal(transitioned.phase, 'foundation_review');
assert.equal(transitioned.history.length, 2);
assert.equal(transitioned.history[1].id, 'foundation_case_triage');
assert.equal(transitioned.history[1].from_phase, 'received');
assert.equal(transitioned.history[1].to_phase, 'foundation_review');
assert.equal(transitioned.history[1].choice_id, 'review_case');

// Replaying the exact same event is idempotent.
adapterA.applyOperations([transitionOp], {
  scene_id: sceneB.id,
  choice_id: 'review_case'
});
transitioned = adapterA.getWorkObject('foundation_case_001');
assert.equal(transitioned.history.length, 2, 'Replay must not duplicate work-object history');

// Immutable identity/state boundaries: upsert is not a back door for lifecycle changes.
assert.throws(() => adapterA.upsertWorkObject({
  work_object_id: 'foundation_case_001',
  kind: 'different_kind'
}, {
  event_id: 'illegal_kind_change',
  at: '2026-08-23T11:05:00Z'
}), /kind kan ikke endres/);
assert.throws(() => adapterA.upsertWorkObject({
  work_object_id: 'foundation_case_001',
  role_scope: 'different_role'
}, {
  event_id: 'illegal_role_change',
  at: '2026-08-23T11:06:00Z'
}), /role_scope kan ikke endres/);
assert.throws(() => adapterA.upsertWorkObject({
  work_object_id: 'foundation_case_001',
  status: 'done'
}, {
  event_id: 'illegal_status_change',
  at: '2026-08-23T11:07:00Z'
}), /status må endres med transitionWorkObject/);
assert.throws(() => adapterA.upsertWorkObject({
  work_object_id: 'foundation_case_001',
  phase: 'done'
}, {
  event_id: 'illegal_phase_change',
  at: '2026-08-23T11:08:00Z'
}), /phase må endres med transitionWorkObject/);

// Simulate a full page/app reload: new state API + new adapter, same serialized save.
const serializedAfterTransition = stateA.serialized();
const stateReloaded = makeFakeState(serializedAfterTransition);
const adapterReloaded = factory.createAdapter(stateReloaded);
const resolvedAfterReload = adapterReloaded.resolveWorkContext(sceneB.work_context);
assert.equal(resolvedAfterReload.objects.length, 1);
assert.equal(resolvedAfterReload.objects[0].work_object_id, 'foundation_case_001');
assert.equal(resolvedAfterReload.objects[0].status, 'in_progress');
assert.equal(resolvedAfterReload.objects[0].phase, 'foundation_review');
assert.equal(resolvedAfterReload.objects[0].history.length, 2);
assert.equal(stateReloaded.snapshot().score, 17);

// Shared indexing is deterministic and opt-in.
adapterReloaded.createWorkObject({
  work_object_id: 'foundation_shared_001',
  kind: 'foundation_shared_kind',
  role_scope: 'foundation_role',
  title: 'Shared foundation object',
  status: 'open',
  phase: 'received',
  shared: true
}, {
  event_id: 'foundation_shared_create',
  at: '2026-08-23T11:30:00Z'
});
world = adapterReloaded.getWorldState();
assert.deepEqual(world.active_object_ids, ['foundation_case_001', 'foundation_shared_001']);
assert.deepEqual(world.shared_object_ids, ['foundation_shared_001']);
assert.deepEqual(world.role_object_ids.foundation_role, ['foundation_case_001', 'foundation_shared_001']);

// Closing removes only active indexing; the object and role history remain queryable.
adapterReloaded.closeWorkObject('foundation_case_001', {
  event_id: 'foundation_case_close',
  at: '2026-08-23T16:00:00Z',
  scene_id: 'foundation_scene_close',
  choice_id: 'close_case',
  outcome: 'foundation_complete'
});
const closed = adapterReloaded.getWorkObject('foundation_case_001');
assert.equal(closed.status, 'closed');
assert.equal(closed.phase, 'closed');
assert.equal(closed.closed_at, '2026-08-23T16:00:00Z');
assert.equal(closed.outcome, 'foundation_complete');
assert.equal(closed.history.length, 3);
assert.equal(closed.history[2].op, 'closed');
world = adapterReloaded.getWorldState();
assert.deepEqual(world.active_object_ids, ['foundation_shared_001']);
assert.ok(world.role_object_ids.foundation_role.includes('foundation_case_001'));
assert.equal(adapterReloaded.listWorkObjectsForRole('foundation_role').length, 2);
assert.throws(() => adapterReloaded.transitionWorkObject('foundation_case_001', {
  event_id: 'illegal_closed_transition',
  at: '2026-08-23T16:05:00Z',
  to_status: 'reopened',
  to_phase: 'review'
}), /Lukket arbeidsobjekt kan ikke transitioneres/);

// Corrupt/legacy fragments fail closed during normalization instead of crashing.
const corrupt = factory.normalizeWorldState({
  schema: 'old_unknown_world',
  version: 99,
  objects_by_id: {
    bad_missing_required: { status: 'open' },
    mismatched_key: {
      schema: 'civication_work_object_v1',
      version: 1,
      work_object_id: 'different_id',
      kind: 'case',
      role_scope: 'role',
      title: 'Mismatch',
      status: 'open',
      phase: 'open',
      opened_at: '2026-08-23T00:00:00Z',
      updated_at: '2026-08-23T00:00:00Z'
    }
  },
  active_object_ids: ['ghost']
});
assert.deepEqual(corrupt, {
  schema: 'civication_work_world_state_v1',
  version: 1,
  objects_by_id: {},
  active_object_ids: [],
  role_object_ids: {},
  shared_object_ids: []
});

console.log('Civication persistent work-object foundation: OK');
