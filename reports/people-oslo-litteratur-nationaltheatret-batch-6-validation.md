# People Oslo litteratur — Nationaltheatret batch 6 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch covers the 1960/70 generation and modern ensemble line after merged batches 1–5.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch6.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-6-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `rolf_soder` | Rolf Søder | `nationaltheatret` | Part of the postwar/1960s Nationaltheatret ensemble line |
| `monna_tandberg` | Monna Tandberg | `nationaltheatret` | Modern Nationaltheatret actor profile and Ibsen/scenekunst anchor |
| `mona_hofland` | Mona Hofland | `nationaltheatret` | Long ensemble line and broad film/TV/stage profile |
| `espen_skjonberg` | Espen Skjønberg | `nationaltheatret` | Long modern Nationaltheatret/scenekanon profile |
| `anne_marit_jacobsen` | Anne Marit Jacobsen | `nationaltheatret` | Long Nationaltheatret relationship from 1970 and broad public actor profile |

## Research gate

### Rolf Søder

Reference basis: documented in the Nationaltheatret postwar/1960s ensemble line and relevant as both stage and film actor.

Decision: safe. Direct Nationaltheatret ensemble relationship.

### Monna Tandberg

Reference basis: documented Nationaltheatret relevance in the modern ensemble/Ibsen line.

Decision: safe. Direct Nationaltheatret relationship.

### Mona Hofland

Reference basis: documented Nationaltheatret ensemble relevance and broad film/TV/stage profile.

Decision: safe. Direct Nationaltheatret relationship.

### Espen Skjønberg

Reference basis: documented modern Nationaltheatret/scenekanon relevance.

Decision: safe. Direct Nationaltheatret relationship.

### Anne Marit Jacobsen

Reference basis: documented Nationaltheatret relationship from 1970 and broad public stage/film/TV profile.

Decision: safe. Direct Nationaltheatret relationship.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `rolf_soder`
- `monna_tandberg`
- `mona_hofland`
- `espen_skjonberg`
- `anne_marit_jacobsen`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

Existing people already handled in separate update batch:

- `wenche_foss`
- `liv_ullmann`
- `kjersti_holmen`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch6.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
