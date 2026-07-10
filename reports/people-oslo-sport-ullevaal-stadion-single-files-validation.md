# Ullevaal Stadion people — single-files validation

## Scope

Adds five directly Ullevaal-linked Norway men's national-team profiles as individual people files.

## New files

- `data/people/sport/oslo/ullevaal_stadion/martin_odegaard.json`
- `data/people/sport/oslo/ullevaal_stadion/john_arne_riise.json`
- `data/people/sport/oslo/ullevaal_stadion/henning_berg.json`
- `data/people/sport/oslo/ullevaal_stadion/rune_bratseth.json`
- `data/people/sport/oslo/ullevaal_stadion/erik_thorstvedt.json`

## Manifest

Each person file is registered separately in `data/people/manifest.json`.

## Rules followed

- One person per file
- No batch file
- No duplicate people IDs
- No place files changed
- No `data/places/places_index.json` change
- No UI/runtime changes
- No image assets added

## Validation

Run:

```bash
node -e "for (const f of [
  'data/people/sport/oslo/ullevaal_stadion/martin_odegaard.json',
  'data/people/sport/oslo/ullevaal_stadion/john_arne_riise.json',
  'data/people/sport/oslo/ullevaal_stadion/henning_berg.json',
  'data/people/sport/oslo/ullevaal_stadion/rune_bratseth.json',
  'data/people/sport/oslo/ullevaal_stadion/erik_thorstvedt.json',
  'data/people/manifest.json'
]) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
bash scripts/check-people.sh
```
