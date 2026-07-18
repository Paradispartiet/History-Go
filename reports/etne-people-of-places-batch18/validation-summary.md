# Etne People of Places batch 18 — validation summary

## Fresh coverage baseline

Read-only Actions run `29662165289` generated the batch 18 coverage artifact from canonical place source files plus the active runtime index and the complete people manifest.

Result before batch 18:

- active Etne places: 81
- covered Etne places: 58
- uncovered Etne places: 23
- people manifest files: 546
- people entries: 1,119
- `skakke_kultursenter_etne`: uncovered, with zero people links

The persisted baseline is `reports/etne-people-of-places-batch18/coverage-audit.json`.

## Full integration validation

Actions run `29662309551` applied the batch 18 manifest/test-gate patch in the runner and completed these steps successfully:

- register batch source and regression gate exactly once
- `node tests/etne-people-of-places-batch18.test.js`
- `bash scripts/check-people.sh`
- fresh Etne coverage audit after batch 18
- `npm run typecheck`
- `npm run tools:check` against the known main-branch story-reference baseline
- `git diff --check`

The integration run's only failure was the final repository commit/push step. No data or validation step failed.

The successful coverage step verifies that `skakke_kultursenter_etne` receives exactly the two intended people links, so the deterministic batch effect is one newly covered Etne place: 59/81 covered and 22/81 uncovered on the audited branch state.

The `tools:check` baseline gate accepted only the same five pre-existing story-reference failures already documented on main: `utoya`, `norges_hjemmefrontmuseum` twice, and `operaen` twice.

## Delivery

Actions run `29662369548` successfully pushed the already-validated permanent integration changes:

- `data/people/manifest.json`
- `scripts/check-people.sh`

Post-delivery repository inspection confirms:

- `people/kunst/vestland/etne/people_skakke_kultursenter_batch1.json` is registered in the people manifest
- `tests/etne-people-of-places-batch18.test.js` is wired into `scripts/check-people.sh` after batch 17 and before the completion marker
- the temporary workflow was removed from the final PR branch

Final ordinary GitHub CI should be treated as the merge gate for the clean head.
