# People Oslo sport — Bislett Stadion batch 3 validation

## Scope

Add a third dedicated people batch for `bislett_stadion`, extending the stadium's world-record and speed-skating layers after batches 1 and 2.

New people file:

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch3.json`

Updated manifest:

- `data/people/manifest.json`

## Place anchor

Target place:

- `bislett_stadion`
- category: `sport`
- place profile covers `friidrett`, `skøyter`, `fotball`, `Bislett Games`, `OL-spor`, and `rekordhistorie`

## Repo-wide people ID check

Checked before adding:

- `steve_cram` — not found
- `said_aouita` — not found
- `meseret_defar` — not found
- `tirunesh_dibaba` — not found
- `eric_heiden` — not found

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

## Research gate

This batch continues the Bislett-specific principle: do not add generic famous athletes; add people whose historical role is tied directly to Bislett Stadion as arena, ice, or Bislett Games record scene.

### `steve_cram`

Reason: Bislett Dream Mile / mile world-record layer. Steve Cram's 3:46.32 mile at Bislett Stadium in Oslo in 1985 stood as the world record for eight years.

Sources:

- https://en.wikipedia.org/wiki/Steve_Cram
- https://en.wikipedia.org/wiki/Dream_Mile

### `said_aouita`

Reason: Bislett 5000 m world-record layer. Bislett Games world-record listings include Saïd Aouita's 5000 m world record at Bislett on 27 July 1985.

Sources:

- https://en.wikipedia.org/wiki/Sa%C3%AFd_Aouita
- https://de.wikipedia.org/wiki/Bislett_Games

### `meseret_defar`

Reason: modern Bislett women's 5000 m world-record layer. Meseret Defar improved her own 5000 m world record at the Bislett Games in Oslo in 2007.

Sources:

- https://de.wikipedia.org/wiki/Meseret_Defar
- https://en.wikipedia.org/wiki/2007_IAAF_Golden_League

### `tirunesh_dibaba`

Reason: modern Bislett women's 5000 m world-record layer. The 14:11.15 5000 m world record in Oslo on 6 June 2008 is part of the Bislett Games world-record sequence.

Sources:

- https://de.wikipedia.org/wiki/Bislett_Games
- https://en.wikipedia.org/wiki/2009_World_Championships_in_Athletics_%E2%80%93_Women%27s_5000_metres

### `eric_heiden`

Reason: Bislett international speed-skating championship layer. The 1979 World Allround Speed Skating Championships were held at Bislett Stadium, where Eric Heiden won gold.

Sources:

- https://en.wikipedia.org/wiki/1979_World_Allround_Speed_Skating_Championships
- https://en.wikipedia.org/wiki/Eric_Heiden

## Image / asset policy

No external images were added. No guessed repo image paths were added. All new entries use:

- `image`: `""`
- `cardImage`: `""`

A separate asset pass is still needed for Bislett hero-wall photos and any stadium image.

## Files changed

- Added `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch3.json`
- Updated `data/people/manifest.json`
- Added `reports/people-oslo-sport-bislett-stadion-batch-3-validation.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-3-research-notes.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-3-image-todo.md`

## Files intentionally not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime/loader files
- No unrelated people files
- No external image assets

## Expected validation

To run before merge:

```bash
node -e "for (const f of ['data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch3.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
