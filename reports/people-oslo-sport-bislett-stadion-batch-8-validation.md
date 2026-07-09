# People Oslo sport — Bislett Stadion batch 8 validation

## Scope

Add an eighth dedicated people batch for `bislett_stadion`, focused on historical Norwegian speed-skating anchors.

New people file:

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch8.json`

Updated manifest:

- `data/people/manifest.json`

## Place anchor

Target place:

- `bislett_stadion`
- category: `sport`

This batch responds to the need for more historical Norwegian people, especially from the Bislett ice era.

## Repo-wide people ID check

Checked before adding:

- `roald_larsen` — not found
- `ivar_ballangrud` — not found
- `per_ivar_moe` — not found
- `magne_thomassen` — not found
- `roar_gronvold` — not found

## Research gate

### `roald_larsen`

Reason: Norwegian bronze medalist at the 1925 World Allround Speed Skating Championships held at Bislett Stadion.

Sources:

- https://en.wikipedia.org/wiki/1925_World_Allround_Speed_Skating_Championships
- https://en.wikipedia.org/wiki/Bislett_Stadium

### `ivar_ballangrud`

Reason: Historical Norwegian allround skater tied to Oslo/Bislett's interwar speed-skating championship era; European champion in Oslo in 1936 and part of the Norwegian skating canon connected to the period when Bislett developed as a major ice venue.

Sources:

- https://en.wikipedia.org/wiki/Ivar_Ballangrud
- https://en.wikipedia.org/wiki/European_Speed_Skating_Championships_for_Men
- https://en.wikipedia.org/wiki/Bislett_Stadium

### `per_ivar_moe`

Reason: Norwegian World Allround Champion in Oslo in 1965, within Bislett's post-war role as Oslo's major international speed-skating venue.

Sources:

- https://en.wikipedia.org/wiki/Per_Ivar_Moe
- https://en.wikipedia.org/wiki/World_Allround_Speed_Skating_Championships_for_Men
- https://en.wikipedia.org/wiki/Bislett_Stadium

### `magne_thomassen`

Reason: Norwegian silver medalist at the 1970 World Allround Speed Skating Championships held at Bislett Stadium.

Sources:

- https://en.wikipedia.org/wiki/1970_World_Allround_Speed_Skating_Championships

### `roar_gronvold`

Reason: Norwegian silver medalist at the 1972 World Allround Speed Skating Championships held at Bislett stadion.

Sources:

- https://en.wikipedia.org/wiki/1972_World_Allround_Speed_Skating_Championships

## Image / asset policy

No external images were added. No guessed repo image paths were added. All new entries use:

- `image`: `""`
- `cardImage`: `""`

## Files changed

- Added `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch8.json`
- Updated `data/people/manifest.json`
- Added `reports/people-oslo-sport-bislett-stadion-batch-8-validation.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-8-research-notes.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-8-image-todo.md`

## Files intentionally not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime/loader files
- No unrelated people files
- No external image assets

## Expected validation

To run before merge:

```bash
node -e "for (const f of ['data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch8.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Expected:

- new people entries = 5
- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0
