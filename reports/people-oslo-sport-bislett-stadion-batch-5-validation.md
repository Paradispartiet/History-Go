# People Oslo sport — Bislett Stadion batch 5 validation

## Scope

Add a fifth dedicated people batch for `bislett_stadion`, recreated from current `main` after Nationaltheatret duplicate-ID cleanup was merged separately in #2028.

New people file:

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch5.json`

Updated manifest:

- `data/people/manifest.json`

## Place anchor

Target place:

- `bislett_stadion`
- category: `sport`

This batch uses Bislett Games meeting-record anchors and keeps each entry tied to a concrete Bislett Stadion / Bislett Games result.

## Repo-wide people ID check

Checked before adding:

- `usain_bolt` — not found
- `michael_johnson` — not found
- `david_rudisha` — not found
- `hicham_el_guerrouj` — not found
- `yomif_kejelcha` — not found

## Research gate

### `usain_bolt`

Reason: Bislett Games men's 100 m meeting record, 9.79 on 7 June 2012.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://fr.wikipedia.org/wiki/Bislett_Games

### `michael_johnson`

Reason: Bislett Games men's 400 m meeting record, 43.86 on 21 July 1995.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://fr.wikipedia.org/wiki/Bislett_Games

### `david_rudisha`

Reason: Bislett Games men's 800 m meeting record, 1:42.04 on 4 June 2010.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/June_2010_in_sports

### `hicham_el_guerrouj`

Reason: Bislett Games men's mile meeting record, 3:44.90 on 4 July 1997.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://it.wikipedia.org/wiki/Bislett_Games

### `yomif_kejelcha`

Reason: Bislett Games men's 3000 m meeting record, 7:26.25 on 1 July 2021; also part of Bislett's recent fast 5000 m context.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/2021_Bislett_Games
- https://en.wikipedia.org/wiki/2023_Bislett_Games

## Image / asset policy

No external images were added. No guessed repo image paths were added. All new entries use:

- `image`: `""`
- `cardImage`: `""`

## Files changed

- Added `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch5.json`
- Updated `data/people/manifest.json`
- Added `reports/people-oslo-sport-bislett-stadion-batch-5-validation.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-5-research-notes.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-5-image-todo.md`

## Files intentionally not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime/loader files
- No unrelated people files
- No external image assets

## Expected validation

To run before merge:

```bash
node -e "for (const f of ['data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch5.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
