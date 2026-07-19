# People of Places — Akershus festning batch 5 validation

## Intended scope

This batch adds exactly five new canonical people files for `akershus_festning`:

- `ragnar_skancke`
- `albert_viljam_hagelin`
- `siegfried_fehmer`
- `einar_donnum`
- `reidar_haaland`

Expected data changes:

- five new one-person JSON files under `data/people/historie/oslo/akershus_festning/`;
- five new manifest paths in `data/people/manifest.json`;
- this validation report;
- the batch research report.

No place files, place indexes, quiz files, Civication data, UI code or unrelated people records should change.

## Canonical audit

Repository searches were run for all five proposed IDs and full names before file creation.

Expected result:

- no existing canonical record for any accepted ID;
- no duplicate person created;
- existing canonical `vidkun_quisling` remains unchanged and is not duplicated.

## Place gate

Every new record uses:

- `placeId: "akershus_festning"`
- `places: ["akershus_festning"]`

Every accepted candidate has a direct documented physical relation to the fortress through imprisonment or execution.

## Visual metadata

- Ragnar Skancke and Albert Viljam Hagelin use the existing `person_politician_miniature` code.
- Siegfried Fehmer, Einar Dønnum and Reidar Haaland do not receive invented police, military or criminal design codes; the standard people resolver handles them.

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

## Scope verification

Before PR creation, compare the batch branch directly against current `main`.

Expected changed-file set:

1. `data/people/manifest.json`
2. `data/people/historie/oslo/akershus_festning/ragnar_skancke.json`
3. `data/people/historie/oslo/akershus_festning/albert_viljam_hagelin.json`
4. `data/people/historie/oslo/akershus_festning/siegfried_fehmer.json`
5. `data/people/historie/oslo/akershus_festning/einar_donnum.json`
6. `data/people/historie/oslo/akershus_festning/reidar_haaland.json`
7. `reports/people-akershus-festning-batch5-research.md`
8. `reports/people-akershus-festning-batch5-validation.md`

The final PR should contain no unrelated files.
