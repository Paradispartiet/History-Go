# People Oslo sport — Bislett Stadion batch 7 validation

## Scope

Add a seventh dedicated people batch for `bislett_stadion`, continuing from batch 6 already present on `main`.

New people file:

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch7.json`

Updated manifest:

- `data/people/manifest.json`

## Place anchor

Target place:

- `bislett_stadion`
- category: `sport`

This batch adds women’s Bislett Games record anchors across sprint, hurdles, steeplechase and pole vault.

## Repo-wide people ID check

Checked before adding:

- `marie_josee_ta_lou` — not found
- `dafne_schippers` — not found
- `femke_bol` — not found
- `faith_cherotich` — not found
- `yelena_isinbayeva` — not found

## Research gate

### `marie_josee_ta_lou`

Reason: Bislett Games women’s 100 m meeting-record anchor, 10.75 on 15 June 2023.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/2023_Bislett_Games

### `dafne_schippers`

Reason: Bislett Games women’s 200 m meeting-record anchor, 21.93 on 9 June 2016.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://fr.wikipedia.org/wiki/Bislett_Games

### `femke_bol`

Reason: Bislett Games women’s 400 m hurdles meeting-record anchor, 52.30 on 15 June 2023.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/2023_Bislett_Games

### `faith_cherotich`

Reason: Bislett Games women’s 3000 m steeplechase meeting-record anchor, 9:02.60 on 12 June 2025.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/2025_Bislett_Games

### `yelena_isinbayeva`

Reason: Bislett Games women’s pole vault meeting-record anchor, 4.85 m on 15 June 2007.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://fr.wikipedia.org/wiki/Bislett_Games

## Image / asset policy

No external images were added. No guessed repo image paths were added. All new entries use:

- `image`: `""`
- `cardImage`: `""`

## Files changed

- Added `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch7.json`
- Updated `data/people/manifest.json`
- Added `reports/people-oslo-sport-bislett-stadion-batch-7-validation.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-7-research-notes.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-7-image-todo.md`

## Files intentionally not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime/loader files
- No unrelated people files
- No external image assets

## Expected validation

To run before merge:

```bash
node -e "for (const f of ['data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch7.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
