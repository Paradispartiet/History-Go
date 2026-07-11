# Ullevaal Stadion historical people — single-file validation

## Scope

Adds five historical Norwegian football people as separate files under:

- `data/people/sport/oslo/ullevaal_stadion/`

## Added people

- `tom_lund`
- `per_bredesen`
- `hallvar_thoresen`
- `kjetil_rekdal`
- `stig_inge_bjornebye`

## Candidate correction

The earlier plan mentioned Per Røntved. That candidate was rejected because Per Røntved was a Danish international, not a Norwegian Ullevaal people anchor. He was replaced by Per Bredesen, who scored for Norway at Ullevaal and represents an important early Norwegian professional-football story.

## File model

Each person is stored in a separate JSON file. No batch file was created.

## Duplicate gate

Repository search before creation found no active people IDs matching the five new IDs.

## Place anchor

All five files use:

- `placeId`: `ullevaal_stadion`
- `places`: `["ullevaal_stadion"]`
- `category`: `sport`

## Image policy

No image paths were guessed and no external assets were added. Each new file uses empty `image` and `cardImage` fields.

## Changed files

- Five new single-person JSON files
- `data/people/manifest.json` with five separate manifest entries
- This validation report

## Not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime files
- No batch people files

## Expected validation

```bash
node -e "for (const f of [
  'data/people/sport/oslo/ullevaal_stadion/tom_lund.json',
  'data/people/sport/oslo/ullevaal_stadion/per_bredesen.json',
  'data/people/sport/oslo/ullevaal_stadion/hallvar_thoresen.json',
  'data/people/sport/oslo/ullevaal_stadion/kjetil_rekdal.json',
  'data/people/sport/oslo/ullevaal_stadion/stig_inge_bjornebye.json',
  'data/people/manifest.json'
]) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
bash scripts/check-people.sh
```

Expected:

- new people entries = 5
- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0
