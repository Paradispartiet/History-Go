# People of Places — Akershus festning batch 2 validation

## Intended scope

Expected direct diff against `agent/akershus-festning-people-batch1`:

- `data/people/manifest.json`
- `data/people/historie/oslo/akershus_festning/christian_jensen_lofthuus.json`
- `data/people/historie/oslo/akershus_festning/ole_hoiland.json`
- `data/people/historie/oslo/akershus_festning/gjest_baardsen.json`
- `data/people/historie/oslo/akershus_festning/lars_haetta.json`
- `data/people/historie/oslo/akershus_festning/peder_hansson_litle.json`
- `reports/people-akershus-festning-batch2-research.md`
- `reports/people-akershus-festning-batch2-validation.md`

Expected total: **8 changed files**.

## Canonical ID gate

Repository searches found no existing canonical people records for the five proposed IDs or relevant name variants before creation.

Expected new canonical IDs:

- `christian_jensen_lofthuus`
- `ole_hoiland`
- `gjest_baardsen`
- `lars_haetta`
- `peder_hansson_litle`

## Place-reference gate

All five records use active primary anchor:

- `placeId: "akershus_festning"`

Peder Hanssøn Litle also links to the existing active sub-place `akerhus_slott` in `places`.

Expected invariant status after merge:

- `duplicatePeopleIds: 0`
- `invalidPlaceRefs: 0`
- `peopleWithoutValidPrimaryAnchor: 0`
- `peopleWithEmptyPlacesArray: 0`

## Required repository checks

Run on a normal repository checkout:

```bash
mkdir -p reports/people-akershus-festning-batch2-checks

npm run audit:people-of-places \
  2>&1 | tee reports/people-akershus-festning-batch2-checks/audit-people-of-places.txt

npm run tools:check \
  2>&1 | tee reports/people-akershus-festning-batch2-checks/tools-check.txt
```

These commands were **not** run locally in the connector-only environment and are therefore not claimed as locally passed.

GitHub Actions should be treated as the authoritative automated validation available for the opened PR.

## Out-of-scope guard

This batch must not change:

- place data
- place indexes or manifests
- quiz data
- Civication data or code
- unrelated people records
- existing Akershus batch 1 person files

A direct branch comparison must be checked before the PR is considered ready.
