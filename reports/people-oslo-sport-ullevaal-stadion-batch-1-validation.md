# People Oslo sport — Ullevaal Stadion batch 1 validation

## Scope

Adds the first dedicated people batch for `ullevaal_stadion`.

New file:

- `data/people/sport/oslo/people_sport_oslo_ullevaal_stadion_batch1.json`

Updated manifest:

- `data/people/manifest.json`

## Added people

- `martin_odegaard`
- `john_arne_riise`
- `henning_berg`
- `rune_bratseth`
- `erik_thorstvedt`

## Duplicate gate

The five IDs were checked against the repository before creation. Existing legacy entries such as `erling_haaland` and `ole_gunnar_solskjaer` were deliberately not duplicated.

## Place relevance

All five entries are tied to Ullevaal through Norway men's national-team home matches, captaincy, qualification campaigns or long-term national-team roles. The batch is not a generic list of famous Norwegian footballers.

## Image policy

No external images or guessed local paths were added. New entries use empty `image` and `cardImage` fields.

## Files intentionally not changed

- No place files
- No `data/places/places_index.json`
- No UI/runtime files
- No legacy people entries
- No image assets

## Validation

```bash
node -e "for (const f of ['data/people/sport/oslo/people_sport_oslo_ullevaal_stadion_batch1.json','data/people/manifest.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
bash scripts/check-people.sh
```

Expected:

- 5 new people entries
- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0
