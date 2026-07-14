# Ullevaal Stadion women’s EURO 1987 final — single-file validation

## Added people

- `trude_stendal`
- `heidi_store`
- `gunn_nyborg`
- `kari_nielsen`
- `janne_andreassen`

## File model

Each person is stored in an individual JSON file under:

`data/people/sport/oslo/ullevaal_stadion/`

No batch file was created.

## Expected invariants

- 5 new people files
- 5 unique people IDs
- 5 separate manifest entries
- `placeId = ullevaal_stadion` for every entry
- `places = ["ullevaal_stadion"]` for every entry
- 0 deleted people
- 0 place, index, UI or runtime changes

## Validation commands

```bash
node -e "for (const f of [
  'data/people/sport/oslo/ullevaal_stadion/trude_stendal.json',
  'data/people/sport/oslo/ullevaal_stadion/heidi_store.json',
  'data/people/sport/oslo/ullevaal_stadion/gunn_nyborg.json',
  'data/people/sport/oslo/ullevaal_stadion/kari_nielsen.json',
  'data/people/sport/oslo/ullevaal_stadion/janne_andreassen.json',
  'data/people/manifest.json'
]) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"

bash scripts/check-people.sh
```
