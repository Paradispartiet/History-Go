# Phase 65 preflight: one-line typecheck baseline drift audit

## Status

- Phase 65 was stopped before any `js/Civication/systems/day/dayConsequences.js` code change. This phase is audit-only.
- The committed `reports/typecheck-baseline-report.md` was copied to `/tmp/typecheck-baseline-committed-phase-65-preflight.md`, two fresh reports were generated and copied to `/tmp/typecheck-baseline-fresh-phase-65-preflight-run1.md` and `/tmp/typecheck-baseline-fresh-phase-65-preflight-run2.md`, and the committed report was restored immediately with `git restore reports/typecheck-baseline-report.md`.
- No JavaScript, schemas/globals, data, UI, CSS, HTML, package, workflow, manifest, test, or migration files were changed by this audit.

## Start-control results

| Check | Result |
| --- | --- |
| `git status --porcelain=v1` | Only `?? node_modules/` was present before the audit report was created. |
| `git status --porcelain=v1 --untracked-files=no` | Empty; no tracked local changes were present. |
| `git log -1 --oneline` | `42bf36a Update sw.js` |
| Required files | `.github/workflows/typecheck-baseline.yml`, `reports/typecheck-baseline-report.md`, `reports/civication-next-local-typecheck-candidates-phase-62.md`, `reports/typecheck-baseline-drift-audit-phase-63-preflight.md`, and `js/Civication/systems/day/dayConsequences.js` all existed. |

### Untracked-file assessment

`node_modules/` is untracked, but it is explicitly excluded by `tsconfig.json`. The TypeScript include set is limited to `js/**/*.js`, `scripts/**/*.js`, root `*.js`, `schemas/**/*.ts`, and `schemas/**/*.d.ts`; the exclude set includes `node_modules`, `dist`, `build`, and `.cache`. Therefore the observed baseline drift is not explained by the untracked `node_modules/` directory.

## Committed baseline vs fresh observed baseline

| Metric | Committed baseline | Fresh observed | Delta |
| --- | ---: | ---: | ---: |
| Total diagnostics | 1873 | 1874 | +1 |
| Files with diagnostics | 191 | 191 | 0 |
| `other` | 577 | 578 | +1 |
| `js/ui/**` | 516 | 516 | 0 |
| `js/Civication/**` | 466 | 466 | 0 |
| `CivicationUI.js` | 106 | 106 | 0 |
| `CivicationMiniSectionsUI.js` | 22 | 22 | 0 |
| `civicationEventEngine.js` | 23 | 23 | 0 |
| `civicationEconomyEngine.js` | 0 | 0 | 0 |
| `js/profile.js` | 83 | 83 | 0 |
| `js/state/**` | 16 | 16 | 0 |
| TS2339 | 1522 | 1523 | +1 |
| TS2551 | 137 | 137 | 0 |
| TS2322 | 20 | 20 | 0 |
| TS2349 | 14 | 14 | 0 |

The file count stayed at 191, so the drift is one additional diagnostic in a file that was already part of the baseline, not a newly included file.

## Determinism check

Two consecutive `npm run typecheck:report` runs produced the same key metrics:

- total diagnostics: 1874
- files with diagnostics: 191
- `other`: 578
- `js/Civication/**`: 466
- TS2339: 1523

The only diff between `/tmp/typecheck-baseline-fresh-phase-65-preflight-run1.md` and `/tmp/typecheck-baseline-fresh-phase-65-preflight-run2.md` was the generated timestamp. This does not indicate nondeterministic diagnostic generation.

## Exact drift source

The `other +1` and `TS2339 +1` are explained by `js/leksikon/leksikon_loader.js`, which now has 20 diagnostics instead of the 19-diagnostic shape represented by the committed baseline era.

| File | Area | Committed-era count | Fresh count | Delta | Error code |
| --- | --- | ---: | ---: | ---: | --- |
| `js/leksikon/leksikon_loader.js` | `other` | 19 | 20 | +1 | TS2339 |

The exact additional diagnostic is:

```text
js/leksikon/leksikon_loader.js(814,14): error TS2339: Property 'HGLeksikon' does not exist on type 'Window & typeof globalThis'.
```

That line is the header-button click handler added in `034a8ea Rydd Lesespor visninger og data`:

```js
window.HGLeksikon?.openLesespor?.();
```

A semantic comparison of `js/leksikon/leksikon_loader.js` diagnostics before and after the Lesespor cleanup shows the existing `window.HGLeksikon` global assignment diagnostic remained, while this new call site adds a second `HGLeksikon` TS2339 in the same tracked JS file. This is why `js/leksikon/leksikon_loader.js` moves from 19 to 20 diagnostics without changing the total file count.

## Commit/cause assessment

| Possible cause | Assessment |
| --- | --- |
| Untracked/generated files in typecheck scope | Not the cause. The only untracked path is `node_modules/`, and `tsconfig.json` excludes it. |
| Nondeterministic/script-related report generation | Not indicated. The two fresh report runs had identical key metrics; only timestamps differed. |
| Latest HEAD differing from the stopped-thread commit | HEAD is `42bf36a Update sw.js`, not `405a50d`. The `sw.js` update changes only `SW_VERSION` and the fresh `sw.js` diagnostic count remains 12, so it does not explain the drift. |
| Commit `405a50d Batch 17: verify and align remaining vitenskap emne_ids` | Not the cause. Running the same typecheck at `405a50d` produced the same 1874/191/578/466/1523 key metrics as HEAD, and `405a50d` changes data/report files rather than a TypeScript-included JS call site. |
| Earlier source change not reflected in baseline | Cause found. `034a8ea Rydd Lesespor visninger og data` changed the tracked TypeScript-included file `js/leksikon/leksikon_loader.js` and added the `window.HGLeksikon?.openLesespor?.()` read that produces the extra `TS2339`. |
| Stale committed baseline | Yes. `reports/typecheck-baseline-report.md` records `other: 577` and `TS2339: 1522`, but the current reproducible typecheck output is `other: 578` and `TS2339: 1523`. |

## Civication stability and Phase 65 readiness

`js/Civication/**` is stable for this preflight:

- committed baseline: 466 diagnostics
- fresh observed run 1: 466 diagnostics
- fresh observed run 2: 466 diagnostics
- raw typecheck at `405a50d`: 466 diagnostics
- raw typecheck at HEAD `42bf36a`: 466 diagnostics

The drift is outside Civication and does not come from `js/Civication/systems/day/dayConsequences.js`. Phase 65 can be resumed after a baseline-only repair refreshes the committed report to the current output.

## Recommendation

1. Open a baseline-only refresh PR for `reports/typecheck-baseline-report.md`, because the committed report is stale relative to current reproducible typecheck output.
2. Do not remove `node_modules/` as part of this audit; it is untracked, excluded from TypeScript, and not the source of the drift.
3. After the baseline-only refresh lands, resume Phase 65 against `js/Civication/systems/day/dayConsequences.js` with the expectation that `js/Civication/**` remains at 466 diagnostics.

## Commands run

```text
git status --porcelain=v1
git status --porcelain=v1 --untracked-files=no
git log -1 --oneline
test -f .github/workflows/typecheck-baseline.yml
test -f reports/typecheck-baseline-report.md
test -f reports/civication-next-local-typecheck-candidates-phase-62.md
test -f reports/typecheck-baseline-drift-audit-phase-63-preflight.md
test -f js/Civication/systems/day/dayConsequences.js
cp reports/typecheck-baseline-report.md /tmp/typecheck-baseline-committed-phase-65-preflight.md
npm run typecheck:report
cp reports/typecheck-baseline-report.md /tmp/typecheck-baseline-fresh-phase-65-preflight-run1.md
npm run typecheck:report
cp reports/typecheck-baseline-report.md /tmp/typecheck-baseline-fresh-phase-65-preflight-run2.md
diff -u /tmp/typecheck-baseline-fresh-phase-65-preflight-run1.md /tmp/typecheck-baseline-fresh-phase-65-preflight-run2.md || true
git restore reports/typecheck-baseline-report.md
npm run typecheck > /tmp/typecheck-full-phase-65-preflight.txt 2>&1 || true
grep "js/Civication/" /tmp/typecheck-full-phase-65-preflight.txt > /tmp/typecheck-civication-phase-65-preflight.txt || true
grep "TS2339" /tmp/typecheck-full-phase-65-preflight.txt > /tmp/typecheck-ts2339-phase-65-preflight.txt || true
grep -v "js/Civication/" /tmp/typecheck-full-phase-65-preflight.txt > /tmp/typecheck-non-civication-phase-65-preflight.txt || true
diff -u /tmp/typecheck-baseline-committed-phase-65-preflight.md /tmp/typecheck-baseline-fresh-phase-65-preflight-run1.md || true
git worktree add --detach /tmp/hg-phase65-4a4c 4a4c8eb
git worktree add --detach /tmp/hg-phase65-405a 405a50d
git worktree add --detach /tmp/hg-phase65-5fdc 5fdc33b
git worktree add --detach /tmp/hg-phase65-87 87bcefa
PATH=/workspace/History-Go/node_modules/.bin:$PATH npm run typecheck > /tmp/typecheck-full-phase65-4a4c.txt 2>&1 || true
PATH=/workspace/History-Go/node_modules/.bin:$PATH npm run typecheck > /tmp/typecheck-full-phase65-405a.txt 2>&1 || true
PATH=/workspace/History-Go/node_modules/.bin:$PATH npm run typecheck > /tmp/typecheck-full-phase65-5fdc.txt 2>&1 || true
PATH=/workspace/History-Go/node_modules/.bin:$PATH npm run typecheck > /tmp/typecheck-full-phase65-87.txt 2>&1 || true
python3 one-off counters over /tmp/typecheck-full-phase-65-preflight.txt and comparison outputs
git diff --name-only
```
