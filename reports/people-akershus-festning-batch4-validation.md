# People of Places — Akershus festning batch 4 validation

## Intended scope

This batch adds exactly five new canonical people files for `akershus_festning`:

- `hartvig_krummedike`
- `henrik_krummedike`
- `odd_alvsson`
- `olav_galle`
- `mogens_gyldenstierne`

Expected data changes:

- five new one-person JSON files under `data/people/historie/oslo/akershus_festning/`;
- five new manifest paths in `data/people/manifest.json`;
- this validation report;
- the batch research report.

No place files, place indexes, quiz files, Civication data, UI code or unrelated people records should change.

## Canonical audit

Fresh `main` was audited before file creation.

The initially proposed Håkon V Magnusson, Christian IV, Håkon VI Magnusson and Margrete 1. already exist as canonical people and were not duplicated.

Repository searches for the final accepted IDs and name variants found no existing canonical records for:

- Hartvig Krummedike
- Henrik Krummedike
- Odd Alvsson
- Olav Galle
- Mogens Gyldenstierne

## Place gate

Every new record uses:

- `placeId: "akershus_festning"`
- `places: ["akershus_festning"]`

Every accepted person has a direct documented institutional or military relation to Akershus itself through command, possession, administration or defence.

## Required repository validation

The repository-level gate is:

```bash
bash scripts/check-people.sh
```

Expected core invariants after the batch:

- duplicate people IDs: 0;
- invalid place references: 0;
- people without valid primary anchor: 0;
- people with empty `places` arrays: 0.

Repository-local commands were not run in the connector-only environment and are not falsely reported as passed locally. GitHub Actions Data checks should be treated as the executable validation source for the PR.

## Expected changed-file set

1. `data/people/manifest.json`
2. `data/people/historie/oslo/akershus_festning/hartvig_krummedike.json`
3. `data/people/historie/oslo/akershus_festning/henrik_krummedike.json`
4. `data/people/historie/oslo/akershus_festning/odd_alvsson.json`
5. `data/people/historie/oslo/akershus_festning/olav_galle.json`
6. `data/people/historie/oslo/akershus_festning/mogens_gyldenstierne.json`
7. `reports/people-akershus-festning-batch4-research.md`
8. `reports/people-akershus-festning-batch4-validation.md`

The final PR should contain no unrelated files.
