# People Oslo musikk — Det Norske Teatret batch 14 validation

Generated: 2026-07-08

## Scope

Adds five researched Det Norske Teatret ensemble-/music-theatre-/repertoire anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This PR is intentionally a draft stacked on the batch 13 branch because PR #1869 is still a draft and earlier PRs in the stack must be merged into `main` first.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch14.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-14-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `jan_gronli` | Jan Grønli | `det_norske_teatret` | Worked as theatre actor at DNT from 1971 to 1991 |
| `iren_reppen` | Iren Reppen | `det_norske_teatret` | Long DNT period, 1992–2007, including drama, musical and cabaret roles |
| `ole_jorgen_nilsen` | Ole-Jørgen Nilsen | `det_norske_teatret` | DNT ensemble 1968–1973, including contemporary repertoire |
| `vidar_magnussen` | Vidar Magnussen | `det_norske_teatret` | Directing debut at DNT with `The Book of Mormon` in 2017 |
| `ulrikke_hansen_dovigen` | Ulrikke Hansen Døvigen | `det_norske_teatret` | Concrete DNT role as Wendy Darling in `Peter Pan` |

## Research gate

### Jan Grønli

Reference basis: Jan Grønli is documented as working from 1971 to 1991 at Det Norske Teatret as a theatre actor.

Decision: safe. Direct long-term ensemble relationship with the target place.

### Iren Reppen

Reference basis: Iren Reppen is documented with theatre work at Det Norske Teatret from 1992 to 2007, including drama, musical and cabaret roles.

Decision: safe. Direct long-term relationship with the target place and strong music/scenekunst fit.

### Ole-Jørgen Nilsen

Reference basis: Ole-Jørgen Nilsen is documented as belonging to Det Norske Teatret's ensemble from 1968 to 1973, with roles in translated contemporary productions and as van Gogh in `Postmannen fra Arles`.

Decision: safe. Direct DNT ensemble and repertoire relationship.

### Vidar Magnussen

Reference basis: Vidar Magnussen is documented as making his directing debut at Det Norske Teatret with `The Book of Mormon` in 2017; the production was a major and award-winning DNT musical/comedy production.

Decision: safe. Direct DNT directing relationship and strong music-theatre fit.

### Ulrikke Hansen Døvigen

Reference basis: Ulrikke Hansen Døvigen is documented as having performed at Det Norske Teatret as Wendy Darling in `Peter Pan`.

Decision: safe but narrower than the long-term ensemble anchors. Kept because the DNT role is explicit and adds a family-/children's-repertoire anchor.

## Rejected / held back in this research pass

- `toralv_maurstad`: held back because the available DNT relation remained more guest-/role-oriented than a clean DNT employment or production anchor.
- `liv_dommersnes`: held back because the quick pass did not support a clean direct DNT relationship.
- `jack_fjeldstad`: held back because the quick pass did not support a clean direct DNT relationship.
- `knut_risan`: held back because the quick pass pointed to Nationaltheatret and other theatres, not a clean DNT relationship.
- `kjersti_dovigen`: held back because the search surfaced Ulrikke Hansen Døvigen's DNT role, not a clean Kjersti Døvigen DNT anchor.

## Repo gate

Repo/PR searches were performed before this batch proposal for these candidate IDs:

- `jan_gronli`
- `iren_reppen`
- `ole_jorgen_nilsen`
- `vidar_magnussen`
- `ulrikke_hansen_dovigen`

No existing people ID hits were returned for the exact candidate IDs or batch14 file.

## Stack note

This PR is based on:

```text
data/det-norske-teatret-people-batch-13-20260708
```

because PR #1869 is still a draft. Do not merge this draft PR before the earlier stack is merged in the correct order. Once the stack is merged, retarget this PR to `main` or recreate it cleanly from updated `main` if GitHub shows inherited diff.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch14.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run after PR #1869 is included:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch14.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
