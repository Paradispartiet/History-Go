# People — Nationaltheatret existing people update validation

Generated: 2026-07-09

## Scope

Updates existing people entries that already exist in other category files, so they are linked to `nationaltheatret` without creating duplicate people IDs.

This follows the cleanup decision from the Nationaltheatret people research pass: these people are important Nationaltheatret anchors, but already exist in the repo and should be updated in place.

## Changed files

- `data/people/popkultur/oslo/people_popkultur_oslo.json`
- `data/people/film_tv/oslo/people_film_tv_oslo.json`
- `reports/people-nationaltheatret-existing-people-update-validation.md`

## Updated existing people

| id | file | Existing primary place | Added place | Decision |
|---|---|---|---|---|
| `wenche_foss` | `data/people/popkultur/oslo/people_popkultur_oslo.json` | `folketeateret` | `nationaltheatret` | Keep existing popkultur primary anchor, add Nationaltheatret as supplemental scenekunst place |
| `liv_ullmann` | `data/people/film_tv/oslo/people_film_tv_oslo.json` | `cinemateket_oslo` | `nationaltheatret` | Keep existing film/TV primary anchor, add Nationaltheatret as supplemental scenekunst place |
| `kjersti_holmen` | `data/people/film_tv/oslo/people_film_tv_oslo.json` | `cinemateket_oslo` | `nationaltheatret` | Keep existing film/TV primary anchor, add Nationaltheatret as supplemental scenekunst place |

## Research gate

### Wenche Foss

Reference basis: direct long-term Nationaltheatret relationship and major postwar stage profile.

Decision: update existing `wenche_foss`, do not create a duplicate person in a Nationaltheatret batch file.

### Liv Ullmann

Reference basis: major film and theatre profile, with Nationaltheatret relevance in addition to the existing Cinemateket film-canon anchor.

Decision: update existing `liv_ullmann`, do not create a duplicate person in a Nationaltheatret batch file.

### Kjersti Holmen

Reference basis: film and stage profile with long Nationaltheatret relevance in addition to the existing Cinemateket film-canon anchor.

Decision: update existing `kjersti_holmen`, do not create a duplicate person in a Nationaltheatret batch file.

## Repo gate

This update intentionally does not add new people IDs.

Expected effect:

- `new people entries = 0`
- `duplicatePeopleIds = 0`
- `invalidPlaceRefs = 0`
- `peopleWithoutValidPrimaryAnchor = 0`
- `peopleWithEmptyPlacesArray = 0`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/popkultur/oslo/people_popkultur_oslo.json','data/people/film_tv/oslo/people_film_tv_oslo.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

## Not changed

- No new people files.
- No manifest changes.
- No place files.
- No `data/places/places_index.json`.
- No UI/runtime/loader files.
