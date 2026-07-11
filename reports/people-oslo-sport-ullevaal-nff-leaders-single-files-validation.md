# Ullevaal Stadion NFF leaders single-file validation

## Scope

Adds five Norwegian football leaders as separate people files linked to `ullevaal_stadion`.

## Added people

- `per_ravn_omdal`
- `karen_espelund`
- `sondre_kafjord`
- `yngve_hallen`
- `lise_klaveness`

## File model

Each person is stored as an individual JSON file under:

`data/people/sport/oslo/ullevaal_stadion/`

No batch file was created.

## Counts

- 5 new people files
- 5 new people IDs
- 5 new manifest entries
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
  'data/people/sport/oslo/ullevaal_stadion/per_ravn_omdal.json',
  'data/people/sport/oslo/ullevaal_stadion/karen_espelund.json',
  'data/people/sport/oslo/ullevaal_stadion/sondre_kafjord.json',
  'data/people/sport/oslo/ullevaal_stadion/yngve_hallen.json',
  'data/people/sport/oslo/ullevaal_stadion/lise_klaveness.json',
  'data/people/manifest.json'
]) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
bash scripts/check-people.sh
```
