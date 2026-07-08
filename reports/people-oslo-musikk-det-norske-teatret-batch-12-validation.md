# People Oslo musikk — Det Norske Teatret batch 12 validation

Generated: 2026-07-08

## Scope

Adds five researched Det Norske Teatret scene-/institution-network anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This PR is intentionally a draft stacked on the batch 11 branch because PR #1864 is still a draft and earlier PRs in the stack must be merged into `main` first.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch12.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-12-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `rolf_just_nilsen` | Rolf Just Nilsen | `det_norske_teatret` | Worked at DNT 1968–1970 and 1976–1981; died during a DNT performance |
| `per_sunderland` | Per Sunderland | `det_norske_teatret` | Performed at DNT from 1949 before later national stage career |
| `lise_fjeldstad` | Lise Fjeldstad | `det_norske_teatret` | Started working at DNT immediately after theatre school in 1963 |
| `per_jansen` | Per Jansen | `det_norske_teatret` | Stage debut at DNT in 1966 |
| `merete_skavlan` | Merete Skavlan | `det_norske_teatret` | Directed/produced at DNT, including `Vår og portvin` in 1969 |

## Research gate

### Rolf Just Nilsen

Reference basis: Rolf Just Nilsen is documented as working at Det Norske Teatret from 1968 to 1970 and again from 1976 to 1981. He died during a performance of `L/L Wang & Nilsen` at Det Norske Teatret in 1981.

Decision: safe. Direct music, revue and stage-performance relationship with the target place.

### Per Sunderland

Reference basis: Per Sunderland is documented as performing at Det Norske Teatret from 1949 before later work at Det Nye Teater, Folketeatret and Nationaltheatret.

Decision: safe. Direct early postwar stage relationship with the target place.

### Lise Fjeldstad

Reference basis: Lise Fjeldstad is documented as starting work at Det Norske Teatret immediately after graduating from theatre school in 1963.

Decision: safe. Direct early professional-stage relationship with the target place.

### Per Jansen

Reference basis: Per Jansen is documented as making his stage debut at Det Norske Teatret in 1966.

Decision: safe. Direct stage-debut relationship with the target place.

### Merete Skavlan

Reference basis: Merete Skavlan is documented as participating in productions at Det Norske Teatret and making her stage producer debut with `Vår og portvin` at Det Norske Teatret in 1969.

Decision: safe. Direct production/regi relationship with the target place.

## Repo gate

Repo/PR searches were performed before this batch proposal for these candidate IDs:

- `rolf_just_nilsen`
- `per_sunderland`
- `lise_fjeldstad`
- `per_jansen`
- `merete_skavlan`

No existing people ID hits were returned for the exact candidate IDs or batch12 file.

## Stack note

This PR is based on:

```text
data/det-norske-teatret-people-batch-11-20260708
```

because PR #1864 is still a draft. Do not merge this draft PR before the earlier stack is merged in the correct order. Once the stack is merged, retarget this PR to `main` or recreate it cleanly from updated `main` if GitHub shows inherited diff.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch12.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run after PR #1864 is included:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch12.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
