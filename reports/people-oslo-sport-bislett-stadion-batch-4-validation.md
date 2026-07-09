# People Oslo sport — Bislett Stadion batch 4 validation

## Scope

Add a fourth dedicated people batch for `bislett_stadion`, continuing from batch 3 already present on `main`.

New people file:

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch4.json`

Updated manifest:

- `data/people/manifest.json`

## Place anchor

Target place:

- `bislett_stadion`
- category: `sport`

This batch keeps the same modeling rule as batches 1–3: people are added only when the connection to Bislett Stadion is explicit and historically specific.

## Repo-wide people ID check

Checked before adding:

- `jan_egil_storholt` — not found
- `yobes_ondieki` — not found
- `william_sigei` — not found
- `haile_gebrselassie` — not found
- `david_moorcroft` — not found

Already present and not duplicated from earlier Bislett data:

- `grete_waitz`
- `hjalmar_andersen`
- `johann_olav_koss`
- `karsten_warholm`
- `jakob_ingebrigtsen`
- `ingrid_kristiansen`
- `vebjorn_rodal`
- `trine_hattestad`
- `andreas_thorkildsen`
- `arne_haukvik`
- `martinus_lordahl`
- `knut_johannesen`
- `fred_anton_maier`
- `sebastian_coe`
- `ron_clarke`
- `steve_ovett`
- `kay_stenshjemmet`
- `sten_stensen`
- `tomas_gustafson`
- `steve_cram`
- `said_aouita`
- `meseret_defar`
- `tirunesh_dibaba`
- `eric_heiden`

## Research gate

### `jan_egil_storholt`

Reason: 1979 World Allround Speed Skating Championships were held at Bislett Stadium, Oslo, and Storholt won silver.

Sources:

- https://en.wikipedia.org/wiki/1979_World_Allround_Speed_Skating_Championships
- https://en.wikipedia.org/wiki/Jan_Egil_Storholt

### `yobes_ondieki`

Reason: At the 1993 Bislett Games in Oslo, Yobes Ondieki became the first athlete under 27 minutes for 10,000 m with 26:58.38.

Sources:

- https://en.wikipedia.org/wiki/Yobes_Ondieki
- https://de.wikipedia.org/wiki/Bislett_Games

### `william_sigei`

Reason: Bislett Games world-record sequence lists William Sigei's 10,000 m world record at Bislett on 22 July 1994, 26:52.23.

Sources:

- https://de.wikipedia.org/wiki/Bislett_Games

### `haile_gebrselassie`

Reason: Haile Gebrselassie ran 26:31.32 for 10,000 m in Oslo on 4 July 1997, included in the Bislett Games world-record sequence.

Sources:

- https://en.wikipedia.org/wiki/Haile_Gebrselassie
- https://de.wikipedia.org/wiki/Bislett_Games

### `david_moorcroft`

Reason: David Moorcroft set a 5000 m world record of 13:00.41 at the Bislett Games in Oslo in 1982.

Sources:

- https://en.wikipedia.org/wiki/David_Moorcroft
- https://de.wikipedia.org/wiki/Bislett_Games

## Image / asset policy

No external images were added. No guessed repo image paths were added. All new entries use:

- `image`: `""`
- `cardImage`: `""`

## Files changed

- Added `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch4.json`
- Updated `data/people/manifest.json`
- Added `reports/people-oslo-sport-bislett-stadion-batch-4-validation.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-4-research-notes.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-4-image-todo.md`

## Files intentionally not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime/loader files
- No unrelated people files
- No external image assets

## Expected validation

To run before merge:

```bash
node -e "for (const f of ['data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch4.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
