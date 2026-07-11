# Ullevaal Stadion coaches single-file validation

## Scope

Adds five Norwegian national-team coaches and leaders as separate people files linked to `ullevaal_stadion`.

## Added people

- `egil_olsen`
- `age_hareide`
- `per_mathias_hogmo`
- `stale_solbakken`
- `nils_johan_semb`

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
  'data/people/sport/oslo/ullevaal_stadion/egil_olsen.json',
  'data/people/sport/oslo/ullevaal_stadion/age_hareide.json',
  'data/people/sport/oslo/ullevaal_stadion/per_mathias_hogmo.json',
  'data/people/sport/oslo/ullevaal_stadion/stale_solbakken.json',
  'data/people/sport/oslo/ullevaal_stadion/nils_johan_semb.json',
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
