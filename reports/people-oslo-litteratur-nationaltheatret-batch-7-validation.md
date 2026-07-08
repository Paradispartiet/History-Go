# People Oslo litteratur — Nationaltheatret batch 7 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch covers the 1970–1990 modern scenekanon and ensemble-continuity line after merged batches 1–6.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch7.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-7-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `sverre_anker_ousdal` | Sverre Anker Ousdal | `nationaltheatret` | Long Nationaltheatret relationship from 1970; modern scenekanon anchor |
| `nils_ole_oftebro` | Nils Ole Oftebro | `nationaltheatret` | Nationaltheatret relationship from 1971; broad stage/film/TV profile |
| `froydis_armand` | Frøydis Armand | `nationaltheatret` | Nationaltheatret relationship from 1972; modern ensemble/Ibsen line |
| `lise_fjeldstad` | Lise Fjeldstad | `nationaltheatret` | Nationaltheatret employment from 1975; modern Ibsen/classical repertory anchor |
| `gisken_armand` | Gisken Armand | `nationaltheatret` | Nationaltheatret relationship from 1988; newer ensemble-continuity anchor |

## Research gate

### Sverre Anker Ousdal

Reference basis: documented long Nationaltheatret relationship from 1970 and major modern Norwegian actor profile.

Decision: safe. Direct Nationaltheatret relationship and high scenekanon value.

### Nils Ole Oftebro

Reference basis: documented Nationaltheatret relationship from 1971 and broad stage/film/TV public profile.

Decision: safe. Direct Nationaltheatret relationship.

### Frøydis Armand

Reference basis: documented Nationaltheatret relationship from 1972 and modern ensemble significance.

Decision: safe. Direct Nationaltheatret relationship.

### Lise Fjeldstad

Reference basis: documented Nationaltheatret employment from 1975 and central role in modern Ibsen/classical repertory.

Decision: safe. Direct Nationaltheatret relationship with high Ibsen/scenekanon value.

### Gisken Armand

Reference basis: documented Nationaltheatret relationship from 1988 and continuation of the modern ensemble/family line.

Decision: safe. Direct Nationaltheatret relationship.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `sverre_anker_ousdal`
- `nils_ole_oftebro`
- `froydis_armand`
- `lise_fjeldstad`
- `gisken_armand`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch7.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
