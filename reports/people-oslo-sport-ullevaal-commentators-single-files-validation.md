# Ullevaal Stadion commentators single-file validation

## Scope

Adds two Norwegian sports commentators as separate people files linked to `ullevaal_stadion`.

## Added people

- `bjorge_lillelien`
- `arne_scheie`

## File model

Each person is stored as an individual JSON file under:

`data/people/sport/oslo/ullevaal_stadion/`

No batch file was created.

## Counts

- 2 new people files
- 2 new people IDs
- 2 separate manifest entries
- 0 deleted people
- 0 batch files

## Not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime files
- No image assets

## Expected validation

```bash
node -e "for (const f of [
  'data/people/sport/oslo/ullevaal_stadion/bjorge_lillelien.json',
  'data/people/sport/oslo/ullevaal_stadion/arne_scheie.json',
  'data/people/manifest.json'
]) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
bash scripts/check-people.sh
```

Expected:

- JSON parse OK
- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0
