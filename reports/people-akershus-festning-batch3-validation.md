# People of Places — Akershus festning batch 3 validation

## Intended scope

This batch adds exactly five new canonical people files for `akershus_festning`:

- `hans_van_paeschen`
- `hans_van_steenwinckel_den_eldre`
- `isaac_van_geelkerck`
- `michael_smith_arentz`
- `anthony_coucheron`

Expected data changes:

- five new one-person JSON files under `data/people/historie/oslo/akershus_festning/`;
- five new manifest paths in `data/people/manifest.json`;
- this validation report;
- the batch research report.

No place files, place indexes, quiz files, Civication data, UI code or unrelated people records should change.

## Canonical audit

Before file creation, repository searches were run for all five proposed IDs and full names.

Expected result:

- no existing canonical record for any accepted ID;
- no duplicate person created;
- existing Akershus people from batches 1–2 remain unchanged.

## Place gate

Every record uses:

- `placeId: "akershus_festning"`
- `places: ["akershus_festning"]`

All five candidates have direct documented roles tied to the fortress itself through planning, construction, engineering or command.

## Visual metadata

The batch uses the existing `person_architect_miniature` design code because all five records belong to the fortress engineering, architectural or fortification tradition.

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

Before PR creation, compare the batch branch directly against its base.

Expected changed-file set:

1. `data/people/manifest.json`
2. `data/people/historie/oslo/akershus_festning/hans_van_paeschen.json`
3. `data/people/historie/oslo/akershus_festning/hans_van_steenwinckel_den_eldre.json`
4. `data/people/historie/oslo/akershus_festning/isaac_van_geelkerck.json`
5. `data/people/historie/oslo/akershus_festning/michael_smith_arentz.json`
6. `data/people/historie/oslo/akershus_festning/anthony_coucheron.json`
7. `reports/people-akershus-festning-batch3-research.md`
8. `reports/people-akershus-festning-batch3-validation.md`

The final PR should contain no unrelated files.
