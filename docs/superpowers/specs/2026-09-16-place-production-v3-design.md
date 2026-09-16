# Place Production v3 Design

## Status

Approved in chat on 2026-09-16 for implementation planning.

## Goal

Make ordinary Place production materially simpler without weakening fail-closed evidence, source discipline, subsystem ownership, generated-data checks, manual image review, or CI gates.

The core change is to replace parallel hand-maintained production state with one canonical machine-readable production record per Place and derive operational views, reports, and CI routing from it.

## Problem

Current Place production repeats the same decisions across several surfaces:

- `data/places/production/<place>.json` and other canonical Place source files;
- `reports/place-production/*-workcard-current.json`;
- separate gate-audit reports;
- place-specific phase tests;
- `.github/ci/place-regression-registry-v1.json`;
- workflow-specific `paths:` lists and hard-coded test commands;
- preflight snapshots that hash documentation files rather than version semantic contracts.

This creates drift. A completed workcard can preserve an older collection quota or obsolete production-profile vocabulary even after the canonical contract changes. Documentation-only changes can also trigger the full place regression matrix because documentation paths are treated as shared runtime dependencies.

## Scope

Place Production v3 covers five connected responsibilities:

1. one canonical production record schema for production decisions and status;
2. generated workcard / audit projections instead of parallel manually edited state;
3. one machine-readable routing registry for Place CI;
4. impact-aware routing so documentation-only changes do not automatically execute the full place matrix;
5. one CLI surface for `plan`, `build`, and `verify` orchestration.

Migration of all historical phase tests into generic parameterized tests is intentionally incremental. V3 provides the routing and verification interface that makes that migration possible, but it does not require deleting all legacy tests in the first change.

## Non-goals

- Do not weaken factuality, provenance, image, quiz, Fagverk, coordinate, or manual QA requirements.
- Do not replace subsystem-specific canonical data models for People, Objects, Brands, historical events, Productions, Quiz, Knowledge, Leksikon, Stories, or media.
- Do not make `data/places/production/<place>.json` the content owner for those subsystems. It records production decisions and references their canonical outputs.
- Do not synthesize filler entities or convert `BEGRUNNET N/A` into PASS.
- Do not silently rewrite legacy Places during V3 introduction.
- Do not treat generated files as authoring sources.

## Canonical ownership

### Production record

For an ordinary Place participating in V3, the only hand-maintained production-state record is:

`data/places/production/<place_id>.json`

The record uses schema `history_go_place_production_v3`.

It owns:

- Place ID and category;
- semantic contract versions;
- production profile and rationale;
- source-review state;
- collection decisions;
- conditional module decisions;
- explicit blockers;
- source / identity decisions that are specific to production orchestration;
- manual review attestations that cannot be derived from canonical data;
- references to canonical subsystem outputs;
- final production state.

It does not duplicate full People/Object/Brand/Quiz/etc. records.

### Derived views

The following become generated projections when a Place adopts V3:

- `reports/place-production/<place>-workcard-current.json`;
- `reports/place-production/<place>-quality-gate-current.json`.

Generated projections contain a header marking them as generated and naming the canonical production record. They must pass a `--check` mode that fails when committed projections are stale.

Legacy reports may remain until their Place is migrated.

## Semantic contract versions

V3 replaces per-workcard hashes of large documentation files with semantic versions:

```json
{
  "contracts": {
    "place_production": "v3",
    "place_card_collections": "v2",
    "quiz_production": "canonical-v1"
  }
}
```

Hashing remains appropriate for generated-output freshness when a generator owns both sides. It is not used as proof that a human reread a documentation file.

A semantic contract bump is explicit. Editorial wording changes that do not change behavior do not stale every Place production record.

## Production record shape

Minimum V3 shape:

```json
{
  "schema": "history_go_place_production_v3",
  "place_id": "example_place",
  "category": "historie",
  "contracts": {
    "place_production": "v3",
    "place_card_collections": "v2",
    "quiz_production": "canonical-v1"
  },
  "profile": {
    "id": "standard",
    "status": "confirmed",
    "reason": "Source-backed ordinary Place with several independent learning tracks."
  },
  "source_review": {
    "status": "complete"
  },
  "collections": {
    "people": {"status": "PASS"},
    "objects": {"status": "BEGRUNNET_NA", "reason": "No qualifying physical object after source review."},
    "brands": {"status": "BLOCKED", "reason": "Qualified identity exists; authentic asset missing."},
    "historical_events": {"status": "PASS"}
  },
  "modules": {
    "stories": {"status": "PASS"},
    "before_after": {"status": "BEGRUNNET_NA", "reason": "No defensible paired visual evidence."}
  },
  "blockers": ["brands: authentic asset missing"],
  "manual_reviews": {
    "images": {"status": "PENDING"},
    "final_ui": {"status": "PENDING"}
  },
  "state": "in_progress"
}
```

Allowed collection/module statuses are exactly:

- `PASS`
- `BEGRUNNET_NA`
- `BLOCKED`

Allowed ordinary profiles are exactly:

- `major`
- `standard`
- `focused`
- `micro`

`rich` is not a V3 production profile. Quiz richness remains a separate quiz decision.

The selected PlaceCard collections are derived as the ordered set of collection entries with `status = PASS`; they are not separately hand-maintained in a second production-state field.

## State derivation

The CLI derives state conservatively:

- any `BLOCKED` collection/module or non-empty blocker list => `blocked`;
- required manual review still pending => at most `in_progress`;
- source review incomplete => at most `in_progress`;
- all applicable decisions closed, required generated checks green, and required manual reviews PASS => `complete`.

A record claiming `complete` while derived state is not complete is an error.

## Routing architecture

Create one canonical registry:

`.github/ci/place-production-routing-v2.json`

It owns:

- global semantic-contract paths;
- shared runtime paths that truly require full matrix execution;
- documentation/governance-only paths;
- per-Place path matchers;
- per-Place bespoke test paths that still exist;
- subsystem gate declarations.

A single routing library reads changed paths and returns an execution plan.

Routing modes:

### `governance-only`

For editorial documentation changes that alter no schema, runtime, generator, or canonical data.

Runs contract/governance tests only. Does not select every Place regression.

### `shared-contract`

For schema or routing-contract changes.

Runs generic Place contract tests plus routing tests. Full place-specific matrix is required only when the changed contract can alter runtime interpretation of every Place.

### `affected-places`

For Place-specific canonical data, entity data, generated projections, media, quiz, or reports.

Runs generic Place gates plus only matched Place-specific regressions.

### `full-matrix`

Reserved for shared runtime or generator changes that can change all Place behavior, plus explicit workflow dispatch / main integrity use.

The router is fail-closed: an unknown path that matched a Place-production workflow cannot silently skip validation.

## Workflow integration

`data-checks.yml` and `place-rounds-governance.yml` remain workflow shells initially. They must stop owning independent copies of Place impact logic.

Each workflow asks the shared router for its relevant gate plan.

Documentation files such as `docs/PLACE_PRODUCTION_CHECKLIST.md` must not be listed as unconditional full-matrix dependencies. If a documentation change also changes a semantic contract/schema/runtime file in the same PR, the stronger routing mode wins.

## CLI

Add one author-facing command:

`node scripts/place-production-v3.mjs <plan|build|verify> <place_id> [--check]`

Expose package aliases:

- `npm run place:plan -- <place_id>`
- `npm run place:build -- <place_id>`
- `npm run place:verify -- <place_id>`

### `plan`

Reads the production record, validates it, derives selected collections, reports blockers, and prints which owned builders and gates apply. It performs no writes.

### `build`

Runs only registered deterministic builders needed by the Place and then regenerates V3 projections. It never hand-edits generator-owned outputs.

### `verify`

Runs schema validation, projection freshness checks, generic Place contracts, affected Place regressions, and declared subsystem gates. It exits non-zero on any blocker that contradicts claimed completion.

The implementation may initially register the builders already required by the migrated pilot Place and expand the builder registry as more Places migrate. Unknown required builders fail closed rather than being guessed.

## Pilot and migration

The first implementation migrates one representative completed ordinary Place whose current workcard demonstrates the old duplication problem. The pilot must not alter that Place's user-visible factual content merely to fit V3.

Migration procedure:

1. translate current production decisions into the V3 record;
2. normalize obsolete production-profile vocabulary to the current canonical profile model without changing quiz profile;
3. derive collections from PASS statuses;
4. generate the workcard and quality-gate projections;
5. prove projection `--check` stability;
6. prove old and new canonical runtime outputs are unchanged except where a stale production-state artifact is intentionally corrected.

Other Places remain readable as legacy until migrated.

## Tests

V3 requires permanent tests for:

- schema acceptance and rejection;
- exact allowed profile/status vocabularies;
- derived-state fail-closed behavior;
- derived collection selection;
- projection determinism and freshness;
- routing classification for governance-only, affected-place, shared-contract, and full-matrix scenarios;
- unknown-path fail-closed behavior;
- CLI plan output and verify failure on unresolved blocker;
- pilot migration preserving canonical runtime/content outputs.

Existing bespoke Place tests stay registered until replaced by an equivalent generic invariant or an explicitly justified unique Place rule.

## Rollout safety

V3 is additive first:

- legacy workcards remain valid for non-migrated Places;
- V3 records are detected by schema and use the new path;
- no mass migration is performed in the foundation PR;
- CI routing changes are covered by route-scenario tests before workflow triggers are narrowed;
- full-matrix manual dispatch remains available as a safety valve;
- `main` integrity continues to run broad verification after merge.

## Success criteria

The V3 foundation is complete when:

1. one migrated pilot Place has one hand-maintained production-state record and deterministic generated projections;
2. changing only production documentation no longer runs all registered Place regressions;
3. Place-specific changes select only the relevant Place-specific regressions plus generic gates;
4. shared runtime changes still select full-matrix verification;
5. `place:plan`, `place:build`, and `place:verify` use the same canonical record and routing model;
6. the system fails closed on unknown routing, stale projections, invalid statuses, unresolved blockers, and a falsely claimed complete state;
7. no factuality, provenance, manual image QA, generator ownership, or canonical subsystem requirement is weakened.
