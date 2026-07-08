# People Oslo musikk — Det Norske Teatret batch 10 validation

Generated: 2026-07-08

## Scope

Adds five researched historical ensemble-/institution anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This PR is intentionally a draft stacked on the batch 9 branch because PR #1836 is still a draft and PR #1828 must be merged into `main` first.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch10.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-10-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `monna_tandberg` | Monna Tandberg | `det_norske_teatret` | Employed at Det Norske Teatret from 1964 to 1969 |
| `tordis_maurstad` | Tordis Maurstad | `det_norske_teatret` | Appointed at Det Norske Teatret in 1923 and worked there most of her career |
| `sossen_krohg` | Sossen Krohg | `det_norske_teatret` | Det Norske Teatret school graduate, stage debut and employment 1948–1952 |
| `gisle_straume` | Gisle Straume | `det_norske_teatret` | Employed at Det Norske Teatret 1945–1951 and again 1952–1955 |
| `alfred_maurstad` | Alfred Maurstad | `det_norske_teatret` | Stage debut at Det Norske Teatret; actor/director/Hardanger fiddle profile |

## Research gate

### Monna Tandberg

Reference basis: Monna Tandberg is documented as employed by Det Norske Teatret from 1964 to 1969, before her long Nationaltheatret period.

Decision: safe. Direct time-bounded ensemble relationship with the target place.

### Tordis Maurstad

Reference basis: Tordis Maurstad is documented as appointed at Det Norske Teatret in 1923 and as working at the theatre for most of her career.

Decision: safe. Very strong long-term ensemble relationship with the target place.

### Sossen Krohg

Reference basis: Sossen Krohg is documented as graduating from Det Norske Teatret's theatre school in 1946, making her stage debut in `Kranes konditori`, and being appointed at Det Norske Teatret from 1948 to 1952.

Decision: safe. Direct education, debut and employment relationship with the target place.

### Gisle Straume

Reference basis: Gisle Straume is documented as employed at Det Norske Teatret from 1945 to 1951 and again from 1952 to 1955.

Decision: safe. Direct postwar ensemble relationship with the target place.

### Alfred Maurstad

Reference basis: Alfred Maurstad is documented as debuting at Det Norske Teatret in 1921. He is especially relevant because his stage career intersects with music through the Hardanger fiddle tradition.

Decision: safe. Direct stage-debut relationship and strong music/scenekunst fit.

## Repo gate

Repo search was performed before this batch proposal for these candidate IDs:

- `monna_tandberg`
- `tordis_maurstad`
- `sossen_krohg`
- `gisle_straume`
- `alfred_maurstad`

No existing people ID hits were returned for the exact candidate IDs.

## Stack note

This PR is based on:

```text
data/det-norske-teatret-people-batch-9-20260708
```

because PR #1836 is still a draft. Do not merge this draft PR before #1828 and #1836 are merged in the correct order. Once the stack is merged, retarget this PR to `main` or recreate it cleanly from updated `main` if GitHub shows inherited diff.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch10.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run after PR #1836 is included:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch10.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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