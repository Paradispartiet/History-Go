# People Oslo sport — Bislett Stadion batch 1 validation

## Scope

Add a first dedicated people batch for `bislett_stadion` without changing place files, runtime code, UI code, loader code, generated indexes, or unrelated people files.

New people file:

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json`

Updated manifest:

- `data/people/manifest.json`

## Place anchor

Confirmed place anchor exists on current `main`:

- `data/places/sport/europa/norway/oslo_sport/bislett_stadion.json`
- `id`: `bislett_stadion`
- `category`: `sport`
- sport profile includes `friidrett`, `fotball`, and `skøyter`
- people round already enabled in `rounds`

## Repo-wide people ID check

Checked before adding:

- `arne_haukvik` — not found
- `martinus_lordahl` — not found
- `knut_johannesen` — not found
- `fred_anton_maier` — not found
- `sebastian_coe` — not found

Existing Bislett-related people found and not duplicated:

- `grete_waitz` — already in `data/people/sport/oslo/people_sport_oslo.json`, anchored to `bislett_stadion`
- `hjalmar_andersen` — already in `data/people/sport/oslo/people_sport_oslo.json`, includes `bislett_stadion`
- `johann_olav_koss` — already in `data/people/sport/oslo/people_sport_oslo.json`, includes `bislett_stadion`
- `karsten_warholm` — already in `data/people/sport/oslo/people_sport_oslo.json`, anchored to `bislett_stadion`
- `jakob_ingebrigtsen` — already in `data/people/sport/oslo/people_sport_oslo.json`, anchored to `bislett_stadion`
- `ingrid_kristiansen` — already in `data/people/sport/oslo/people_sport_oslo.json`, anchored to `bislett_stadion`
- `vebjorn_rodal` — already in `data/people/sport/oslo/people_sport_oslo.json`, anchored to `bislett_stadion`
- `trine_hattestad` — already in `data/people/sport/oslo/people_sport_oslo.json`, anchored to `bislett_stadion`
- `andreas_thorkildsen` — already in `data/people/sport/oslo/people_sport_oslo.json`, anchored to `bislett_stadion`

## Research gate

The user specifically noted that Bislett has hero images inside the stadium. This batch therefore prioritizes people who are part of Bislett's own stadium mythology: venue builders, Bislett Games builders, speed-skating record history, and international Bislett record names. I did not add any external image URL or guessed local asset path.

### Added people

#### `arne_haukvik`

Reason: central Bislett Games organizer. Source basis: Arne Haukvik is described as strongly contributing to founding the modern Bislett Games, including booking Ron Clarke for the 1965 meet at Bislett where Clarke set a 10,000 m world record. Bislett Games sources also tie Haukvik to the 1965 formation of the modern meeting.

Sources:

- https://en.wikipedia.org/wiki/Arne_Haukvik
- https://en.wikipedia.org/wiki/Bislett_Games

#### `martinus_lordahl`

Reason: stadium builder / early Bislett institution figure. Source basis: Bislett Stadium history describes Martinus Lørdahl as instrumental in facilitating construction of the first bleachers, begun in 1917 and completed in 1922, and notes a square outside the stadium named for him. Martinus Lørdahl source also says he was a driving force in construction from 1908 and that a bust was unveiled at Bislett in 2010.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Stadium
- https://en.wikipedia.org/wiki/Martinus_L%C3%B8rdahl

#### `knut_johannesen`

Reason: speed-skating hero in Bislett's winter-stadium layer. Source basis: Bislett Stadium history lists Knut Johannesen among Norwegian speed skaters who became European champions at Bislett, and notes his 1963 5000 m world record at Bislett.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Stadium
- https://en.wikipedia.org/wiki/Knut_Johannesen

#### `fred_anton_maier`

Reason: speed-skating record figure tied to Bislett ice. Source basis: Bislett Stadium history lists Fred Anton Maier among Norwegian speed skaters who became European champions at Bislett. Fred Anton Maier's record profile lists a 10,000 m personal/world-record context at Bislett on 28 January 1968.

Sources:

- https://en.wikipedia.org/wiki/Bislett_Stadium
- https://en.wikipedia.org/wiki/Fred_Anton_Maier

#### `sebastian_coe`

Reason: international Bislett record name. Source basis: 1979 athletics record listings show Sebastian Coe setting world records in Oslo in 1979, and the Dream Mile/Bislett record context ties his mile record to Bislett.

Sources:

- https://en.wikipedia.org/wiki/1979_in_the_sport_of_athletics
- https://en.wikipedia.org/wiki/Dream_Mile

## Image / asset policy

The user asked whether the Bislett stadium image shown in chat could be added. I did **not** add that image because it is an external chat/web image, not a verified repository asset. No safe existing asset path for the shown Bislett photo was found in repo search, so all new entries use:

- `image`: `""`
- `cardImage`: `""`

A later asset PR can add licensed/local images and update these fields.

## Files changed

- Added `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json`
- Updated `data/people/manifest.json`
- Added `reports/people-oslo-sport-bislett-stadion-batch-1-validation.md`

## Files intentionally not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime/loader files
- No unrelated people files
- No external image assets

## Expected validation

To run before merge:

```bash
node -e "for (const f of ['data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
