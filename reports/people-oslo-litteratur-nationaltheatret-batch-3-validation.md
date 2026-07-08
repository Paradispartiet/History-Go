# People Oslo litteratur — Nationaltheatret batch 3 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch covers the 1910s–1930s ensemble, regi and theatre-renewal line after merged batches 1 and 2.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch3.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-3-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `gerd_grieg` | Gerd Grieg | `nationaltheatret` | Acting debut at Nationaltheatret in 1910; returned there in 1928 |
| `tore_segelcke` | Tore Segelcke | `nationaltheatret` | Joined Nationaltheatret in 1928 and became one of its leading performers |
| `aase_bye` | Aase Bye | `nationaltheatret` | Nationaltheatret debut in 1923; over fifty years of theatre association |
| `gerda_ring` | Gerda Ring | `nationaltheatret` | Played at Nationaltheatret from 1912 to 1961; actor, instructor and theatre-strike figure |
| `agnes_mowinckel` | Agnes Mowinckel | `nationaltheatret` | Nationaltheatret acting/directing work, including 1925–1926 stage-instructor period and later productions |

## Research gate

### Gerd Grieg

Reference basis: documented acting debut at Nationaltheatret in 1910 and later return to Nationaltheatret in 1928.

Decision: safe. Direct Nationaltheatret relationship with strong interwar/cultural-history value.

### Tore Segelcke

Reference basis: documented arrival at Nationaltheatret in 1928 and long tenure as one of the theatre's leading performers in classical and modern drama.

Decision: safe. Direct long-term Nationaltheatret relationship.

### Aase Bye

Reference basis: documented stage debut at Nationaltheatret in 1923 and more than fifty years of connection to the theatre.

Decision: safe. Direct long-term Nationaltheatret relationship, with strong Ibsen/scenekunst value.

### Gerda Ring

Reference basis: documented Nationaltheatret work from 1912 to 1961 and later stage-production/instruction work, plus central role in the theatre strike during the occupation.

Decision: safe. Direct long-term Nationaltheatret relationship with added cultural-resistance value.

### Agnes Mowinckel

Reference basis: documented early appearance at Nationaltheatret, stage-instructor contract in 1925–1926 and later productions at Nationaltheatret.

Decision: safe. Direct theatre relationship with strong theatre-renewal and female-regi value.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `gerd_grieg`
- `tore_segelcke`
- `aase_bye`
- `gerda_ring`
- `agnes_mowinckel`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

Known existing people still held out for later update batches:

- `wenche_foss` exists in `data/people/popkultur/oslo/people_popkultur_oslo.json`.
- `liv_ullmann` exists in `data/people/film_tv/oslo/people_film_tv_oslo.json`.
- `kjersti_holmen` exists in `data/people/film_tv/oslo/people_film_tv_oslo.json`.

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch3.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
