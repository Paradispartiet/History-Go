# Phase 63 preflight: typecheck baseline drift audit

## Status

- Phase 63 was stopped before any DebateEngine code change. This audit is intentionally report-only.
- No JavaScript, schemas/globals, data, UI, CSS, HTML, package, workflow, manifest, test, or migration files were changed by this audit.
- The committed `reports/typecheck-baseline-report.md` was copied to `/tmp/typecheck-baseline-committed-phase-63-preflight.md`, a fresh report was generated and copied to `/tmp/typecheck-baseline-fresh-phase-63-preflight.md`, and the committed report was restored immediately with `git restore reports/typecheck-baseline-report.md`.

## Start-control results

| Check | Result |
| --- | --- |
| `git status --porcelain=v1` | Only `?? node_modules/` was present before the audit report was created. |
| `git status --porcelain=v1 --untracked-files=no` | Empty; no tracked local changes were present. |
| `git log -1 --oneline` | `247c9c3 Update sw.js` |
| Required files | `.github/workflows/typecheck-baseline.yml`, `reports/typecheck-baseline-report.md`, `reports/civication-next-local-typecheck-candidates-phase-62.md`, and `js/Civication/systems/civicationDebateEngine.js` all existed. |

### Untracked-file assessment

`node_modules/` is untracked, but it is explicitly excluded by `tsconfig.json`. The TypeScript include set is limited to `js/**/*.js`, `scripts/**/*.js`, root `*.js`, `schemas/**/*.ts`, and `schemas/**/*.d.ts`; the exclude set includes `node_modules`, `dist`, `build`, and `.cache`. Therefore the observed baseline drift is not explained by the untracked `node_modules/` directory.

## Committed baseline vs fresh observed baseline

| Metric | Committed baseline | Fresh observed | Delta |
| --- | ---: | ---: | ---: |
| Total diagnostics | 1857 | 1875 | +18 |
| Files with diagnostics | 191 | 191 | 0 |
| `other` | 571 | 571 | 0 |
| `js/ui/**` | 510 | 517 | +7 |
| `js/Civication/**` | 473 | 473 | 0 |
| `CivicationUI.js` | 106 | 106 | 0 |
| `CivicationMiniSectionsUI.js` | 22 | 22 | 0 |
| `civicationEventEngine.js` | 23 | 23 | 0 |
| `civicationEconomyEngine.js` | 0 | 0 | 0 |
| `js/profile.js` | 83 | 83 | 0 |
| `js/state/**` | 16 | 16 | 0 |
| `js/boot.js` | 75 | 76 | +1 |
| `js/dataHub.js` | 11 | 21 | +10 |
| TS2339 | 1508 | 1524 | +16 |
| TS2551 | 137 | 137 | 0 |
| TS2322 | 20 | 20 | 0 |
| TS2349 | 12 | 14 | +2 |

The file count stayed at 191, so the drift is additional diagnostics in files that were already part of the baseline, not diagnostics from newly included files.

## Drift source

The committed baseline matches the raw typecheck output at commit `4a7e6d3 Phase 62: audit next Civication local typecheck candidates`:

- 1857 diagnostics
- 191 files with diagnostics
- TS2339: 1508
- TS2349: 12

Running the same TypeScript check at commit `a934a1a Add Lesespor to DataHub and PlaceCard` produces the current observed totals:

- 1875 diagnostics
- 191 files with diagnostics
- TS2339: 1524
- TS2349: 14

That means the baseline report is stale relative to later committed source changes. The relevant TypeScript-included files changed by `a934a1a` are:

- `js/boot.js`
- `js/dataHub.js`
- `js/ui/place-card.js`

The later `247c9c3 Update sw.js` commit does not explain the drift; the fresh counts already match at `a934a1a`.

## New/extra diagnostics in `js/ui/**`

Fresh `js/ui/**` diagnostics increased from 510 to 517 (+7), all in `js/ui/place-card.js`.

The semantic comparison below normalizes away line-number shifts by comparing `(file, error code, message)` between the Phase 62 raw baseline and fresh raw output. It shows 13 new/changed `js/ui/place-card.js` diagnostics, offset by 6 old `js/ui/place-card.js` diagnostics that disappeared or changed wording/type text, yielding the net +7 in `js/ui/**`.

### New/changed `js/ui/place-card.js` diagnostics

| Fresh diagnostic |
| --- |
| `js/ui/place-card.js(87,21): error TS2339: Property 'getLesesporForPlace' does not exist on type 'Window & typeof globalThis'.` |
| `js/ui/place-card.js(88,19): error TS2339: Property 'getLesesporForPlace' does not exist on type 'Window & typeof globalThis'.` |
| `js/ui/place-card.js(92,22): error TS2339: Property 'LESESPOR_BY_PLACE' does not exist on type 'Window & typeof globalThis'.` |
| `js/ui/place-card.js(93,37): error TS2339: Property 'LESESPOR_BY_PLACE' does not exist on type 'Window & typeof globalThis'.` |
| `js/ui/place-card.js(93,69): error TS2339: Property 'LESESPOR_BY_PLACE' does not exist on type 'Window & typeof globalThis'.` |
| `js/ui/place-card.js(167,23): error TS2741: Property 'id' is missing in type 'Record<string, unknown>' but required in type 'Place'.` |
| `js/ui/place-card.js(173,29): error TS2339: Property 'LESESPOR' does not exist on type 'Window & typeof globalThis'.` |
| `js/ui/place-card.js(175,28): error TS2349: This expression is not callable.` |
| `js/ui/place-card.js(280,43): error TS2345: Argument of type 'Place \| Record<string, unknown>' is not assignable to parameter of type 'Record<string, unknown> \| PlaceCardPlace'.` |
| `js/ui/place-card.js(283,67): error TS2345: Argument of type 'Place \| Record<string, unknown>' is not assignable to parameter of type 'Record<string, unknown> \| PlaceCardPlace'.` |
| `js/ui/place-card.js(297,49): error TS2345: Argument of type 'Place \| Record<string, unknown>' is not assignable to parameter of type 'Record<string, unknown> \| PlaceCardPlace'.` |
| `js/ui/place-card.js(1520,41): error TS2345: Argument of type 'Record<string, unknown> \| PlaceCardPlace' is not assignable to parameter of type 'Place'.` |
| `js/ui/place-card.js(1529,47): error TS2345: Argument of type 'Record<string, unknown> \| PlaceCardPlace' is not assignable to parameter of type 'Place'.` |

### Offset/changed old `js/ui/place-card.js` diagnostics

These six baseline diagnostics no longer appear with the same `(file, error code, message)` shape after the Lesespor changes, which is why 13 new/changed diagnostics become a net +7 for `js/ui/**`.

| Baseline diagnostic no longer matching fresh output |
| --- |
| `js/ui/place-card.js(91,23): error TS2741: Property 'id' is missing in type 'PlaceCardRecord' but required in type 'Place'.` |
| `js/ui/place-card.js(195,43): error TS2345: Argument of type 'Place \| PlaceCardRecord' is not assignable to parameter of type 'PlaceCardRecord \| PlaceCardPlace'.` |
| `js/ui/place-card.js(198,67): error TS2345: Argument of type 'Place \| PlaceCardRecord' is not assignable to parameter of type 'PlaceCardRecord \| PlaceCardPlace'.` |
| `js/ui/place-card.js(212,49): error TS2345: Argument of type 'Place \| PlaceCardRecord' is not assignable to parameter of type 'PlaceCardRecord \| PlaceCardPlace'.` |
| `js/ui/place-card.js(1434,41): error TS2345: Argument of type 'PlaceCardRecord \| PlaceCardPlace' is not assignable to parameter of type 'Place'.` |
| `js/ui/place-card.js(1443,47): error TS2345: Argument of type 'PlaceCardRecord \| PlaceCardPlace' is not assignable to parameter of type 'Place'.` |

### Net `js/ui/**` error-code movement

| File | Error code | Committed raw count | Fresh raw count | Delta |
| --- | ---: | ---: | ---: | ---: |
| `js/ui/place-card.js` | TS2339 | 113 | 119 | +6 |
| `js/ui/place-card.js` | TS2349 | 0 | 1 | +1 |
| `js/ui/place-card.js` | all codes | 142 | 149 | +7 |

## New/extra TS2349 diagnostics

TS2349 increased from 12 to 14 (+2). The two extra TS2349 diagnostics are:

| Fresh diagnostic |
| --- |
| `js/boot.js(412,43): error TS2349: This expression is not callable.` |
| `js/ui/place-card.js(175,28): error TS2349: This expression is not callable.` |

Net TS2349 movement by file:

| File | Committed raw count | Fresh raw count | Delta |
| --- | ---: | ---: | ---: |
| `js/boot.js` | 1 | 2 | +1 |
| `js/ui/place-card.js` | 0 | 1 | +1 |
| All files | 12 | 14 | +2 |

## New/extra TS2339 diagnostics

TS2339 increased from 1508 to 1524 (+16). The net TS2339 increase is fully explained by Lesespor-related globals in two files:

| File | Committed raw count | Fresh raw count | Delta | New global/property names represented |
| --- | ---: | ---: | ---: | --- |
| `js/dataHub.js` | 10 | 20 | +10 | `LESESPOR`, `LESESPOR_BY_PLACE`, `getLesesporForPlace` |
| `js/ui/place-card.js` | 113 | 119 | +6 | `LESESPOR`, `LESESPOR_BY_PLACE`, `getLesesporForPlace` |
| All files | 1508 | 1524 | +16 | Lesespor-related window globals |

## Civication stability

`js/Civication/**` is stable for this preflight:

- Committed baseline: 473 diagnostics
- Fresh observed baseline: 473 diagnostics
- `CivicationUI.js`: 106 diagnostics in both reports
- `CivicationMiniSectionsUI.js`: 22 diagnostics in both reports
- `civicationEventEngine.js`: 23 diagnostics in both reports
- `civicationEconomyEngine.js`: 0 diagnostics in both reports

No new or extra diagnostics were observed in `js/Civication/**`, so the stopped Phase 63 DebateEngine work can be resumed after a baseline-repair step without first investigating Civication drift.

## Cause assessment

| Possible cause | Assessment |
| --- | --- |
| Untracked files hidden by `git status --untracked-files=no` | Not the cause. Only `node_modules/` was untracked, and `tsconfig.json` excludes it. |
| Local/generated files included by `tsconfig.json` | Not observed. No untracked files under included `js/`, `scripts/`, root `*.js`, or `schemas/` paths were present. |
| Difference between committed report and current typecheck output | Yes. The committed report still records the Phase 62-era 1857 baseline, while current source produces 1875 diagnostics. |
| Recent merge/source change not reflected in baseline | Yes. `a934a1a Add Lesespor to DataHub and PlaceCard` introduced the current observed counts in TypeScript-included JS files, but `reports/typecheck-baseline-report.md` was not refreshed afterward. |
| Nondeterministic/script-related report generation | Not indicated. Re-running raw typecheck and report generation produced the same fresh totals, and checking commit `a934a1a` produced the same 1875-diagnostic total as current HEAD. |
| Other concrete cause | The concrete cause is a stale committed baseline after Lesespor JS changes in `js/boot.js`, `js/dataHub.js`, and `js/ui/place-card.js`. |

## Recommendation

1. Open a baseline-only repair PR that refreshes `reports/typecheck-baseline-report.md` to the current 1875-diagnostic output, because the drift is caused by a stale committed baseline rather than untracked/generated files.
2. After that baseline-only repair lands, resume Phase 63 DebateEngine work with the preflight expectation that `js/Civication/**` remains at 473 diagnostics.
3. Do not remove `node_modules/` as part of this audit; it is untracked, excluded from TypeScript, and not the source of the drift.

## Commands run

```text
git status --porcelain=v1
git status --porcelain=v1 --untracked-files=no
git log -1 --oneline
test -f .github/workflows/typecheck-baseline.yml
test -f reports/typecheck-baseline-report.md
test -f reports/civication-next-local-typecheck-candidates-phase-62.md
test -f js/Civication/systems/civicationDebateEngine.js
cp reports/typecheck-baseline-report.md /tmp/typecheck-baseline-committed-phase-63-preflight.md
npm run typecheck:report
cp reports/typecheck-baseline-report.md /tmp/typecheck-baseline-fresh-phase-63-preflight.md
git restore reports/typecheck-baseline-report.md
npm run typecheck > /tmp/typecheck-full-phase-63-preflight.txt 2>&1 || true
grep "js/ui/" /tmp/typecheck-full-phase-63-preflight.txt > /tmp/typecheck-js-ui-phase-63-preflight.txt || true
grep "js/Civication/" /tmp/typecheck-full-phase-63-preflight.txt > /tmp/typecheck-civication-phase-63-preflight.txt || true
grep "TS2349" /tmp/typecheck-full-phase-63-preflight.txt > /tmp/typecheck-ts2349-phase-63-preflight.txt || true
grep "TS2339" /tmp/typecheck-full-phase-63-preflight.txt > /tmp/typecheck-ts2339-phase-63-preflight.txt || true
diff -u /tmp/typecheck-baseline-committed-phase-63-preflight.md /tmp/typecheck-baseline-fresh-phase-63-preflight.md || true
```
