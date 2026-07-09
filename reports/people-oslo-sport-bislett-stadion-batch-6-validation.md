# People Oslo sport — Bislett Stadion batch 6 validation

## Scope

Add a sixth dedicated people batch for `bislett_stadion`, continuing from batch 5 already present on `main`.

New people file:

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch6.json`

Updated manifest:

- `data/people/manifest.json`

## Place anchor

Target place:

- `bislett_stadion`
- category: `sport`

This batch extends Bislett coverage beyond the core running canon by adding meeting-record anchors from two miles, 5000 m, 200 m, 110 m hurdles and high jump.

## Repo-wide people ID check

Checked before adding:

- `rod_dixon` — not found as a people entry
- `hagos_gebrhiwet` — not found as a people entry
- `erriyon_knighton` — not found as a people entry
- `ladji_doucoure` — not found as a people entry
- `mutaz_essa_barshim` — not found as a people entry

The names only appeared as future-candidate notes in the batch 5 research report.

## Research gate

### `rod_dixon`

Reason: Bislett Games two miles meeting-record anchor from 1979.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/Rod_Dixon

### `hagos_gebrhiwet`

Reason: Bislett Games 5000 m meeting-record anchor from 2024, 12:36.73.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/2024_Bislett_Games

### `erriyon_knighton`

Reason: Bislett Games 200 m meeting-record anchor from 2023, 19.77.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/2023_Bislett_Games

### `ladji_doucoure`

Reason: Bislett Games 110 m hurdles meeting-record anchor from 2005, 13.11.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/Ladji_Doucour%C3%A9

### `mutaz_essa_barshim`

Reason: Bislett Games high jump meeting-record anchor from 2017, 2.38.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/Mutaz_Essa_Barshim

## Image / asset policy

No external images were added. No guessed repo image paths were added. All new entries use:

- `image`: `""`
- `cardImage`: `""`

## Files changed

- Added `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch6.json`
- Updated `data/people/manifest.json`
- Added `reports/people-oslo-sport-bislett-stadion-batch-6-validation.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-6-research-notes.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-6-image-todo.md`

## Files intentionally not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime/loader files
- No unrelated people files
- No external image assets

## Expected validation

To run before merge:

```bash
node -e "for (const f of ['data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch6.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
