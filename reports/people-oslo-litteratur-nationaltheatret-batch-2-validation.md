# People Oslo litteratur — Nationaltheatret batch 2 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch continues the early/gullalder Nationaltheatret line after batch 1. It is based on `main` after PR #1877 was merged.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch2.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-2-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `august_oddvar` | August Oddvar | `nationaltheatret` | Stage debut at Nationaltheatret in 1899; career-long relationship with the theatre |
| `ingolf_schanche` | Ingolf Schanche | `nationaltheatret` | Worked at Nationaltheatret from 1905 to 1928 and again from 1931 to 1942 |
| `hauk_aabel` | Hauk Aabel | `nationaltheatret` | Long Nationaltheatret period from 1911 to retirement in the 1930s; major comic/ensemble anchor |
| `harald_stormoen` | Harald Stormoen | `nationaltheatret` | Multiple long Nationaltheatret periods from the opening generation onward |
| `david_knudsen` | David Knudsen | `nationaltheatret` | Long Nationaltheatret relationship from 1911 to 1940 |

## Research gate

### August Oddvar

Reference basis: documented stage debut at Nationaltheatret in 1899 and career-long theatre work there.

Decision: safe. Direct opening/gullalder relation to the target place.

### Ingolf Schanche

Reference basis: documented Nationaltheatret work from 1905 to 1928 and again from 1931 to 1942.

Decision: safe. Direct long-term Nationaltheatret relationship.

### Hauk Aabel

Reference basis: documented Nationaltheatret association from 1911 to his retirement in 1934, including major comic roles and Holberg tradition.

Decision: safe. Direct long-term Nationaltheatret relationship.

### Harald Stormoen

Reference basis: documented Nationaltheatret periods from 1899 to 1918, 1921 to 1928 and 1935 to 1937.

Decision: safe. Direct multi-period Nationaltheatret relationship.

### David Knudsen

Reference basis: documented Nationaltheatret relationship from 1911 to 1940.

Decision: safe. Direct long-term Nationaltheatret relationship.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `august_oddvar`
- `ingolf_schanche`
- `hauk_aabel`
- `harald_stormoen`
- `david_knudsen`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

Known existing people still held out for later update batches:

- `wenche_foss` exists in `data/people/popkultur/oslo/people_popkultur_oslo.json`.
- `liv_ullmann` exists in `data/people/film_tv/oslo/people_film_tv_oslo.json`.
- `kjersti_holmen` exists in `data/people/film_tv/oslo/people_film_tv_oslo.json`.

## File structure decision

The batch creates this people file:

```text
people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch2.json
```

and registers it in:

```text
data/people/manifest.json
```

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch2.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
- No generated audit reports manually edited.
