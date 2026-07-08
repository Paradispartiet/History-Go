# People Oslo litteratur — Nationaltheatret batch 4 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch covers late interwar/postwar transition and broad public stage culture after merged batches 1–3.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch4.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-4-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `per_aabel` | Per Aabel | `nationaltheatret` | Employed at Nationaltheatret from 1940 to 1972; direct statue/place memory |
| `ella_hval` | Ella Hval | `nationaltheatret` | Worked at Nationaltheatret from 1945; actor, instructor and teacher at the theatre's student school |
| `alfred_maurstad` | Alfred Maurstad | `nationaltheatret` | Began working at Nationaltheatret in 1930; actor/director/theatre-manager profile |
| `olafr_havrevold` | Olafr Havrevold | `nationaltheatret` | Worked at Nationaltheatret from 1923 to 1965 |
| `lillebil_ibsen` | Lillebil Ibsen | `nationaltheatret` | Dancer debut at Nationaltheatret in 1911, actor debut in 1915, later Nationaltheatret work 1956–1969 |

## Research gate

### Per Aabel

Reference basis: documented Nationaltheatret employment from 1940 to 1972 and statue outside the theatre's stage entrance.

Decision: safe. Direct long-term theatre relationship plus place memory.

### Ella Hval

Reference basis: documented Nationaltheatret work from 1945, leading roles, and instructor/teacher relationship with Nationaltheatret student school.

Decision: safe. Direct stage and institution relationship.

### Alfred Maurstad

Reference basis: documented start at Nationaltheatret in 1930 and broader theatre/film leadership profile.

Decision: safe. Direct Nationaltheatret relationship.

### Olafr Havrevold

Reference basis: documented Nationaltheatret work from 1923 to 1965.

Decision: safe. Direct long-term Nationaltheatret relationship.

### Lillebil Ibsen

Reference basis: documented dancer debut at Nationaltheatret in 1911, actor debut at Nationaltheatret in 1915 and later Nationaltheatret work from 1956 to 1969.

Decision: safe. Direct Nationaltheatret relationship across dance and theatre.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `per_aabel`
- `ella_hval`
- `alfred_maurstad`
- `olafr_havrevold`
- `lillebil_ibsen`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

Known existing people still held out for later update batches:

- `wenche_foss` exists in `data/people/popkultur/oslo/people_popkultur_oslo.json`.
- `liv_ullmann` exists in `data/people/film_tv/oslo/people_film_tv_oslo.json`.
- `kjersti_holmen` exists in `data/people/film_tv/oslo/people_film_tv_oslo.json`.

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch4.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
