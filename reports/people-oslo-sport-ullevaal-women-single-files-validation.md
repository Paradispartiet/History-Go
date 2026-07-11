# Ullevaal Stadion women people single-file validation

## Scope

Adds five Norwegian women's national-team profiles as separate people files linked to `ullevaal_stadion`.

## Added people

- `hege_riise`
- `linda_medalen`
- `marianne_pettersen`
- `solveig_gulbrandsen`
- `caroline_graham_hansen`

## File model

Each person is stored as an individual JSON file under:

`data/people/sport/oslo/ullevaal_stadion/`

No batch file was created.

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
  'data/people/sport/oslo/ullevaal_stadion/hege_riise.json',
  'data/people/sport/oslo/ullevaal_stadion/linda_medalen.json',
  'data/people/sport/oslo/ullevaal_stadion/marianne_pettersen.json',
  'data/people/sport/oslo/ullevaal_stadion/solveig_gulbrandsen.json',
  'data/people/sport/oslo/ullevaal_stadion/caroline_graham_hansen.json',
  'data/people/manifest.json'
]) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
bash scripts/check-people.sh
```
