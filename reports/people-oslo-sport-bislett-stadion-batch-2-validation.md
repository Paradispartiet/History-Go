# People Oslo sport — Bislett Stadion batch 2 validation

## Scope

Add a second dedicated people batch for `bislett_stadion`, extending the stadium's hero/research layer after batch 1.

New people file:

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch2.json`

Updated manifest:

- `data/people/manifest.json`

## Place anchor

Target place:

- `bislett_stadion`
- category: `sport`
- place profile covers `friidrett`, `skøyter`, `fotball`, `Bislett Games`, `OL-spor`, and `rekordhistorie`

## Repo-wide people ID check

Checked before adding:

- `ron_clarke` — not found
- `steve_ovett` — not found
- `kay_stenshjemmet` — not found
- `sten_stensen` — not found
- `tomas_gustafson` — not found

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

## Research gate

This batch continues the Bislett-specific principle: do not add generic famous athletes; add people whose historical role is tied directly to Bislett Stadion as arena, ice, or Bislett Games/Dream Mile record scene.

### `ron_clarke`

Reason: early modern Bislett Games / world-record layer. Ron Clarke's 10,000 m world record in Oslo in 1965 is part of the origin story for the modern Bislett Games and Arne Haukvik's international record-era Bislett.

Sources:

- https://en.wikipedia.org/wiki/Ron_Clarke
- https://en.wikipedia.org/wiki/Bislett_Games

### `steve_ovett`

Reason: Dream Mile / international Bislett record layer. Dream Mile records list Steve Ovett's 1980 mile world record at Bislett, placing him directly inside the stadium's middle-distance mythology.

Sources:

- https://en.wikipedia.org/wiki/Dream_Mile
- https://en.wikipedia.org/wiki/1980_in_the_sport_of_athletics

### `kay_stenshjemmet`

Reason: Bislett speed-skating championship layer. Bislett Stadium history identifies Kay Stenshjemmet among Norwegian speed skaters who became European champions at Bislett; his 1976 European title came at Bislett.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Stadium
- https://en.wikipedia.org/wiki/Kay_Stenshjemmet

### `sten_stensen`

Reason: Bislett speed-skating world-record layer. Bislett Stadium history lists Sten Stensen's 10,000 m world record during the 1976 European Championships at Bislett.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Stadium
- https://en.wikipedia.org/wiki/Sten_Stensen

### `tomas_gustafson`

Reason: final Bislett speed-skating world-record layer. Bislett Stadium history identifies Tomas Gustafson's 14:23.59 in 1982 as Bislett's final speed-skating world record.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Stadium
- https://en.wikipedia.org/wiki/Tomas_Gustafson

## Image / asset policy

No external images were added. No guessed repo image paths were added. All new entries use:

- `image`: `""`
- `cardImage`: `""`

A separate asset pass is still needed for Bislett hero-wall photos and any stadium image.

## Files changed

- Added `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch2.json`
- Updated `data/people/manifest.json`
- Added `reports/people-oslo-sport-bislett-stadion-batch-2-validation.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-2-research-notes.md`
- Added `reports/people-oslo-sport-bislett-stadion-batch-2-image-todo.md`

## Files intentionally not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime/loader files
- No unrelated people files
- No external image assets

## Expected validation

To run before merge:

```bash
node -e "for (const f of ['data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch2.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
