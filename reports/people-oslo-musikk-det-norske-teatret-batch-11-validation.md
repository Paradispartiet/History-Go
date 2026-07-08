# People Oslo musikk — Det Norske Teatret batch 11 validation

Generated: 2026-07-08

## Scope

Adds five researched Det Norske Teatret ensemble-/scene anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This PR is intentionally a draft stacked on the batch 10 branch because PR #1852 is still a draft and PR #1828 must be merged into `main` first.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch11.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-11-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `rut_tellefsen` | Rut Tellefsen | `det_norske_teatret` | Stage debut at Det Norske Teatret in 1956 |
| `tom_tellefsen` | Tom Tellefsen | `det_norske_teatret` | Stage debut at Det Norske Teatret in 1959 and worked there until retirement |
| `bjarne_andersen` | Bjarne Andersen | `det_norske_teatret` | Worked at Det Norske Teatret from 1944 to 1951 |
| `elsa_lystad` | Elsa Lystad | `det_norske_teatret` | Assigned to Det Norske Teatret from 1958 to 1964 |
| `reidar_sorensen` | Reidar Sørensen | `det_norske_teatret` | Worked at Det Norske Teatret and other Norwegian theatre institutions |

## Research gate

### Rut Tellefsen

Reference basis: Rut Tellefsen is documented as having made her stage debut at Det Norske Teatret in 1956.

Decision: safe. Direct stage-debut relationship with the target place.

### Tom Tellefsen

Reference basis: Tom Tellefsen is documented as having made his stage debut at Det Norske Teatret in 1959 and working at that theatre until his retirement in 2001.

Decision: safe. Very strong long-term ensemble relationship with the target place.

### Bjarne Andersen

Reference basis: Bjarne Andersen is documented as having worked for Det Norske Teatret from 1944 to 1951.

Decision: safe. Direct wartime/postwar theatre relationship with the target place.

### Elsa Lystad

Reference basis: Elsa Lystad is documented as assigned to Det Norske Teatret from 1958 to 1964.

Decision: safe. Direct time-bounded ensemble relationship with the target place.

### Reidar Sørensen

Reference basis: Reidar Sørensen is documented as having worked at Det Norske Teatret among other Norwegian theatre institutions.

Decision: safe but broader than the other four; retained because the Det Norske Teatret relationship is explicit and the entry frames him as a networked scene-institution anchor, not as a loose film/TV profile.

## Repo gate

Repo/PR search was performed before this batch proposal for these candidate IDs:

- `rut_tellefsen`
- `tom_tellefsen`
- `bjarne_andersen`
- `elsa_lystad`
- `reidar_sorensen`

No existing people ID hits were returned for the exact candidate IDs or batch11 file.

## Stack note

This PR is based on:

```text
data/det-norske-teatret-people-batch-10-20260708
```

because PR #1852 is still a draft. Do not merge this draft PR before #1828, #1836 and #1852 are merged in the correct order. Once the stack is merged, retarget this PR to `main` or recreate it cleanly from updated `main` if GitHub shows inherited diff.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch11.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run after PR #1852 is included:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch11.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
