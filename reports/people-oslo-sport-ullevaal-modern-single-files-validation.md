# Ullevaal Stadion modern profiles single-file validation

## Scope

Adds five modern Norwegian men’s national-team profiles as separate people files linked to `ullevaal_stadion`.

## Added people

- `alexander_sorloth`
- `joshua_king`
- `morten_gamst_pedersen`
- `brede_hangeland`
- `mohammed_abdellaoue`

## File model

Each person is stored as an individual JSON file under:

`data/people/sport/oslo/ullevaal_stadion/`

No batch file was created.

## Counts

- 5 new people files
- 5 new people IDs
- 5 separate manifest entries
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
  'data/people/sport/oslo/ullevaal_stadion/alexander_sorloth.json',
  'data/people/sport/oslo/ullevaal_stadion/joshua_king.json',
  'data/people/sport/oslo/ullevaal_stadion/morten_gamst_pedersen.json',
  'data/people/sport/oslo/ullevaal_stadion/brede_hangeland.json',
  'data/people/sport/oslo/ullevaal_stadion/mohammed_abdellaoue.json',
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
