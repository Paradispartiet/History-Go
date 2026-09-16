# Sosiologi Advanced Theory Phase 4 Runtime Release Design

## Baseline and authority

This design is anchored to `Paradispartiet/History-Go` main at `08588cff4020ea85f555356a8616e5122a0de0a9` on 2026-09-16.

Canonical ownership remains unchanged:

- owner subject: `politikk`
- canonical subcategory: `sosiologi_antropologi`
- canonical Fagverk registry: `data/fagverk/fagverk_registry.json`
- Politikk runtime manifest: `data/fag/politikk/politikk_runtime_manifest.json`
- Advanced Theory production authority: `data/fag/politikk/sosiologi_antropologi/production_registry_v1.json`
- Advanced Theory materialized overlays: `data/fagverk/politikk/sosiologi_antropologi/advanced_theory/**`

Phase 3 has already established the release precondition: all 60 Advanced Theory claims have inspectable full-text evidence and are `runtime_releasable`; the runtime-release gate is open. The claims intentionally remain runtime-pending, so the current RED state is `runtime_ready_count = 0`, `runtime_claims_remain_pending = true`, and `runtime_ready = false`.

The repository reconciliation contract continues to prohibit creating `sosiologi_antropologi` as a separate top-level subject, moving existing Politikk chapters, or counting secondary links as independent production.

## Problem

The shared Fagverk chapter hydrator currently supports one canonical chapter payload with optional `moduleFiles`, followed by one `claimsFile`. It has no contract for independently materialized chapter expansions or multiple expansion claim files.

Advanced Theory is therefore in a deliberate intermediate state: source-backed overlay assets exist and have passed full-text verification, but the canonical runtime cannot consume them without either changing the shared hydration contract or introducing a parallel runtime model.

A separate Advanced Theory registry, subject, or Politikk-only shadow loader would duplicate authority and make release ownership ambiguous. Replacing owner chapters with generated Advanced Theory copies would also destroy the existing owner boundary.

## Goals

Phase 4 will:

1. add a generic, backward-compatible expansion contract to the existing shared Fagverk chapter runtime;
2. keep all Advanced Theory content under the existing `politikk / sosiologi_antropologi` ownership model;
3. attach the seven materialized Advanced Theory overlay groups to their existing owner chapters using the mapping already owned by the production registry and Phase-3 audit;
4. make expansion modules and claims part of the existing generated Fagverk release surface and digest/integrity checks;
5. promote exactly the 60 full-text-verified claims from runtime-pending to runtime-ready only when the Phase-3 release gate is satisfied;
6. fail closed on missing files, owner mismatches, duplicate identities, incomplete evidence, or stale generated release state.

## Non-goals

Phase 4 will not:

- create a new top-level Sociology subject;
- create a parallel Fagverk or Advanced Theory registry;
- move or replace existing Politikk owner chapters;
- rewrite existing verified owner claims;
- weaken full-text evidence requirements;
- hand-edit generator-owned runtime, index, audit, or release artifacts;
- infer new owner mappings outside the production registry and existing canonical reconciliation contract.

## Runtime expansion contract

The shared chapter model gains two optional ordered pointer lists:

```json
{
  "expansionModuleFiles": ["path/to/expansion-module.json"],
  "expansionClaimsFiles": ["path/to/expansion-claims.json"]
}
```

Both fields are optional. A chapter without either field must hydrate identically to the current runtime.

The shared hydration order is deterministic:

1. load the canonical chapter payload from `chapter.file`;
2. load and merge its existing `moduleFiles` in declared order;
3. load and merge `expansionModuleFiles` in declared order;
4. load the existing base `claimsFile`, if present;
5. load `expansionClaimsFiles` in declared order;
6. validate source and claim identity across the fully hydrated chapter;
7. normalize the completed payload once, after all base and expansion content has been merged.

Expansion support belongs in the shared Fagverk hydration layer rather than a Politikk-specific adapter so every subject keeps one chapter-loading contract.

### Merge invariants

- Base chapter fields remain authoritative unless an expansion contract explicitly defines an additive collection.
- Expansion modules are additive; they cannot silently replace canonical owner metadata, chapter identity, owner subject, or primary domain.
- Claim IDs must be unique across base and all expansions. Any duplicate claim ID fails the hydration/release gate.
- Source IDs must resolve deterministically. A repeated source ID is allowed only when its normalized source record is identical; conflicting definitions fail closed.
- Expansion paths must be repository-relative canonical data paths accepted by the existing loader and release tooling.
- Missing expansion files fail closed; they are not treated as optional runtime content.

## Registration and ownership

The seven Advanced Theory overlay groups are registered as expansions of existing Politikk chapters. Their chapter mapping is not re-derived in Phase 4; the implementation reads it from `production_registry_v1.json` and the existing Phase-3 materialization/audit state.

The canonical Fagverk registry remains the only registry exposed to runtime. The generator that owns the Advanced Theory materialization is responsible for emitting the expansion pointer declarations into the existing canonical chapter/release source surface. Generated outputs must be rebuilt through that owner rather than patched manually.

No owner chapter is copied into a new Advanced Theory tree. The existing chapter remains the root runtime object; Advanced Theory appears only as an additive expansion attached to it.

## Phase-4 promotion state machine

The Phase-4 materializer is a fail-closed transition from the already-materialized Phase-3 state.

### Preconditions

Before any runtime promotion is written, the materializer must prove all of the following from the current source-of-truth files:

- the expected Advanced Theory inventory contains exactly 60 claims;
- every expected claim is present exactly once;
- every claim has `source_evidence.verification_status == "fulltext_verified"`;
- the Phase-3 audit exposes `runtime_release_gate_open == true`;
- all seven overlay groups resolve to existing canonical Politikk owner chapters;
- every referenced expansion module and expansion claims file exists;
- no expansion claim ID collides with a base owner claim or another expansion claim;
- no conflicting duplicate source definition exists;
- the production registry, materialized overlays, and Phase-3 audit agree on claim and owner identity.

If any precondition fails, Phase 4 performs no partial promotion. Generation should use temporary/in-memory output and write authoritative artifacts only after the complete validation set succeeds.

### Successful transition

On success the generator promotes only Advanced Theory generated claim/runtime metadata. Exact enum spelling is resolved from the current validator/runtime contract during implementation planning; the semantic transition is fixed by this design:

- all 60 expected claims become runtime-ready;
- `runtime_ready_count = 60`;
- `runtime_claims_remain_pending = false`;
- `runtime_ready = true`;
- the Phase-4 audit records the exact source inventory and generated artifact digests used for promotion.

Existing owner claims are not rewritten or reclassified by this transition.

## Release integration

The existing Fagverk release generator remains the sole release owner. It is extended so its traversal follows the new expansion pointers reachable from canonical chapters.

For every registered expansion it must:

- include the expansion module and claims paths in the generated release inventory;
- calculate and record the same class of digest/integrity evidence used for other canonical Fagverk assets;
- fail on missing paths or unreadable JSON;
- fail when the registered owner chapter does not match the production authority;
- fail on claim/source identity collisions;
- detect stale generated release output when source expansion assets have changed.

The release manifest is still derived from the existing canonical registry. There is no Advanced Theory release manifest that can become an independent source of truth.

## Runtime data flow

The resulting runtime path is:

`politikk_runtime_manifest.json`
→ `data/fagverk/fagverk_registry.json`
→ existing Politikk owner chapter
→ base `moduleFiles` / base `claimsFile`
→ optional `expansionModuleFiles` / `expansionClaimsFiles`
→ shared Fagverk hydration and normalization
→ existing Fagverk subject/read models and UI.

This preserves one canonical route from subject authority to rendered material.

## Error handling

Phase 4 is fail-closed at both generation and runtime validation boundaries.

Hard failures include:

- release gate closed;
- fewer or more than 60 Advanced Theory claims;
- expected claim missing or duplicated;
- non-fulltext-verified evidence on any promoted claim;
- unknown owner chapter;
- expansion path outside the accepted canonical data surface;
- missing expansion file;
- duplicate claim ID;
- conflicting duplicate source ID;
- generated release inventory or digest drift.

No fallback may silently omit an Advanced Theory expansion after it has been registered as runtime-ready.

## TDD and verification

Implementation starts from the existing Phase-3 runtime-pending state as RED.

### RED coverage

Tests must first demonstrate that, on the approved baseline contract:

- the shared hydrator cannot yet expose the registered Advanced Theory expansion claims;
- the Phase-3 audit still reports zero runtime-ready Advanced Theory claims;
- the existing release traversal does not yet own expansion assets.

### GREEN coverage

The implementation must prove:

- chapters without expansion fields hydrate byte/semantic-equivalently to current behavior;
- a chapter with expansion modules hydrates base content first and additive expansion content in declared order;
- base and expansion claims are both available through the existing read model;
- exactly 60 Advanced Theory claims become runtime-ready;
- all 60 claim IDs are unique across the hydrated owner chapters;
- source identity handling is deterministic;
- all seven overlay groups are bound only to owner chapters authorized by the production registry;
- the release generator includes every expansion asset and its integrity evidence;
- generated outputs are reproducible from source-of-truth inputs.

Negative tests must cover at least: gate closed, missing expansion file, missing claim, duplicate claim ID, conflicting source ID, owner mismatch, non-fulltext-verified evidence, and stale generated release state.

### Regression gates

After the focused Phase-4 tests pass, implementation must run the repository's current targeted Sociology/Fagverk gate, Politikk/Fagverk runtime tests, generator/release integrity checks, and the broader exact-head checks required by the current package/workflow contract. The implementation plan resolves the exact current command names from fresh `main`; it must not invent or bypass repository-owned gates.

## Generator ownership

Hand-maintained inputs and generator-owned outputs remain separated.

The implementation may change:

- shared runtime source code required to understand the generic expansion contract;
- hand-maintained or generator-input mapping data already owned by the Advanced Theory production flow;
- the owning materializer/builder and its tests.

Runtime/audit/index/release artifacts owned by those generators are changed only by running their owners. A clean regeneration check is required before merge.

## CI, merge, and post-merge proof

The implementation branch is mergeable only when:

1. focused Phase-4 TDD is green;
2. the generated diff is clean and reproducible;
3. all required Fagverk/Politikk/domain-registry gates are green on the exact head;
4. broader required repository checks are green on that same exact head;
5. no unrelated generated or canonical data drift is present.

After merge, record the merge/main SHA and verify the applicable post-merge integrity/deploy checks before declaring Phase 4 closed.

## Rollback properties

The design is additive. Removing the expansion registrations and regenerating their Phase-4 outputs restores the prior runtime because base chapter files, base module pointers, base claims, canonical subject IDs, and owner chapters are unchanged.

No canonical ID migration is required for rollback.

## Implementation-plan constraints

The implementation plan must resolve two repository-specific details from fresh source before code changes:

1. the exact current runtime-ready status/classification enum values expected by validators;
2. the exact existing Fagverk release-builder/materializer entry points that own release inventory and digests.

Those are implementation bindings, not open architecture decisions. The architecture is fixed by this design: one canonical registry, additive shared chapter expansions, generator-owned release outputs, 60/60 gated promotion, and no parallel Sociology runtime.