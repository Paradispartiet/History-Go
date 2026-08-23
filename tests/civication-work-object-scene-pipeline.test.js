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
const dayConsequencesSource = fs.readFileSync(path.join(ROOT, 'js/Civication/systems/day/dayConsequences.js'), 'utf8');

assert.equal(schema.properties.work_context.$ref, '#/$defs/workContext');
assert.equal(schema.$defs.effects.properties.work_object_ops.items.$ref, '#/$defs/workObjectOp');
assert.equal(schema.$defs.workObjectOp.oneOf.length, 7);
assert.equal(schema.$defs.workContext.additionalProperties, false);
assert.equal(schema.$defs.workObjectCreateSeed.additionalProperties, false);
assert.equal(schema.$defs.workObjectPatch.additionalProperties, false);

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

async function proveCompilerContract() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'civi-work-object-pipeline-'));
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
      id: 'foundation_family',
      mails: [{
        id: 'foundation_scene_001',
        subject: 'Persistent case',
        summary: 'Create and revisit one bounded work object.',
        situation: ['A case enters the workplace and must survive later scenes.'],
        work_context: {
          object_ids: ['foundation_case_001'],
          institution_id: 'foundation_institution',
          deadline_ref: 'foundation_deadline'
        },
        effects: {
          work_object_ops: [{
            op: 'create',
            event_id: 'foundation_case_create',
            work_object: {
              work_object_id: 'foundation_case_001',
              kind: 'case',
              role_scope: 'foundation_role',
              institution_id: 'foundation_institution',
              title: 'Foundation case',
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
        },
        choices: [
          {
            id: 'review',
            label: 'Review the case',
            effect: 1,
            effects: {
              work_object_ops: [{
                op: 'transition',
                event_id: 'foundation_case_review',
                work_object_id: 'foundation_case_001',
                to_status: 'in_progress',
                to_phase: 'review'
              }]
            }
          },
          {
            id: 'record',
            label: 'Record a note',
            effect: 0,
            effects: {
              work_object_ops: [{
                op: 'note',
                event_id: 'foundation_case_note',
                work_object_id: 'foundation_case_001',
                note: 'Recorded without changing phase.'
              }]
            }
          }
        ]
      }]
    }]
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(catalog, null, 2)}\n`);

  const compiler = await import(`${pathToFileURL(compilerPath).href}?work-object-pipeline=${Date.now()}`);
  const registry = await compiler.compileRegistryFromRepo(tempRoot);
  assert.equal(registry.entries.length, 1);
  const entry = registry.entries[0];
  assert.deepEqual(entry.scene.work_context, catalog.families[0].mails[0].work_context);
  assert.deepEqual(
    entry.scene.effects.work_object_ops,
    catalog.families[0].mails[0].effects.work_object_ops
  );
  assert.deepEqual(
    entry.scene.choices[0].effects.work_object_ops,
    catalog.families[0].mails[0].choices[0].effects.work_object_ops
  );
  assert.deepEqual(
    entry.compatibility_projection.work_context,
    entry.scene.work_context,
    'runtime compatibility projection must receive compiler-normalized work_context'
  );
  assert.deepEqual(
    entry.compatibility_projection.effects.work_object_ops,
    entry.scene.effects.work_object_ops,
    'runtime compatibility projection must receive compiler-normalized scene operations'
  );
  assert.deepEqual(
    entry.compatibility_projection.choices[0].effects.work_object_ops,
    entry.scene.choices[0].effects.work_object_ops,
    'runtime compatibility choice must receive compiler-normalized choice operations'
  );

  const invalid = JSON.parse(JSON.stringify(catalog));
  invalid.families[0].mails[0].effects.work_object_ops[0].unexpected = true;
  fs.writeFileSync(sourcePath, `${JSON.stringify(invalid, null, 2)}\n`);
  await assert.rejects(
    () => compiler.compileRegistryFromRepo(tempRoot),
    /unexpected|ukjent felt/i,
    'work-object operations must fail closed on unknown fields'
  );

  fs.rmSync(tempRoot, { recursive: true, force: true });
}

async function proveRuntimeTransaction() {
  const state = makeFakeState({ score: 11, identity_tags: ['preserved'] });
  const adapter = workWorldFactory.createAdapter(state);
  let registered = null;
  let registeredPriority = null;

  const fakeWindow = {
    CivicationState: state,
    CivicationWorkWorldFactory: workWorldFactory,
    CivicationWorkWorld: adapter,
    CivicationChoiceDirector: {
      registerHandler(name, fn, priority) {
        if (name === 'dayConsequences') {
          registered = fn;
          registeredPriority = priority;
        }
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
  assert.equal(typeof registered, 'function');
  assert.equal(registeredPriority, 10);

  const eventObj = {
    id: 'foundation_runtime_scene',
    work_context: {
      object_ids: ['foundation_runtime_case'],
      institution_id: 'foundation_institution'
    },
    effects: {
      work_object_ops: [{
        op: 'create',
        event_id: 'foundation_runtime_create',
        work_object: {
          work_object_id: 'foundation_runtime_case',
          kind: 'case',
          role_scope: 'foundation_role',
          institution_id: 'foundation_institution',
          title: 'Runtime case',
          status: 'open',
          phase: 'received',
          people_refs: [],
          place_refs: [],
          knowledge_refs: [],
          open_questions: [],
          flags: [],
          shared: false
        }
      }]
    }
  };
  const choice = {
    id: 'review',
    label: 'Review',
    effect: 1,
    effects: {
      work_object_ops: [{
        op: 'transition',
        event_id: 'foundation_runtime_review',
        work_object_id: 'foundation_runtime_case',
        to_status: 'in_progress',
        to_phase: 'review'
      }]
    }
  };

  const result = await registered({ eventObj, choice, result: { ok: true, effect: 1 } });
  assert.equal(result.work_world.applied_count, 2);
  assert.deepEqual(result.work_world.work_context_before.missing_object_ids, ['foundation_runtime_case']);
  assert.deepEqual(result.work_world.work_context_after.missing_object_ids, []);
  assert.equal(result.work_world.work_context_after.objects[0].status, 'in_progress');
  assert.equal(result.work_world.work_context_after.objects[0].phase, 'review');
  assert.deepEqual(result.work_world.operation_event_ids, ['foundation_runtime_create', 'foundation_runtime_review']);
  const persisted = adapter.getWorkObject('foundation_runtime_case');
  assert.equal(persisted.history.length, 2);
  assert.equal(state.snapshot().score, 11);
  assert.deepEqual(state.snapshot().identity_tags, ['preserved']);

  // Replaying the same accepted answer is idempotent at the work-object layer.
  await registered({ eventObj, choice, result: { ok: true, effect: 1 } });
  assert.equal(adapter.getWorkObject('foundation_runtime_case').history.length, 2);

  // Preflight proves atomicity: an invalid later op prevents an earlier create from persisting.
  const atomicEvent = {
    id: 'foundation_atomic_scene',
    effects: {
      work_object_ops: [{
        op: 'create',
        event_id: 'foundation_atomic_create',
        work_object: {
          work_object_id: 'foundation_atomic_case',
          kind: 'case',
          role_scope: 'foundation_role',
          title: 'Atomic case',
          status: 'open',
          phase: 'received',
          people_refs: [],
          place_refs: [],
          knowledge_refs: [],
          open_questions: [],
          flags: [],
          shared: false
        }
      }]
    }
  };
  const badChoice = {
    id: 'bad_transition',
    label: 'Bad transition',
    effects: {
      work_object_ops: [{
        op: 'transition',
        event_id: 'foundation_atomic_bad_transition',
        work_object_id: 'foundation_missing_case',
        to_status: 'in_progress',
        to_phase: 'review'
      }]
    }
  };
  await assert.rejects(
    () => registered({ eventObj: atomicEvent, choice: badChoice, result: { ok: true } }),
    /Ukjent arbeidsobjekt/
  );
  assert.equal(adapter.getWorkObject('foundation_atomic_case'), null, 'failed batch must leave real state untouched');
}

(async () => {
  await proveCompilerContract();
  await proveRuntimeTransaction();
  console.log('Civication work-object scene pipeline: OK');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
