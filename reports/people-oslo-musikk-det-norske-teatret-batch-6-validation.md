# People Oslo musikk — Det Norske Teatret batch 6 validation

Generated: 2026-07-08

## Scope

Adds five researched ensemble-/actor anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This PR is intentionally stacked on the batch 5 branch because PR #1809 is still open.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch6.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-6-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `henny_moan` | Henny Moan | `det_norske_teatret` | Worked at Det Norske Teatret, Oslo Nye Teater and Nationaltheatret |
| `ragnhild_hilt` | Ragnhild Hilt | `det_norske_teatret` | Entire professional career at Det Norske Teatret from 1971 to 2014 |
| `jorunn_kjellsby` | Jorunn Kjellsby | `det_norske_teatret` | Worked at Det Norske Teatret from 1971 |
| `ragnhild_nygaard` | Ragnhild Nygaard | `det_norske_teatret` | Employed at Det Norske Teatret from 1969 to 1977 |
| `ragnhild_hald` | Ragnhild Hald | `det_norske_teatret` | Engaged with Det Norske Teatret from 1919 to 1952 |

## Research gate

### Henny Moan

Reference basis: Henny Moan is documented as having acted at Det Norske Teatret, Oslo Nye Teater and Nationaltheatret, with major classic repertoire roles. This is a direct theatre connection rather than a loose film-celebrity association.

Decision: safe, but broader than the long-term ensemble anchors. Kept because the Det Norske Teatret connection is explicit.

### Ragnhild Hilt

Reference basis: Ragnhild Hilt is documented as spending her entire career at Det Norske Teatret from 1971 to spring 2014.

Decision: safe. Very strong long-term ensemble relationship with the target place.

### Jorunn Kjellsby

Reference basis: Jorunn Kjellsby is documented as working for Det Norske Teatret from 1971, after earlier periods at Trøndelag Teater and Oslo Nye Teater.

Decision: safe. Direct long-term stage relationship with the target place.

### Ragnhild Nygaard

Reference basis: Ragnhild Nygaard is documented as employed at Det Norske Teatret from 1969 to 1977, with listed Norwegian Theater roles including `Orestien`, `Ungen` and `Det gode mennesket i Sezuan`.

Decision: safe. Direct time-bounded ensemble relationship with the target place.

### Ragnhild Hald

Reference basis: Ragnhild Hald is documented as engaged with Det Norske Teatret from 1919 to 1952, plus later theatre work elsewhere. This makes her a strong historical ensemble anchor.

Decision: safe. Direct early-to-mid-century ensemble relationship with the target place.

## Repo gate

Repo search was performed before this batch proposal for these candidate IDs:

- `henny_moan`
- `ragnhild_hilt`
- `jorunn_kjellsby`
- `ragnhild_nygaard`
- `ragnhild_hald`

No existing people ID hits were returned for the exact candidate IDs.

## Stack note

This PR is based on:

```text
data/det-norske-teatret-people-batch-5-20260708
```

because PR #1809 is still open. Once #1809 is merged, this branch/PR should be retargeted to `main` or recreated cleanly from updated `main` if GitHub shows inherited diff.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch6.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run after PR #1809 is included:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch6.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
