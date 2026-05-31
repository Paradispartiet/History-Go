# Phase 71 preflight: typecheck baseline drift audit

## Status

Phase 71 was stopped before any `js/Civication/systems/civicationRoleStarter.js` code change because the baseline preflight did not match the committed `reports/typecheck-baseline-report.md` after PR #731.

This phase is audit-only. No JS, schemas/globals, data, UI, CSS, HTML, package, manifest, test, or workflow files were intentionally changed.

## Start control

- HEAD during the audit: `7b0f873 Support Leksikon hubs without articles`.
- Required files were present:
  - `.github/workflows/typecheck-baseline.yml`
  - `reports/typecheck-baseline-report.md`
  - `reports/civication-next-local-typecheck-candidates-phase-66.md`
  - `js/Civication/systems/civicationRoleStarter.js`
- Tracked working tree changes before the audit: none.
- Untracked files before the audit: `node_modules/`.
- `node_modules/` is outside the TypeScript project scope because `tsconfig.json` includes only `js/**/*.js`, `scripts/**/*.js`, root `*.js`, `schemas/**/*.ts`, and `schemas/**/*.d.ts`, and explicitly excludes `node_modules`.

## Determinism check

`npm run typecheck:report` was run twice. The two fresh report files had the same diagnostic counts and only differed in the generated timestamp metadata, so the observed counts are deterministic for this audit.

## Committed baseline after PR #731

| Metric | Committed value |
| --- | ---: |
| Total diagnostics | 1867 |
| Files with diagnostics | 189 |
| `other` | 579 |
| `js/ui/**` | 516 |
| `js/Civication/**` | 458 |
| `CivicationUI.js` | 106 |
| `CivicationMiniSectionsUI.js` | 22 |
| `civicationEventEngine.js` | 23 |
| `civicationEconomyEngine.js` | 0 |
| `js/profile.js` | 83 |
| `js/state/**` | 16 |
| `TS2339` | 1516 |
| `TS2551` | 137 |
| `TS2322` | 20 |
| `TS2349` | 14 |

## Fresh observed baseline

| Metric | Fresh observed value |
| --- | ---: |
| Total diagnostics | 1849 |
| Files with diagnostics | 189 |
| `other` | 579 |
| `js/ui/**` | 498 |
| `js/Civication/**` | 458 |
| `CivicationUI.js` | 106 |
| `CivicationMiniSectionsUI.js` | 22 |
| `civicationEventEngine.js` | 23 |
| `civicationEconomyEngine.js` | 0 |
| `js/profile.js` | 83 |
| `js/state/**` | 16 |
| `TS2339` | 1498 |
| `TS2551` | 137 |
| `TS2322` | 20 |
| `TS2349` | 14 |

## Drift summary

| Metric | Committed | Fresh observed | Delta |
| --- | ---: | ---: | ---: |
| Total diagnostics | 1867 | 1849 | -18 |
| Files with diagnostics | 189 | 189 | 0 |
| `other` | 579 | 579 | 0 |
| `js/ui/**` | 516 | 498 | -18 |
| `js/Civication/**` | 458 | 458 | 0 |
| `js/profile.js` | 83 | 83 | 0 |
| `js/state/**` | 16 | 16 | 0 |
| `TS2339` | 1516 | 1498 | -18 |
| `TS2551` | 137 | 137 | 0 |
| `TS2322` | 20 | 20 | 0 |
| `TS2349` | 14 | 14 | 0 |

The drift is fully explained by `js/ui/place-card.js`, which moved from 148 diagnostics in the committed report to 130 diagnostics in the fresh report. No `js/Civication/**` count changed.

## Exact `js/ui/**` diagnostics explaining the -18 drift

The following diagnostics were present at the committed-baseline-producing tree (`6311818 Phase 70: narrow dayFactionMailScoring active faction typecheck pass`) and are no longer present at current HEAD. Matching was done by file, TypeScript error code, and diagnostic message, ignoring line-number shifts caused by later edits in `js/ui/place-card.js`.

| Count | File | Old line(s) | Code | Diagnostic |
| ---: | --- | --- | --- | --- |
| 2 | `js/ui/place-card.js` | 188, 189 | TS2339 | Property `getLesesporForPlace` does not exist on type `Window & typeof globalThis`. |
| 3 | `js/ui/place-card.js` | 193, 194, 194 | TS2339 | Property `LESESPOR_BY_PLACE` does not exist on type `Window & typeof globalThis`. |
| 1 | `js/ui/place-card.js` | 765 | TS2339 | Property `onclick` does not exist on type `Element`. |
| 1 | `js/ui/place-card.js` | 766 | TS2339 | Property `dataset` does not exist on type `Element`. |
| 4 | `js/ui/place-card.js` | 1080, 1080, 1081, 1082 | TS2339 | Property `HGStories` does not exist on type `Window & typeof globalThis`. |
| 2 | `js/ui/place-card.js` | 1110, 1111 | TS2339 | Property `WK_BY_PLACE` does not exist on type `Window & typeof globalThis`. |
| 3 | `js/ui/place-card.js` | 1139, 1139, 1140 | TS2339 | Property `Wonderkammer` does not exist on type `Window & typeof globalThis`. |
| 2 | `js/ui/place-card.js` | 1141, 1142 | TS2339 | Property `openWonderkammerEntry` does not exist on type `Window & typeof globalThis`. |
| **18** | `js/ui/place-card.js` | — | **TS2339** | **Total removed diagnostics.** |

These are all TS2339 diagnostics, so they explain both `js/ui/** -18` and `TS2339 -18`.

## Source of the positive drift

The reduction can be connected to commit `9fed56e Move stories and Wonderkammer into Leksikon`, which landed after the last committed baseline refresh (`6311818`). That commit changed `js/ui/place-card.js`, `js/leksikon/leksikon_loader.js`, `css/placeCard.css`, and `index.html`, and removed PlaceCard-side Lesespor, story, and Wonderkammer references that were responsible for the stale diagnostics listed above.

A direct typecheck comparison confirmed:

| Tree | Total diagnostics | `js/ui/**` | `js/ui/place-card.js` | `js/Civication/**` | TS2339 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `6311818` | 1867 | 516 | 148 | 458 | 1516 |
| `HEAD` (`7b0f873`) | 1849 | 498 | 130 | 458 | 1498 |

The latest HEAD commit, `7b0f873 Support Leksikon hubs without articles`, was also checked against its parent `9fed56e`; both produced 1849 total diagnostics, 498 `js/ui/**` diagnostics, 130 `js/ui/place-card.js` diagnostics, 458 `js/Civication/**` diagnostics, and 1498 TS2339 diagnostics. Therefore the positive drift is attributable to the earlier `9fed56e` merge/change, not to `7b0f873` itself.

## Civication stability assessment

`js/Civication/**` remains stable at 458 diagnostics in the committed baseline and in the fresh observed reports. The Phase 71 target area is therefore not the source of the baseline mismatch.

## Baseline staleness assessment

`reports/typecheck-baseline-report.md` on the current branch is stale relative to the current typecheck output. The stale committed report still records 1867 total diagnostics and 516 `js/ui/**` diagnostics, while current deterministic `npm run typecheck:report` output records 1849 total diagnostics and 498 `js/ui/**` diagnostics.

## Recommendation

Proceed with a baseline-only refresh PR to update `reports/typecheck-baseline-report.md` to the deterministic current baseline of 1849 diagnostics before resuming Phase 71. After that baseline repair, Phase 71 can be resumed against `js/Civication/systems/civicationRoleStarter.js`, because `js/Civication/**` is stable and still matches the expected 458 diagnostics.

Do not fold the baseline refresh into the Phase 71 roleStarter code change.
