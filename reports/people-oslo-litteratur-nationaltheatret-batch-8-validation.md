# People Oslo litteratur — Nationaltheatret batch 8 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch starts the teatersjef/institution-leadership line after merged people batches 1–7.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch8.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-8-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `vilhelm_krag` | Vilhelm Krag | `nationaltheatret` | Teatersjef 1908–1911 |
| `einar_skavlan` | Einar Skavlan | `nationaltheatret` | Teatersjef 1928–1930 |
| `anton_ronneberg` | Anton Rønneberg | `nationaltheatret` | Teatersjef 1933–1934 and later Nationaltheatret historian |
| `johan_henrik_wiers_jenssen` | Johan Henrik Wiers-Jenssen | `nationaltheatret` | Teatersjef 1934–1935 |
| `axel_otto_normann` | Axel Otto Normann | `nationaltheatret` | Teatersjef 1935–1941 and 1945–1946 |

## Research gate

Reference basis: Store norske leksikon's Nationaltheatret article lists the theatre-manager sequence and years, including Vilhelm Krag 1908–1911, Einar Skavlan 1928–1930, Anton Rønneberg 1933–1934, Johan Henrik Wiers-Jenssen 1934–1935 and Axel Otto Normann 1935–1941 / 1945–1946.

Decision: safe. All five have direct teatersjef relationship with the target place.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `vilhelm_krag`
- `einar_skavlan`
- `anton_ronneberg`
- `johan_henrik_wiers_jenssen`
- `axel_otto_normann`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

Existing leaders already represented in earlier Nationaltheatret batches and intentionally not duplicated here:

- `bjorn_bjornson`
- `halfdan_christensen`
- `toralv_maurstad`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch8.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Expected:

- `new people entries = 5`
- `duplicatePeopleIds = 0`
- `invalidPlaceRefs = 0`
- `peopleWithoutValidPrimaryAnchor = 0`
- `peopleWithEmptyPlacesArray = 0`
- `flatPeopleFiles = 0`

## Not changed

- No place files.
- No `data/places/places_index.json`.
- No UI/runtime/loader files.
- No unrelated people files.
