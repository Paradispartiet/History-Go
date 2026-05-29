# Phase 65 preflight v2: second one-line typecheck baseline drift audit

## Status

- Phase 65 remains stopped before any `js/Civication/systems/day/dayConsequences.js` code change. This phase is audit-only.
- The committed `reports/typecheck-baseline-report.md` was copied to `/tmp/typecheck-baseline-committed-phase-65-preflight-v2.md`, two fresh reports were generated and copied to `/tmp/typecheck-baseline-fresh-phase-65-preflight-v2-run1.md` and `/tmp/typecheck-baseline-fresh-phase-65-preflight-v2-run2.md`, and the committed report was restored immediately with `git restore reports/typecheck-baseline-report.md`.
- The two fresh report runs have identical key metrics. Their only report diff is the generated timestamp.
- No JavaScript, schemas/globals, data, UI, CSS, HTML, package, workflow, manifest, test, or migration files were changed by this audit.

## Start-control results

| Check | Result |
| --- | --- |
| `git status --porcelain=v1` | Only `?? node_modules/` was present before the audit report was created. |
| `git status --porcelain=v1 --untracked-files=no` | Empty; no tracked local changes were present. |
| `git log -1 --oneline` | `546c21f Stram inn aktive Lesespor-data` |
| Required files | `.github/workflows/typecheck-baseline.yml`, `reports/typecheck-baseline-report.md`, `reports/typecheck-baseline-drift-audit-phase-65-preflight.md`, `reports/civication-next-local-typecheck-candidates-phase-62.md`, `js/Civication/systems/day/dayConsequences.js`, and `js/leksikon/leksikon_loader.js` all existed. |

### Untracked-file assessment

`node_modules/` is untracked, but it is explicitly excluded by `tsconfig.json`. The TypeScript include set is limited to `js/**/*.js`, `scripts/**/*.js`, root `*.js`, `schemas/**/*.ts`, and `schemas/**/*.d.ts`; the exclude set includes `node_modules`, `dist`, `build`, and `.cache`. Therefore the observed baseline drift is not explained by the untracked `node_modules/` directory.

## Baseline comparison

| Metric | Committed baseline | PR #711 expected baseline | Fresh observed baseline | Delta vs committed | Delta vs PR #711 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Total diagnostics | 1873 | 1874 | 1875 | +2 | +1 |
| Files with diagnostics | 191 | 191 | 191 | 0 | 0 |
| `other` | 577 | 578 | 579 | +2 | +1 |
| `js/ui/**` | 516 | 516 | 516 | 0 | 0 |
| `js/Civication/**` | 466 | 466 | 466 | 0 | 0 |
| TS2339 | 1522 | 1523 | 1524 | +2 | +1 |
| TS2551 | 137 | 137 | 137 | 0 | 0 |
| TS2322 | 20 | 20 | 20 | 0 | 0 |
| TS2349 | 14 | 14 | 14 | 0 | 0 |

The file count stayed at 191, so the second drift is another diagnostic in a file that was already part of the baseline, not a newly included file.

## Determinism check

Two consecutive `npm run typecheck:report` runs produced the same key metrics:

- total diagnostics: 1875
- files with diagnostics: 191
- `other`: 579
- `js/Civication/**`: 466
- TS2339: 1524

The only diff between `/tmp/typecheck-baseline-fresh-phase-65-preflight-v2-run1.md` and `/tmp/typecheck-baseline-fresh-phase-65-preflight-v2-run2.md` was the generated timestamp. This does not indicate nondeterministic diagnostic generation.

## Exact second drift source

PR #711 already explained the first `other +1` / `TS2339 +1` as this diagnostic in `js/leksikon/leksikon_loader.js`:

```text
js/leksikon/leksikon_loader.js(814,14): error TS2339: Property 'HGLeksikon' does not exist on type 'Window & typeof globalThis'.
```

That came from the header-button call site:

```js
window.HGLeksikon?.openLesespor?.();
```

The current second drift is still in `js/leksikon/leksikon_loader.js`, but it is a different global-property diagnostic. After `ccf9f73 Move Lesespor into PlaceCard stories`, the previous `window.HGLeksikon?.openLesespor?.()` call site was replaced by a separate `window.HGLesespor?.openAll?.()` call site, and a new global assignment was added for `window.HGLesespor`. The call-site replacement is count-neutral against PR #711's already explained diagnostic; the additional assignment is the new +1.

The exact additional diagnostic that explains 1874 -> 1875 is:

```text
js/leksikon/leksikon_loader.js(968,10): error TS2339: Property 'HGLesespor' does not exist on type 'Window & typeof globalThis'.
```

The relevant current diagnostics in the same file are:

```text
js/leksikon/leksikon_loader.js(800,14): error TS2339: Property 'HGLesespor' does not exist on type 'Window & typeof globalThis'.
js/leksikon/leksikon_loader.js(960,10): error TS2339: Property 'HGLeksikon' does not exist on type 'Window & typeof globalThis'.
js/leksikon/leksikon_loader.js(968,10): error TS2339: Property 'HGLesespor' does not exist on type 'Window & typeof globalThis'.
```

Compared with the PR #711 expected shape, `js/leksikon/leksikon_loader.js` moves from 20 to 21 diagnostics. Compared with the committed baseline, the same file moves from the older 19-diagnostic shape to 21 diagnostics. Those two `js/leksikon/leksikon_loader.js` TS2339 diagnostics account for both `other +2` and `TS2339 +2` versus the committed baseline:

| Relative baseline | File | Area | Diagnostic | Error code | Delta |
| --- | --- | --- | --- | --- | ---: |
| Committed -> PR #711 | `js/leksikon/leksikon_loader.js` | `other` | `js/leksikon/leksikon_loader.js(814,14): error TS2339: Property 'HGLeksikon' does not exist on type 'Window & typeof globalThis'.` | TS2339 | +1 |
| PR #711 -> fresh v2 | `js/leksikon/leksikon_loader.js` | `other` | `js/leksikon/leksikon_loader.js(968,10): error TS2339: Property 'HGLesespor' does not exist on type 'Window & typeof globalThis'.` | TS2339 | +1 |
| Committed -> fresh v2 | `js/leksikon/leksikon_loader.js` | `other` | Combined two diagnostics above | TS2339 | +2 |

## Commit/cause assessment

| Possible cause | Assessment |
| --- | --- |
| Untracked/generated files in typecheck scope | Not the cause. The only untracked path is `node_modules/`, and `tsconfig.json` excludes it. |
| Nondeterministic report generation | Not indicated. The two fresh report runs had identical key metrics; only timestamps differed. |
| HEAD `546c21f Stram inn aktive Lesespor-data` | Not the cause. Running the same typecheck at `HEAD^` (`ccf9f73`) produced the same 1875 total diagnostics, 466 `js/Civication/**` diagnostics, 1524 TS2339 diagnostics, and 21 `js/leksikon/leksikon_loader.js` diagnostics as HEAD. `546c21f` changed Lesespor data files and `tools/validate_lesespor.mjs`; it did not introduce the second observed `js/leksikon/leksikon_loader.js` TS2339 drift. |
| `ccf9f73 Move Lesespor into PlaceCard stories` | Cause found. Comparing `ccf9f73^` (`9a063fc`) to `ccf9f73` shows total diagnostics 1874 -> 1875, TS2339 1523 -> 1524, and `js/leksikon/leksikon_loader.js` 20 -> 21. The new net diagnostic is `window.HGLesespor = { ... }` at current line 968. |
| Stale committed baseline | Yes. `reports/typecheck-baseline-report.md` records total 1873, `other: 577`, and TS2339: 1522, but the current reproducible typecheck output is total 1875, `other: 579`, and TS2339: 1524. |

## Civication stability and Phase 65 readiness

`js/Civication/**` is stable for this preflight:

- committed baseline: 466 diagnostics
- PR #711 expected baseline: 466 diagnostics
- fresh observed run 1: 466 diagnostics
- fresh observed run 2: 466 diagnostics
- raw typecheck at `ccf9f73` (`HEAD^`): 466 diagnostics
- raw typecheck at HEAD `546c21f`: 466 diagnostics

The drift is outside Civication and does not come from `js/Civication/systems/day/dayConsequences.js`. Phase 65 can be resumed after a baseline-only repair refreshes the committed report to the current output.

## Recommendation

1. Open a baseline-only refresh PR for `reports/typecheck-baseline-report.md` to 1875 diagnostics, because the committed report is stale relative to current reproducible typecheck output.
2. Do not remove `node_modules/` as part of this audit; it is untracked, excluded from TypeScript, and not the source of the drift.
3. After the baseline-only refresh lands, resume Phase 65 against `js/Civication/systems/day/dayConsequences.js` with the expectation that `js/Civication/**` remains at 466 diagnostics.
4. If a future preflight observes any additional mismatch beyond 1875/191/579/466/1524, stop again and audit that new drift before changing `dayConsequences.js`.

## Commands run

```text
git status --porcelain=v1
git status --porcelain=v1 --untracked-files=no
git log -1 --oneline
test -f .github/workflows/typecheck-baseline.yml
test -f reports/typecheck-baseline-report.md
test -f reports/typecheck-baseline-drift-audit-phase-65-preflight.md
test -f reports/civication-next-local-typecheck-candidates-phase-62.md
test -f js/Civication/systems/day/dayConsequences.js
test -f js/leksikon/leksikon_loader.js
cp reports/typecheck-baseline-report.md /tmp/typecheck-baseline-committed-phase-65-preflight-v2.md
npm run typecheck:report
cp reports/typecheck-baseline-report.md /tmp/typecheck-baseline-fresh-phase-65-preflight-v2-run1.md
npm run typecheck:report
cp reports/typecheck-baseline-report.md /tmp/typecheck-baseline-fresh-phase-65-preflight-v2-run2.md
diff -u /tmp/typecheck-baseline-fresh-phase-65-preflight-v2-run1.md /tmp/typecheck-baseline-fresh-phase-65-preflight-v2-run2.md || true
git restore reports/typecheck-baseline-report.md
npm run typecheck > /tmp/typecheck-full-phase-65-preflight-v2.txt 2>&1 || true
grep "js/Civication/" /tmp/typecheck-full-phase-65-preflight-v2.txt > /tmp/typecheck-civication-phase-65-preflight-v2.txt || true
grep "TS2339" /tmp/typecheck-full-phase-65-preflight-v2.txt > /tmp/typecheck-ts2339-phase-65-preflight-v2.txt || true
grep "js/leksikon/leksikon_loader.js" /tmp/typecheck-full-phase-65-preflight-v2.txt > /tmp/typecheck-leksikon-loader-phase-65-preflight-v2.txt || true
grep -v "js/Civication/" /tmp/typecheck-full-phase-65-preflight-v2.txt > /tmp/typecheck-non-civication-phase-65-preflight-v2.txt || true
diff -u /tmp/typecheck-baseline-committed-phase-65-preflight-v2.md /tmp/typecheck-baseline-fresh-phase-65-preflight-v2-run1.md || true
git worktree add --detach /tmp/hg-phase65-v2-headprev HEAD^
PATH=/workspace/History-Go/node_modules/.bin:$PATH npm run typecheck > /tmp/typecheck-full-phase65-v2-headprev.txt 2>&1 || true
git worktree add --detach /tmp/hg-phase65-v2-before-ccf ccf9f73^
PATH=/workspace/History-Go/node_modules/.bin:$PATH npm run typecheck > /tmp/typecheck-full-phase65-v2-before-ccf.txt 2>&1 || true
python3 one-off counters over /tmp/typecheck-full-phase-65-preflight-v2.txt, /tmp/typecheck-full-phase65-v2-headprev.txt, and /tmp/typecheck-full-phase65-v2-before-ccf.txt
git diff --name-only
```
