# Phase 73 preflight: audit non-Civication typecheck baseline drift

## Status

Phase 73 was stopped before any `dayFactionNpcReactions` code change. This is an audit-only preflight report explaining why the committed `reports/typecheck-baseline-report.md` baseline no longer matches a fresh `npm run typecheck:report` run.

No JS, schemas/globals, data, AHA, UI, CSS, HTML, package, manifest, workflow, test, or `TYPESCRIPT_MIGRATION.md` files were changed by this audit.

## Start control

- `git log -1 --oneline`: `36778dd People of Places: Lisboa popkultur batch 1`
- Tracked worktree changes before audit: none.
- Untracked files before audit: `node_modules/`.
- `node_modules/` is outside the TypeScript project scope because `tsconfig.json` excludes `node_modules`; it was not deleted or modified by this audit.
- Required preflight files were present:
  - `.github/workflows/typecheck-baseline.yml`
  - `reports/typecheck-baseline-report.md`
  - `reports/civication-next-local-typecheck-candidates-phase-72.md`
  - `reports/typecheck-baseline-drift-audit-phase-71-preflight.md`
  - `js/Civication/systems/day/dayFactionNpcReactions.js`

## Committed baseline vs fresh observed baseline

The committed baseline was copied to `/tmp/typecheck-baseline-committed-phase-73-preflight.md`. Two fresh `npm run typecheck:report` runs were copied to `/tmp/typecheck-baseline-fresh-phase-73-preflight-run1.md` and `/tmp/typecheck-baseline-fresh-phase-73-preflight-run2.md`.

Run 1 and run 2 had identical diagnostic counts. Their only diff was the generated UTC timestamp in the report metadata, so the drift is deterministic for the current checkout/environment.

| Metric | Committed baseline | Fresh observed | Delta |
| --- | ---: | ---: | ---: |
| Total diagnostics | 1848 | 1855 | +7 |
| Files with diagnostics | 189 | 189 | 0 |
| `other` diagnostics | 579 | 586 | +7 |
| `js/ui/**` diagnostics | 498 | 498 | 0 |
| `js/Civication/**` diagnostics | 457 | 457 | 0 |
| `TS2339` diagnostics | 1497 | 1504 | +7 |
| `TS2551` diagnostics | 137 | 137 | 0 |
| `TS2322` diagnostics | 20 | 20 | 0 |
| `TS2349` diagnostics | 14 | 14 | 0 |

## Drift source

The +7 drift is entirely in `js/psychologyRoom.js`, which is classified as `other` by `tools/typecheck-baseline-report.mjs`.

| File | Area | Previous observed count at `950d711` | Fresh observed count at `HEAD` | Delta | Error code |
| --- | --- | ---: | ---: | ---: | --- |
| `js/psychologyRoom.js` | `other` | 10 | 17 | +7 | `TS2339` |

The net +7 comes from the `Add active day flow to psychology paths` change (`dc82cce`), not from the current HEAD PR #743 Lisboa data/report batch. Comparing raw typecheck output at `950d711` to raw output at `dc82cce` shows 17 new `js/psychologyRoom.js` `TS2339` diagnostics and 10 old `js/psychologyRoom.js` `TS2339` diagnostics removed/shifted, for a net +7. Current `HEAD` has the same raw diagnostics as `630c33b` / Phase 72, so later data/report-only merges did not add additional typecheck drift.

### Concrete new diagnostics at current HEAD

These are the current `js/psychologyRoom.js` `TS2339` diagnostics that were not present at `950d711` before `dc82cce`:

| Diagnostic |
| --- |
| `js/psychologyRoom.js(158,31): error TS2339: Property 'dataset' does not exist on type 'Element'.` |
| `js/psychologyRoom.js(168,62): error TS2339: Property 'dataset' does not exist on type 'Element'.` |
| `js/psychologyRoom.js(494,60): error TS2339: Property 'dataset' does not exist on type 'Element'.` |
| `js/psychologyRoom.js(527,68): error TS2339: Property 'dataset' does not exist on type 'Element'.` |
| `js/psychologyRoom.js(542,53): error TS2339: Property 'elements' does not exist on type 'EventTarget'.` |
| `js/psychologyRoom.js(553,49): error TS2339: Property 'dataset' does not exist on type 'Element'.` |
| `js/psychologyRoom.js(572,45): error TS2339: Property 'dataset' does not exist on type 'Element'.` |
| `js/psychologyRoom.js(598,45): error TS2339: Property 'dataset' does not exist on type 'Element'.` |
| `js/psychologyRoom.js(643,82): error TS2339: Property 'dataset' does not exist on type 'Element'.` |
| `js/psychologyRoom.js(644,89): error TS2339: Property 'value' does not exist on type 'HTMLElement'.` |
| `js/psychologyRoom.js(651,91): error TS2339: Property 'value' does not exist on type 'HTMLElement'.` |
| `js/psychologyRoom.js(652,45): error TS2339: Property 'dataset' does not exist on type 'Element'.` |
| `js/psychologyRoom.js(656,77): error TS2339: Property 'dataset' does not exist on type 'EventTarget'.` |
| `js/psychologyRoom.js(660,73): error TS2339: Property 'dataset' does not exist on type 'EventTarget'.` |
| `js/psychologyRoom.js(664,81): error TS2339: Property 'dataset' does not exist on type 'EventTarget'.` |
| `js/psychologyRoom.js(674,53): error TS2339: Property 'elements' does not exist on type 'EventTarget'.` |
| `js/psychologyRoom.js(746,10): error TS2339: Property 'PsychologyRoom' does not exist on type 'Window & typeof globalThis'.` |

The same comparison also shows 10 pre-existing `js/psychologyRoom.js` `TS2339` diagnostics disappeared or moved because `dc82cce` rewrote/expanded the file. Therefore the committed baseline's net drift is +7 rather than +17.

## Stability checks

- `js/Civication/**` is stable at 457 diagnostics. Phase 73's target file, `js/Civication/systems/day/dayFactionNpcReactions.js`, is not implicated in this drift.
- `js/ui/**` is stable at 498 diagnostics.
- Files with diagnostics remain stable at 189.
- Diagnostic code drift is limited to `TS2339` (+7). `TS2551`, `TS2322`, and `TS2349` match the committed baseline.
- The only untracked path observed was `node_modules/`; it is excluded by `tsconfig.json` and did not create an included source file.

## Recent-merge assessment

- PR #743 / `36778dd` changed data and generated reports only. Those paths are outside `tsconfig.json`'s JS/schema include set, and raw diagnostics at current `HEAD` match raw diagnostics at `630c33b`, so PR #743 is not the source of the +7 typecheck drift.
- PR #742, PR #740, PR #739, and PR #737 are data/report migrations or people/place normalization batches in this range; they do not explain the `js/psychologyRoom.js` diagnostics.
- PR #738 / `dc82cce Add active day flow to psychology paths` changed `js/psychologyRoom.js` and is the commit that raises the fresh typecheck result from 1848 to 1855.
- Phase 72 / `630c33b` kept the committed baseline report at 1848 even though a fresh typecheck at that commit now yields 1855, so the committed report is stale relative to the merged `js/psychologyRoom.js` state.

## Recommendation

The cause is known and localized: `js/psychologyRoom.js` gained a net +7 `TS2339` diagnostics from the active-day-flow psychology change. Because `js/Civication/**` remains stable at 457 and `js/ui/**` remains stable at 498, Phase 73 can resume after a baseline-repair step.

Recommended next step: create a baseline-only refresh PR that updates `reports/typecheck-baseline-report.md` to the deterministic fresh total of 1855, with `other` at 586 and `TS2339` at 1504. Do not proceed with the Phase 73 `dayFactionNpcReactions` code change until that baseline-only repair is either merged or explicitly accepted as the new preflight baseline.
