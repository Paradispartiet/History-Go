# Ullevaal Stadion classic stars single-file validation

## Scope

Adds five existing-history Norwegian football profiles as separate people files linked to `ullevaal_stadion`.

## Added people

- `einar_gundersen`
- `gunnar_thoresen`
- `roald_jensen`
- `harald_berg`
- `odd_iversen`

## File model

Each person is stored as an individual JSON file under:

`data/people/sport/oslo/ullevaal_stadion/`

No batch file was created.

## Manifest

Five separate entries were added to `data/people/manifest.json`.

## Counts

- 5 new people files
- 5 new people IDs
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
  'data/people/sport/oslo/ullevaal_stadion/einar_gundersen.json',
  'data/people/sport/oslo/ullevaal_stadion/gunnar_thoresen.json',
  'data/people/sport/oslo/ullevaal_stadion/roald_jensen.json',
  'data/people/sport/oslo/ullevaal_stadion/harald_berg.json',
  'data/people/sport/oslo/ullevaal_stadion/odd_iversen.json',
  'data/people/manifest.json'
]) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
bash scripts/check-people.sh
```

Expected:

- JSON parse OK
- duplicate people IDs unchanged / 0
- invalid place refs unchanged / 0
- valid primary anchor for all five people
- non-empty `places` array for all five people
