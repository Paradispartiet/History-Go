# Place Production v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace duplicated Place-production workflow state and duplicated CI impact logic with one canonical workflow record, deterministic projections, one routing registry, and one `plan/build/verify` CLI without weakening existing factuality or QA gates.

**Architecture:** Keep existing `data/places/production/<place>.json` files as factuality/claims owners. Add a small workflow-only record under `data/places/workflow/<place>.json`, derive workcard/gate reports from it, and use a shared routing library + registry to classify changed paths for both local verification and GitHub Actions. Introduce V3 additively with Akershus slott as the pilot; legacy workcards and bespoke tests remain valid until migrated.

**Tech Stack:** Node.js 22 ESM, JSON/JSON Schema, `node:test`, existing npm scripts, GitHub Actions YAML.

**Spec:** `docs/superpowers/specs/2026-09-16-place-production-v3-design.md`

## Global Constraints

- `data/places/production/<place>.json` remains factuality/claims source of truth; V3 must not repurpose or rewrite its ownership model.
- Workflow statuses are exactly `PASS`, `BEGRUNNET_NA`, `BLOCKED`.
- Ordinary production profiles are exactly `major`, `standard`, `focused`, `micro`; quiz richness stays separate.
- V3 is additive: non-migrated Places continue using legacy workcards/tests.
- Unknown routing and unknown required builders fail closed.
- Generated projections are never hand-edited after migration.
- Documentation-only edits must not automatically select the full place regression matrix.
- Shared runtime changes must still be able to select the full matrix.
- Existing factuality, provenance, manual image QA, quiz, Fagverk, coordinate, generator-ownership and main-integrity gates remain authoritative.

---

### Task 1: Add the workflow schema and validation core

**Files:**
- Create: `data/places/regler/place_production_workflow_v3.schema.json`
- Create: `scripts/place-production-v3-lib.mjs`
- Create: `tests/place-production-v3-workflow.test.mjs`

**Interfaces:**
- Produces: `WORKFLOW_SCHEMA_ID`, `loadWorkflowRecord(placeId)`, `validateWorkflowRecord(record)`, `deriveSelectedCollections(record)`, `deriveWorkflowState(record)` from `scripts/place-production-v3-lib.mjs`.
- Consumes: filesystem paths rooted at repository root; no subsystem data is mutated.

- [ ] **Step 1: Write failing schema/derivation tests**

Create `tests/place-production-v3-workflow.test.mjs` with fixtures inline and assertions equivalent to:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateWorkflowRecord,
  deriveSelectedCollections,
  deriveWorkflowState,
} from '../scripts/place-production-v3-lib.mjs';

const complete = {
  schema: 'history_go_place_production_workflow_v3',
  place_id: 'example_place',
  category: 'historie',
  contracts: {
    place_production: 'v3',
    place_card_collections: 'v2',
    quiz_production: 'canonical-v1',
  },
  sources: { factuality_record: 'data/places/production/example_place.json' },
  profile: { id: 'standard', status: 'confirmed', reason: 'Source-backed.' },
  source_review: { status: 'complete' },
  collections: {
    people: { status: 'PASS' },
    objects: { status: 'BEGRUNNET_NA', reason: 'No qualifying object.' },
    historical_events: { status: 'PASS' },
  },
  modules: {},
  blockers: [],
  manual_reviews: {
    images: { status: 'PASS' },
    final_ui: { status: 'PASS' },
  },
  state: 'complete',
};

test('derives only PASS collections', () => {
  assert.deepEqual(deriveSelectedCollections(complete), ['people', 'historical_events']);
});

test('complete record derives complete', () => {
  assert.equal(validateWorkflowRecord(complete).ok, true);
  assert.equal(deriveWorkflowState(complete), 'complete');
});

test('BLOCKED fails closed', () => {
  const record = structuredClone(complete);
  record.collections.brands = { status: 'BLOCKED', reason: 'Asset missing.' };
  record.state = 'blocked';
  assert.equal(deriveWorkflowState(record), 'blocked');
});

test('rich is not a production profile', () => {
  const record = structuredClone(complete);
  record.profile.id = 'rich';
  assert.equal(validateWorkflowRecord(record).ok, false);
});

test('a false complete claim is invalid', () => {
  const record = structuredClone(complete);
  record.manual_reviews.images.status = 'PENDING';
  assert.equal(validateWorkflowRecord(record).ok, false);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --test tests/place-production-v3-workflow.test.mjs
```

Expected: FAIL because `scripts/place-production-v3-lib.mjs` does not exist.

- [ ] **Step 3: Add the JSON schema**

Create `data/places/regler/place_production_workflow_v3.schema.json` with `additionalProperties: false` at the top-level and exact enums:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "history_go_place_production_workflow_v3",
  "type": "object",
  "required": ["schema", "place_id", "category", "contracts", "sources", "profile", "source_review", "collections", "modules", "blockers", "manual_reviews", "state"],
  "properties": {
    "schema": {"const": "history_go_place_production_workflow_v3"},
    "place_id": {"type": "string", "minLength": 1},
    "category": {"type": "string", "minLength": 1},
    "contracts": {"type": "object"},
    "sources": {"type": "object"},
    "profile": {
      "type": "object",
      "required": ["id", "status", "reason"],
      "properties": {
        "id": {"enum": ["major", "standard", "focused", "micro"]},
        "status": {"enum": ["confirmed", "provisional"]},
        "reason": {"type": "string", "minLength": 1}
      }
    },
    "state": {"enum": ["in_progress", "blocked", "complete"]}
  }
}
```

In the complete file, define reusable `$defs.decision` so collection/module status is exactly `PASS | BEGRUNNET_NA | BLOCKED`; require a non-empty `reason` for `BEGRUNNET_NA` and `BLOCKED` in the runtime validator even if JSON Schema remains structural.

- [ ] **Step 4: Implement the validation/derivation core**

Create `scripts/place-production-v3-lib.mjs` with these exact exports:

```js
export const WORKFLOW_SCHEMA_ID = 'history_go_place_production_workflow_v3';
export const DECISION_STATUSES = new Set(['PASS', 'BEGRUNNET_NA', 'BLOCKED']);
export const PRODUCTION_PROFILES = new Set(['major', 'standard', 'focused', 'micro']);

export function deriveSelectedCollections(record) {
  return Object.entries(record.collections ?? {})
    .filter(([, value]) => value?.status === 'PASS')
    .map(([id]) => id);
}

export function deriveWorkflowState(record) {
  const decisions = [
    ...Object.values(record.collections ?? {}),
    ...Object.values(record.modules ?? {}),
  ];
  if ((record.blockers ?? []).length || decisions.some((item) => item?.status === 'BLOCKED')) return 'blocked';
  if (record.source_review?.status !== 'complete') return 'in_progress';
  if (record.manual_reviews?.images?.status !== 'PASS') return 'in_progress';
  if (record.manual_reviews?.final_ui?.status !== 'PASS') return 'in_progress';
  return 'complete';
}
```

`validateWorkflowRecord(record)` must check required keys, exact schema ID, exact profile vocabulary, decision vocabulary, required reasons for N/A/BLOCKED, and `record.state === deriveWorkflowState(record)`. Return `{ok, errors}` and do not throw for semantic validation failures.

`loadWorkflowRecord(placeId)` reads only `data/places/workflow/${placeId}.json`, parses JSON, validates, and throws a descriptive error if the record is absent or invalid.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run:

```bash
node --test tests/place-production-v3-workflow.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add data/places/regler/place_production_workflow_v3.schema.json scripts/place-production-v3-lib.mjs tests/place-production-v3-workflow.test.mjs
git commit -m "feat: add Place Production v3 workflow core"
```

---

### Task 2: Add deterministic workcard and quality-gate projections

**Files:**
- Create: `scripts/build-place-production-v3-projections.mjs`
- Modify: `scripts/place-production-v3-lib.mjs`
- Create: `tests/place-production-v3-projections.test.mjs`

**Interfaces:**
- Produces: `renderWorkcardProjection(record)` and `renderQualityGateProjection(record)` from the library.
- Produces CLI: `node scripts/build-place-production-v3-projections.mjs <place_id> [--check]`.
- Projection paths: `reports/place-production/<place>-workcard-current.json` and `reports/place-production/<place>-quality-gate-current.json`.

- [ ] **Step 1: Write failing projection determinism tests**

Test that a fixture record produces:

```js
const workcard = renderWorkcardProjection(record);
assert.equal(workcard.generated, true);
assert.equal(workcard.source, 'data/places/workflow/example_place.json');
assert.deepEqual(workcard.selected_collections, ['people', 'historical_events']);
assert.equal(workcard.profile.id, 'standard');
assert.equal('rule_preflight' in workcard, false);

const gate = renderQualityGateProjection(record);
assert.equal(gate.generated, true);
assert.equal(gate.derived_state, 'complete');
assert.deepEqual(gate.blockers, []);
```

Also test stable JSON text ordering by rendering twice and asserting exact equality.

- [ ] **Step 2: Run projection tests and confirm RED**

```bash
node --test tests/place-production-v3-projections.test.mjs
```

Expected: FAIL because render functions do not exist.

- [ ] **Step 3: Implement projection renderers**

Add to `scripts/place-production-v3-lib.mjs`:

```js
export function renderWorkcardProjection(record) {
  return {
    schema: 'history_go_place_workcard_projection_v3',
    generated: true,
    source: `data/places/workflow/${record.place_id}.json`,
    place_id: record.place_id,
    category: record.category,
    state: deriveWorkflowState(record),
    profile: record.profile,
    selected_collections: deriveSelectedCollections(record),
    collections: record.collections,
    modules: record.modules,
    blockers: record.blockers,
    manual_reviews: record.manual_reviews,
  };
}

export function renderQualityGateProjection(record) {
  return {
    schema: 'history_go_place_quality_gate_projection_v3',
    generated: true,
    source: `data/places/workflow/${record.place_id}.json`,
    place_id: record.place_id,
    derived_state: deriveWorkflowState(record),
    selected_collections: deriveSelectedCollections(record),
    blockers: record.blockers,
    manual_reviews: record.manual_reviews,
  };
}
```

Use a shared `stableJson(value)` that writes `JSON.stringify(value, null, 2) + '\n'` after recursively preserving declared object order; do not inject timestamps that make output non-deterministic.

- [ ] **Step 4: Implement generator/check CLI**

`build-place-production-v3-projections.mjs` must:

1. load/validate the workflow record;
2. resolve both target paths;
3. in normal mode write exact deterministic projection contents;
4. in `--check` mode compare exact bytes and exit 1 with `stale V3 projection: <path>` if either differs or is missing.

- [ ] **Step 5: Run tests GREEN**

```bash
node --test tests/place-production-v3-workflow.test.mjs tests/place-production-v3-projections.test.mjs
```

- [ ] **Step 6: Commit Task 2**

```bash
git add scripts/place-production-v3-lib.mjs scripts/build-place-production-v3-projections.mjs tests/place-production-v3-projections.test.mjs
git commit -m "feat: generate Place Production v3 projections"
```

---

### Task 3: Migrate Akershus slott as the pilot without touching factual claims

**Files:**
- Create: `data/places/workflow/akershus_slott.json`
- Replace by generator output: `reports/place-production/akershus-slott-workcard-current.json`
- Create by generator output: `reports/place-production/akershus-slott-quality-gate-current.json`
- Keep unchanged: `data/places/production/akershus_slott.json`
- Create: `tests/akershus-slott-place-production-v3.test.mjs`

**Interfaces:**
- Consumes existing factuality record `data/places/production/akershus_slott.json`.
- Produces first real V3 workflow record and projections.

- [ ] **Step 1: Record the factuality source hash before migration**

Run:

```bash
sha256sum data/places/production/akershus_slott.json
```

Save the hash in test fixture code as `EXPECTED_FACTUALITY_SHA256` so the migration test proves this file did not change during the workflow migration.

- [ ] **Step 2: Write failing pilot migration test**

Create assertions that:

```js
assert.equal(workflow.schema, 'history_go_place_production_workflow_v3');
assert.equal(workflow.place_id, 'akershus_slott');
assert.equal(workflow.sources.factuality_record, 'data/places/production/akershus_slott.json');
assert.ok(['major', 'standard', 'focused', 'micro'].includes(workflow.profile.id));
assert.notEqual(workflow.profile.id, 'rich');
assert.equal(workflow.state, 'complete');
assert.deepEqual(deriveSelectedCollections(workflow), Object.keys(workflow.collections).filter((id) => workflow.collections[id].status === 'PASS'));
```

Hash `data/places/production/akershus_slott.json` in the test and assert exact equality with `EXPECTED_FACTUALITY_SHA256`.

- [ ] **Step 3: Run pilot test RED**

```bash
node --test tests/akershus-slott-place-production-v3.test.mjs
```

Expected: FAIL because the workflow record does not exist.

- [ ] **Step 4: Create `data/places/workflow/akershus_slott.json`**

Translate only workflow facts from the existing workcard. Use current canonical profile vocabulary. Keep the existing quiz profile out of the workflow profile. Collection statuses must describe current reality; if all four legacy collections are genuinely complete they may all be PASS, but no fixed quota or `full_place_collection_count` is stored.

Manual reviews already documented as completed in the existing quality audit become PASS with concise evidence references rather than copied long prose.

- [ ] **Step 5: Generate projections**

```bash
node scripts/build-place-production-v3-projections.mjs akershus_slott
node scripts/build-place-production-v3-projections.mjs akershus_slott --check
```

Expected: both commands exit 0; second command writes nothing.

- [ ] **Step 6: Run pilot + core tests GREEN**

```bash
node --test tests/place-production-v3-workflow.test.mjs tests/place-production-v3-projections.test.mjs tests/akershus-slott-place-production-v3.test.mjs
```

- [ ] **Step 7: Verify factuality record is unchanged**

```bash
git diff --exit-code -- data/places/production/akershus_slott.json
```

Expected: exit 0.

- [ ] **Step 8: Commit Task 3**

```bash
git add data/places/workflow/akershus_slott.json reports/place-production/akershus-slott-workcard-current.json reports/place-production/akershus-slott-quality-gate-current.json tests/akershus-slott-place-production-v3.test.mjs
git commit -m "feat: migrate Akershus slott workflow to Place Production v3"
```

---

### Task 4: Introduce one Place-production routing registry and classifier

**Files:**
- Create: `.github/ci/place-production-routing-v2.json`
- Create: `scripts/place-production-routing-v2-lib.mjs`
- Create: `scripts/place-production-routing-v2.mjs`
- Create: `tests/place-production-routing-v2.test.mjs`
- Read/migrate data from: `.github/ci/place-regression-registry-v1.json`

**Interfaces:**
- Produces: `classifyPlaceProductionChanges(changedPaths, registry)` returning `{mode, places, tests, gates, unknown}`.
- Modes: `governance-only | shared-contract | affected-places | full-matrix`.
- CLI: `node scripts/place-production-routing-v2.mjs --base <sha> --head <sha> [--json]`.

- [ ] **Step 1: Write routing scenario tests RED**

Use exact scenarios:

```js
assert.equal(classify(['docs/PLACE_PRODUCTION_CHECKLIST.md']).mode, 'governance-only');
assert.deepEqual(classify(['docs/PLACE_PRODUCTION_CHECKLIST.md']).places, []);

const torggata = classify(['data/places/by/oslo/places/torggata.json']);
assert.equal(torggata.mode, 'affected-places');
assert.deepEqual(torggata.places, ['torggata']);

assert.equal(classify(['js/ui/place-card.js']).mode, 'full-matrix');
assert.equal(classify(['data/places/regler/place_production_workflow_v3.schema.json']).mode, 'shared-contract');

const unknown = classify(['data/places/workflow/not_registered_yet.json']);
assert.equal(unknown.unknown.length, 1);
```

The unknown case must not silently become no-op.

- [ ] **Step 2: Run routing tests RED**

```bash
node --test tests/place-production-routing-v2.test.mjs
```

- [ ] **Step 3: Build the V2 registry**

Populate `.github/ci/place-production-routing-v2.json` with these top-level keys:

```json
{
  "version": 2,
  "governanceOnlyPaths": [],
  "sharedContractPaths": [],
  "fullMatrixPaths": [],
  "places": []
}
```

Move `docs/PLACE_PRODUCTION_CHECKLIST.md` from the old full-matrix concept into `governanceOnlyPaths`.

Move true runtime-wide paths such as `js/app.js`, `js/map.js`, `js/map.ts`, `js/views/MapView.js`, and shared PlaceCard runtime files used by the workflow into `fullMatrixPaths`.

Add `data/places/regler/place_production_workflow_v3.schema.json`, `scripts/place-production-v3-lib.mjs`, projection generator, and the routing registry/library themselves to `sharedContractPaths` unless they are runtime-wide.

Copy each existing registered Place matcher and bespoke test list from `.github/ci/place-regression-registry-v1.json` into `places` so coverage is not lost.

Add Akershus slott matcher for `akershus_slott`, `akershus-slott`, its workflow record and V3 pilot test.

- [ ] **Step 4: Implement precedence and fail-closed classification**

Precedence for mixed changes is:

```text
full-matrix > shared-contract > affected-places > governance-only
```

`classifyPlaceProductionChanges()` must deduplicate places/tests, preserve registry order, and list any path that falls inside a declared Place-production namespace but matches no known rule in `unknown`.

The CLI computes changed paths using `git diff --name-only <base> <head>`, prints a human summary by default, and exact JSON with `--json`.

- [ ] **Step 5: Run routing tests GREEN**

```bash
node --test tests/place-production-routing-v2.test.mjs
```

- [ ] **Step 6: Commit Task 4**

```bash
git add .github/ci/place-production-routing-v2.json scripts/place-production-routing-v2-lib.mjs scripts/place-production-routing-v2.mjs tests/place-production-routing-v2.test.mjs
git commit -m "feat: centralize Place production routing"
```

---

### Task 5: Make affected-place regression execution consume the V2 router

**Files:**
- Modify: `scripts/run-place-regressions-v1.mjs`
- Modify: `.github/ci/place-regression-registry-v1.json`
- Create: `tests/run-place-regressions-v2-routing.test.mjs`

**Interfaces:**
- `run-place-regressions-v1.mjs` remains as a compatibility entrypoint used by current CI, but delegates selection to V2.
- V1 registry becomes either a compatibility pointer/minimal deprecated file or is no longer read by the runner after tests prove V2 parity.

- [ ] **Step 1: Write compatibility tests RED**

Test the runner selection logic through exported helper or spawned process:

- docs-only checklist change => no registered Place regressions;
- Torggata-specific change => Torggata tests only;
- shared runtime change => all registered Place tests;
- unknown Place workflow path => exit non-zero.

- [ ] **Step 2: Run RED**

```bash
node --test tests/run-place-regressions-v2-routing.test.mjs
```

- [ ] **Step 3: Replace local selection logic**

Remove the old `sharedFullMatrixPaths`/substring selection implementation from `run-place-regressions-v1.mjs` and import the V2 classifier.

Required behavior:

```js
const plan = classifyPlaceProductionChanges(changedFiles(), registry);
if (plan.unknown.length) {
  console.error(`Unrouted Place production path(s): ${plan.unknown.join(', ')}`);
  process.exit(1);
}
if (plan.mode === 'governance-only' || plan.tests.length === 0) {
  console.log('No place-specific regressions selected; generic governance remains authoritative.');
  process.exit(0);
}
run(process.execPath, ['--test', ...plan.tests]);
```

- [ ] **Step 4: Run compatibility + routing tests GREEN**

```bash
node --test tests/place-production-routing-v2.test.mjs tests/run-place-regressions-v2-routing.test.mjs
```

- [ ] **Step 5: Commit Task 5**

```bash
git add scripts/run-place-regressions-v1.mjs .github/ci/place-regression-registry-v1.json tests/run-place-regressions-v2-routing.test.mjs
git commit -m "refactor: route Place regressions through v2 registry"
```

---

### Task 6: Narrow workflow triggers without losing fail-closed coverage

**Files:**
- Modify: `.github/workflows/data-checks.yml`
- Modify: `.github/workflows/place-rounds-governance.yml`
- Modify: `scripts/audit-ci-workflow-routing.mjs`
- Create or modify: tests that exercise `audit-ci-workflow-routing.mjs` according to existing project pattern

**Interfaces:**
- GitHub workflow shells continue to own execution permissions/concurrency.
- V2 registry owns Place impact classification.

- [ ] **Step 1: Add failing routing-governance assertions**

Extend the existing CI routing audit so it fails when:

1. `docs/PLACE_PRODUCTION_CHECKLIST.md` appears in a full-matrix registry bucket;
2. `data-checks.yml` or `place-rounds-governance.yml` reimplements a per-Place hard-coded impact table that V2 owns;
3. `place-production-routing-v2.json` is missing from the relevant workflow trigger paths;
4. `scripts/place-production-routing-v2*.mjs` changes do not trigger the required routing/governance workflow.

- [ ] **Step 2: Run the CI routing audit and confirm RED**

Run the repository's existing command that invokes `scripts/audit-ci-workflow-routing.mjs`; if no package alias exists, run:

```bash
node scripts/audit-ci-workflow-routing.mjs
```

- [ ] **Step 3: Update `data-checks.yml`**

Keep the existing generic Places check and `Run affected place regressions` step. Add the V2 registry/library paths to workflow triggers. Remove the checklist from any code path that makes the regression runner interpret it as a full matrix; docs may still trigger a lightweight governance step.

Do not remove `fetch-depth: 0` from the Places job because base/head diff classification requires history.

- [ ] **Step 4: Update `place-rounds-governance.yml`**

Preserve runtime/visual tests for actual runtime/schema changes. Route documentation-only changes to governance/contract assertions and do not install/run Chromium solely because checklist prose changed.

Keep `workflow_dispatch` as the explicit broad safety valve.

- [ ] **Step 5: Run routing audit + focused tests GREEN**

```bash
node scripts/audit-ci-workflow-routing.mjs
node --test tests/place-production-routing-v2.test.mjs tests/run-place-regressions-v2-routing.test.mjs
```

- [ ] **Step 6: Commit Task 6**

```bash
git add .github/workflows/data-checks.yml .github/workflows/place-rounds-governance.yml scripts/audit-ci-workflow-routing.mjs tests
git commit -m "ci: route Place production checks by impact"
```

---

### Task 7: Add the unified `place:plan`, `place:build`, and `place:verify` CLI

**Files:**
- Create: `scripts/place-production-v3.mjs`
- Modify: `scripts/place-production-v3-lib.mjs`
- Modify: `package.json`
- Create: `tests/place-production-v3-cli.test.mjs`

**Interfaces:**
- CLI: `node scripts/place-production-v3.mjs <plan|build|verify> <place_id>`.
- npm aliases: `place:plan`, `place:build`, `place:verify`.

- [ ] **Step 1: Write CLI tests RED**

Spawn the CLI with Akershus slott and assert:

```text
plan: exit 0 and prints place_id, profile, selected collections, blockers, referenced factuality record
verify: exit 0 for complete Akershus slott pilot
verify: exits non-zero for a temporary fixture record claiming complete with a BLOCKED decision
build: invokes projection generation and leaves `--check` clean
```

Use temporary fixture directories or an injectable `repoRoot` rather than mutating canonical test data.

- [ ] **Step 2: Run CLI tests RED**

```bash
node --test tests/place-production-v3-cli.test.mjs
```

- [ ] **Step 3: Implement `plan`**

`plan` must print a deterministic summary with these fields in this order:

```text
Place: <place_id>
Profile: <profile.id> (<profile.status>)
State: <derived state>
Collections: <PASS ids or none>
Blocked: <BLOCKED ids + explicit blockers or none>
Factuality: <sources.factuality_record>
```

No writes.

- [ ] **Step 4: Implement `build`**

Initial V3 build must run only deterministic, already-owned builders that are universally required for the migrated pilot and then projections. Use an explicit central command list in the library rather than shell-string concatenation:

```js
export const V3_BUILD_STEPS = [
  ['npm', ['run', 'places:index:build']],
  ['npm', ['run', 'place-open:build']],
  ['node', ['scripts/build-place-production-v3-projections.mjs']],
];
```

For the projection step append `<place_id>`. If a later workflow record declares a required output that no registered builder owns, fail with `No registered V3 builder for <output>` rather than guessing.

- [ ] **Step 5: Implement `verify`**

For the pilot, verification sequence is:

```text
validate workflow record
verify referenced factuality record exists
projection --check
bash scripts/check-places.sh
run affected place regressions for the Place via V2 routing helper
fail if claimed state differs from derived state
```

The CLI must propagate the first non-zero exit code.

- [ ] **Step 6: Add package aliases**

Add exactly:

```json
"place:plan": "node scripts/place-production-v3.mjs plan",
"place:build": "node scripts/place-production-v3.mjs build",
"place:verify": "node scripts/place-production-v3.mjs verify"
```

- [ ] **Step 7: Run CLI/core tests GREEN**

```bash
node --test tests/place-production-v3-workflow.test.mjs tests/place-production-v3-projections.test.mjs tests/place-production-v3-cli.test.mjs tests/akershus-slott-place-production-v3.test.mjs
npm run place:plan -- akershus_slott
npm run place:verify -- akershus_slott
```

- [ ] **Step 8: Commit Task 7**

```bash
git add scripts/place-production-v3.mjs scripts/place-production-v3-lib.mjs package.json tests/place-production-v3-cli.test.mjs
git commit -m "feat: add unified Place production CLI"
```

---

### Task 8: Document V3 as the canonical workflow for migrated Places and run full verification

**Files:**
- Modify: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Modify: `docs/PLACE_PRODUCTION_PROFILES.md`
- Modify: `data/places/README_place_rounds.md`
- Modify: `docs/superpowers/specs/2026-09-16-place-production-v3-design.md` only if implementation discovered a factual mismatch; do not rewrite approved scope casually.

**Interfaces:**
- Documentation points authors to `data/places/workflow/<place>.json` for workflow state and explicitly distinguishes it from `data/places/production/<place>.json` factuality data.

- [ ] **Step 1: Add concise V3 authoring instructions**

Document the new canonical sequence:

```text
Place factuality/content sources
→ data/places/workflow/<place>.json
→ npm run place:plan -- <place>
→ content/entity work through subsystem owners
→ npm run place:build -- <place>
→ manual image/UI QA
→ npm run place:verify -- <place>
→ PR / exact-head CI / merge
```

State that migrated V3 workcards and quality gates are generated, not hand-edited.

- [ ] **Step 2: Run focused V3 suite**

```bash
node --test \
  tests/place-production-v3-workflow.test.mjs \
  tests/place-production-v3-projections.test.mjs \
  tests/akershus-slott-place-production-v3.test.mjs \
  tests/place-production-routing-v2.test.mjs \
  tests/run-place-regressions-v2-routing.test.mjs \
  tests/place-production-v3-cli.test.mjs
```

Expected: all PASS.

- [ ] **Step 3: Run workflow-routing governance**

```bash
node scripts/audit-ci-workflow-routing.mjs
```

Expected: PASS.

- [ ] **Step 4: Run canonical Place checks**

```bash
bash scripts/check-places.sh
```

Expected: PASS.

- [ ] **Step 5: Run Akershus V3 verification**

```bash
npm run place:verify -- akershus_slott
```

Expected: PASS.

- [ ] **Step 6: Run repository-level tests required by changed surfaces**

```bash
npm test
npm run typecheck
```

If the repository's exact-head CI requires additional named gates for changed workflow files, run those same commands locally where available before push.

- [ ] **Step 7: Verify generated state and diff hygiene**

```bash
node scripts/build-place-production-v3-projections.mjs akershus_slott --check
git diff --check
git status --short
```

Confirm there is no change to `data/places/production/akershus_slott.json` and no unrelated generated/runtime churn.

- [ ] **Step 8: Commit Task 8**

```bash
git add docs/PLACE_PRODUCTION_CHECKLIST.md docs/PLACE_PRODUCTION_PROFILES.md data/places/README_place_rounds.md
git commit -m "docs: make Place Production v3 the migrated workflow"
```

- [ ] **Step 9: Push, open PR, and verify exact head**

Push the implementation branch, open a PR against current `main`, record the exact head SHA, and require all triggered exact-head workflows to pass. Do not repair unrelated baseline data by inventing records. If a broad gate exposes an unrelated pre-existing failure, prove the scope before deciding whether a separate repair is needed.

- [ ] **Step 10: Merge only the verified exact head**

Merge after exact-head CI is green, then verify `main` points to the merge result and post-merge main-integrity succeeds.

---

## Plan self-review

- **Spec coverage:** Tasks 1–3 implement canonical workflow state and generated projections; Tasks 4–6 implement unified impact routing and narrower documentation CI; Task 7 implements the unified CLI; Task 8 integrates documentation and full verification. Incremental legacy phase-test migration remains explicitly out of foundation scope as specified.
- **Placeholder scan:** No TBD/TODO/“implement later” instructions are used. The only intentionally incremental item is legacy test migration, which the approved spec marks as a non-foundation rollout item rather than an unfinished step.
- **Type/name consistency:** Schema ID is `history_go_place_production_workflow_v3`; canonical workflow path is `data/places/workflow/<place_id>.json`; routing registry is `.github/ci/place-production-routing-v2.json`; CLI is `scripts/place-production-v3.mjs`; profile/status vocabularies are consistent across tasks.
