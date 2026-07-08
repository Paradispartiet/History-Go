# People Oslo litteratur — Nationaltheatret batch 5 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch covers the postwar ensemble and public stage-culture line after merged batches 1–4 and the existing-people update PR.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch5.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-5-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `liv_dommersnes` | Liv Dommersnes | `nationaltheatret` | Nationaltheatret work from the 1940s; later return and 50th anniversary marked there |
| `ingerid_vardund` | Ingerid Vardund | `nationaltheatret` | Worked at Nationaltheatret from 1958 to 1993; Nora/Ibsen connection |
| `toralv_maurstad` | Toralv Maurstad | `nationaltheatret` | Major actor profile and Nationaltheatret theatre director from 1978 to 1986 |
| `knut_wigert` | Knut Wigert | `nationaltheatret` | Began at Nationaltheatret in 1938; long Ibsen line and bust/place memory |
| `henki_kolstad` | Henki Kolstad | `nationaltheatret` | Postwar ensemble and broad Norwegian public stage/film/TV profile |

## Research gate

### Liv Dommersnes

Reference basis: documented Nationaltheatret relationship from the 1940s, later return to the theatre and 50th anniversary celebration at Nationaltheatret.

Decision: safe. Direct Nationaltheatret relationship with strong postwar/stage-literature value.

### Ingerid Vardund

Reference basis: documented Nationaltheatret employment from 1958 to 1993, including Ibsen/Nora work.

Decision: safe. Direct long-term Nationaltheatret relationship.

### Toralv Maurstad

Reference basis: documented Nationaltheatret actor profile and theatre director period from 1978 to 1986.

Decision: safe. Direct artistic and institutional Nationaltheatret relationship.

### Knut Wigert

Reference basis: documented Nationaltheatret work from 1938, long Ibsen role series and bust at the theatre.

Decision: safe. Direct Nationaltheatret relationship with strong Ibsen/minnekultur value.

### Henki Kolstad

Reference basis: documented as part of Nationaltheatret's postwar ensemble line and broad public stage/film/TV profile.

Decision: safe. Direct Nationaltheatret relation, but less place-memory heavy than Wigert/Aabel; included as ensemble/public-culture anchor.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `liv_dommersnes`
- `ingerid_vardund`
- `toralv_maurstad`
- `knut_wigert`
- `henki_kolstad`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

Existing people already handled in separate update batch:

- `wenche_foss`
- `liv_ullmann`
- `kjersti_holmen`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch5.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
