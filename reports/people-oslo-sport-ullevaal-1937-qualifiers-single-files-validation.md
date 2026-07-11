# Ullevaal Stadion 1937 qualifiers single-file validation

## Scope

Adds five historic Norway profiles as separate people files linked to `ullevaal_stadion`.

## Added people

- `reidar_kvammen`
- `alf_martinsen`
- `arne_brustad`
- `nils_eriksen`
- `asbjorn_halvorsen`

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

## Required invariants

- Every file contains exactly one people object.
- Every `id` is unique.
- Every `placeId` is `ullevaal_stadion`.
- Every `places` array contains `ullevaal_stadion`.
- Every new file is registered separately in `data/people/manifest.json`.

## Not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime files
- No image assets

## Expected validation

```bash
node -e "for (const f of [
  'data/people/sport/oslo/ullevaal_stadion/reidar_kvammen.json',
  'data/people/sport/oslo/ullevaal_stadion/alf_martinsen.json',
  'data/people/sport/oslo/ullevaal_stadion/arne_brustad.json',
  'data/people/sport/oslo/ullevaal_stadion/nils_eriksen.json',
  'data/people/sport/oslo/ullevaal_stadion/asbjorn_halvorsen.json',
  'data/people/manifest.json'
]) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
bash scripts/check-people.sh
```
